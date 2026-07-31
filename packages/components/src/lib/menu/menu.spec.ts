import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucidePencil } from '@lucide/angular';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { DsMenu } from './menu';
import { DsMenuItem } from './menu-item';
import { DsMenuSeparator } from './menu-separator';
import { DsMenuTrigger } from './menu-trigger';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss, readPublicApi } from '../../testing/css';

// Angular intercepta los imports de .css (incluso ?raw), de ahí el readFileSync.
// Límite jsdom declarado (design §Risks): el top layer, el anidamiento real de
// popovers y el posicionamiento lateral se verifican a mano en playground.
const readSource = (relative: string): string => readComponentCss('menu', relative);

@Component({
  standalone: true,
  imports: [DsMenu, DsMenuItem, DsMenuSeparator, DsMenuTrigger, LucidePencil],
  template: `
    <button type="button" [dsMenuTriggerFor]="menu">Acciones</button>
    <ds-menu #menu>
      <ds-menu-item (selected)="edited = true">
        <svg lucidePencil size="16" strokeWidth="1.5" aria-hidden="true"></svg>
        Editar
      </ds-menu-item>
      <ds-menu-item (selected)="duplicated = true">Duplicar</ds-menu-item>
      <ds-menu-separator />
      <ds-menu-item [disabled]="true" (selected)="archived = true">Archivar</ds-menu-item>
      <ds-menu-item [submenu]="sub">Exportar</ds-menu-item>
      <ds-menu #sub>
        <ds-menu-item (selected)="exportedPdf = true">PDF</ds-menu-item>
        <ds-menu-item>CSV</ds-menu-item>
      </ds-menu>
      <ds-menu-item [danger]="true" (selected)="deleted = true">Eliminar</ds-menu-item>
    </ds-menu>
  `,
})
class MenuHost {
  edited = false;
  duplicated = false;
  archived = false;
  exportedPdf = false;
  deleted = false;
}

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('DsMenu family', () => {
  let fixture: ComponentFixture<MenuHost>;
  let host: MenuHost;
  let trigger: HTMLButtonElement;
  let rootPanel: HTMLElement;
  let subPanel: HTMLElement;
  let items: HTMLElement[];
  let rootItems: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuHost] }).compileComponents();
    fixture = TestBed.createComponent(MenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // `fixture.nativeElement` es `any`: tipar la raíz permite que el typecheck
    // verifique estas consultas en vez de darlas por buenas.
    const root = fixture.nativeElement as HTMLElement;
    trigger = root.querySelector('button')!;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="menu"]'));
    [rootPanel, subPanel] = panels;
    items = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    // Items del nivel raíz (excluye PDF y CSV, que viven en el subpanel).
    rootItems = items.filter((item) => !subPanel.contains(item));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const openRoot = (): void => {
    trigger.click();
    fixture.detectChanges();
  };

  // Scenario: apertura desde el trigger (CA-012.1)
  it('cablea el patrón menu button en el trigger y abre por click con foco en el primer item', () => {
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(rootPanel.getAttribute('popover')).toBe('auto');

    openRoot();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(rootPanel.id);
    expect(document.activeElement).toBe(rootItems[0]);
  });

  it('abre con ArrowDown y ArrowUp desde el trigger', () => {
    for (const key of ['ArrowDown', 'ArrowUp']) {
      keydown(trigger, key);
      fixture.detectChanges();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      keydown(rootPanel, 'Escape');
      fixture.detectChanges();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
  });

  // Scenario: navegación por teclado con typeahead (CA-012.2)
  it('ArrowDown/ArrowUp navegan con wrap sin saltear disabled; Home/End van a los extremos', () => {
    openRoot();
    keydown(rootPanel, 'ArrowDown');
    expect(document.activeElement).toBe(rootItems[1]);
    keydown(rootPanel, 'ArrowDown');
    // No saltea el item disabled (descubribilidad, ADR-011).
    expect(document.activeElement).toBe(rootItems[2]);
    keydown(rootPanel, 'End');
    expect(document.activeElement).toBe(rootItems[4]);
    keydown(rootPanel, 'ArrowDown'); // wrap al primero
    expect(document.activeElement).toBe(rootItems[0]);
    keydown(rootPanel, 'ArrowUp'); // wrap al último
    expect(document.activeElement).toBe(rootItems[4]);
    keydown(rootPanel, 'Home');
    expect(document.activeElement).toBe(rootItems[0]);
  });

  it('typeahead salta al siguiente item que empieza con el carácter tipeado', () => {
    vi.useFakeTimers();
    openRoot();
    keydown(rootPanel, 'd');
    expect(document.activeElement).toBe(rootItems[1]); // Duplicar
    vi.advanceTimersByTime(600); // vence el reset del buffer (500 ms)
    keydown(rootPanel, 'e');
    // Desde Duplicar, el siguiente con "e" es Exportar (no vuelve a Editar).
    expect(document.activeElement).toBe(rootItems[3]);
    // Sin esperar el reset, el buffer refina: "ex" sigue en Exportar.
    keydown(rootPanel, 'x');
    expect(document.activeElement).toBe(rootItems[3]);
  });

  it('Escape cierra el menú y devuelve el foco al trigger', () => {
    openRoot();
    keydown(rootPanel, 'Escape');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab cierra todo el árbol antes de ceder el foco (APG menu button)', () => {
    openRoot();
    keydown(rootPanel, 'Tab');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Desde un submenú abierto, Tab también cierra el árbol completo.
    openRoot();
    const submenuItem = rootItems[3];
    submenuItem.focus();
    keydown(submenuItem, 'ArrowRight');
    fixture.detectChanges();
    keydown(subPanel, 'Tab');
    fixture.detectChanges();
    expect(submenuItem.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: activación de un item (CA-012.3)
  it('activar un item por click emite selected, cierra el árbol y devuelve el foco al trigger', () => {
    openRoot();
    rootItems[1].click();
    fixture.detectChanges();
    expect(host.duplicated).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('activar un item por Enter emite selected y cierra', () => {
    openRoot();
    keydown(rootItems[0], 'Enter');
    fixture.detectChanges();
    expect(host.edited).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: contenido de items — icono, danger y separador (CA-012.4)
  it('el icono proyectado es decorativo (aria-hidden, convención ADR-012)', () => {
    const icon = rootItems[0].querySelector('svg:not(.ds-menu-item__chevron)');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
  });

  it('el item danger lleva la clase de variante tokenizada', () => {
    expect(rootItems[4].classList.contains('ds-menu-item--danger')).toBe(true);
  });

  it('el separador expone role="separator" y no es focusable', () => {
    const separator = fixture.nativeElement.querySelector('[role="separator"]');
    expect(separator).toBeTruthy();
    expect(separator.hasAttribute('tabindex')).toBe(false);
  });

  // Scenario: item disabled accesible (CA-012.5)
  it('el item disabled es focusable, expone aria-disabled y no ejecuta ni cierra', () => {
    openRoot();
    const disabledItem = rootItems[2];
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
    expect(disabledItem.getAttribute('tabindex')).toBe('-1');
    disabledItem.focus();
    expect(document.activeElement).toBe(disabledItem);
    disabledItem.click();
    fixture.detectChanges();
    expect(host.archived).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true'); // sigue abierto
  });

  // Scenario: submenú anidado (CA-012.6)
  it('el item con submenú expone aria-haspopup/aria-expanded y abre con ArrowRight enfocando el primer item', () => {
    openRoot();
    const submenuItem = rootItems[3];
    expect(submenuItem.getAttribute('aria-haspopup')).toBe('menu');
    expect(submenuItem.getAttribute('aria-expanded')).toBe('false');

    submenuItem.focus();
    keydown(submenuItem, 'ArrowRight');
    fixture.detectChanges();
    expect(submenuItem.getAttribute('aria-expanded')).toBe('true');
    const subItems = Array.from(subPanel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(document.activeElement).toBe(subItems[0]);
  });

  it('ArrowLeft y Escape cierran solo el submenú devolviendo el foco al item padre', () => {
    openRoot();
    const submenuItem = rootItems[3];
    submenuItem.focus();

    for (const key of ['ArrowLeft', 'Escape']) {
      keydown(submenuItem, 'ArrowRight');
      fixture.detectChanges();
      expect(submenuItem.getAttribute('aria-expanded')).toBe('true');
      keydown(subPanel, key);
      fixture.detectChanges();
      expect(submenuItem.getAttribute('aria-expanded')).toBe('false');
      expect(trigger.getAttribute('aria-expanded')).toBe('true'); // la raíz sigue abierta
      expect(document.activeElement).toBe(submenuItem);
    }
  });

  it('activar una hoja del submenú cierra todo el árbol', () => {
    openRoot();
    const submenuItem = rootItems[3];
    submenuItem.focus();
    keydown(submenuItem, 'ArrowRight');
    fixture.detectChanges();
    const subItems = Array.from(subPanel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    subItems[0].click();
    fixture.detectChanges();
    expect(host.exportedPdf).toBe(true);
    expect(submenuItem.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('hover sobre el item con submenú lo abre tras el delay sin robar el foco; hover en un hermano lo cierra', () => {
    vi.useFakeTimers();
    openRoot();
    const submenuItem = rootItems[3];
    submenuItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(submenuItem.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(submenuItem); // el foco queda en el invocador

    rootItems[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    fixture.detectChanges();
    expect(submenuItem.getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: light-dismiss del árbol (CA-012.7)
  it('sincroniza el estado con el cierre nativo del popover (evento toggle)', () => {
    openRoot();
    const toggle = new Event('toggle') as Event & { newState?: string };
    toggle.newState = 'closed';
    rootPanel.dispatchEvent(toggle);
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: estilos exclusivamente por tokens (CA-012.8)
  it('el CSS de la familia no tiene hardcodes y declara el bloque reduced-motion', () => {
    const sources = ['menu.css', 'menu-item.css', 'menu-separator.css'].map(readSource);
    expect(sources.every((css) => css.length > 0)).toBe(true);
    for (const css of sources) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    }
    expect(readSource('menu.css')).toContain('@media (prefers-reduced-motion: reduce)');
    expect(readSource('menu.css')).toContain('@starting-style');
  });

  // Scenario: exportado desde public-api.ts
  it('la familia completa se exporta en public-api.ts', () => {
    const publicApi = readPublicApi();
    expect(publicApi).toContain(`export * from './lib/menu';`);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [MenuHost] }).compileComponents();

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
