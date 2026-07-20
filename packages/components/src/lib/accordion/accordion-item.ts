import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  untracked,
  viewChild,
} from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

import { DsAccordion, type DsAccordionItemRegistration } from './accordion';

let nextAccordionItemId = 0;

@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion-item.html',
  styleUrl: './accordion-item.css',
  imports: [LucideChevronDown],
  host: {
    '[class.ds-accordion-item--expanded]': 'expanded()',
  },
})
export class DsAccordionItem implements DsAccordionItemRegistration, OnInit, OnDestroy {
  readonly expanded = model<boolean>(false);
  readonly disabled = input<boolean>(false);

  private readonly uid = nextAccordionItemId++;
  protected readonly headerId = `ds-accordion-header-${this.uid}`;
  protected readonly panelId = `ds-accordion-panel-${this.uid}`;

  // El contenedor más cercano: un item anidado se registra en su propio
  // accordion, nunca en el del padre (scoping por inyección jerárquica).
  protected readonly accordion = inject(DsAccordion);

  private readonly headerButton = viewChild.required<ElementRef<HTMLButtonElement>>('headerButton');

  constructor() {
    // Cualquier vía de expansión (toggle o model programático) dispara la
    // exclusividad del contenedor — el estado nunca diverge del consumidor.
    // untracked: el effect depende solo del expanded PROPIO; si trackeara las
    // lecturas de isExpanded() de los hermanos, el effect de un item expandido
    // se re-ejecutaría cuando otro se expande y re-impondría su exclusividad
    // colapsando al recién abierto.
    effect(() => {
      if (this.expanded()) {
        untracked(() => this.accordion.notifyExpanded(this));
      }
    });
  }

  ngOnInit(): void {
    this.accordion.registerItem(this);
  }

  ngOnDestroy(): void {
    this.accordion.unregisterItem(this);
  }

  // DsAccordionItemRegistration
  isDisabled(): boolean {
    return this.disabled();
  }

  isExpanded(): boolean {
    return this.expanded();
  }

  collapse(): void {
    this.expanded.set(false);
  }

  focusHeader(): void {
    this.headerButton().nativeElement.focus();
  }

  // ADR-011 (rama botón de acción): focusable + aria-disabled + guarda.
  protected onToggle(): void {
    if (this.disabled()) {
      return;
    }
    this.expanded.update((expanded) => !expanded);
  }

  protected onHeaderKeydown(event: KeyboardEvent): void {
    this.accordion.onHeaderKeydown(event, this);
  }
}
