import { existsSync, readFileSync } from 'node:fs';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsAccordion } from './accordion';
import { DsAccordionItem } from './accordion-item';

// Angular intercepta los imports de .css (incluso ?raw), de ahí el readFileSync.
// Límite jsdom declarado (design §4): jsdom no computa layout — la animación de
// altura (grid 0fr→1fr) y la visibility con delay se verifican a mano en
// playground; acá se verifica la fuente CSS. Enter/Space sobre el header son
// activación de plataforma del <button> nativo (disparan click): se testea click.
function readSource(relative: string): string {
  const path = [
    `src/lib/accordion/${relative}`,
    `packages/components/src/lib/accordion/${relative}`,
  ].find((p) => existsSync(p));
  return path ? readFileSync(path, 'utf-8') : '';
}

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

@Component({
  standalone: true,
  imports: [DsAccordion, DsAccordionItem],
  template: `
    <ds-accordion [multiple]="multiple()" [headingLevel]="level()">
      <ds-accordion-item [(expanded)]="a">
        <span dsAccordionHeader>Sección A</span>
        <p>Contenido A</p>
      </ds-accordion-item>
      <ds-accordion-item [(expanded)]="b">
        <span dsAccordionHeader>Sección B</span>
        <p>Contenido B</p>
      </ds-accordion-item>
      <ds-accordion-item [(expanded)]="c" [disabled]="true">
        <span dsAccordionHeader>Sección C</span>
        <p>Contenido C</p>
      </ds-accordion-item>
    </ds-accordion>
  `,
})
class Host {
  readonly multiple = signal(false);
  readonly level = signal(3);
  readonly a = signal(false);
  readonly b = signal(false);
  readonly c = signal(false);
}

@Component({
  standalone: true,
  imports: [DsAccordion, DsAccordionItem],
  template: `
    <ds-accordion>
      <ds-accordion-item [(expanded)]="outerA">
        <span dsAccordionHeader>Padre A</span>
        <ds-accordion [headingLevel]="4">
          <ds-accordion-item [(expanded)]="innerA">
            <span dsAccordionHeader>Hijo A</span>
            <p>Contenido hijo A</p>
          </ds-accordion-item>
          <ds-accordion-item [(expanded)]="innerB">
            <span dsAccordionHeader>Hijo B</span>
            <p>Contenido hijo B</p>
          </ds-accordion-item>
        </ds-accordion>
      </ds-accordion-item>
      <ds-accordion-item [(expanded)]="outerB">
        <span dsAccordionHeader>Padre B</span>
        <p>Contenido padre B</p>
      </ds-accordion-item>
    </ds-accordion>
  `,
})
class NestedHost {
  readonly outerA = signal(false);
  readonly outerB = signal(false);
  readonly innerA = signal(false);
  readonly innerB = signal(false);
}

describe('DsAccordion + DsAccordionItem', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let headers: HTMLButtonElement[];
  let panels: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host, NestedHost] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    headers = Array.from(fixture.nativeElement.querySelectorAll('.ds-accordion-item__header'));
    panels = Array.from(fixture.nativeElement.querySelectorAll('[role="region"]'));
  });

  // Scenario: estructura accesible (CA-013.1)
  it('cada header es un heading con button aria-expanded/aria-controls y su panel es region', () => {
    const headings: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="heading"]'),
    );
    expect(headings.length).toBe(3);
    for (const heading of headings) {
      expect(heading.getAttribute('aria-level')).toBe('3');
      expect(heading.querySelector('button')).not.toBeNull();
    }
    headers.forEach((header, i) => {
      expect(header.getAttribute('aria-expanded')).toBe('false');
      expect(header.getAttribute('aria-controls')).toBe(panels[i].id);
      expect(panels[i].getAttribute('aria-labelledby')).toBe(header.id);
    });
  });

  it('headingLevel del contenedor se refleja en todos los headers de la instancia', () => {
    host.level.set(2);
    fixture.detectChanges();
    const headings: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="heading"]'),
    );
    expect(headings.every((h) => h.getAttribute('aria-level') === '2')).toBe(true);
  });

  // Scenario: toggle de una sección (CA-013.2)
  it('click alterna expandido/colapsado y aria-expanded refleja el estado', () => {
    headers[0].click();
    fixture.detectChanges();
    expect(host.a()).toBe(true);
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');

    headers[0].click();
    fixture.detectChanges();
    expect(host.a()).toBe(false);
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: exclusividad single y modo multi (CA-013.3)
  it('en single (default), expandir una sección colapsa la que estaba abierta', () => {
    headers[0].click();
    fixture.detectChanges();
    headers[1].click();
    fixture.detectChanges();
    expect(host.a()).toBe(false);
    expect(host.b()).toBe(true);
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('la expansión programática por model también aplica la exclusividad, sin rebote', () => {
    host.a.set(true);
    fixture.detectChanges();
    host.b.set(true);
    fixture.detectChanges();
    expect(host.a()).toBe(false);
    expect(host.b()).toBe(true);
  });

  it('con multiple, cada sección alterna de forma independiente', () => {
    host.multiple.set(true);
    fixture.detectChanges();
    headers[0].click();
    fixture.detectChanges();
    headers[1].click();
    fixture.detectChanges();
    expect(host.a()).toBe(true);
    expect(host.b()).toBe(true);
  });

  // Scenario: teclado entre headers (CA-013.4)
  it('↑/↓ mueven el foco entre headers con wrap y sin saltear disabled; Home/End saltan a extremos', () => {
    headers[0].focus();
    keydown(headers[0], 'ArrowDown');
    expect(document.activeElement).toBe(headers[1]);
    keydown(headers[1], 'ArrowDown'); // no saltea el disabled (descubribilidad)
    expect(document.activeElement).toBe(headers[2]);
    keydown(headers[2], 'ArrowDown'); // wrap
    expect(document.activeElement).toBe(headers[0]);
    keydown(headers[0], 'ArrowUp'); // wrap inverso
    expect(document.activeElement).toBe(headers[2]);
    keydown(headers[2], 'Home');
    expect(document.activeElement).toBe(headers[0]);
    keydown(headers[0], 'End');
    expect(document.activeElement).toBe(headers[2]);
  });

  // Scenario: sección disabled accesible (CA-013.5)
  it('una sección disabled es focusable, expone aria-disabled y no cambia de estado al activarse', () => {
    expect(headers[2].hasAttribute('disabled')).toBe(false);
    expect(headers[2].getAttribute('aria-disabled')).toBe('true');
    headers[2].focus();
    expect(document.activeElement).toBe(headers[2]);
    headers[2].click();
    fixture.detectChanges();
    expect(host.c()).toBe(false);
    expect(headers[2].getAttribute('aria-expanded')).toBe('false');
  });

  // Scenario: accordion anidado (CA-013.6)
  it('un accordion anidado opera exclusividad, teclado y headingLevel independientes del padre', () => {
    const nested = TestBed.createComponent(NestedHost);
    const nestedHost = nested.componentInstance;
    nested.detectChanges();

    // headingLevel distingue instancias: padre 3 (default), anidado 4
    const allHeaders: HTMLButtonElement[] = Array.from(
      nested.nativeElement.querySelectorAll('.ds-accordion-item__header'),
    );
    const levelOf = (h: HTMLElement): string | null =>
      h.closest('[role="heading"]')!.getAttribute('aria-level');
    const outerHeaders = allHeaders.filter((h) => levelOf(h) === '3');
    const innerHeaders = allHeaders.filter((h) => levelOf(h) === '4');
    expect(outerHeaders.length).toBe(2);
    expect(innerHeaders.length).toBe(2);

    // Exclusividad scoped: expandir en el anidado no colapsa al padre
    nestedHost.outerA.set(true);
    nested.detectChanges();
    innerHeaders[0].click();
    nested.detectChanges();
    innerHeaders[1].click();
    nested.detectChanges();
    expect(nestedHost.innerA()).toBe(false);
    expect(nestedHost.innerB()).toBe(true);
    expect(nestedHost.outerA()).toBe(true);

    // Teclado scoped: desde el último header del anidado, ↓ wrappea dentro del
    // anidado (no navega hacia los headers del padre)
    innerHeaders[1].focus();
    keydown(innerHeaders[1], 'ArrowDown');
    expect(document.activeElement).toBe(innerHeaders[0]);
  });

  // Scenario: animación con reduced-motion (CA-013.7) + estilos por tokens (CA-013.8)
  it('el CSS de la familia no tiene hardcodes, anima con grid 0fr→1fr y declara reduced-motion', () => {
    const sources = ['accordion.css', 'accordion-item.css'].map(readSource);
    expect(sources.every((css) => css.length > 0)).toBe(true);
    for (const css of sources) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    }
    const itemCss = readSource('accordion-item.css');
    expect(itemCss).toContain('grid-template-rows: 0fr');
    expect(itemCss).toContain('grid-template-rows: 1fr');
    expect(itemCss).toContain('visibility: hidden');
    expect(itemCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  // Scenario: exportado desde public-api.ts
  it('la familia completa se exporta en public-api.ts', () => {
    const publicApiPath = ['src/public-api.ts', 'packages/components/src/public-api.ts'].find((p) =>
      existsSync(p),
    );
    const publicApi = publicApiPath ? readFileSync(publicApiPath, 'utf-8') : '';
    expect(publicApi).toContain(`export * from './lib/accordion';`);
  });
});
