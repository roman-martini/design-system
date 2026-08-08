import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsCheckbox } from './checkbox';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

describe('DsCheckbox', () => {
  let fixture: ComponentFixture<DsCheckbox>;
  let component: DsCheckbox;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsCheckbox],
    }).compileComponents();

    fixture = TestBed.createComponent(DsCheckbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(inputEl).toBeTruthy();
    expect(inputEl.type).toBe('checkbox');
  });

  it('writeValue updates checked state', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    expect(inputEl.checked).toBe(true);
  });

  it('writeValue handles null and undefined as false', () => {
    component.writeValue(null);
    expect(component.checked()).toBe(false);
    component.writeValue(undefined);
    expect(component.checked()).toBe(false);
  });

  it('registerOnChange fires on input change', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    inputEl.checked = true;
    inputEl.dispatchEvent(new Event('change'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('registerOnTouched fires on input change', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);

    inputEl.dispatchEvent(new Event('change'));

    expect(onTouched).toHaveBeenCalled();
  });

  it('setDisabledState updates disabled signal and DOM', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(component.disabled()).toBe(true);
    expect(inputEl.disabled).toBe(true);
  });

  it('respects disabled — does not emit when disabled', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    component.setDisabledState(true);
    fixture.detectChanges();

    inputEl.checked = true;
    inputEl.dispatchEvent(new Event('change'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('indeterminate input sets aria-checked="mixed"', async () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(inputEl.indeterminate).toBe(true);
    expect(inputEl.getAttribute('aria-checked')).toBe('mixed');
  });

  it('aria-checked reflects checked when not indeterminate', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(inputEl.getAttribute('aria-checked')).toBe('true');

    component.writeValue(false);
    fixture.detectChanges();
    expect(inputEl.getAttribute('aria-checked')).toBe('false');
  });

  it('label string is rendered as fallback when no projected content', () => {
    fixture.componentRef.setInput('label', 'Acepto');
    fixture.detectChanges();

    const labelSpan = fixture.nativeElement.querySelector('.checkbox__label') as HTMLElement;
    expect(labelSpan.textContent?.trim()).toBe('Acepto');
  });

  it('size attribute reflects on input data-size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(inputEl.getAttribute('data-size')).toBe(size);
    }
  });
});

// Integración con ReactiveFormsModule (host component)
@Component({
  standalone: true,
  imports: [DsCheckbox, ReactiveFormsModule],
  template: `<ds-checkbox [formControl]="ctrl" />`,
})
class DsCheckboxFormHost {
  readonly ctrl = new FormControl<boolean>(false, { nonNullable: true });
}

describe('DsCheckbox + FormControl', () => {
  let hostFixture: ComponentFixture<DsCheckboxFormHost>;
  let host: DsCheckboxFormHost;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsCheckboxFormHost],
    }).compileComponents();

    hostFixture = TestBed.createComponent(DsCheckboxFormHost);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
    inputEl = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('FormControl.setValue updates the checkbox', () => {
    host.ctrl.setValue(true);
    hostFixture.detectChanges();
    expect(inputEl.checked).toBe(true);
  });

  it('user toggle updates FormControl.value', () => {
    inputEl.checked = true;
    inputEl.dispatchEvent(new Event('change'));
    expect(host.ctrl.value).toBe(true);
  });

  it('FormControl.disable propaga al input', () => {
    host.ctrl.disable();
    hostFixture.detectChanges();
    expect(inputEl.disabled).toBe(true);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsCheckbox] }).compileComponents();

    const fixture = TestBed.createComponent(DsCheckbox);
    fixture.componentRef.setInput('label', 'Acepto los términos');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});

// Scenario: estilos del checkbox por tokens de componente (aaa-051). El
// checkmark vivía como `stroke='white'` dentro de un SVG en data URI —que no ve
// las custom properties del documento— así que no seguía al theme: en dark, con
// el fondo primario aclarado, la marca perdía contraste.
describe('DsCheckbox — estilos por tokens', () => {
  const css = readComponentCss('checkbox');

  it('no declara literales de color, tampoco dentro del SVG embebido', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/stroke='white'/);
    expect(css).not.toMatch(/\bwhite\b/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?![^(]*\))/);
  });

  it('el color de la marca sale de su token de componente', () => {
    expect(css).toContain('background-color: var(--ds-component-checkbox-check-color)');
  });

  it('dibuja la marca con máscara, no con background-image', () => {
    // Con background-image el color viaja dentro del SVG y queda fuera del
    // alcance de los tokens; con máscara lo pone CSS.
    expect(css).toContain('mask-image');
    expect(css).toContain('-webkit-mask-image');
    expect(css).not.toMatch(/background-image:\s*url\("data:image\/svg/);
  });

  it('consume sus tokens de componente en vez de semantic directo', () => {
    for (const token of [
      '--ds-component-checkbox-bg-off',
      '--ds-component-checkbox-bg-on',
      '--ds-component-checkbox-border-off',
      '--ds-component-checkbox-border-on',
      '--ds-component-checkbox-radius',
      '--ds-component-checkbox-size-md',
      '--ds-component-checkbox-label-color',
    ]) {
      expect(css, `falta ${token}`).toContain(token);
    }
    expect(css).not.toMatch(/background(-color)?:\s*var\(--ds-semantic-color-bg/);
  });

  // Scenario: el control comunica hover en ambos estados (aaa-053). Los tokens
  // hover existían desde el bootstrap sin consumidor: el CSS los pinta bajo
  // :hover:not(:disabled), así disabled queda inmutable por selector.
  it('pinta los hovers desde sus tokens y solo fuera de disabled', () => {
    expect(css).toMatch(
      /:hover:not\(:disabled\)[^{]*\{[^}]*var\(--ds-component-checkbox-bg-off-hover\)/,
    );
    expect(css).toMatch(
      /:hover:not\(:disabled\):checked[^{]*\{[^}]*var\(--ds-component-checkbox-bg-on-hover\)/,
    );
    // indeterminate cuenta como estado marcado
    expect(css).toMatch(/:hover:not\(:disabled\):indeterminate/);
    // ninguna regla hover aplica sin la guarda de disabled
    for (const match of css.matchAll(/^[^{}]*:hover[^{]*\{/gm)) {
      expect(match[0]).toContain(':not(:disabled)');
    }
  });
});
