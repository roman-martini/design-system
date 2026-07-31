import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsButton } from './button';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// Scenarios de variantes (aaa-033) asertan tokens sobre el CSS fuente (criterio aaa-023):
// jsdom no computa colores; los ratios reales los verifica el gate de contraste por script.
const buttonCss = readComponentCss('button');

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

  describe('variants (aaa-033)', () => {
    it('reflects each new variant on data-variant (CA-020.1–020.3)', () => {
      for (const variant of ['outline', 'danger', 'danger-outline', 'danger-ghost'] as const) {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(buttonEl.getAttribute('data-variant')).toBe(variant);
      }
    });

    it('styles outline from component tokens (CA-020.1)', () => {
      expect(buttonCss).toContain('--ds-component-button-outline-border');
      expect(buttonCss).toContain('--ds-component-button-outline-text');
      expect(buttonCss).toContain('--ds-component-button-outline-bg-hover');
    });

    it('styles danger solid from the bootstrap block (CA-020.2)', () => {
      expect(buttonCss).toContain('--ds-component-button-danger-bg');
      expect(buttonCss).toContain('--ds-component-button-danger-bg-hover');
      expect(buttonCss).toContain('--ds-component-button-danger-text');
    });

    it('styles danger-outline and danger-ghost with subtle hover (CA-020.3)', () => {
      expect(buttonCss).toContain('--ds-component-button-danger-outline-border');
      expect(buttonCss).toContain('--ds-component-button-danger-outline-bg-hover');
      expect(buttonCss).toContain('--ds-component-button-danger-ghost-text');
      expect(buttonCss).toContain('--ds-component-button-danger-ghost-bg-hover');
    });

    it('keeps the disabled guard working on a danger variant (CA-020.5)', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.clicked.subscribe(spy);
      buttonEl.click();

      expect(spy).not.toHaveBeenCalled();
      expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
    });

    it('uses no hex codes in the variants CSS source (CA-020.1–020.3)', () => {
      expect(buttonCss.length).toBeGreaterThan(0);
      expect(buttonCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    });
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

    it('keeps the loading guard working on a danger variant (CA-020.5)', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.clicked.subscribe(spy);
      buttonEl.click();

      expect(spy).not.toHaveBeenCalled();
      expect(buttonEl.getAttribute('aria-busy')).toBe('true');
      expect(buttonEl.getAttribute('data-variant')).toBe('danger');
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

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
//
// Se monta con host: el nombre accesible del botón sale de su contenido
// proyectado, y `createComponent(DsButton)` no proyecta nada — auditar eso
// mediría un caso que ningún consumidor escribe.
@Component({
  standalone: true,
  imports: [DsButton],
  template: `<ds-button>Guardar cambios</ds-button>`,
})
class A11yHost {}

describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [A11yHost] }).compileComponents();

    const fixture = TestBed.createComponent(A11yHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});

// Scenario de la spec `component-button` que no tenía test: CA-017.7, estilos del
// estado loading por tokens y sin pares de contraste propios (testing-05, aaa-042).
describe('loading — estilos por tokens (CA-017.7)', () => {
  // Reglas cuyo selector menciona el estado loading, con su bloque de declaraciones.
  const reglasLoading = Array.from(
    buttonCss.matchAll(/([^{}]*\[data-loading[^{}]*)\{([^}]*)\}/g),
  ).map(([, selector, cuerpo]) => ({ selector: selector.trim(), cuerpo }));

  it('el CSS del estado loading existe y es acotado', () => {
    expect(reglasLoading.length).toBeGreaterThan(0);
  });

  it('no introduce pares de contraste propios: no declara color ni background', () => {
    // El spinner hereda currentColor del botón; si el bloque loading pintara
    // color o fondo propios, crearía un par que el gate de contraste no cubre.
    for (const { selector, cuerpo } of reglasLoading) {
      // Las reglas de variante que solo EXCLUYEN el estado loading
      // (`:not([data-loading])`) no son estilos del estado: se saltean.
      if (selector.includes(':not([data-loading])')) continue;

      expect(cuerpo, `regla '${selector}'`).not.toMatch(/(?<!-)\bcolor:/);
      expect(cuerpo, `regla '${selector}'`).not.toMatch(/\bbackground(-color)?:/);
    }
  });

  it('todo valor visual del bloque loading sale de un token --ds-*', () => {
    // Propiedades de layout puro (position, display, inset, opacity, cursor…) no
    // son valores del sistema visual; las que sí lo son van por var(--ds-*).
    const propiedadesTokenizables = /\b(gap|margin|padding|border-radius|font-size|box-shadow):/;

    for (const { selector, cuerpo } of reglasLoading) {
      if (selector.includes(':not([data-loading])')) continue;
      if (!propiedadesTokenizables.test(cuerpo)) continue;

      for (const linea of cuerpo.split('\n')) {
        if (!propiedadesTokenizables.test(linea)) continue;
        expect(linea, `regla '${selector}'`).toContain('var(--ds-');
      }
    }
  });
});
