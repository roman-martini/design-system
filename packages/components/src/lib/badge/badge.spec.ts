import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsBadge, DsBadgeTone, DsBadgeAppearance, DsBadgeSize } from './badge';
import { DsBadgeIcon } from './badge-icon';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// Los colores por combinación tono×apariencia los verifica el gate de contraste por
// script (18 pares × 4 themes); jsdom no computa colores. Acá asertamos data-* + tokens
// en el CSS fuente (criterio aaa-023/033).
const css = readComponentCss('badge');

@Component({
  standalone: true,
  imports: [DsBadge, DsBadgeIcon],
  template: `
    <ds-badge [tone]="tone()" [appearance]="appearance()" [size]="size()" [dot]="dot()">
      @if (withIcon()) {
        <svg dsBadgeIcon></svg>
      }
      Estado
    </ds-badge>
  `,
})
class BadgeHost {
  readonly tone = signal<DsBadgeTone>('neutral');
  readonly appearance = signal<DsBadgeAppearance>('subtle');
  readonly size = signal<DsBadgeSize>('md');
  readonly dot = signal<boolean>(false);
  readonly withIcon = signal<boolean>(true);
}

describe('DsBadge', () => {
  let fixture: ComponentFixture<BadgeHost>;
  let badge: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();
    fixture = TestBed.createComponent(BadgeHost);
    fixture.detectChanges();
    badge = fixture.nativeElement.querySelector('ds-badge') as HTMLElement;
  });

  it('defaults to neutral/subtle/md (CA-021.1)', () => {
    expect(badge.getAttribute('data-tone')).toBe('neutral');
    expect(badge.getAttribute('data-appearance')).toBe('subtle');
    expect(badge.getAttribute('data-size')).toBe('md');
  });

  it('reflects the two axes and size on data-* (CA-021.1/021.3)', () => {
    fixture.componentInstance.tone.set('danger');
    fixture.componentInstance.appearance.set('solid');
    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();

    expect(badge.getAttribute('data-tone')).toBe('danger');
    expect(badge.getAttribute('data-appearance')).toBe('solid');
    expect(badge.getAttribute('data-size')).toBe('lg');
  });

  it('projects the text content (CA-021.1)', () => {
    expect(badge.textContent?.trim()).toContain('Estado');
  });

  it('renders a decorative dot when dot is true and there is no icon (CA-021.4)', () => {
    fixture.componentInstance.withIcon.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-badge__dot')).toBeNull();

    fixture.componentInstance.dot.set(true);
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('.ds-badge__dot') as HTMLElement;
    expect(dot).toBeTruthy();
    expect(dot.getAttribute('aria-hidden')).toBe('true');
  });

  it('makes the projected icon decorative via the dsBadgeIcon directive (CA-021.4)', () => {
    const icon = badge.querySelector('[dsBadgeIcon]') as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives the icon precedence over the dot when both are set (CA-021.4)', () => {
    fixture.componentInstance.dot.set(true); // withIcon is true by default
    fixture.detectChanges();

    // el ícono explícito gana: el dot no se renderiza
    expect(fixture.nativeElement.querySelector('.ds-badge__dot')).toBeNull();
    expect(badge.querySelector('[dsBadgeIcon]')).toBeTruthy();
  });

  it('imposes no role — meaning is carried by the text (CA-021.5)', () => {
    expect(badge.getAttribute('role')).toBeNull();
  });

  it('covers the 18 tone×appearance combinations with tokens in the CSS source (CA-021.2)', () => {
    for (const tone of ['neutral', 'primary', 'danger', 'success', 'warning', 'info'] as const) {
      // subtle/outline text + subtle bg + solid pair
      expect(css).toContain(`--ds-component-badge-${tone}-text`);
      expect(css).toContain(`--ds-component-badge-${tone}-subtle-bg`);
      expect(css).toContain(`--ds-component-badge-${tone}-solid-bg`);
      expect(css).toContain(`--ds-component-badge-${tone}-solid-text`);
    }
    // outline reusa el color del texto como borde
    expect(css).toContain("[data-appearance='outline']");
    expect(css).toContain('border-color: currentColor');
  });

  it('uses only tokens: no hex nor color literals in the CSS source (CA-021.6)', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-badge-');
  });

  it('exports DsBadge and its types from public-api (CA-021.7)', () => {
    expect(publicApi.DsBadge).toBe(DsBadge);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();

    const fixture = TestBed.createComponent(BadgeHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
