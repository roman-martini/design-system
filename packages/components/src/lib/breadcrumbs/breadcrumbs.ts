import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';

import { DsBreadcrumbsSeparator } from './breadcrumbs-separator';

/**
 * Contrato mínimo que DsBreadcrumbItem cumple para que DsBreadcrumbs coordine
 * posiciones, colapso y foco sin importarlo directamente (evita la dependencia
 * circular — mismo patrón que DsAccordionItemRegistration).
 */
export interface DsBreadcrumbItemRegistration {
  focusContent(): void;
}

@Component({
  selector: 'ds-breadcrumbs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css',
})
export class DsBreadcrumbs {
  // Nombre accesible del landmark nav (el consumidor lo traduce si hace falta).
  readonly ariaLabel = input<string>('breadcrumb', { alias: 'aria-label' });
  // Truncamiento opt-in: sin valor nunca hay colapso (HU-014 decisión 3).
  readonly maxItems = input<number | null>(null);

  private readonly injector = inject(Injector);
  private readonly separator = contentChild(DsBreadcrumbsSeparator);

  private readonly items = signal<DsBreadcrumbItemRegistration[]>([]);
  private readonly expanded = signal(false);

  // Rango de índices ocultos [start, end) — visibles: primero + últimos
  // (maxItems - 1). Null cuando no hay colapso.
  private readonly collapsedRange = computed(() => {
    const max = this.maxItems();
    const count = this.items().length;
    if (max === null || max < 2 || this.expanded() || count <= max) {
      return null;
    }
    return { start: 1, end: count - (max - 1) };
  });

  // API que los DsBreadcrumbItem hijos consumen
  registerItem(item: DsBreadcrumbItemRegistration): void {
    if (!this.items().includes(item)) {
      this.items.update((items) => [...items, item]);
    }
  }

  unregisterItem(item: DsBreadcrumbItemRegistration): void {
    this.items.update((items) => items.filter((i) => i !== item));
  }

  separatorTemplate(): TemplateRef<unknown> | null {
    return this.separator()?.template ?? null;
  }

  isFirst(item: DsBreadcrumbItemRegistration): boolean {
    return this.items().indexOf(item) === 0;
  }

  isLast(item: DsBreadcrumbItemRegistration): boolean {
    const items = this.items();
    return items.indexOf(item) === items.length - 1;
  }

  isHidden(item: DsBreadcrumbItemRegistration): boolean {
    const range = this.collapsedRange();
    if (range === null) {
      return false;
    }
    const index = this.items().indexOf(item);
    return index >= range.start && index < range.end;
  }

  showsEllipsisBefore(item: DsBreadcrumbItemRegistration): boolean {
    const range = this.collapsedRange();
    return range !== null && this.items().indexOf(item) === range.end;
  }

  hiddenCount(): number {
    const range = this.collapsedRange();
    return range === null ? 0 : range.end - range.start;
  }

  // Expansión inline (HU-014 decisión 3): revela los ocultos y mueve el foco
  // al primer item revelado una vez renderizado.
  expand(): void {
    const range = this.collapsedRange();
    if (range === null) {
      return;
    }
    const firstRevealed = this.items()[range.start];
    this.expanded.set(true);
    afterNextRender(() => firstRevealed?.focusContent(), { injector: this.injector });
  }
}
