import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsProgress } from './progress';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss, readPublicApi } from '../../testing/css';

// Límite jsdom declarado: las animaciones (desplazamiento indeterminado, pulso
// reduced-motion) se verifican sobre la fuente CSS; el movimiento real se
// verifica a mano en playground.
const readSource = (relative: string): string => readComponentCss('progress', relative);

@Component({
  standalone: true,
  imports: [DsProgress],
  template: `
    <ds-progress
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [tone]="tone()"
      [showValue]="showValue()"
    />
  `,
})
class Host {
  readonly value = signal<number | null>(40);
  readonly max = signal(100);
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly tone = signal<'primary' | 'success' | 'danger'>('primary');
  readonly showValue = signal(false);
}

describe('DsProgress', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const bar = (): HTMLElement => fixture.nativeElement.querySelector('[role="progressbar"]');
  const fill = (): HTMLElement => fixture.nativeElement.querySelector('.ds-progress__fill');
  const valueText = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.ds-progress__value');
  const hostEl = (): HTMLElement => fixture.nativeElement.querySelector('ds-progress');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Scenario: determinada accesible (CA-016.1)
  it('expone progressbar con aria-valuenow/min/max y fill proporcional', () => {
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(bar().getAttribute('aria-valuemax')).toBe('100');
    expect(bar().getAttribute('aria-valuenow')).toBe('40');
    expect(fill().style.width).toBe('40%');
  });

  it('clampa value fuera de rango por arriba y por abajo', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(bar().getAttribute('aria-valuenow')).toBe('100');
    expect(fill().style.width).toBe('100%');

    host.value.set(-10);
    fixture.detectChanges();
    expect(bar().getAttribute('aria-valuenow')).toBe('0');
    expect(fill().style.width).toBe('0%');
  });

  it('respeta un max custom (aria-valuenow expone el valor real, no el porcentaje)', () => {
    host.max.set(20);
    host.value.set(5);
    fixture.detectChanges();
    expect(bar().getAttribute('aria-valuemax')).toBe('20');
    expect(bar().getAttribute('aria-valuenow')).toBe('5');
    expect(fill().style.width).toBe('25%');
  });

  // Scenario: indeterminada (CA-016.2)
  it('sin value expone progressbar sin aria-valuenow con la clase de animación', () => {
    host.value.set(null);
    fixture.detectChanges();
    expect(bar().getAttribute('aria-valuenow')).toBeNull();
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(fill().classList.contains('ds-progress__fill--indeterminate')).toBe(true);
  });

  // Scenario: label accesible con opt-out (CA-016.3)
  it('tiene nombre accesible default, configurable, y opt-out con label vacío', () => {
    expect(bar().getAttribute('aria-label')).toBe('Progreso');

    const solo = TestBed.createComponent(DsProgress);
    solo.componentRef.setInput('label', 'Subiendo archivo');
    solo.detectChanges();
    expect(
      solo.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-label'),
    ).toBe('Subiendo archivo');

    solo.componentRef.setInput('label', '');
    solo.detectChanges();
    expect(
      solo.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-label'),
    ).toBeNull();
  });

  // Scenario: porcentaje visible opt-in (CA-016.4)
  it('showValue muestra el porcentaje redondeado solo en determinada', () => {
    expect(valueText()).toBeNull();

    host.showValue.set(true);
    host.value.set(33.4);
    fixture.detectChanges();
    expect(valueText()!.textContent!.trim()).toBe('33%');

    host.value.set(null);
    fixture.detectChanges();
    expect(valueText()).toBeNull();
  });

  // Scenario: sizes y tonos (CA-016.5, CA-016.6)
  it('sizes y tonos se reflejan como data-attributes del host para el CSS', () => {
    expect(hostEl().getAttribute('data-size')).toBe('md');
    expect(hostEl().getAttribute('data-tone')).toBe('primary');

    host.size.set('lg');
    host.tone.set('danger');
    fixture.detectChanges();
    expect(hostEl().getAttribute('data-size')).toBe('lg');
    expect(hostEl().getAttribute('data-tone')).toBe('danger');
  });

  // Scenario: reduced-motion por pulso (CA-016.7) + tokens (CA-016.8)
  it('el CSS declara keyframes, reemplazo por pulso bajo reduced-motion y cero hardcodes', () => {
    const css = readSource('progress.css');
    expect(css.length).toBeGreaterThan(0);
    expect(css).toContain('@keyframes ds-progress-slide');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@keyframes ds-progress-pulse');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    // sin clases de estado desde :host (lección aaa-026); los :host([data-*])
    // de configuración estática son válidos (progress no se anida ni proyecta)
    expect(css).not.toMatch(/:host\(\.[^)]*\)/);
  });

  // Scenario: exportado desde public-api.ts
  it('el componente se exporta en public-api.ts', () => {
    const publicApi = readPublicApi();
    expect(publicApi).toContain(`export * from './lib/progress';`);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
