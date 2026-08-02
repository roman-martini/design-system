import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
} from '@angular/core';
import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideInfo,
  LucideTriangleAlert,
  LucideX,
} from '@lucide/angular';

import { DS_TOAST_CONFIG, DsToastEntry, DsToastService } from './toast';

// Fallback cuando el entorno no resuelve las CSS vars (jsdom en tests).
const DEFAULT_DURATION_MS = 5000;

/**
 * Un toast del stack. Interno: NO se exporta desde public-api (design.md §1
 * de aaa-021). Dueño de su timer de auto-dismiss: pausable por hover y foco
 * (WCAG 2.2.1) con reanudación por tiempo restante; danger nunca lo arma.
 */
@Component({
  selector: 'ds-toast-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-item.html',
  styleUrl: './toast-item.css',
  imports: [LucideCircleAlert, LucideCircleCheck, LucideInfo, LucideTriangleAlert, LucideX],
  host: {
    // Sin rol de live region: el anuncio lo hace la región persistente del
    // service (aaa-047). Declararlo también acá produciría un anuncio doble, y
    // no serviría igual: este nodo se inserta junto con su texto, que es lo
    // que los lectores no observan de forma confiable.
    '[attr.data-variant]': 'entry().variant',
    '(mouseenter)': 'setPausedByHover(true)',
    '(mouseleave)': 'setPausedByHover(false)',
    '(focusin)': 'setPausedByFocus(true)',
    '(focusout)': 'setPausedByFocus(false)',
  },
})
export class DsToastItem implements OnInit, OnDestroy {
  readonly entry = input.required<DsToastEntry>();

  protected readonly dismissLabel = inject(DS_TOAST_CONFIG).dismissLabel;

  private readonly toasts = inject(DsToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private deadline = 0;
  private remaining: number | null = null;
  private hovered = false;
  private focused = false;

  ngOnInit(): void {
    const { variant, duration } = this.entry();
    if (variant === 'danger' || duration === 0) {
      return; // persistente: los errores se leen (HU-008 §2) / opt-out explícito
    }
    this.remaining = duration ?? this.resolveDefaultDuration();
    this.armTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  protected setPausedByHover(paused: boolean): void {
    this.hovered = paused;
    this.syncTimer();
  }

  protected setPausedByFocus(paused: boolean): void {
    this.focused = paused;
    this.syncTimer();
  }

  protected dismiss(): void {
    this.toasts.dismiss(this.entry().id);
  }

  protected runAction(): void {
    this.entry().action?.callback();
    this.dismiss();
  }

  // El timer corre solo sin hover ni foco (WCAG 2.2.1); la pausa conserva el
  // tiempo restante y la reanudación re-arma con ese remanente.
  private syncTimer(): void {
    if (this.remaining === null) {
      return; // persistente: nada que pausar
    }
    const paused = this.hovered || this.focused;
    if (paused && this.timer !== null) {
      this.clearTimer();
      this.remaining = Math.max(0, this.deadline - Date.now());
    } else if (!paused && this.timer === null) {
      this.armTimer();
    }
  }

  private armTimer(): void {
    if (this.remaining === null) {
      return;
    }
    this.deadline = Date.now() + this.remaining;
    this.timer = setTimeout(() => this.dismiss(), this.remaining);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private resolveDefaultDuration(): number {
    const raw = getComputedStyle(this.host.nativeElement)
      .getPropertyValue('--ds-component-toast-duration')
      .trim();
    if (!raw) {
      return DEFAULT_DURATION_MS;
    }
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return DEFAULT_DURATION_MS;
    }
    // "5s" → 5000; "5000ms"/"5000" → 5000
    return raw.endsWith('ms') || !raw.endsWith('s') ? parsed : parsed * 1000;
  }
}
