import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, type ActivatedRouteSnapshot } from '@angular/router';
import {
  DsBreadcrumbItem,
  DsBreadcrumbs,
  DsBreadcrumbsSeparator,
} from '@romanmartinidev/components';
import { filter } from 'rxjs';

/** Resolver síncrono y puro para `data.breadcrumb` (HU-014 decisión 4). */
export type DsBreadcrumbResolver = (route: ActivatedRouteSnapshot) => string;

interface DsBreadcrumbEntry {
  label: string;
  url: string;
}

/**
 * Recorre la rama primaria del árbol de rutas acumulando la URL y arma un
 * crumb por cada ruta con `data.breadcrumb` (string o resolver); las rutas
 * sin la data se omiten.
 */
function buildCrumbs(root: ActivatedRouteSnapshot): DsBreadcrumbEntry[] {
  const crumbs: DsBreadcrumbEntry[] = [];
  let url = '';
  let route: ActivatedRouteSnapshot | null = root;
  while (route !== null) {
    const segment = route.url.map((s) => s.path).join('/');
    if (segment) {
      url += `/${segment}`;
    }
    // Data PROPIA de la config (route.data heredaría la de padres componentless
    // y duplicaría crumbs en rutas intermedias sin data declarada).
    const data = route.routeConfig?.data?.['breadcrumb'] as
      | string
      | DsBreadcrumbResolver
      | undefined;
    if (data !== undefined) {
      const label = typeof data === 'function' ? data(route) : String(data);
      crumbs.push({ label, url: url || '/' });
    }
    route = route.firstChild;
  }
  return crumbs;
}

@Component({
  selector: 'ds-breadcrumbs-router',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumbs-router.html',
  imports: [DsBreadcrumbs, DsBreadcrumbItem, DsBreadcrumbsSeparator, NgTemplateOutlet, RouterLink],
})
export class DsBreadcrumbsRouter {
  readonly ariaLabel = input<string>('breadcrumb', { alias: 'aria-label' });
  readonly maxItems = input<number | null>(null);

  private readonly router = inject(Router);

  // Template de separador del consumidor, reenviado al core.
  protected readonly separator = contentChild(DsBreadcrumbsSeparator);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    { initialValue: null },
  );

  protected readonly crumbs = computed(() => {
    this.navigationEnd(); // recomputa en cada navegación
    return buildCrumbs(this.router.routerState.snapshot.root);
  });
}
