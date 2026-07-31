import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsCheckbox } from './checkbox';
import { expectNoAxeViolations } from '../../testing/axe';

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
