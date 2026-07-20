import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronsLeft,
  LucideChevronsRight,
} from '@lucide/angular';

export type DsPaginationVariant = 'numbered' | 'compact';

export type DsPaginationWindowItem = number | 'ellipsis';

/**
 * Ventana de páginas visibles (design §2): siempre 1 y `total`, `siblings`
 * vecinas por lado de `current`, huecos como 'ellipsis'. Regla anti-parpadeo:
 * un hueco de exactamente una página se rellena con el número.
 * Función pura, testeable sin TestBed.
 */
export function pageWindow(
  current: number,
  total: number,
  siblings: number,
): DsPaginationWindowItem[] {
  if (total <= 0) {
    return [];
  }
  // Ancho máximo de la ventana con elipsis: 1 + last + current + 2·siblings +
  // 2 slots de "…". Si el total entra ahí, la elipsis no ahorra nada: todo.
  if (total <= 2 * siblings + 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const page = Math.min(Math.max(current, 1), total);
  const start = Math.max(2, page - siblings);
  const end = Math.min(total - 1, page + siblings);

  const items: DsPaginationWindowItem[] = [1];
  if (start > 3) {
    items.push('ellipsis');
  } else if (start === 3) {
    items.push(2);
  }
  for (let p = start; p <= end; p++) {
    items.push(p);
  }
  if (end < total - 2) {
    items.push('ellipsis');
  } else if (end === total - 2) {
    items.push(total - 1);
  }
  if (total > 1) {
    items.push(total);
  }
  return items;
}

@Component({
  selector: 'ds-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  imports: [LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight],
})
export class DsPagination {
  readonly page = model<number>(1);
  readonly totalPages = input.required<number>();
  readonly siblingCount = input<number>(1);
  readonly variant = input<DsPaginationVariant>('numbered');

  // Labels accesibles configurables (CA-015.6); defaults en español, el
  // consumidor los reemplaza para i18n.
  readonly ariaLabel = input<string>('paginación', { alias: 'aria-label' });
  readonly firstLabel = input<string>('Primera página');
  readonly prevLabel = input<string>('Página anterior');
  readonly nextLabel = input<string>('Página siguiente');
  readonly lastLabel = input<string>('Última página');
  readonly pageLabel = input<string>('Página');
  readonly ofLabel = input<string>('de');

  // Página efectiva (patrón activeValue de DsTabs): la vista normaliza un
  // model fuera de rango sin sobrescribirlo de oficio (design §1).
  protected readonly effectivePage = computed(() =>
    Math.min(Math.max(this.page(), 1), Math.max(this.totalPages(), 1)),
  );

  protected readonly window = computed(() =>
    pageWindow(this.effectivePage(), this.totalPages(), this.siblingCount()),
  );

  protected readonly isFirstPage = computed(() => this.effectivePage() <= 1);
  protected readonly isLastPage = computed(() => this.effectivePage() >= this.totalPages());

  // Toda emisión queda dentro de [1, totalPages] (CA-015.2).
  protected goTo(target: number): void {
    const clamped = Math.min(Math.max(target, 1), Math.max(this.totalPages(), 1));
    if (clamped !== this.page()) {
      this.page.set(clamped);
    }
  }

  // ADR-011 (rama botón de acción): focusable + aria-disabled + guarda.
  protected onFirst(): void {
    if (!this.isFirstPage()) {
      this.goTo(1);
    }
  }

  protected onPrev(): void {
    if (!this.isFirstPage()) {
      this.goTo(this.effectivePage() - 1);
    }
  }

  protected onNext(): void {
    if (!this.isLastPage()) {
      this.goTo(this.effectivePage() + 1);
    }
  }

  protected onLast(): void {
    if (!this.isLastPage()) {
      this.goTo(this.totalPages());
    }
  }
}
