import { existsSync, readFileSync } from 'node:fs';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsPagination, pageWindow } from './pagination';

function readSource(relative: string): string {
  const path = [
    `src/lib/pagination/${relative}`,
    `packages/components/src/lib/pagination/${relative}`,
  ].find((p) => existsSync(p));
  return path ? readFileSync(path, 'utf-8') : '';
}

describe('pageWindow (función pura)', () => {
  it('total que entra completo: sin elipsis', () => {
    expect(pageWindow(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('total largo con current en el medio: elipsis en ambos huecos', () => {
    expect(pageWindow(10, 20, 1)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('current en los extremos: elipsis solo del lado largo', () => {
    expect(pageWindow(1, 20, 1)).toEqual([1, 2, 'ellipsis', 20]);
    expect(pageWindow(20, 20, 1)).toEqual([1, 'ellipsis', 19, 20]);
  });

  it('regla anti-parpadeo: un hueco de una sola página se rellena con el número', () => {
    // start sería 3 → el 2 se muestra en vez de "…"
    expect(pageWindow(4, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
    // simétrico al final
    expect(pageWindow(17, 20, 1)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });

  it('siblings 0 y 2', () => {
    expect(pageWindow(10, 20, 0)).toEqual([1, 'ellipsis', 10, 'ellipsis', 20]);
    expect(pageWindow(10, 20, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20]);
  });

  it('bordes degenerados: total 1 y total 0', () => {
    expect(pageWindow(1, 1, 1)).toEqual([1]);
    expect(pageWindow(3, 0, 1)).toEqual([]);
  });

  it('current fuera de rango se clampa', () => {
    expect(pageWindow(99, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });
});

@Component({
  standalone: true,
  imports: [DsPagination],
  template: `
    <ds-pagination
      [(page)]="page"
      [totalPages]="total()"
      [siblingCount]="siblings()"
      [variant]="variant()"
      aria-label="Resultados"
    />
  `,
})
class Host {
  readonly page = signal(1);
  readonly total = signal(20);
  readonly siblings = signal(1);
  readonly variant = signal<'numbered' | 'compact'>('numbered');
}

describe('DsPagination', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  // Selección por rol/label (no por clase CSS): botón de página = nombre
  // accesible "Página N"; el resto de los buttons son controles de extremo.
  const allButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button'));
  const isPageButton = (b: HTMLButtonElement): boolean =>
    /^Página \d+$/.test(b.getAttribute('aria-label') ?? '');
  const pageButtons = (): HTMLButtonElement[] => allButtons().filter(isPageButton);
  const controls = (): HTMLButtonElement[] => allButtons().filter((b) => !isPageButton(b));
  const byLabel = (label: string): HTMLButtonElement =>
    allButtons().find((c) => c.getAttribute('aria-label') === label)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Scenario: estructura accesible (CA-015.1)
  it('renderiza nav con nombre accesible, botones "Página N" y aria-current en la actual', () => {
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Resultados');
    expect(fixture.nativeElement.querySelector('ul').getAttribute('role')).toBe('list');
    const current = pageButtons().find((b) => b.getAttribute('aria-current') === 'page')!;
    expect(current.getAttribute('aria-label')).toBe('Página 1');
    // el nombre accesible coincide con el número visible de cada botón
    expect(
      pageButtons().every(
        (b) => b.getAttribute('aria-label') === `Página ${b.textContent!.trim()}`,
      ),
    ).toBe(true);
  });

  it('con totalPages 0 no renderiza páginas (caso degenerado del @empty)', () => {
    host.total.set(0);
    fixture.detectChanges();
    expect(pageButtons().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.ds-pagination__ellipsis')).toBeNull();
  });

  // Scenario: modelo two-way con emisiones acotadas (CA-015.2)
  it('click actualiza el model y el set programático actualiza el render', () => {
    pageButtons()
      .find((b) => b.textContent!.trim() === '20')!
      .click();
    fixture.detectChanges();
    expect(host.page()).toBe(20);

    host.page.set(10);
    fixture.detectChanges();
    const current = pageButtons().find((b) => b.getAttribute('aria-current') === 'page')!;
    expect(current.textContent!.trim()).toBe('10');
  });

  it('page fuera de rango normaliza la vista sin pisar el model', () => {
    host.page.set(99);
    fixture.detectChanges();
    const current = pageButtons().find((b) => b.getAttribute('aria-current') === 'page')!;
    expect(current.textContent!.trim()).toBe('20');
    expect(host.page()).toBe(99); // el model es del consumidor
    // pero navegar desde ahí emite dentro del rango
    byLabel('Página anterior').click();
    fixture.detectChanges();
    expect(host.page()).toBe(19);
  });

  // Scenario: navegación y extremos disabled accesibles (CA-015.3)
  it('prev/next/first/last navegan y en los extremos quedan disabled accesibles con guarda', () => {
    host.page.set(10);
    fixture.detectChanges();
    byLabel('Página siguiente').click();
    fixture.detectChanges();
    expect(host.page()).toBe(11);
    byLabel('Última página').click();
    fixture.detectChanges();
    expect(host.page()).toBe(20);

    // en la última: next/last disabled accesibles
    expect(byLabel('Página siguiente').getAttribute('aria-disabled')).toBe('true');
    expect(byLabel('Última página').getAttribute('aria-disabled')).toBe('true');
    expect(byLabel('Última página').hasAttribute('disabled')).toBe(false);
    byLabel('Página siguiente').click();
    fixture.detectChanges();
    expect(host.page()).toBe(20); // guarda: sin acción

    byLabel('Primera página').click();
    fixture.detectChanges();
    expect(host.page()).toBe(1);
    expect(byLabel('Primera página').getAttribute('aria-disabled')).toBe('true');
    expect(byLabel('Página anterior').getAttribute('aria-disabled')).toBe('true');
  });

  // Scenario: ventana con elipsis estática (CA-015.4)
  it('la elipsis se renderiza decorativa y la ventana respeta siblingCount', () => {
    host.page.set(10);
    fixture.detectChanges();
    const ellipses: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.ds-pagination__ellipsis'),
    );
    expect(ellipses.length).toBe(2);
    expect(ellipses.every((e) => e.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(ellipses.every((e) => e.tagName !== 'BUTTON')).toBe(true);
    expect(pageButtons().map((b) => b.textContent!.trim())).toEqual(['1', '9', '10', '11', '20']);

    host.siblings.set(2);
    fixture.detectChanges();
    expect(pageButtons().map((b) => b.textContent!.trim())).toEqual([
      '1',
      '8',
      '9',
      '10',
      '11',
      '12',
      '20',
    ]);
  });

  it('con un total que entra completo no hay elipsis', () => {
    host.total.set(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-pagination__ellipsis')).toBeNull();
    expect(pageButtons().length).toBe(5);
  });

  // Scenario: variante compacta (CA-015.5)
  it('compact renderiza solo extremos + contador y mantiene modelo y disabled', () => {
    host.variant.set('compact');
    host.page.set(3);
    fixture.detectChanges();
    expect(pageButtons().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.ds-pagination__counter').textContent!.trim()).toBe(
      '3 de 20',
    );
    expect(controls().length).toBe(4);
    byLabel('Página siguiente').click();
    fixture.detectChanges();
    expect(host.page()).toBe(4);
    host.page.set(1);
    fixture.detectChanges();
    expect(byLabel('Primera página').getAttribute('aria-disabled')).toBe('true');
  });

  // Scenario: labels configurables (CA-015.6)
  it('los labels default están en español y son reemplazables por inputs', () => {
    const solo = TestBed.createComponent(DsPagination);
    solo.componentRef.setInput('totalPages', 3);
    solo.detectChanges();
    expect(solo.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('paginación');

    solo.componentRef.setInput('pageLabel', 'Page');
    solo.componentRef.setInput('nextLabel', 'Next page');
    solo.detectChanges();
    const labels = Array.from(solo.nativeElement.querySelectorAll<HTMLElement>('button')).map((c) =>
      c.getAttribute('aria-label'),
    );
    expect(labels).toContain('Page 1');
    expect(labels).toContain('Next page');
  });

  // Scenario: estilos por tokens (CA-015.7)
  it('el CSS no tiene hardcodes ni selectores de estado por descendencia desde :host', () => {
    const css = readSource('pagination.css');
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    expect(css).not.toMatch(/:host\([^)]*\)\s+[.\w[]/);
  });

  // Scenario: exportado desde public-api.ts
  it('el componente se exporta en public-api.ts', () => {
    const publicApiPath = ['src/public-api.ts', 'packages/components/src/public-api.ts'].find((p) =>
      existsSync(p),
    );
    const publicApi = publicApiPath ? readFileSync(publicApiPath, 'utf-8') : '';
    expect(publicApi).toContain(`export * from './lib/pagination';`);
  });
});
