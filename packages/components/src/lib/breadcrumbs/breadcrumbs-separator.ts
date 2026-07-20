import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Template de separador del consumidor: <ng-template dsBreadcrumbsSeparator>.
 * Sin él, el separador es el chevron Lucide default (ADR-012).
 */
@Directive({ selector: 'ng-template[dsBreadcrumbsSeparator]' })
export class DsBreadcrumbsSeparator {
  readonly template = inject(TemplateRef);
}
