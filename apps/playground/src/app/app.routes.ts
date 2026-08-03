import { Routes } from '@angular/router';

import { SHOWCASE_ENTRIES } from './showcase/registry';

const HOME = SHOWCASE_ENTRIES[0].slug;

// Rutas generadas desde el registro único (design.md §1 de aaa-022): una ruta
// lazy por componente; '' y desconocidas redirigen al primer entregable.
export const routes: Routes = [
  ...SHOWCASE_ENTRIES.map((entry) => ({
    path: entry.slug,
    loadComponent: entry.loadComponent,
    title: `${entry.label} — Showcase`,
    // Rastro para el demo de auto-generación de ds-breadcrumbs-router (aaa-027)
    data: { breadcrumb: entry.label },
  })),
  // Prototipo del hito H1 (D-023): no es un showcase de componente, es una
  // pantalla real construida con el kit. Va fuera de SHOWCASE_ENTRIES a
  // propósito — ese registro es el catálogo por componente.
  {
    path: 'prototipo',
    loadComponent: () => import('./prototype/upgrade-form').then((m) => m.UpgradeForm),
    title: 'Prototipo — Upgrade subscription',
    data: { breadcrumb: 'Prototipo' },
  },
  { path: '', pathMatch: 'full' as const, redirectTo: HOME },
  { path: '**', redirectTo: HOME },
];
