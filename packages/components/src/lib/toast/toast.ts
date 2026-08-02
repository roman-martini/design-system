import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  OnDestroy,
  PLATFORM_ID,
  createComponent,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';

import { DsToastContainer } from './toast-container';

export type DsToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type DsToastVariant = 'success' | 'info' | 'warning' | 'danger';

export interface DsToastAction {
  label: string;
  callback: () => void;
}

export interface DsToastOptions {
  message: string;
  variant: DsToastVariant;
  /** ms; `0` = persistente. Default: token `component.toast.duration` (~5s). Ignorado en danger (siempre persiste). */
  duration?: number;
  action?: DsToastAction;
}

export interface DsToastRef {
  dismiss(): void;
}

export interface DsToastConfig {
  /** Posición global del stack — una sola por app, nunca por toast (HU-008 §1). */
  position?: DsToastPosition;
  /** aria-label del botón de cierre. */
  dismissLabel?: string;
}

// Interno: entry del stack, consumido por el contenedor y el item (no exportado en index).
export interface DsToastEntry {
  id: number;
  message: string;
  variant: DsToastVariant;
  duration?: number;
  action?: DsToastAction;
}

const DEFAULT_CONFIG: Required<DsToastConfig> = {
  position: 'bottom-right',
  dismissLabel: 'Cerrar',
};

// Interno: la única forma documentada de setear la config es provideDsToasts.
export const DS_TOAST_CONFIG = new InjectionToken<Required<DsToastConfig>>('DS_TOAST_CONFIG', {
  factory: () => DEFAULT_CONFIG,
});

export function provideDsToasts(config: DsToastConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DS_TOAST_CONFIG, useValue: { ...DEFAULT_CONFIG, ...config } },
  ]);
}

type DsToastShortcutOptions = Omit<DsToastOptions, 'message' | 'variant'>;

/**
 * Sistema de toasts del DS (HU-008). Primera service del kit: la API pública
 * es programática; el DOM (contenedor + item) es detalle interno no exportado.
 * El stack vive en el top layer vía popover manual (ADR-014, regla de capa) —
 * visible por encima de modales abiertos.
 */
@Injectable({ providedIn: 'root' })
export class DsToastService implements OnDestroy {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly entriesState = signal<readonly DsToastEntry[]>([]);

  // Leído por el contenedor interno; solo lectura — el invariante del stack
  // (ids, orden, sync del popover) lo mantienen show()/dismiss().
  readonly entries = this.entriesState.asReadonly();

  private containerRef: ComponentRef<DsToastContainer> | null = null;
  private popoverOpen = false;
  private nextId = 0;

  // Regiones de anuncio. Viven fuera del contenedor a propósito: el contenedor
  // es un popover y cerrado computa `display: none`, o sea que está fuera del
  // árbol de accesibilidad — una región alojada ahí adentro aparecería recién
  // con el primer toast, que es justo el defecto a corregir (design §1).
  private announcer: HTMLElement | null = null;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  constructor() {
    // Eager: una live region insertada junto con su contenido frecuentemente
    // no se anuncia; tiene que preexistir. La guarda no es opcional — el
    // service es `providedIn: 'root'` y sin ella tocaría el DOM en SSR.
    if (this.isBrowser) {
      this.createAnnouncer();
    }
  }

  show(options: DsToastOptions): DsToastRef {
    const entry: DsToastEntry = { id: this.nextId++, ...options };
    this.ensureContainer();
    this.entriesState.update((list) => [...list, entry]);
    this.syncPopover();
    this.announce(entry);
    return { dismiss: () => this.dismiss(entry.id) };
  }

  success(message: string, options: DsToastShortcutOptions = {}): DsToastRef {
    return this.show({ ...options, message, variant: 'success' });
  }

  info(message: string, options: DsToastShortcutOptions = {}): DsToastRef {
    return this.show({ ...options, message, variant: 'info' });
  }

  warning(message: string, options: DsToastShortcutOptions = {}): DsToastRef {
    return this.show({ ...options, message, variant: 'warning' });
  }

  danger(message: string, options: DsToastShortcutOptions = {}): DsToastRef {
    return this.show({ ...options, message, variant: 'danger' });
  }

  // Interno (lo usa el item para el cierre por X/acción/timer).
  dismiss(id: number): void {
    this.entriesState.update((list) => list.filter((entry) => entry.id !== id));
    this.syncPopover();
  }

  ngOnDestroy(): void {
    if (this.containerRef) {
      this.containerRef.destroy();
      this.containerRef = null;
    }
    this.announcer?.remove();
    this.announcer = null;
    this.politeRegion = null;
    this.assertiveRegion = null;
  }

  /**
   * Dos regiones estáticas en vez de una que cambie `aria-live`: varios
   * lectores cachean la politeness al construir el árbol, así que mutarla en
   * caliente no es confiable (design §2).
   */
  private createAnnouncer(): void {
    const announcer = document.createElement('div');
    // Visually hidden que preserva el árbol de accesibilidad: ni `display:
    // none` ni `visibility: hidden` ni `aria-hidden` sirven acá, sacan el
    // elemento del árbol y con él el anuncio (design §3).
    announcer.style.cssText =
      'position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap';

    this.politeRegion = this.createRegion('polite');
    this.assertiveRegion = this.createRegion('assertive');
    announcer.append(this.politeRegion, this.assertiveRegion);

    document.body.appendChild(announcer);
    this.announcer = announcer;
  }

  private createRegion(politeness: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    return region;
  }

  private announce(entry: DsToastEntry): void {
    const region = entry.variant === 'danger' ? this.assertiveRegion : this.politeRegion;
    if (!region) {
      return;
    }
    // Vaciar antes de escribir: sin la limpieza, dos mensajes idénticos
    // consecutivos no cambian el textContent y varios lectores no detectan
    // mutación, así que el segundo no se anuncia (design §6).
    region.textContent = '';
    region.textContent = entry.message;
  }

  // Creación perezosa al primer toast; el elemento queda vivo entre ráfagas.
  private ensureContainer(): void {
    if (this.containerRef) {
      return;
    }
    const ref = createComponent(DsToastContainer, {
      environmentInjector: this.environmentInjector,
    });
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement as HTMLElement);
    ref.changeDetectorRef.detectChanges();
    this.containerRef = ref;
  }

  private syncPopover(): void {
    const el = this.containerRef?.location.nativeElement as HTMLElement | undefined;
    if (!el) {
      return;
    }
    const shouldOpen = this.entries().length > 0;
    if (shouldOpen && !this.popoverOpen) {
      el.showPopover?.();
      this.popoverOpen = true;
    } else if (!shouldOpen && this.popoverOpen) {
      el.hidePopover?.();
      this.popoverOpen = false;
    }
  }
}
