import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  OnDestroy,
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

  private readonly entriesState = signal<readonly DsToastEntry[]>([]);

  // Leído por el contenedor interno; solo lectura — el invariante del stack
  // (ids, orden, sync del popover) lo mantienen show()/dismiss().
  readonly entries = this.entriesState.asReadonly();

  private containerRef: ComponentRef<DsToastContainer> | null = null;
  private popoverOpen = false;
  private nextId = 0;

  show(options: DsToastOptions): DsToastRef {
    const entry: DsToastEntry = { id: this.nextId++, ...options };
    this.ensureContainer();
    this.entriesState.update((list) => [...list, entry]);
    this.syncPopover();
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
