import { Type } from '@angular/core';

/**
 * Registro único del showcase: fuente de verdad de rutas y sidebar
 * (design.md §1 de aaa-022). Agregar un componente al kit = agregar acá su
 * entrada + crear la vista `<slug>-showcase` (paso del workflow
 * /ds:add-component).
 */
export interface ShowcaseEntry {
  /** Segmento de ruta: /button, /radio-group, … */
  slug: string;
  /** Texto del sidebar. */
  label: string;
  /** Import lazy de la vista standalone. */
  loadComponent: () => Promise<Type<unknown>>;
}

export const SHOWCASE_ENTRIES: readonly ShowcaseEntry[] = [
  {
    slug: 'button',
    label: 'Button',
    loadComponent: () => import('./button/button-showcase').then((m) => m.ButtonShowcase),
  },
  {
    slug: 'checkbox',
    label: 'Checkbox',
    loadComponent: () => import('./checkbox/checkbox-showcase').then((m) => m.CheckboxShowcase),
  },
  {
    slug: 'radio',
    label: 'Radio',
    loadComponent: () => import('./radio/radio-showcase').then((m) => m.RadioShowcase),
  },
  {
    slug: 'radio-group',
    label: 'Radio Group',
    loadComponent: () =>
      import('./radio-group/radio-group-showcase').then((m) => m.RadioGroupShowcase),
  },
  {
    slug: 'modal',
    label: 'Modal',
    loadComponent: () => import('./modal/modal-showcase').then((m) => m.ModalShowcase),
  },
  {
    slug: 'select',
    label: 'Select',
    loadComponent: () => import('./select/select-showcase').then((m) => m.SelectShowcase),
  },
  {
    slug: 'input',
    label: 'Input',
    loadComponent: () => import('./input/input-showcase').then((m) => m.InputShowcase),
  },
  {
    slug: 'menu',
    label: 'Menu',
    loadComponent: () => import('./menu/menu-showcase').then((m) => m.MenuShowcase),
  },
  {
    slug: 'tabs',
    label: 'Tabs',
    loadComponent: () => import('./tabs/tabs-showcase').then((m) => m.TabsShowcase),
  },
  {
    slug: 'breadcrumbs',
    label: 'Breadcrumbs',
    loadComponent: () =>
      import('./breadcrumbs/breadcrumbs-showcase').then((m) => m.BreadcrumbsShowcase),
  },
  {
    slug: 'accordion',
    label: 'Accordion',
    loadComponent: () => import('./accordion/accordion-showcase').then((m) => m.AccordionShowcase),
  },
  {
    slug: 'pagination',
    label: 'Pagination',
    loadComponent: () =>
      import('./pagination/pagination-showcase').then((m) => m.PaginationShowcase),
  },
  {
    slug: 'tooltip',
    label: 'Tooltip',
    loadComponent: () => import('./tooltip/tooltip-showcase').then((m) => m.TooltipShowcase),
  },
  {
    slug: 'toast',
    label: 'Toast',
    loadComponent: () => import('./toast/toast-showcase').then((m) => m.ToastShowcase),
  },
  {
    slug: 'progress',
    label: 'Progress',
    loadComponent: () => import('./progress/progress-showcase').then((m) => m.ProgressShowcase),
  },
  {
    slug: 'skeleton',
    label: 'Skeleton',
    loadComponent: () => import('./skeleton/skeleton-showcase').then((m) => m.SkeletonShowcase),
  },
  {
    slug: 'spinner',
    label: 'Spinner',
    loadComponent: () => import('./spinner/spinner-showcase').then((m) => m.SpinnerShowcase),
  },
  {
    slug: 'iconography',
    label: 'Iconografía',
    loadComponent: () =>
      import('./iconography/iconography-showcase').then((m) => m.IconographyShowcase),
  },
];
