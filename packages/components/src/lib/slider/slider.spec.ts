import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsSlider } from './slider';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// jsdom cubre todo lo que estos tests usan (task 1.2 de aaa-044, verificado
// empíricamente): clampeo nativo de type=range, custom properties inline por
// getComputedStyle, PointerEvent y :focus-visible en matches().
const css = readComponentCss('slider');

describe('DsSlider', () => {
  let fixture: ComponentFixture<DsSlider>;
  let component: DsSlider;
  let input: HTMLInputElement;

  const control = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-slider__control') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsSlider] }).compileComponents();
    fixture = TestBed.createComponent(DsSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('renders a native range input as the single interactive control (CA-025.2)', () => {
    expect(input).toBeTruthy();
    expect(input.type).toBe('range');
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(1);
  });

  it('reflects min/max/step on the native input (CA-025.2)', () => {
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 50);
    fixture.componentRef.setInput('step', 5);
    fixture.detectChanges();

    expect(input.getAttribute('min')).toBe('10');
    expect(input.getAttribute('max')).toBe('50');
    expect(input.getAttribute('step')).toBe('5');
  });

  it('propagates numbers (never strings) via CVA on input events (CA-025.1)', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    input.value = '30';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe(30);
    expect(onChange).toHaveBeenCalledWith(30);
    expect(onChange).not.toHaveBeenCalledWith('30');
  });

  it('fires onTouched on blur (CA-025.1)', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);
    input.dispatchEvent(new Event('blur'));
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue reflects on the native input; null coerces to min (CA-025.1)', () => {
    component.writeValue(45);
    fixture.detectChanges();
    expect(input.value).toBe('45');

    fixture.componentRef.setInput('min', 10);
    component.writeValue(null);
    fixture.detectChanges();
    expect(component.value()).toBe(10);
  });

  it('exposes --ds-slider-pct derived from value within range (CA-025.4)', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 200);
    component.writeValue(50);
    fixture.detectChanges();

    expect(getComputedStyle(control()).getPropertyValue('--ds-slider-pct').trim()).toBe('25');
  });

  it('clamps pct to [0, 100] and degrades an empty range to 0 (CA-025.4)', () => {
    component.writeValue(500);
    fixture.detectChanges();
    expect(getComputedStyle(control()).getPropertyValue('--ds-slider-pct').trim()).toBe('100');

    fixture.componentRef.setInput('max', 0);
    fixture.detectChanges();
    expect(getComputedStyle(control()).getPropertyValue('--ds-slider-pct').trim()).toBe('0');
  });

  it('associates the visible label with the input (CA-025.3)', () => {
    fixture.componentRef.setInput('label', 'Volumen');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent?.trim()).toBe('Volumen');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('forwards aria-label to the input and removes it from the host (CA-025.3)', () => {
    fixture.componentRef.setInput('aria-label', 'Volumen');
    fixture.detectChanges();

    expect(input.getAttribute('aria-label')).toBe('Volumen');
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBeNull();
  });

  it('exposes aria-valuetext only when a formatter is provided (CA-025.3)', () => {
    expect(input.getAttribute('aria-valuetext')).toBeNull();

    fixture.componentRef.setInput('valueText', (v: number) => `${v} %`);
    component.writeValue(45);
    fixture.detectChanges();

    expect(input.getAttribute('aria-valuetext')).toBe('45 %');
  });

  it('disabled is native and blocks propagation (CA-025.5)', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect((fixture.nativeElement as HTMLElement).classList).toContain('ds-slider--disabled');

    const onChange = vi.fn();
    component.registerOnChange(onChange);
    input.dispatchEvent(new Event('input'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('paints focus and hover affordances on the visual thumb via CSS (CA-025.5)', () => {
    expect(css).toContain(':focus-visible ~ .ds-slider__thumb');
    expect(css).toContain('--ds-semantic-shadow-focus');
  });

  it('reflects size on the host and sizes come from tokens (CA-025.9)', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).getAttribute('data-size')).toBe(size);
      expect(css).toContain(`--ds-component-slider-thumb-size-${size}`);
      expect(css).toContain(`--ds-component-slider-track-height-${size}`);
    }
    // Área interactiva ≥24px en toda size: el alto del control usa max() con el token.
    expect(css).toContain('max(var(--ds-dimension-24), var(--_thumb))');
  });

  it('renders the minimal DOM when no extras are enabled (CA-025.10)', () => {
    expect(fixture.nativeElement.querySelector('.ds-slider__track')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ds-slider__fill')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ds-slider__thumb')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('output')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ds-slider__ticks')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ds-slider__tooltip')).toBeNull();
  });

  it('uses only tokens: no hex nor color literals in the CSS source (CA-025.4)', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-slider-');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('exports DsSlider from public-api', () => {
    expect(publicApi.DsSlider).toBe(DsSlider);
  });
});

describe('DsSlider — extras opt-in', () => {
  let fixture: ComponentFixture<DsSlider>;
  let component: DsSlider;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsSlider] }).compileComponents();
    fixture = TestBed.createComponent(DsSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('showValue renders an output associated with the input (CA-025.6)', () => {
    fixture.componentRef.setInput('showValue', true);
    component.writeValue(30);
    fixture.detectChanges();

    const output = fixture.nativeElement.querySelector('output') as HTMLOutputElement;
    expect(output).toBeTruthy();
    expect(output.textContent?.trim()).toBe('30');
    expect(output.getAttribute('for')).toBe(input.id);
    expect(css).toContain('font-variant-numeric: tabular-nums');

    fixture.componentRef.setInput('valueText', (v: number) => `${v} %`);
    fixture.detectChanges();
    expect(output.textContent?.trim()).toBe('30 %');
  });

  it('ticks render aria-hidden marks positioned by their value pct (CA-025.7)', () => {
    fixture.componentRef.setInput('ticks', [
      { value: 0, label: '0' },
      { value: 50 },
      { value: 100, label: '100' },
    ]);
    fixture.detectChanges();

    const ticksHost = fixture.nativeElement.querySelector('.ds-slider__ticks') as HTMLElement;
    expect(ticksHost.getAttribute('aria-hidden')).toBe('true');

    const marks = fixture.nativeElement.querySelectorAll('.ds-slider__tick');
    expect(marks.length).toBe(3);
    expect(
      getComputedStyle(marks[1] as HTMLElement)
        .getPropertyValue('--ds-slider-tick-pct')
        .trim(),
    ).toBe('50');

    const labels = fixture.nativeElement.querySelectorAll('.ds-slider__tick-label');
    expect(labels.length).toBe(2);
    expect((labels[0] as HTMLElement).classList).toContain('ds-slider__tick-label--start');
    expect((labels[1] as HTMLElement).classList).toContain('ds-slider__tick-label--end');
  });

  it('valueTooltip renders an aria-hidden bubble without Popover API (CA-025.8)', () => {
    fixture.componentRef.setInput('valueTooltip', true);
    fixture.componentRef.setInput('valueText', (v: number) => `${v} %`);
    component.writeValue(45);
    fixture.detectChanges();

    const tooltip = fixture.nativeElement.querySelector('.ds-slider__tooltip') as HTMLElement;
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');
    expect(tooltip.hasAttribute('popover')).toBe(false);
    expect(tooltip.textContent?.trim()).toBe('45 %');
  });

  it('dragging toggles the visibility class via pointer events (CA-025.8)', () => {
    fixture.componentRef.setInput('valueTooltip', true);
    fixture.detectChanges();
    const control = fixture.nativeElement.querySelector('.ds-slider__control') as HTMLElement;

    input.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(control.classList).toContain('ds-slider__control--dragging');

    input.dispatchEvent(new Event('pointerup'));
    fixture.detectChanges();
    expect(control.classList).not.toContain('ds-slider__control--dragging');

    // La visibilidad con foco de teclado es puro CSS: la regla existe en la fuente.
    expect(css).toContain(':focus-visible ~ .ds-slider__tooltip');
  });
});

// Integración real con ReactiveFormsModule (CA-025.1)
@Component({
  standalone: true,
  imports: [DsSlider, ReactiveFormsModule],
  template: `<ds-slider label="Volumen" [formControl]="ctrl" />`,
})
class DsSliderFormHost {
  readonly ctrl = new FormControl<number>(20, { nonNullable: true });
}

describe('DsSlider + FormControl', () => {
  let hostFixture: ComponentFixture<DsSliderFormHost>;
  let host: DsSliderFormHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsSliderFormHost] }).compileComponents();
    hostFixture = TestBed.createComponent(DsSliderFormHost);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
    input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('FormControl.setValue updates the native input', () => {
    host.ctrl.setValue(60);
    hostFixture.detectChanges();
    expect(input.value).toBe('60');
  });

  it('user interaction updates FormControl.value as a number', () => {
    input.value = '35';
    input.dispatchEvent(new Event('input'));
    expect(host.ctrl.value).toBe(35);
  });

  it('FormControl.disable propagates to the native input', () => {
    host.ctrl.disable();
    hostFixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto y sobre el render
// con todos los extras encendidos (output visible, ticks etiquetados y burbuja).
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsSlider] }).compileComponents();

    const fixture = TestBed.createComponent(DsSlider);
    fixture.componentRef.setInput('label', 'Volumen');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });

  it('el render con extras no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsSlider] }).compileComponents();

    const fixture = TestBed.createComponent(DsSlider);
    fixture.componentRef.setInput('label', 'Volumen');
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('valueTooltip', true);
    fixture.componentRef.setInput('ticks', [
      { value: 0, label: '0' },
      { value: 100, label: '100' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
