import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Contrato mínimo que DsAccordionItem cumple para que DsAccordion coordine
 * exclusividad y navegación sin importar DsAccordionItem directamente (evita
 * la dependencia circular — mismo patrón que DsOptionRegistration).
 */
export interface DsAccordionItemRegistration {
  isDisabled(): boolean;
  isExpanded(): boolean;
  collapse(): void;
  focusHeader(): void;
}

@Component({
  selector: 'ds-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
})
export class DsAccordion {
  readonly multiple = input<boolean>(false);
  // Nivel de heading de todos los headers de la instancia (jerarquía coherente
  // por diseño); un accordion anidado declara el suyo.
  readonly headingLevel = input<number>(3);

  private readonly items = signal<DsAccordionItemRegistration[]>([]);

  // API que los DsAccordionItem hijos consumen
  registerItem(item: DsAccordionItemRegistration): void {
    if (!this.items().includes(item)) {
      this.items.update((items) => [...items, item]);
    }
  }

  unregisterItem(item: DsAccordionItemRegistration): void {
    this.items.update((items) => items.filter((i) => i !== item));
  }

  // Exclusividad single: colapsa a los hermanos expandidos del item que se
  // expande (idempotente — solo escribe en los que están expandidos, sin
  // rebote con models controlados). Scoped a la instancia por inyección.
  notifyExpanded(item: DsAccordionItemRegistration): void {
    if (this.multiple()) {
      return;
    }
    for (const other of this.items()) {
      if (other !== item && other.isExpanded()) {
        other.collapse();
      }
    }
  }

  // Navegación APG accordion entre headers de la instancia: ↑/↓ con wrap y
  // Home/End, sin saltear disabled (descubribilidad, mismo criterio que
  // DsMenu). Los headers de un accordion anidado no participan (scoping por
  // inyección jerárquica).
  onHeaderKeydown(event: KeyboardEvent, item: DsAccordionItemRegistration): void {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const items = this.items();
    if (items.length === 0) {
      return;
    }
    event.preventDefault();

    const current = items.indexOf(item);
    let target: DsAccordionItemRegistration;
    switch (event.key) {
      case 'ArrowDown':
        target = items[(current + 1) % items.length];
        break;
      case 'ArrowUp':
        target = items[(current - 1 + items.length) % items.length];
        break;
      case 'Home':
        target = items[0];
        break;
      default:
        target = items[items.length - 1];
    }
    target.focusHeader();
  }
}
