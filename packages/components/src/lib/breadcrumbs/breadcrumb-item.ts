import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';

import { DsBreadcrumbs, type DsBreadcrumbItemRegistration } from './breadcrumbs';

@Component({
  selector: 'ds-breadcrumb-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb-item.html',
  styleUrl: './breadcrumb-item.css',
  imports: [LucideChevronRight, NgTemplateOutlet],
  host: {
    role: 'listitem',
    // El item actual se marca en el listitem (conforme ARIA; no se manipula
    // el link proyectado del consumidor).
    '[attr.aria-current]': 'isLast() ? "page" : null',
    '[class.ds-breadcrumb-item--hidden]': 'isHidden()',
  },
})
export class DsBreadcrumbItem implements DsBreadcrumbItemRegistration, OnInit, OnDestroy {
  protected readonly breadcrumbs = inject(DsBreadcrumbs);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.breadcrumbs.registerItem(this);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.unregisterItem(this);
  }

  // DsBreadcrumbItemRegistration
  focusContent(): void {
    this.host.nativeElement.querySelector<HTMLElement>('a, button, [tabindex]')?.focus();
  }

  protected isFirst(): boolean {
    return this.breadcrumbs.isFirst(this);
  }

  protected isLast(): boolean {
    return this.breadcrumbs.isLast(this);
  }

  protected isHidden(): boolean {
    return this.breadcrumbs.isHidden(this);
  }

  protected showsEllipsisBefore(): boolean {
    return this.breadcrumbs.showsEllipsisBefore(this);
  }

  protected ellipsisLabel(): string {
    const count = this.breadcrumbs.hiddenCount();
    return count === 1 ? 'Mostrar 1 nivel oculto' : `Mostrar ${count} niveles ocultos`;
  }

  protected onEllipsisClick(): void {
    this.breadcrumbs.expand();
  }
}
