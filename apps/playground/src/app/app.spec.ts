import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';
import { routes } from './app.routes';
import { SHOWCASE_ENTRIES } from './showcase/registry';

const HOME = SHOWCASE_ENTRIES[0].slug;

describe('Showcase — navegación', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  // Parametrizado sobre el registro, no sobre una lista escrita a mano: una
  // entrada nueva queda cubierta sin tocar este archivo (aaa-042, design D8).
  // Asserta que la vista montó; lo que cada vista muestra es asunto del spec
  // del componente — replicar eso acá sería mantenimiento por entrada.
  it.each(SHOWCASE_ENTRIES.map((e) => [e.slug, e.label] as const))(
    '/%s monta la vista de %s (ruta lazy)',
    async (slug) => {
      const harness = await RouterTestingHarness.create(`/${slug}`);

      expect(TestBed.inject(Location).path()).toBe(`/${slug}`);
      expect(harness.routeNativeElement).not.toBeNull();
      expect(harness.routeNativeElement?.textContent?.trim()).not.toBe('');
    },
  );

  it('/button renderiza la vista del Button (ruta lazy)', async () => {
    const harness = await RouterTestingHarness.create('/button');
    // Queries por contenido/rol, no por tag del DS: casos de uso del button visibles
    const headings = Array.from(harness.routeNativeElement?.querySelectorAll('h2') ?? []);
    expect(headings.map((h) => h.textContent?.trim())).toContain('Variants');
  });

  it('/select renderiza la vista del Select', async () => {
    const harness = await RouterTestingHarness.create('/select');
    expect(harness.routeNativeElement?.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('la ruta vacía redirige a la primera entrada del registro', async () => {
    await RouterTestingHarness.create('/');
    expect(TestBed.inject(Location).path()).toBe(`/${HOME}`);
  });

  it('una ruta desconocida redirige sin pantalla rota', async () => {
    await RouterTestingHarness.create('/no-existe');
    expect(TestBed.inject(Location).path()).toBe(`/${HOME}`);
  });
});

describe('Showcase — shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('el sidebar es un nav accesible con un link por entregable', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav[aria-label="Componentes"]');
    expect(nav).not.toBeNull();
    const links = nav.querySelectorAll('a[href]');
    expect(links.length).toBe(SHOWCASE_ENTRIES.length);
  });

  it('el link de la vista activa expone aria-current="page"', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/checkbox');
    await fixture.whenStable();
    fixture.detectChanges();

    const active = fixture.nativeElement.querySelector('nav a[aria-current="page"]');
    expect(active?.textContent?.trim()).toBe('Checkbox');
  });
});
