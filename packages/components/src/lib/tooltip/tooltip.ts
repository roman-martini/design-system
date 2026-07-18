import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  OnDestroy,
  createComponent,
  inject,
  input,
} from '@angular/core';

import { DsTooltipPanel } from './tooltip-panel';

export type DsTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

// Fallbacks cuando el entorno no resuelve las CSS vars (jsdom en tests).
const DEFAULT_DELAY_MS = 500;
const DEFAULT_OFFSET_PX = 4;
// Gracia mínima para cruzar el gap host→panel (hoverable, WCAG 1.4.13).
// No es un delay perceptible de cierre: es el tiempo de un movimiento de mouse.
const HOVER_GRACE_MS = 80;

interface TooltipCoords {
  top: number;
  left: number;
}

// Cálculo puro del placement con flip al opuesto si no hay espacio en el
// viewport (fallback JS de ADR-014 §2).
function computeTooltipPosition(
  hostRect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  offset: number,
  requested: DsTooltipPlacement,
  viewportWidth: number,
  viewportHeight: number,
): TooltipCoords {
  let placement = requested;
  if (placement === 'top' && hostRect.top - panelHeight - offset < 0) {
    placement = 'bottom';
  } else if (placement === 'bottom' && hostRect.bottom + panelHeight + offset > viewportHeight) {
    placement = 'top';
  } else if (placement === 'left' && hostRect.left - panelWidth - offset < 0) {
    placement = 'right';
  } else if (placement === 'right' && hostRect.right + panelWidth + offset > viewportWidth) {
    placement = 'left';
  }

  switch (placement) {
    case 'top':
      return {
        top: hostRect.top - panelHeight - offset,
        left: hostRect.left + (hostRect.width - panelWidth) / 2,
      };
    case 'bottom':
      return {
        top: hostRect.bottom + offset,
        left: hostRect.left + (hostRect.width - panelWidth) / 2,
      };
    case 'left':
      return {
        top: hostRect.top + (hostRect.height - panelHeight) / 2,
        left: hostRect.left - panelWidth - offset,
      };
    default:
      return {
        top: hostRect.top + (hostRect.height - panelHeight) / 2,
        left: hostRect.right + offset,
      };
  }
}

@Directive({
  selector: '[dsTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut()',
  },
})
export class DsTooltip implements OnDestroy {
  readonly dsTooltip = input.required<string>();
  readonly dsTooltipPlacement = input<DsTooltipPlacement>('top');
  readonly dsTooltipDelay = input<number | undefined>(undefined);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private panelRef: ComponentRef<DsTooltipPanel> | null = null;
  private visible = false;
  private hoveringPanel = false;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  // ESC a nivel documento solo mientras está visible: dismissable sin mover el
  // foco, incluso si el tooltip se abrió por hover con el foco en otro lado.
  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.hide();
    }
  };
  private readonly repositionListener = (): void => this.position();

  ngOnDestroy(): void {
    this.clearTimers();
    this.detachOpenListeners();
    if (this.panelRef) {
      this.panelRef.destroy();
      this.panelRef = null;
    }
  }

  protected onMouseEnter(): void {
    if (!this.dsTooltip()) {
      return;
    }
    this.clearTimers();
    if (this.visible) {
      return;
    }
    this.openTimer = setTimeout(() => this.show(), this.resolveDelay());
  }

  protected onMouseLeave(): void {
    this.clearOpenTimer();
    if (!this.visible) {
      return;
    }
    // Gracia para el cruce al panel (hoverable): si el mouse entra al panel
    // antes de vencer, el cierre se cancela.
    this.closeTimer = setTimeout(() => {
      if (!this.hoveringPanel) {
        this.hide();
      }
    }, HOVER_GRACE_MS);
  }

  protected onFocusIn(): void {
    if (!this.dsTooltip()) {
      return;
    }
    this.clearTimers();
    this.show();
  }

  protected onFocusOut(): void {
    this.clearTimers();
    this.hide();
  }

  private show(): void {
    if (this.visible || !this.dsTooltip()) {
      return;
    }
    const panel = this.ensurePanel();
    panel.instance.text.set(this.dsTooltip());
    panel.changeDetectorRef.detectChanges();
    const panelEl = panel.location.nativeElement as HTMLElement;
    panelEl.showPopover?.();
    this.visible = true;
    this.addDescribedBy(panel.instance.id);
    this.position();
    document.addEventListener('keydown', this.onDocumentKeydown);
    window.addEventListener('scroll', this.repositionListener, { capture: true, passive: true });
    window.addEventListener('resize', this.repositionListener, { passive: true });
  }

  private hide(): void {
    if (!this.visible) {
      return;
    }
    const panelEl = this.panelRef?.location.nativeElement as HTMLElement | undefined;
    panelEl?.hidePopover?.();
    this.visible = false;
    this.hoveringPanel = false;
    if (this.panelRef) {
      this.removeDescribedBy(this.panelRef.instance.id);
    }
    this.detachOpenListeners();
  }

  private ensurePanel(): ComponentRef<DsTooltipPanel> {
    if (this.panelRef) {
      return this.panelRef;
    }
    const ref = createComponent(DsTooltipPanel, { environmentInjector: this.environmentInjector });
    this.appRef.attachView(ref.hostView);
    const el = ref.location.nativeElement as HTMLElement;
    document.body.appendChild(el);
    // Hoverable (1.4.13): el mouse sobre el panel mantiene el tooltip abierto.
    el.addEventListener('mouseenter', () => {
      this.hoveringPanel = true;
      this.clearCloseTimer();
    });
    el.addEventListener('mouseleave', () => {
      this.hoveringPanel = false;
      this.hide();
    });
    ref.changeDetectorRef.detectChanges();
    this.panelRef = ref;
    return ref;
  }

  // El describedby se compone: se agrega/remueve solo el id propio, sin pisar
  // los valores del consumidor (ej. el hint de un ds-input).
  private addDescribedBy(id: string): void {
    const hostEl = this.host.nativeElement;
    const current = hostEl.getAttribute('aria-describedby');
    const ids = current ? current.split(/\s+/) : [];
    if (!ids.includes(id)) {
      ids.push(id);
    }
    hostEl.setAttribute('aria-describedby', ids.join(' '));
  }

  private removeDescribedBy(id: string): void {
    const hostEl = this.host.nativeElement;
    const current = hostEl.getAttribute('aria-describedby');
    if (!current) {
      return;
    }
    const ids = current.split(/\s+/).filter((existing) => existing !== id);
    if (ids.length > 0) {
      hostEl.setAttribute('aria-describedby', ids.join(' '));
    } else {
      hostEl.removeAttribute('aria-describedby');
    }
  }

  private resolveDelay(): number {
    const override = this.dsTooltipDelay();
    if (override !== undefined) {
      return override;
    }
    return this.readCssNumber('--ds-component-tooltip-delay', DEFAULT_DELAY_MS);
  }

  private readCssNumber(name: string, fallback: number): number {
    const raw = getComputedStyle(this.host.nativeElement).getPropertyValue(name).trim();
    if (!raw) {
      return fallback;
    }
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return fallback;
    }
    // "0.5s" → 500; "500ms"/"500" → 500
    return raw.endsWith('ms') || !raw.endsWith('s') ? parsed : parsed * 1000;
  }

  private position(): void {
    const panelEl = this.panelRef?.location.nativeElement as HTMLElement | undefined;
    if (!panelEl) {
      return;
    }
    const coords = computeTooltipPosition(
      this.host.nativeElement.getBoundingClientRect(),
      panelEl.offsetWidth,
      panelEl.offsetHeight,
      this.readCssNumber('--ds-component-tooltip-offset', DEFAULT_OFFSET_PX),
      this.dsTooltipPlacement(),
      window.innerWidth,
      window.innerHeight,
    );
    panelEl.style.position = 'fixed';
    panelEl.style.top = `${Math.max(0, coords.top)}px`;
    panelEl.style.left = `${Math.max(0, coords.left)}px`;
  }

  private clearOpenTimer(): void {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearOpenTimer();
    this.clearCloseTimer();
  }

  private detachOpenListeners(): void {
    document.removeEventListener('keydown', this.onDocumentKeydown);
    window.removeEventListener('scroll', this.repositionListener, { capture: true });
    window.removeEventListener('resize', this.repositionListener);
  }
}
