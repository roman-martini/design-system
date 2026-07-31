import { existsSync, readFileSync } from 'node:fs';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsBreadcrumbItem } from './breadcrumb-item';
import { DsBreadcrumbs } from './breadcrumbs';
import { DsBreadcrumbsSeparator } from './breadcrumbs-separator';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss, readPublicApi } from '../../testing/css';

// Límite jsdom declarado: display:none del colapso y wrap responsive no se
// computan — se verifica la clase de estado + la fuente CSS; el layout se
// verifica a mano en playground.
const readSource = (relative: string): string => readComponentCss('breadcrumbs', relative);

interface Crumb {
  label: string;
  url: string | null;
}

@Component({
  standalone: true,
  imports: [DsBreadcrumbs, DsBreadcrumbItem, DsBreadcrumbsSeparator],
  template: `
    <ds-breadcrumbs aria-label="Ruta de navegación" [maxItems]="max()">
      @if (customSep()) {
        <ng-template dsBreadcrumbsSeparator>
          <span class="custom-sep">/</span>
        </ng-template>
      }
      @for (crumb of crumbs(); track crumb.label) {
        <ds-breadcrumb-item>
          @if (crumb.url !== null) {
            <a [href]="crumb.url">{{ crumb.label }}</a>
          } @else {
            {{ crumb.label }}
          }
        </ds-breadcrumb-item>
      }
    </ds-breadcrumbs>
  `,
})
class Host {
  readonly max = signal<number | null>(null);
  readonly customSep = signal(false);
  readonly crumbs = signal<Crumb[]>([
    { label: 'Inicio', url: '/' },
    { label: 'Docs', url: '/docs' },
    { label: 'Componentes', url: '/docs/componentes' },
    { label: 'Breadcrumbs', url: null },
  ]);
}

describe('DsBreadcrumbs + DsBreadcrumbItem', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const items = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="listitem"]'));
  const visibleItems = (): HTMLElement[] =>
    items().filter((i) => !i.classList.contains('ds-breadcrumb-item--hidden'));
  const ellipsis = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.ds-breadcrumb-item__ellipsis');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host, DsBreadcrumbs] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Scenario: estructura accesible (CA-014.1)
  it('renderiza nav con nombre accesible y lista con roles explícitos', () => {
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Ruta de navegación');
    const list: HTMLElement = fixture.nativeElement.querySelector('ol');
    expect(list.getAttribute('role')).toBe('list');
    expect(items().length).toBe(4);
  });

  it('sin aria-label del consumidor, el nav usa el default "breadcrumb"', () => {
    const solo = TestBed.createComponent(DsBreadcrumbs);
    solo.detectChanges();
    expect(solo.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('breadcrumb');
  });

  // Scenario: links agnósticos e item actual (CA-014.2)
  it('el último item expone aria-current="page" y se recalcula con items dinámicos', () => {
    expect(items()[3].getAttribute('aria-current')).toBe('page');
    expect(items()[0].getAttribute('aria-current')).toBeNull();

    host.crumbs.update((crumbs) => crumbs.slice(0, 3));
    fixture.detectChanges();
    expect(items().length).toBe(3);
    expect(items()[2].getAttribute('aria-current')).toBe('page');
  });

  it('el link proyectado queda intacto (navegación del consumidor)', () => {
    const link: HTMLAnchorElement = items()[1].querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.textContent?.trim()).toBe('Docs');
  });

  // Scenario: separador default y por template (CA-014.3)
  it('el separador default es el chevron decorativo y el primero no lo lleva', () => {
    const separators = items().map((i) => i.querySelector('.ds-breadcrumb-item__separator'));
    expect(separators[0]).toBeNull();
    for (const sep of separators.slice(1)) {
      expect(sep).not.toBeNull();
      expect(sep!.getAttribute('aria-hidden')).toBe('true');
      expect(sep!.querySelector('svg')).not.toBeNull();
    }
  });

  it('con template dsBreadcrumbsSeparator se renderiza el markup custom, no anunciado', () => {
    host.customSep.set(true);
    fixture.detectChanges();
    const sep = items()[1].querySelector('.ds-breadcrumb-item__separator')!;
    expect(sep.querySelector('.custom-sep')?.textContent).toBe('/');
    expect(sep.querySelector('svg')).toBeNull();
    expect(sep.getAttribute('aria-hidden')).toBe('true');
  });

  // Scenario: truncamiento opt-in con expansión inline (CA-014.4)
  it('con maxItems superado muestra primero + últimos y el botón "…" con nombre accesible', () => {
    host.max.set(3);
    fixture.detectChanges();
    // 4 items, max 3 → visibles: Inicio + Componentes + Breadcrumbs; oculto: Docs
    expect(visibleItems().length).toBe(3);
    expect(items()[1].classList.contains('ds-breadcrumb-item--hidden')).toBe(true);
    expect(ellipsis()).not.toBeNull();
    expect(ellipsis()!.getAttribute('aria-label')).toBe('Mostrar 1 nivel oculto');
  });

  it('activar "…" revela inline, elimina el botón y enfoca el primer revelado', async () => {
    host.max.set(3);
    fixture.detectChanges();
    ellipsis()!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(visibleItems().length).toBe(4);
    expect(ellipsis()).toBeNull();
    const revealedLink = items()[1].querySelector('a')!;
    expect(document.activeElement).toBe(revealedLink);
  });

  it('sin maxItems nunca hay colapso ni botón', () => {
    expect(visibleItems().length).toBe(4);
    expect(ellipsis()).toBeNull();
  });

  // Scenario: estilos por tokens (CA-014.5)
  it('el CSS de la familia no tiene hardcodes ni selectores de estado por descendencia', () => {
    const sources = ['breadcrumbs.css', 'breadcrumb-item.css'].map(readSource);
    expect(sources.every((css) => css.length > 0)).toBe(true);
    for (const css of sources) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    }
    // Lección aaa-026: el estado (current) vive en el elemento propio; el único
    // :host(...) de estado permitido es el del propio host (--hidden).
    expect(readSource('breadcrumb-item.css')).not.toMatch(/:host\([^)]*\)\s+[.\w[]/);
  });

  // Scenario: exportado desde los public-api
  it('el core se exporta en public-api.ts y el entry point router expone su public-api', () => {
    const publicApi = readPublicApi();
    expect(publicApi).toContain(`export * from './lib/breadcrumbs';`);

    const routerApiPath = [
      'router/src/public-api.ts',
      'packages/components/router/src/public-api.ts',
    ].find((p) => existsSync(p));
    const routerApi = routerApiPath ? readFileSync(routerApiPath, 'utf-8') : '';
    expect(routerApi).toContain('DsBreadcrumbsRouter');
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
