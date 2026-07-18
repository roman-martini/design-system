import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import * as tooltipPublicApi from './index';
import { DsTooltip } from './tooltip';

@Component({
  standalone: true,
  imports: [DsTooltip],
  template: `
    <button dsTooltip="Ayuda contextual" aria-describedby="externo">Acción</button>
    <span id="externo">descripción externa</span>
  `,
})
class Host {}

@Component({
  standalone: true,
  imports: [DsTooltip],
  template: `<button dsTooltip="Rápido" [dsTooltipDelay]="100">Acción</button>`,
})
class DelayHost {}

@Component({
  standalone: true,
  imports: [DsTooltip],
  template: `<button dsTooltip="">Sin tooltip</button>`,
})
class EmptyHost {}

function panel(): HTMLElement | null {
  return document.querySelector('[role="tooltip"]');
}

function isOpen(): boolean {
  // El polyfill de test-setup marca el popover abierto con data-popover-open.
  return panel()?.hasAttribute('data-popover-open') ?? false;
}

describe('DsTooltip', () => {
  let fixture: ComponentFixture<Host>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [Host, DelayHost, EmptyHost],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('hover abre tras el delay default (500ms fallback) con el texto', () => {
    button.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(499);
    expect(isOpen()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(isOpen()).toBe(true);
    expect(panel()!.textContent).toContain('Ayuda contextual');
  });

  it('dsTooltipDelay sobreescribe el delay', () => {
    const delayFixture = TestBed.createComponent(DelayHost);
    delayFixture.detectChanges();
    const delayButton = delayFixture.nativeElement.querySelector('button') as HTMLButtonElement;
    delayButton.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(100);
    expect(document.querySelectorAll('[role="tooltip"]').length).toBeGreaterThan(0);
    delayFixture.destroy();
  });

  it('salir antes del delay cancela la apertura', () => {
    button.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(200);
    button.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(2000);
    expect(isOpen()).toBe(false);
  });

  it('el foco por teclado abre inmediato y el blur cierra', () => {
    button.dispatchEvent(new Event('focusin'));
    expect(isOpen()).toBe(true);
    button.dispatchEvent(new Event('focusout'));
    expect(isOpen()).toBe(false);
  });

  it('hover-out cierra tras la gracia mínima de cruce', () => {
    button.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    expect(isOpen()).toBe(true);
    button.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(80);
    expect(isOpen()).toBe(false);
  });

  it('hoverable (1.4.13): entrar al panel mantiene el tooltip; salir de él cierra', () => {
    button.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    button.dispatchEvent(new Event('mouseleave'));
    panel()!.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(1000);
    expect(isOpen()).toBe(true);
    panel()!.dispatchEvent(new Event('mouseleave'));
    expect(isOpen()).toBe(false);
  });

  it('dismissable (1.4.13): ESC cierra sin mover el foco', () => {
    button.focus();
    button.dispatchEvent(new Event('focusin'));
    expect(isOpen()).toBe(true);
    const activeBefore = document.activeElement;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(activeBefore);
  });

  it('persistent (1.4.13): no se cierra por transcurso de tiempo', () => {
    button.dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(60000);
    expect(isOpen()).toBe(true);
  });

  it('aria-describedby se compone sin pisar el valor del consumidor', () => {
    button.dispatchEvent(new Event('focusin'));
    const describedBy = button.getAttribute('aria-describedby')!;
    expect(describedBy.startsWith('externo ')).toBe(true);
    expect(describedBy).toContain(panel()!.id);
    button.dispatchEvent(new Event('focusout'));
    expect(button.getAttribute('aria-describedby')).toBe('externo');
  });

  it('el panel expone role="tooltip", id único y popover manual', () => {
    button.dispatchEvent(new Event('focusin'));
    const el = panel()!;
    expect(el.id).toMatch(/^ds-tooltip-\d+$/);
    expect(el.getAttribute('popover')).toBe('manual');
  });

  it('con string vacío la directiva queda inerte', () => {
    const emptyFixture = TestBed.createComponent(EmptyHost);
    emptyFixture.detectChanges();
    const emptyButton = emptyFixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const panelsBefore = document.querySelectorAll('[role="tooltip"]').length;
    emptyButton.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(2000);
    emptyButton.dispatchEvent(new Event('focusin'));
    expect(document.querySelectorAll('[role="tooltip"]').length).toBe(panelsBefore);
    expect(emptyButton.hasAttribute('aria-describedby')).toBe(false);
    emptyFixture.destroy();
  });

  it('destroy limpia panel, timers y listeners', () => {
    button.dispatchEvent(new Event('focusin'));
    const el = panel()!;
    expect(document.body.contains(el)).toBe(true);
    fixture.destroy();
    expect(document.body.contains(el)).toBe(false);
  });

  it('el panel interno NO es parte de la API pública', () => {
    expect(Object.keys(tooltipPublicApi)).toEqual(['DsTooltip']);
  });
});
