import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsSkeleton } from './skeleton';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// Los scenarios CA-010.4/5 exigen inspeccionar el CSS; jsdom no computa estilos
// de keyframes/media queries, así que se asserta sobre la fuente (mismo criterio
// y límite declarado que spinner.spec.ts, aaa-023).
const css = readComponentCss('skeleton');

describe('DsSkeleton', () => {
  let fixture: ComponentFixture<DsSkeleton>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(DsSkeleton);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('creates the component with shape text by default', () => {
    expect(host.getAttribute('data-shape')).toBe('text');
  });

  it('reflects each shape on data-shape and maps its defaults to tokens (CA-010.1)', () => {
    for (const shape of ['text', 'rect', 'circle'] as const) {
      fixture.componentRef.setInput('shape', shape);
      fixture.detectChanges();

      expect(host.getAttribute('data-shape')).toBe(shape);
    }

    expect(css).toContain('--ds-component-skeleton-text-height');
    expect(css).toContain('--ds-component-skeleton-rect-height');
    expect(css).toContain('--ds-component-skeleton-circle-size');
    expect(css).toContain('--ds-component-skeleton-circle-radius');
    expect(css).toContain('--ds-component-skeleton-radius');
    expect(css).toContain('--ds-component-skeleton-bg');
  });

  it('applies width/height/radius as inline overrides (CA-010.2)', () => {
    fixture.componentRef.setInput('width', '12rem');
    fixture.componentRef.setInput('height', '40%');
    fixture.componentRef.setInput('radius', '8px');
    fixture.detectChanges();

    expect(host.style.width).toBe('12rem');
    expect(host.style.height).toBe('40%');
    expect(host.style.borderRadius).toBe('8px');
  });

  it('renders without inline dimension styles when inputs are empty (CA-010.2)', () => {
    expect(host.style.width).toBe('');
    expect(host.style.height).toBe('');
    expect(host.style.borderRadius).toBe('');
  });

  it('is always decorative: aria-hidden, no role, no text (CA-010.3)', () => {
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.textContent?.trim()).toBe('');
  });

  it('pulses with tokenized duration/opacity and turns off under reduced motion (CA-010.4)', () => {
    expect(css).toContain('ds-skeleton-pulse');
    expect(css).toContain('--ds-component-skeleton-duration-pulse');
    expect(css).toContain('--ds-component-skeleton-pulse-opacity');
    expect(css).toContain('--ds-motion-easing-ease-in-out');

    const reducedMotionBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
    expect(reducedMotionBlock).toBeTruthy();
    expect(reducedMotionBlock).toContain('animation: none');
  });

  it('styles come exclusively from tokens: no hex codes nor hardcoded px (CA-010.5)', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/[1-9]\d*px/);
    expect(css).not.toMatch(/\d+ms/);
  });

  it('is part of the public API together with its shape type (public-api.ts)', () => {
    expect(publicApi.DsSkeleton).toBe(DsSkeleton);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsSkeleton] }).compileComponents();

    const fixture = TestBed.createComponent(DsSkeleton);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
