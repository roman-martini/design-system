import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsButton } from './button';

describe('DsButton', () => {
  let fixture: ComponentFixture<DsButton>;
  let component: DsButton;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
    buttonEl = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.type).toBe('button');
  });

  it('emits clicked when enabled', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    buttonEl.click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
  });

  it('does NOT emit clicked when disabled (guard, not native disabled)', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    buttonEl.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('stays focusable when disabled (no native disabled, no tabindex=-1)', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(buttonEl.hasAttribute('disabled')).toBe(false);
    expect(buttonEl.getAttribute('tabindex')).not.toBe('-1');

    buttonEl.focus();
    expect(document.activeElement).toBe(buttonEl);
  });

  it('exposes aria-disabled according to state', () => {
    expect(buttonEl.getAttribute('aria-disabled')).toBeNull();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
  });

  it('announces disabledReason via a visible span referenced by aria-describedby', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('disabledReason', 'Completá los campos requeridos');
    fixture.detectChanges();

    const reason = fixture.nativeElement.querySelector('.ds-button__reason') as HTMLElement;
    expect(reason).toBeTruthy();
    expect(reason.textContent?.trim()).toBe('Completá los campos requeridos');

    const describedBy = buttonEl.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toBe(reason.id);
  });

  it('does not render the reason when disabled without a reason', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ds-button__reason')).toBeNull();
    expect(buttonEl.getAttribute('aria-describedby')).toBeNull();
  });

  it('does not render the reason when enabled even with a reason set', () => {
    fixture.componentRef.setInput('disabledReason', 'irrelevante mientras esté habilitado');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ds-button__reason')).toBeNull();
    expect(buttonEl.getAttribute('aria-describedby')).toBeNull();
  });
});
