import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsTab } from './tab';
import { DsTabs } from './tabs';

@Component({
  standalone: true,
  imports: [DsTabs, DsTab],
  template: `
    <ds-tabs [(value)]="active" aria-label="Secciones">
      <ds-tab value="a" label="Alfa">
        <p>Contenido A</p>
        <input id="stateful" />
      </ds-tab>
      <ds-tab value="b" label="Beta">Contenido B</ds-tab>
      <ds-tab value="c" label="Gamma" [disabled]="true">Contenido C</ds-tab>
      <ds-tab value="d" label="Delta">Contenido D</ds-tab>
    </ds-tabs>
  `,
})
class Host {
  active = signal<string | null>(null);
}

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('DsTabs + DsTab', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let tablist: HTMLElement;
  let buttons: HTMLButtonElement[];
  let panels: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    buttons = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    panels = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
  });

  it('sin value inicial, el primer tab habilitado queda activo y su panel visible', () => {
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
  });

  it('click en un tab actualiza el model y muestra solo su panel', () => {
    buttons[1].click();
    fixture.detectChanges();
    expect(host.active()).toBe('b');
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(panels[1].hidden).toBe(false);
    expect(panels[0].hidden).toBe(true);
  });

  it('set programático del model activa el tab', () => {
    host.active.set('d');
    fixture.detectChanges();
    expect(buttons[3].getAttribute('aria-selected')).toBe('true');
    expect(panels[3].hidden).toBe(false);
  });

  it('ArrowRight mueve foco y selección, salteando disabled y con wrap', () => {
    keydown(tablist, 'ArrowRight'); // a → b
    fixture.detectChanges();
    expect(host.active()).toBe('b');
    keydown(tablist, 'ArrowRight'); // b → d (saltea c disabled)
    fixture.detectChanges();
    expect(host.active()).toBe('d');
    keydown(tablist, 'ArrowRight'); // d → a (wrap)
    fixture.detectChanges();
    expect(host.active()).toBe('a');
  });

  it('ArrowLeft con wrap hacia el final', () => {
    keydown(tablist, 'ArrowLeft'); // a → d (wrap, saltea c)
    fixture.detectChanges();
    expect(host.active()).toBe('d');
  });

  it('Home y End van al primer/último habilitado', () => {
    keydown(tablist, 'End');
    fixture.detectChanges();
    expect(host.active()).toBe('d');
    keydown(tablist, 'Home');
    fixture.detectChanges();
    expect(host.active()).toBe('a');
  });

  it('roving tabindex: solo el tab activo es tabbable; los paneles tienen tabindex 0', () => {
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1]);
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons.map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1]);
    panels.forEach((p) => expect(p.tabIndex).toBe(0));
  });

  it('ARIA APG: tablist con aria-label reenviado, ids cruzados tab↔panel', () => {
    expect(tablist.getAttribute('aria-label')).toBe('Secciones');
    buttons.forEach((button, i) => {
      expect(button.getAttribute('aria-controls')).toBe(panels[i].id);
      expect(panels[i].getAttribute('aria-labelledby')).toBe(button.id);
    });
  });

  it('el panel inactivo conserva el estado del DOM (hidden, no destruido)', () => {
    const input = fixture.nativeElement.querySelector('#stateful') as HTMLInputElement;
    input.value = 'borrador';
    buttons[1].click();
    fixture.detectChanges();
    expect(panels[0].hidden).toBe(true);
    buttons[0].click();
    fixture.detectChanges();
    const same = fixture.nativeElement.querySelector('#stateful') as HTMLInputElement;
    expect(same.value).toBe('borrador');
  });

  it('tab disabled: aria-disabled, sin disabled nativo, no activable por click', () => {
    expect(buttons[2].getAttribute('aria-disabled')).toBe('true');
    expect(buttons[2].hasAttribute('disabled')).toBe(false);
    buttons[2].click();
    fixture.detectChanges();
    expect(host.active()).not.toBe('c');
    expect(buttons[2].getAttribute('aria-selected')).toBe('false');
  });
});

@Component({
  standalone: true,
  imports: [DsTabs, DsTab],
  template: `
    <ds-tabs [(value)]="active" aria-label="Dinámico">
      @for (tab of items(); track tab) {
        <ds-tab [value]="tab" [label]="tab">Panel {{ tab }}</ds-tab>
      }
    </ds-tabs>
  `,
})
class DynamicHost {
  items = signal(['uno', 'dos', 'tres']);
  active = signal<string | null>('dos');
}

describe('DsTabs registración dinámica', () => {
  let fixture: ComponentFixture<DynamicHost>;
  let host: DynamicHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DynamicHost] }).compileComponents();
    fixture = TestBed.createComponent(DynamicHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function buttons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  }

  it('agregar un tab lo suma al tablist', () => {
    host.items.update((items) => [...items, 'cuatro']);
    fixture.detectChanges();
    expect(buttons().length).toBe(4);
    expect(buttons()[3].textContent).toContain('cuatro');
  });

  it('si el tab activo desaparece, el activo efectivo vuelve al primer habilitado', () => {
    expect(buttons()[1].getAttribute('aria-selected')).toBe('true');
    host.items.set(['uno', 'tres']);
    fixture.detectChanges();
    expect(buttons().length).toBe(2);
    expect(buttons()[0].getAttribute('aria-selected')).toBe('true');
  });
});
