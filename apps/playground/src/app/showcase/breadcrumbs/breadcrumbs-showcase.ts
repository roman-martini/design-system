import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DsBreadcrumbItem,
  DsBreadcrumbs,
  DsBreadcrumbsSeparator,
} from '@romanmartinidev/components';
import { DsBreadcrumbsRouter } from '@romanmartinidev/components/router';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-breadcrumbs-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumbs-showcase.html',
  imports: [
    DsBreadcrumbs,
    DsBreadcrumbItem,
    DsBreadcrumbsSeparator,
    DsBreadcrumbsRouter,
    ShowcaseCase,
  ],
})
export class BreadcrumbsShowcase {
  protected readonly basicSnippet = `<ds-breadcrumbs>
  <ds-breadcrumb-item><a routerLink="/">Inicio</a></ds-breadcrumb-item>
  <ds-breadcrumb-item><a routerLink="/docs">Docs</a></ds-breadcrumb-item>
  <ds-breadcrumb-item>Página actual</ds-breadcrumb-item>
</ds-breadcrumbs>`;

  protected readonly separatorSnippet = `<ds-breadcrumbs>
  <ng-template dsBreadcrumbsSeparator><span>/</span></ng-template>
  …items…
</ds-breadcrumbs>`;

  protected readonly truncatedSnippet = `<ds-breadcrumbs [maxItems]="3">
  <!-- con más de 3 items: primero + "…" + últimos 2 -->
  …items…
</ds-breadcrumbs>`;

  protected readonly routerSnippet = `// rutas: data: { breadcrumb: 'Etiqueta' } o (route) => string
// import { DsBreadcrumbsRouter } from '@romanmartinidev/components/router';
<ds-breadcrumbs-router aria-label="Ubicación" />`;
}
