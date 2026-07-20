import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, type ActivatedRouteSnapshot, type Routes } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsBreadcrumbsRouter } from './breadcrumbs-router';

@Component({ standalone: true, template: '' })
class Dummy {}

const routes: Routes = [
  { path: '', pathMatch: 'full', component: Dummy, data: { breadcrumb: 'Inicio' } },
  {
    path: 'docs',
    data: { breadcrumb: 'Docs' },
    children: [
      { path: '', pathMatch: 'full', component: Dummy },
      {
        // Sin data.breadcrumb: este nivel se omite del rastro
        path: 'guias',
        children: [
          {
            path: 'perfil/:id',
            component: Dummy,
            data: {
              breadcrumb: (route: ActivatedRouteSnapshot) => `Perfil ${route.params['id']}`,
            },
          },
        ],
      },
    ],
  },
];

@Component({
  standalone: true,
  imports: [DsBreadcrumbsRouter],
  template: '<ds-breadcrumbs-router aria-label="Ubicación" />',
})
class Host {}

describe('DsBreadcrumbsRouter (@romanmartinidev/components/router)', () => {
  let fixture: ComponentFixture<Host>;
  let router: Router;

  const labels = (): string[] =>
    Array.from(
      fixture.nativeElement.querySelectorAll<HTMLElement>('.ds-breadcrumb-item__content'),
    ).map((c) => c.textContent!.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter(routes)],
    }).compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  // Scenario: auto-generación desde rutas (CA-014.6)
  it('genera items desde el árbol de rutas con labels string y resolver, omitiendo rutas sin data', async () => {
    await router.navigate(['/docs/guias/perfil/7']);
    fixture.detectChanges();
    // 'guias' no tiene data.breadcrumb → omitida; el resolver recibe los params
    expect(labels()).toEqual(['Docs', 'Perfil 7']);
  });

  it('los items no finales son links con la URL acumulada y el final es la ubicación actual', async () => {
    await router.navigate(['/docs/guias/perfil/7']);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.ds-breadcrumb-item__content a',
    )!;
    expect(link.getAttribute('href')).toBe('/docs');
    const listitems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="listitem"]'),
    );
    expect(listitems.at(-1)!.getAttribute('aria-current')).toBe('page');
    expect(listitems.at(-1)!.querySelector('a')).toBeNull();
  });

  it('se actualiza en cada navegación', async () => {
    await router.navigate(['/docs/guias/perfil/7']);
    fixture.detectChanges();
    expect(labels()).toEqual(['Docs', 'Perfil 7']);

    await router.navigate(['/docs']);
    fixture.detectChanges();
    expect(labels()).toEqual(['Docs']);

    await router.navigate(['/']);
    fixture.detectChanges();
    expect(labels()).toEqual(['Inicio']);
  });

  it('reenvía el aria-label al nav del core', () => {
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Ubicación');
  });
});
