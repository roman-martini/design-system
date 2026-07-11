import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsInput } from './input';

@Component({
  standalone: true,
  imports: [DsInput],
  template: `
    <ds-input
      [(value)]="text"
      label="Email"
      hint="Nunca lo compartimos"
      placeholder="vos@ejemplo.com"
      [type]="type"
    >
      <span ds-input-prefix aria-hidden="true">@</span>
      <span ds-input-suffix aria-hidden="true">.com</span>
    </ds-input>
  `,
})
class TwoWayHost {
  text = signal('');
  type = 'email' as const;
}

describe('DsInput (two-way, sin forms)', () => {
  let fixture: ComponentFixture<TwoWayHost>;
  let host: TwoWayHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TwoWayHost] }).compileComponents();
    fixture = TestBed.createComponent(TwoWayHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('renders the native input with the whitelisted type', () => {
    expect(input.type).toBe('email');
  });

  it('label is associated via for/id', () => {
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('Email');
    expect(label.htmlFor).toBe(input.id);
  });

  it('hint is associated via aria-describedby', () => {
    const hint = fixture.nativeElement.querySelector('.ds-input__hint') as HTMLElement;
    expect(hint.textContent).toContain('Nunca lo compartimos');
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('typing updates the two-way model', () => {
    input.value = 'hola';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.text()).toBe('hola');
  });

  it('setting the model updates the native input', () => {
    host.text.set('chau');
    fixture.detectChanges();
    expect(input.value).toBe('chau');
  });

  it('projects passive prefix and suffix inside the control wrapper', () => {
    const control = fixture.nativeElement.querySelector('.ds-input__control') as HTMLElement;
    const prefix = control.querySelector('[ds-input-prefix]') as HTMLElement;
    const suffix = control.querySelector('[ds-input-suffix]') as HTMLElement;
    expect(prefix.textContent).toBe('@');
    expect(suffix.textContent).toBe('.com');
    expect(prefix.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the placeholder', () => {
    expect(input.placeholder).toBe('vos@ejemplo.com');
  });
});

@Component({
  standalone: true,
  imports: [DsInput],
  template: `<ds-input aria-label="Búsqueda" type="search" />`,
})
class AriaLabelHost {}

describe('DsInput accessible name forwarding', () => {
  it('aria-label del consumidor se reenvía al input nativo', async () => {
    await TestBed.configureTestingModule({ imports: [AriaLabelHost] }).compileComponents();
    const fixture = TestBed.createComponent(AriaLabelHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Búsqueda');
  });
});

@Component({
  standalone: true,
  imports: [DsInput],
  template: `<ds-input [invalid]="true" error="Tomado" label="Usuario" />`,
})
class ManualInvalidHost {}

describe('DsInput invalid manual (sin forms)', () => {
  it('el override [invalid] aplica estado y mensaje', async () => {
    await TestBed.configureTestingModule({ imports: [ManualInvalidHost] }).compileComponents();
    const fixture = TestBed.createComponent(ManualInvalidHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const error = fixture.nativeElement.querySelector('.ds-input__error') as HTMLElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent).toContain('Tomado');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
  });
});

@Component({
  standalone: true,
  imports: [DsInput, ReactiveFormsModule],
  template: `<ds-input
    [formControl]="ctrl"
    label="Email"
    hint="Tu email"
    error="Email inválido"
  />`,
})
class FormHost {
  ctrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.email, Validators.required],
  });
}

describe('DsInput + FormControl', () => {
  let fixture: ComponentFixture<FormHost>;
  let host: FormHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    fixture = TestBed.createComponent(FormHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('typing updates FormControl.value on each input', () => {
    input.value = 'a@b.co';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(host.ctrl.value).toBe('a@b.co');
  });

  it('setValue updates the native input', () => {
    host.ctrl.setValue('x@y.z');
    fixture.detectChanges();
    expect(input.value).toBe('x@y.z');
  });

  it('estado normal mientras el control está pristine aunque sea invalid', () => {
    expect(host.ctrl.invalid).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBeNull();
    const error = fixture.nativeElement.querySelector('.ds-input__error') as HTMLElement;
    expect(error.textContent?.trim()).toBe('');
  });

  it('invalid && touched activa el error automáticamente (visual + mensaje + describedby)', () => {
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const error = fixture.nativeElement.querySelector('.ds-input__error') as HTMLElement;
    expect(error.textContent).toContain('Email inválido');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    const control = fixture.nativeElement.querySelector('.ds-input__control') as HTMLElement;
    expect(control.classList.contains('ds-input__control--invalid')).toBe(true);
  });

  it('el error reemplaza al hint mientras está presente', () => {
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-input__hint')).toBeNull();
    host.ctrl.setValue('valido@ejemplo.com');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-input__hint')).not.toBeNull();
  });

  it('ctrl.disable() aplica disabled nativo (ADR-011 rama form control)', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
