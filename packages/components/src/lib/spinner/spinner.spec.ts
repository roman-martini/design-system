import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsSpinner } from './spinner';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// Los scenarios CA-009.4/5 exigen inspeccionar el CSS; jsdom no computa estilos
// de keyframes/media queries, así que se asserta sobre la fuente. El plugin de
// Angular intercepta los imports de .css (incluso ?raw), de ahí el readFileSync.
const css = readComponentCss('spinner');

describe('DsSpinner', () => {
  let fixture: ComponentFixture<DsSpinner>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsSpinner],
    }).compileComponents();

    fixture = TestBed.createComponent(DsSpinner);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('creates the component with size md by default', () => {
    expect(host.getAttribute('data-size')).toBe('md');
    expect(host.querySelector('svg')).toBeTruthy();
  });

  it('reflects each size on data-size and maps diameter and stroke to tokens (CA-009.1)', () => {
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();

      expect(host.getAttribute('data-size')).toBe(size);
      expect(css).toContain(`--ds-component-spinner-size-${size}`);
      expect(css).toContain(`--ds-component-spinner-stroke-${size}`);
    }
  });

  it('draws indicator and track with currentColor and exposes no color API (CA-009.2)', () => {
    expect(css).toContain('stroke: currentColor');
    expect(css).toContain('--ds-component-spinner-track-opacity');
    expect('color' in fixture.componentInstance).toBe(false);
    expect('variant' in fixture.componentInstance).toBe(false);
  });

  it('announces as role=status with the default label visually hidden (CA-009.3)', () => {
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-hidden')).toBeNull();

    const label = host.querySelector('.ds-spinner__label');
    expect(label?.textContent?.trim()).toBe('Cargando');
  });

  it('announces a custom label (CA-009.3)', () => {
    fixture.componentRef.setInput('label', 'Guardando borrador');
    fixture.detectChanges();

    expect(host.querySelector('.ds-spinner__label')?.textContent?.trim()).toBe(
      'Guardando borrador',
    );
  });

  it('becomes decorative with an empty label: aria-hidden, no role, no text (CA-009.3)', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.querySelector('.ds-spinner__label')).toBeNull();
    expect(host.textContent?.trim()).toBe('');
  });

  it('keeps the SVG decorative for assistive tech in every mode (CA-009.3)', () => {
    expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('rotates with tokenized duration and replaces rotation by an opacity pulse under reduced motion (CA-009.4)', () => {
    expect(css).toContain('--ds-component-spinner-duration-spin');
    expect(css).toContain('--ds-motion-easing-linear');

    const reducedMotionBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
    expect(reducedMotionBlock).toBeTruthy();
    expect(reducedMotionBlock).toContain('animation: none');
    expect(reducedMotionBlock).toContain('ds-spinner-pulse');
    expect(css).toContain('--ds-component-spinner-duration-pulse');
  });

  it('styles come exclusively from tokens: no hex codes nor hardcoded px (CA-009.5)', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/[1-9]\d*px/);
    expect(css).not.toMatch(/\d+ms/);
  });

  it('is part of the public API together with its size type (public-api.ts)', () => {
    expect(publicApi.DsSpinner).toBe(DsSpinner);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [DsSpinner] }).compileComponents();

    const fixture = TestBed.createComponent(DsSpinner);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
