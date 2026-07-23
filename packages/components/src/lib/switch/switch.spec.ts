import { existsSync, readFileSync } from 'node:fs';

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsSwitch } from './switch';
import * as publicApi from '../../public-api';

const cssPath = ['src/lib/switch/switch.css', 'packages/components/src/lib/switch/switch.css'].find(
  (p) => existsSync(p),
);
const css = cssPath ? readFileSync(cssPath, 'utf-8') : '';

describe('DsSwitch', () => {
  let fixture: ComponentFixture<DsSwitch>;
  let component: DsSwitch;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsSwitch] }).compileComponents();
    fixture = TestBed.createComponent(DsSwitch);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('renders an input type=checkbox with role=switch (CA-023.1)', () => {
    expect(input).toBeTruthy();
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles checked and propagates via CVA onChange/onTouched (CA-023.1)', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onTouched).toHaveBeenCalled();
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('writeValue reflects the model value (CA-023.1)', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it('setDisabledState disables the native input and blocks toggle (CA-023.3)', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    const onChange = vi.fn();
    component.registerOnChange(onChange);
    // el input está disabled: un change no debe propagar (comportamiento observable)
    input.dispatchEvent(new Event('change'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reflects size on the input data-size (CA-023.2)', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(input.getAttribute('data-size')).toBe(size);
    }
    expect(css).toContain('--ds-component-switch-track-width-lg');
    expect(css).toContain('--ds-component-switch-thumb-size-lg');
  });

  it('renders an associated clickable label (CA-023.4)', () => {
    fixture.componentRef.setInput('label', 'Notificaciones');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeTruthy();
    expect(label.textContent?.trim()).toContain('Notificaciones');
    // el <label> envuelve el input → clickear el texto togglea
    expect(label.querySelector('input')).toBe(input);
  });

  it('animates with tokens and honors reduced-motion (CA-023.2)', () => {
    expect(css).toContain('--ds-motion-duration-fast');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('uses only tokens: no hex nor color literals in the CSS source (CA-023.5)', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-switch-');
  });

  it('exports DsSwitch from public-api (CA-023.6)', () => {
    expect(publicApi.DsSwitch).toBe(DsSwitch);
  });
});

// Integración real con ReactiveFormsModule (CA-023.1)
@Component({
  standalone: true,
  imports: [DsSwitch, ReactiveFormsModule],
  template: `<ds-switch [formControl]="ctrl" />`,
})
class DsSwitchFormHost {
  readonly ctrl = new FormControl<boolean>(false, { nonNullable: true });
}

describe('DsSwitch + FormControl', () => {
  let hostFixture: ComponentFixture<DsSwitchFormHost>;
  let host: DsSwitchFormHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsSwitchFormHost] }).compileComponents();
    hostFixture = TestBed.createComponent(DsSwitchFormHost);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
    input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('FormControl.setValue updates the switch', () => {
    host.ctrl.setValue(true);
    hostFixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it('user toggle updates FormControl.value', () => {
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(host.ctrl.value).toBe(true);
  });

  it('FormControl.disable propaga al input', () => {
    host.ctrl.disable();
    hostFixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
