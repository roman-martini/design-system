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
  { path: '', pathMatch: 'full' as const, redirectTo: HOME },
  { path: '**', redirectTo: HOME },
];
