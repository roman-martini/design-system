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

  describe('loading', () => {
    it('does NOT emit clicked when loading (guard, not native disabled)', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.clicked.subscribe(spy);

      buttonEl.click();

      expect(spy).not.toHaveBeenCalled();
    });

    it('stays focusable when loading (no native disabled)', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(buttonEl.hasAttribute('disabled')).toBe(false);

      buttonEl.focus();
      expect(document.activeElement).toBe(buttonEl);
    });

    it('exposes aria-busy while loading and removes it otherwise', () => {
      expect(buttonEl.getAttribute('aria-busy')).toBeNull();

      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(buttonEl.getAttribute('aria-busy')).toBe('true');

      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
      expect(buttonEl.getAttribute('aria-busy')).toBeNull();
    });

    it('embeds a decorative spinner (xs, aria-hidden, no role) while loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('ds-spinner') as HTMLElement;
      expect(spinner).toBeTruthy();
      expect(spinner.getAttribute('data-size')).toBe('xs');
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
      expect(spinner.getAttribute('role')).toBeNull();
    });

    it('uses replace mode (frozen width) by default without loadingText', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(buttonEl.getAttribute('data-loading')).toBe('replace');
      // el contenido original permanece en el DOM → nombre accesible preservado
      expect(fixture.nativeElement.querySelector('.ds-button__content')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.ds-button__loading-text')).toBeNull();
    });

    it('uses text mode with loadingText and renders the progress text', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.componentRef.setInput('loadingText', 'Guardando…');
      fixture.detectChanges();

      expect(buttonEl.getAttribute('data-loading')).toBe('text');
      const text = fixture.nativeElement.querySelector('.ds-button__loading-text') as HTMLElement;
      expect(text).toBeTruthy();
      expect(text.textContent?.trim()).toBe('Guardando…');
    });

    it('renders no spinner, data-loading nor aria-busy when not loading', () => {
      expect(fixture.nativeElement.querySelector('ds-spinner')).toBeNull();
      expect(buttonEl.getAttribute('data-loading')).toBeNull();
      expect(buttonEl.getAttribute('aria-busy')).toBeNull();
    });

    it('loading takes precedence over disabled: no aria-disabled, no reason', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('disabledReason', 'Completá los campos');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(buttonEl.getAttribute('aria-busy')).toBe('true');
      expect(buttonEl.getAttribute('aria-disabled')).toBeNull();
      expect(buttonEl.getAttribute('aria-describedby')).toBeNull();
      expect(fixture.nativeElement.querySelector('.ds-button__reason')).toBeNull();
    });

    it('restores disabled and its reason when loading turns false', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('disabledReason', 'Completá los campos');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
      const reason = fixture.nativeElement.querySelector('.ds-button__reason') as HTMLElement;
      expect(reason).toBeTruthy();
      expect(buttonEl.getAttribute('aria-describedby')).toBe(reason.id);
    });
  });
});
