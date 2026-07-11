import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsRadio } from '../radio/radio';
import { DsRadioGroup } from './radio-group';

describe('DsRadioGroup (standalone)', () => {
  let fixture: ComponentFixture<DsRadioGroup>;
  let component: DsRadioGroup;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsRadioGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(DsRadioGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('host element has role="radiogroup"', () => {
    expect(host.getAttribute('role')).toBe('radiogroup');
  });

  it('writeValue updates value signal', () => {
    component.writeValue('foo');
    expect(component.value()).toBe('foo');
  });

  it('registerOnChange fires on selectValue', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    component.selectValue('bar');
    expect(onChange).toHaveBeenCalledWith('bar');
  });

  it('setDisabledState updates disabled signal', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
  });

  it('selectValue is ignored when disabled', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    component.setDisabledState(true);
    component.selectValue('foo');
    expect(component.value()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('auto-generated name is unique between instances', () => {
    const fixtureA = TestBed.createComponent(DsRadioGroup);
    const fixtureB = TestBed.createComponent(DsRadioGroup);
    fixtureA.detectChanges();
    fixtureB.detectChanges();
    expect(fixtureA.componentInstance.name()).not.toBe(fixtureB.componentInstance.name());
    expect(fixtureA.componentInstance.name()).toMatch(/^ds-radio-group-\d+$/);
  });

  it('isSelected compares by reference for non-primitives', () => {
    const ref = { id: 1 };
    component.writeValue(ref);
    expect(component.isSelected(ref)).toBe(true);
    expect(component.isSelected({ id: 1 })).toBe(false);
  });
});

// Integration: host with [(value)] two-way binding
@Component({
  standalone: true,
  imports: [DsRadioGroup, DsRadio],
  template: `
    <ds-radio-group [(value)]="selected" name="test-host" aria-label="Test group">
      <ds-radio [value]="'a'" label="A" />
      <ds-radio [value]="'b'" label="B" />
      <ds-radio [value]="'c'" label="C" />
    </ds-radio-group>
  `,
})
class TwoWayHost {
  selected = signal<string>('a');
}

describe('DsRadioGroup + DsRadio integration', () => {
  let fixture: ComponentFixture<TwoWayHost>;
  let host: TwoWayHost;
  let radios: HTMLInputElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoWayHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TwoWayHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
  });

  it('renders 3 radios with name="test-host"', () => {
    expect(radios.length).toBe(3);
    radios.forEach((r) => expect(r.name).toBe('test-host'));
  });

  it('aria-label del consumidor queda en el host junto al role', () => {
    const group = fixture.nativeElement.querySelector('ds-radio-group') as HTMLElement;
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('Test group');
  });

  it('the radio matching the initial value is checked', () => {
    expect(radios[0].checked).toBe(true);
    expect(radios[1].checked).toBe(false);
  });

  it('clicking another radio updates the host signal', () => {
    radios[1].click();
    fixture.detectChanges();
    expect(host.selected()).toBe('b');
  });

  it('only one radio is checked at a time', () => {
    radios[2].click();
    fixture.detectChanges();
    const checkedCount = radios.filter((r) => r.checked).length;
    expect(checkedCount).toBe(1);
    expect(radios[2].checked).toBe(true);
  });

  it('ArrowRight moves selection to the next radio', () => {
    radios[0].focus();
    const group = fixture.nativeElement.querySelector('ds-radio-group') as HTMLElement;
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.selected()).toBe('b');
  });

  it('ArrowLeft moves selection to the previous radio (wraps to end)', () => {
    radios[0].focus();
    const group = fixture.nativeElement.querySelector('ds-radio-group') as HTMLElement;
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(host.selected()).toBe('c');
  });

  it('Home moves selection to the first radio', () => {
    radios[2].focus();
    const group = fixture.nativeElement.querySelector('ds-radio-group') as HTMLElement;
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(host.selected()).toBe('c');

    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(host.selected()).toBe('a');
  });
});

// Integration: keyboard nav skips disabled radios
@Component({
  standalone: true,
  imports: [DsRadioGroup, DsRadio],
  template: `
    <ds-radio-group [(value)]="selected">
      <ds-radio [value]="'a'" label="A" />
      <ds-radio [value]="'b'" [disabled]="true" label="B" />
      <ds-radio [value]="'c'" label="C" />
    </ds-radio-group>
  `,
})
class KeyboardSkipHost {
  selected = signal<string | null>(null);
}

describe('DsRadioGroup keyboard nav skips disabled', () => {
  let fixture: ComponentFixture<KeyboardSkipHost>;
  let host: KeyboardSkipHost;
  let radios: HTMLInputElement[];
  let group: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardSkipHost],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardSkipHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    group = fixture.nativeElement.querySelector('ds-radio-group') as HTMLElement;
  });

  it('ArrowRight from the first radio skips the disabled second to the third', () => {
    radios[0].focus();
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.selected()).toBe('c');
  });
});

// Integration: FormControl
@Component({
  standalone: true,
  imports: [DsRadioGroup, DsRadio, ReactiveFormsModule],
  template: `
    <ds-radio-group [formControl]="ctrl">
      <ds-radio [value]="'angular'" label="Angular" />
      <ds-radio [value]="'react'" label="React" />
    </ds-radio-group>
  `,
})
class FormControlHost {
  readonly ctrl = new FormControl<string>('angular', { nonNullable: true });
}

describe('DsRadioGroup + FormControl', () => {
  let fixture: ComponentFixture<FormControlHost>;
  let host: FormControlHost;
  let radios: HTMLInputElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlHost],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
  });

  it('FormControl initial value selects the matching radio', () => {
    expect(radios[0].checked).toBe(true);
  });

  it('FormControl.setValue updates the selected radio', () => {
    host.ctrl.setValue('react');
    fixture.detectChanges();
    expect(radios[1].checked).toBe(true);
  });

  it('user click updates FormControl.value', () => {
    radios[1].click();
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('react');
  });

  it('FormControl.disable propagates to all radios', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    radios.forEach((r) => expect(r.disabled).toBe(true));
  });

  it('clicking a disabled radio does not change FormControl value', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    radios[1].click();
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('angular');
  });
});
