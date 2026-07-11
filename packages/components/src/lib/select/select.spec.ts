import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsOption } from './option';
import { DsSelect } from './select';

@Component({
  standalone: true,
  imports: [DsSelect, DsOption],
  template: `
    <ds-select [(value)]="selected" placeholder="Elegí una opción" aria-label="Framework">
      <ds-option [value]="'a'" label="Opción A" />
      <ds-option [value]="'b'" label="Opción B" />
      <ds-option [value]="'c'" [disabled]="true" label="Opción C" />
      <ds-option [value]="'d'" label="ignorado">Contenido proyectado</ds-option>
    </ds-select>
  `,
})
class TwoWayHost {
  selected = signal<string | null>(null);
}

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('DsSelect + DsOption', () => {
  let fixture: ComponentFixture<TwoWayHost>;
  let host: TwoWayHost;
  let trigger: HTMLButtonElement;
  let listbox: HTMLElement;
  let options: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TwoWayHost] }).compileComponents();
    fixture = TestBed.createComponent(TwoWayHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button[role="combobox"]');
    listbox = fixture.nativeElement.querySelector('[role="listbox"]');
    options = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  });

  it('renders the ARIA combobox pattern', () => {
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
    expect(options.length).toBe(4);
    expect(options.every((o) => o.hasAttribute('id'))).toBe(true);
  });

  it('aria-label del consumidor se reenvía al trigger (el combobox real)', () => {
    // El role="combobox" vive en el button interno: el nombre accesible debe
    // llegar ahí, no quedar inerte en <ds-select> (hallazgo alta del review).
    expect(trigger.getAttribute('aria-label')).toBe('Framework');
  });

  it('shows the placeholder when there is no selection', () => {
    expect(trigger.textContent).toContain('Elegí una opción');
  });

  it('renders the chevron per ADR-012 (aria-hidden)', () => {
    const svg = trigger.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens on click and closes on second click', () => {
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens with ArrowDown, Enter and Space', () => {
    for (const key of ['ArrowDown', 'Enter', ' ']) {
      keydown(trigger, key);
      fixture.detectChanges();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      keydown(trigger, 'Escape');
      fixture.detectChanges();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('selecting an option by click updates the model and closes', () => {
    trigger.click();
    fixture.detectChanges();
    options[1].click();
    fixture.detectChanges();
    expect(host.selected()).toBe('b');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Opción B');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('keyboard navigation moves aria-activedescendant and skips disabled options', () => {
    keydown(trigger, 'ArrowDown'); // abre, activa la primera habilitada
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[0].id);

    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[1].id);

    keydown(trigger, 'ArrowDown'); // saltea la opción c (disabled) → d
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[3].id);
  });

  it('Home and End move to first and last enabled options', () => {
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    keydown(trigger, 'End');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[3].id);
    keydown(trigger, 'Home');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('Enter selects the active option and closes', () => {
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    keydown(trigger, 'Enter');
    fixture.detectChanges();
    expect(host.selected()).toBe('b');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('ESC closes without changing the selection', () => {
    host.selected.set('a');
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    keydown(trigger, 'Escape');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.selected()).toBe('a');
  });

  it('platform light-dismiss syncs the open state without changing selection', () => {
    host.selected.set('a');
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    // Simula el cierre por la plataforma (click fuera): el popover se cierra
    // solo y emite `toggle` — el componente debe sincronizar su estado.
    listbox.hidePopover();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.selected()).toBe('a');
  });

  it('disabled options are not selectable', () => {
    trigger.click();
    fixture.detectChanges();
    options[2].click();
    fixture.detectChanges();
    expect(host.selected()).toBeNull();
    expect(options[2].getAttribute('aria-disabled')).toBe('true');
  });

  it('projected content wins over the label input and reflects on the trigger', () => {
    trigger.click();
    fixture.detectChanges();
    expect(options[3].textContent).toContain('Contenido proyectado');
    options[3].click();
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Contenido proyectado');
    expect(trigger.textContent).not.toContain('ignorado');
  });
});

@Component({
  standalone: true,
  imports: [DsSelect, DsOption, ReactiveFormsModule],
  template: `
    <ds-select [formControl]="ctrl" aria-label="Framework">
      <ds-option [value]="'angular'" label="Angular" />
      <ds-option [value]="'react'" label="React" />
    </ds-select>
  `,
})
class FormHost {
  ctrl = new FormControl<string | null>('angular');
}

describe('DsSelect + FormControl', () => {
  let fixture: ComponentFixture<FormHost>;
  let host: FormHost;
  let trigger: HTMLButtonElement;
  let options: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    fixture = TestBed.createComponent(FormHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button[role="combobox"]');
    options = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  });

  it('initial FormControl value selects the matching option', () => {
    expect(trigger.textContent).toContain('Angular');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
  });

  it('setValue updates the rendered selection', () => {
    host.ctrl.setValue('react');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('React');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
  });

  it('user selection updates FormControl.value', () => {
    trigger.click();
    fixture.detectChanges();
    options[1].click();
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('react');
  });

  it('ctrl.disable() → aria-disabled, focuseable y no operable (ADR-011 rama botón)', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.hasAttribute('disabled')).toBe(false);
    expect(trigger.getAttribute('tabindex')).not.toBe('-1');

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.ctrl.value).toBe('angular');
  });
});
