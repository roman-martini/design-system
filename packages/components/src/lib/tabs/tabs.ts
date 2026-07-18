import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';

export type DsTabsVariant = 'underline' | 'pills' | 'contained';
export type DsTabsSize = 'sm' | 'md' | 'lg';

/**
 * Contrato mínimo que DsTab cumple para que DsTabs renderice el tablist y
 * gestione navegación sin importar DsTab directamente (evita la dependencia
 * circular — mismo patrón que DsOptionRegistration).
 */
export interface DsTabRegistration {
  valueProp(): string;
  labelText(): string;
  isDisabled(): boolean;
  tabId(): string;
  panelId(): string;
}

@Component({
  selector: 'ds-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class DsTabs {
  readonly value = model<string | null>(null);
  readonly variant = input<DsTabsVariant>('underline');
  readonly size = input<DsTabsSize>('md');
  // El role="tablist" vive en el strip interno (el host contiene también los
  // paneles): el nombre accesible del consumidor se reenvía (lección aaa-016).
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  protected readonly tabs = signal<DsTabRegistration[]>([]);

  private readonly buttonRefs = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  // Activo efectivo: el value del consumidor si matchea un tab habilitado;
  // sino, el primer habilitado (CA-006.1). También cubre la desaparición del
  // tab activo en registraciones dinámicas.
  private readonly activeValue = computed(() => {
    const tabs = this.tabs();
    const value = this.value();
    if (value !== null && tabs.some((t) => t.valueProp() === value && !t.isDisabled())) {
      return value;
    }
    return tabs.find((t) => !t.isDisabled())?.valueProp() ?? null;
  });

  // API que los DsTab hijos consumen
  registerTab(tab: DsTabRegistration): void {
    if (!this.tabs().includes(tab)) {
      this.tabs.update((tabs) => [...tabs, tab]);
    }
  }

  unregisterTab(tab: DsTabRegistration): void {
    this.tabs.update((tabs) => tabs.filter((t) => t !== tab));
  }

  isActiveValue(value: string): boolean {
    return this.activeValue() === value;
  }

  protected select(tab: DsTabRegistration): void {
    if (tab.isDisabled()) {
      return;
    }
    this.value.set(tab.valueProp());
  }

  // Navegación APG tabs con activación automática: flechas con wrap y skip de
  // disabled (a diferencia del combobox de DsSelect, que por APG no wrappea).
  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const enabled = this.tabs().filter((t) => !t.isDisabled());
    if (enabled.length === 0) {
      return;
    }
    event.preventDefault();

    const current = enabled.findIndex((t) => t.valueProp() === this.activeValue());
    let target: DsTabRegistration;
    switch (event.key) {
      case 'ArrowRight':
        target = enabled[(current + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        target = enabled[(current - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        target = enabled[0];
        break;
      default:
        target = enabled[enabled.length - 1];
    }

    this.value.set(target.valueProp());
    this.focusTab(target);
  }

  private focusTab(tab: DsTabRegistration): void {
    this.buttonRefs()
      .find((ref) => ref.nativeElement.id === tab.tabId())
      ?.nativeElement.focus();
  }
}
