import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { DsOption } from './option';
import { DsSelect } from './select';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss, readPublicApi } from '../../testing/css';

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

  // Scenario: la separación trigger↔listbox sale de un token (components-13).
  // jsdom no resuelve CSS vars ni layout (todo rect en 0), así que lo que se
  // verifica acá es el fallback documentado; el valor real del token se ve en
  // el playground. Sin el fallback, un parseFloat('') dejaría `NaNpx`.
  it('posiciona el listbox con el offset de fallback cuando el entorno no resuelve el token', () => {
    trigger.click();
    fixture.detectChanges();
    expect(listbox.style.top).toBe('4px');
  });

  // El ancho del trigger es el piso del listbox, no su medida exacta: clavarlo
  // con `width` hacía que una opción más larga que el trigger se partiera en
  // varias líneas cuando el trigger se contraía por su label seleccionado
  // (medido: 133px con placeholder → 79px con "Chile", fix del PO).
  it('usa el ancho del trigger como piso del listbox, no como ancho exacto', () => {
    trigger.click();
    fixture.detectChanges();
    expect(listbox.style.minWidth).not.toBe('');
    expect(listbox.style.width).toBe('');
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

  // Scenario: el control pasa a touched al perder el foco sin abrirse
  // (components-03). DsFieldBase ya lo hacía; el contrato de forms del kit
  // debe ser consistente entre sus controles.
  it('blur sin abrir el listado marca el control touched', () => {
    expect(host.ctrl.touched).toBe(false);
    trigger.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.ctrl.touched).toBe(true);
  });

  it('abrir el listado no marca touched; cerrarlo sí', () => {
    trigger.click();
    fixture.detectChanges();
    expect(host.ctrl.touched).toBe(false);
    // Con el listado abierto el blur pertenece a la secuencia de cierre:
    // el dueño de touched es el cierre, no el blur (design §1).
    trigger.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.ctrl.touched).toBe(false);
    keydown(trigger, 'Escape');
    fixture.detectChanges();
    expect(host.ctrl.touched).toBe(true);
  });

  it('el light-dismiss de la plataforma marca touched', () => {
    trigger.click();
    fixture.detectChanges();
    const listbox = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
    listbox.hidePopover();
    fixture.detectChanges();
    expect(host.ctrl.touched).toBe(true);
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

@Component({
  standalone: true,
  imports: [DsSelect, DsOption],
  template: `
    <ds-select [(value)]="selected" placeholder="Elegí un país" aria-label="País">
      <ds-option [value]="'ar'" label="Argentina" />
      <ds-option [value]="'au'" label="Australia" />
      <ds-option [value]="'bo'" [disabled]="true" label="Bolivia" />
      <ds-option [value]="'br'" label="Brasil" />
    </ds-select>
  `,
})
class TypeaheadHost {
  selected = signal<string | null>(null);
}

// Scenario: typeahead por caracteres imprimibles (components-07, patrón APG
// select-only). El reset del buffer usa el timer real → fake timers.
describe('DsSelect — typeahead', () => {
  let fixture: ComponentFixture<TypeaheadHost>;
  let host: TypeaheadHost;
  let trigger: HTMLButtonElement;
  let options: HTMLElement[];

  const activeId = (): string | null => trigger.getAttribute('aria-activedescendant');

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [TypeaheadHost] }).compileComponents();
    fixture = TestBed.createComponent(TypeaheadHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button[role="combobox"]');
    options = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('con el listado abierto salta a la siguiente opción que matchea, salteando disabled', () => {
    keydown(trigger, 'ArrowDown'); // abre con Argentina activa
    fixture.detectChanges();
    keydown(trigger, 'b'); // Bolivia está disabled → Brasil
    fixture.detectChanges();
    expect(activeId()).toBe(options[3].id);
    expect(host.selected()).toBeNull(); // nunca cambia el valor sin confirmar
  });

  it('repetir la inicial cicla entre las opciones que empiezan con ella', () => {
    keydown(trigger, 'ArrowDown'); // Argentina activa
    fixture.detectChanges();
    keydown(trigger, 'a'); // siguiente con "a" → Australia
    fixture.detectChanges();
    expect(activeId()).toBe(options[1].id);
    keydown(trigger, 'a'); // same-letter cycling: "aa" busca como "a" → wrap a Argentina
    fixture.detectChanges();
    expect(activeId()).toBe(options[0].id);
  });

  it('un buffer multi-carácter refina la búsqueda incluyendo la opción activa', () => {
    keydown(trigger, 'ArrowDown'); // Argentina activa
    fixture.detectChanges();
    keydown(trigger, 'a'); // → Australia
    keydown(trigger, 'r'); // "ar" refina: Argentina matchea, Australia no
    fixture.detectChanges();
    expect(activeId()).toBe(options[0].id);
  });

  it('el buffer se resetea tras la pausa de tipeo', () => {
    keydown(trigger, 'ArrowDown'); // Argentina activa
    fixture.detectChanges();
    keydown(trigger, 'b'); // → Brasil
    fixture.detectChanges();
    expect(activeId()).toBe(options[3].id);
    vi.advanceTimersByTime(600); // vence la ventana del buffer
    keydown(trigger, 'a'); // buffer nuevo: "a" (no "ba") → Argentina
    fixture.detectChanges();
    expect(activeId()).toBe(options[0].id);
  });

  it('tipear con el listado cerrado abre y activa la primera coincidencia sin cambiar el valor', () => {
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    keydown(trigger, 'b');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(activeId()).toBe(options[3].id); // Brasil (Bolivia disabled)
    expect(host.selected()).toBeNull();
    keydown(trigger, 'Enter'); // recién la confirmación cambia el valor
    fixture.detectChanges();
    expect(host.selected()).toBe('br');
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [TwoWayHost] }).compileComponents();

    const fixture = TestBed.createComponent(TwoWayHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});

@Component({
  standalone: true,
  imports: [DsSelect, DsOption],
  template: `
    <ds-select [size]="size()" placeholder="Elegí una opción" aria-label="Framework">
      <ds-option [value]="'a'" label="Opción A" />
    </ds-select>
  `,
})
class SizeHost {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
}

// Scenarios de la spec `component-select` que no tenían test (testing-05, aaa-042).
// El criterio de aserción sobre el CSS fuente es el de aaa-023: jsdom no computa
// estilos, así que el contrato de tokens se verifica sobre el archivo.
describe('DsSelect — contrato de size, tokens y superficie pública', () => {
  const selectCss = readComponentCss('select');
  const optionCss = readComponentCss('select', 'option.css');

  it('refleja cada size en data-size del trigger', async () => {
    await TestBed.configureTestingModule({ imports: [SizeHost] }).compileComponents();
    const fixture = TestBed.createComponent(SizeHost);
    fixture.detectChanges();

    const triggerDataSize = (): string | null =>
      (fixture.nativeElement.querySelector('.ds-select__trigger') as HTMLElement).getAttribute(
        'data-size',
      );

    // El default declarado por la spec es 'md'.
    expect(triggerDataSize()).toBe('md');

    for (const size of ['sm', 'md', 'lg'] as const) {
      fixture.componentInstance.size.set(size);
      fixture.detectChanges();
      expect(triggerDataSize()).toBe(size);
    }
  });

  it('no usa hex codes ni colores literales en su CSS fuente', () => {
    for (const css of [selectCss, optionCss]) {
      expect(css.length).toBeGreaterThan(0);
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it('anima la apertura y el cierre con los tokens de motion de overlay', () => {
    expect(selectCss).toContain('--ds-semantic-motion-transition-overlay-enter');
    expect(selectCss).toContain('--ds-semantic-motion-transition-overlay-exit');
  });

  it('desactiva las transiciones bajo prefers-reduced-motion', () => {
    expect(selectCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  // Scenario: el listbox cerrado no genera caja. `display: flex` a secas pisa
  // la regla del UA que oculta un [popover] cerrado (autor gana sobre UA) —
  // el defecto que en el menú desbordaba al panel padre (aaa-045), acá latente
  // porque el listbox no contiene overlays anidados. jsdom no computa estilos
  // de archivo: se verifica sobre el fuente, sin comentarios (mismo criterio
  // que los tests de tokens).
  // El control no se dimensiona solo por el label seleccionado: sin piso, al
  // elegir una opción corta se contrae todo el componente (fix del PO).
  it('declara un piso de ancho tokenizado para el trigger', () => {
    expect(selectCss).toContain('min-width: var(--ds-component-select-trigger-min-width)');
  });

  it('el listbox solo genera caja cuando el popover está abierto', () => {
    const css = selectCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const cerrado = css.slice(css.indexOf('.ds-select__listbox {'), css.indexOf(':popover-open'));
    expect(cerrado).toContain('display: none');
    expect(cerrado).not.toContain('display: flex');
    expect(css.slice(css.indexOf(':popover-open'))).toContain('display: flex');
  });

  it('se exporta desde public-api.ts', () => {
    expect(readPublicApi()).toContain(`export * from './lib/select';`);
  });
});
