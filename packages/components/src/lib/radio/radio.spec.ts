import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsRadio } from './radio';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

describe('DsRadio (standalone, no group)', () => {
  let fixture: ComponentFixture<DsRadio>;
  let component: DsRadio;
  let inputEl: HTMLInputElement;
  let labelEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsRadio],
    }).compileComponents();

    fixture = TestBed.createComponent(DsRadio);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'opt-a');
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    labelEl = fixture.nativeElement.querySelector('.radio__label') as HTMLElement;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(inputEl).toBeTruthy();
    expect(inputEl.type).toBe('radio');
  });

  it('label string fallback renders when no projected content', () => {
    fixture.componentRef.setInput('label', 'Opción A');
    fixture.detectChanges();
    expect(labelEl.textContent?.trim()).toBe('Opción A');
  });

  it('size attribute reflects on input data-size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(inputEl.getAttribute('data-size')).toBe(size);
    }
  });

  it('emits selected output on user click when standalone', () => {
    const spy = vi.fn();
    component.selected.subscribe(spy);
    inputEl.click();
    expect(spy).toHaveBeenCalledWith('opt-a');
  });

  it('respects own disabled — does not emit when disabled', () => {
    const spy = vi.fn();
    component.selected.subscribe(spy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    inputEl.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('disabled input applies disabled attribute on native input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(inputEl.disabled).toBe(true);
  });

  it('aria-checked reflects isSelected (false when standalone with no group)', () => {
    expect(inputEl.getAttribute('aria-checked')).toBe('false');
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsRadio] }).compileComponents();

    const fixture = TestBed.createComponent(DsRadio);
    fixture.componentRef.setInput('value', 'a');
    fixture.componentRef.setInput('label', 'Opción A');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});

// Scenario: estilos del radio por tokens de componente (aaa-051). El punto se
// pintaba con el primitive `--ds-color-white`, que no sigue al theme, mientras
// su token `dot-color` declaraba el color del propio fondo marcado — invisible.
describe('DsRadio — estilos por tokens', () => {
  const css = readComponentCss('radio');

  it('no declara literales ni primitives de color', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/var\(--ds-color-/);
    expect(css).not.toMatch(/\bwhite\b/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('el color del punto sale de su token de componente', () => {
    expect(css).toContain('var(--ds-component-radio-dot-color)');
  });

  it('consume sus tokens de componente en vez de semantic directo', () => {
    for (const token of [
      '--ds-component-radio-bg-off',
      '--ds-component-radio-bg-on',
      '--ds-component-radio-border-off',
      '--ds-component-radio-border-on',
      '--ds-component-radio-size-md',
      '--ds-component-radio-label-color',
    ]) {
      expect(css, `falta ${token}`).toContain(token);
    }
    expect(css).not.toMatch(/background(-color)?:\s*var\(--ds-semantic-color-bg/);
  });

  // Scenario: el control comunica hover en ambos estados (aaa-053) — el mismo
  // par que checkbox, para que la familia de controles reaccione igual.
  it('pinta los hovers desde sus tokens y solo fuera de disabled', () => {
    expect(css).toMatch(
      /:hover:not\(:disabled\)[^{]*\{[^}]*var\(--ds-component-radio-bg-off-hover\)/,
    );
    expect(css).toMatch(
      /:hover:not\(:disabled\):checked[^{]*\{[^}]*var\(--ds-component-radio-bg-on-hover\)/,
    );
    // ninguna regla hover aplica sin la guarda de disabled
    for (const match of css.matchAll(/^[^{}]*:hover[^{]*\{/gm)) {
      expect(match[0]).toContain(':not(:disabled)');
    }
  });
});
