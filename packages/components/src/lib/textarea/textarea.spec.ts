import { existsSync, readFileSync } from 'node:fs';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsTextarea } from './textarea';
import * as publicApi from '../../public-api';

const cssPath = [
  'src/lib/textarea/textarea.css',
  'packages/components/src/lib/textarea/textarea.css',
].find((p) => existsSync(p));
const css = cssPath ? readFileSync(cssPath, 'utf-8') : '';

@Component({
  standalone: true,
  imports: [DsTextarea],
  template: `
    <ds-textarea
      [(value)]="text"
      label="Notas"
      hint="Máximo 500 caracteres"
      placeholder="Escribí acá…"
      [rows]="rows"
      [resize]="resize"
    />
  `,
})
class TwoWayHost {
  text = signal('');
  rows = 5;
  resize = 'none' as const;
}

describe('DsTextarea (two-way, sin forms)', () => {
  let fixture: ComponentFixture<TwoWayHost>;
  let host: TwoWayHost;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TwoWayHost] }).compileComponents();
    fixture = TestBed.createComponent(TwoWayHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  it('renders a native <textarea> with the given rows', () => {
    expect(textarea).toBeTruthy();
    expect(textarea.rows).toBe(5);
  });

  it('label is associated via for/id', () => {
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('Notas');
    expect(label.htmlFor).toBe(textarea.id);
  });

  it('hint is associated via aria-describedby', () => {
    const hint = fixture.nativeElement.querySelector('.ds-field__hint') as HTMLElement;
    expect(hint.textContent).toContain('Máximo 500 caracteres');
    expect(textarea.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('typing updates the two-way model', () => {
    textarea.value = 'hola mundo';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.text()).toBe('hola mundo');
  });

  it('setting the model updates the native textarea', () => {
    host.text.set('chau');
    fixture.detectChanges();
    expect(textarea.value).toBe('chau');
  });

  it('renders the placeholder', () => {
    expect(textarea.placeholder).toBe('Escribí acá…');
  });

  it('refleja resize como data-resize en el wrapper del control', () => {
    const control = fixture.nativeElement.querySelector('.ds-field__control') as HTMLElement;
    expect(control.getAttribute('data-resize')).toBe('none');
  });
});

@Component({
  standalone: true,
  imports: [DsTextarea],
  template: `<ds-textarea aria-label="Comentario" />`,
})
class AriaLabelHost {}

describe('DsTextarea accessible name forwarding', () => {
  it('aria-label del consumidor se reenvía al textarea nativo', async () => {
    await TestBed.configureTestingModule({ imports: [AriaLabelHost] }).compileComponents();
    const fixture = TestBed.createComponent(AriaLabelHost);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.getAttribute('aria-label')).toBe('Comentario');
  });
});

@Component({
  standalone: true,
  imports: [DsTextarea, ReactiveFormsModule],
  template: `<ds-textarea
    [formControl]="ctrl"
    label="Descripción"
    hint="Contanos más"
    error="La descripción es obligatoria"
  />`,
})
class FormHost {
  ctrl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

describe('DsTextarea + FormControl', () => {
  let fixture: ComponentFixture<FormHost>;
  let host: FormHost;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    fixture = TestBed.createComponent(FormHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  it('typing updates FormControl.value on each input', () => {
    textarea.value = 'una nota';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(host.ctrl.value).toBe('una nota');
  });

  it('setValue updates the native textarea', () => {
    host.ctrl.setValue('desde el modelo');
    fixture.detectChanges();
    expect(textarea.value).toBe('desde el modelo');
  });

  it('estado normal mientras el control está pristine aunque sea invalid', () => {
    expect(host.ctrl.invalid).toBe(true);
    expect(textarea.getAttribute('aria-invalid')).toBeNull();
    const error = fixture.nativeElement.querySelector('.ds-field__error') as HTMLElement;
    expect(error.textContent?.trim()).toBe('');
  });

  it('invalid && touched activa el error (aria-invalid + mensaje + describedby)', () => {
    textarea.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    const error = fixture.nativeElement.querySelector('.ds-field__error') as HTMLElement;
    expect(error.textContent).toContain('La descripción es obligatoria');
    expect(textarea.getAttribute('aria-describedby')).toBe(error.id);
    const control = fixture.nativeElement.querySelector('.ds-field__control') as HTMLElement;
    expect(control.classList.contains('ds-field__control--invalid')).toBe(true);
  });

  it('ctrl.disable() aplica disabled nativo', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(textarea.disabled).toBe(true);
  });

  it('markAsTouched externo (submit) pinta el error sin blur local (OnPush + control.events)', () => {
    // required inválido, sin blur local: el borde/aria aún no deben mostrarse.
    expect(textarea.getAttribute('aria-invalid')).toBeNull();
    // Simula form.markAllAsTouched() en un submit: cambia touched desde afuera.
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    const error = fixture.nativeElement.querySelector('.ds-field__error') as HTMLElement;
    expect(error.textContent).toContain('La descripción es obligatoria');
  });
});

describe('DsTextarea CSS y API pública', () => {
  it('usa solo tokens: sin hex ni literales de color en el CSS fuente', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-textarea-');
  });

  it('no fija height (crece por rows + contenido)', () => {
    expect(css).not.toMatch(/(?<![\w-])height:/);
    expect(css).toContain('min-height');
  });

  it('exporta DsTextarea desde public-api', () => {
    expect(publicApi.DsTextarea).toBe(DsTextarea);
  });

  it('NO exporta la base interna DsFieldBase', () => {
    expect((publicApi as Record<string, unknown>)['DsFieldBase']).toBeUndefined();
  });
});
