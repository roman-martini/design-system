import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsRadio } from './radio';

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
