import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsCard, DsCardVariant, DsCardPadding } from './card';
import { DsCardHeader } from './card-header';
import { DsCardContent } from './card-content';
import { DsCardFooter } from './card-footer';
import { DsCardTitle } from './card-title';
import { DsCardDescription } from './card-description';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

// Los scenarios de tokens exigen inspeccionar el CSS; jsdom no computa sombras/gap,
// así que se asserta sobre la fuente (mismo criterio que spinner, aaa-023).
const css = readComponentCss('card');

@Component({
  standalone: true,
  imports: [DsCard, DsCardHeader, DsCardContent, DsCardFooter, DsCardTitle, DsCardDescription],
  template: `
    <ds-card [variant]="variant()" [padding]="padding()">
      <ds-card-header>
        <h2 dsCardTitle>Cookie Settings</h2>
        <p dsCardDescription>Manage your cookie settings here.</p>
      </ds-card-header>
      <ds-card-content>Contenido principal</ds-card-content>
      <ds-card-footer>Pie</ds-card-footer>
    </ds-card>
  `,
})
class FullCardHost {
  readonly variant = signal<DsCardVariant>('outline');
  readonly padding = signal<DsCardPadding>('comfortable');
}

@Component({
  standalone: true,
  imports: [DsCard],
  template: `<ds-card>Solo contenido proyectado</ds-card>`,
})
class BareCardHost {}

@Component({
  standalone: true,
  imports: [DsCardTitle],
  template: `<ds-card-title>Como elemento</ds-card-title>`,
})
class ElementTitleHost {}

describe('DsCard (familia)', () => {
  let fixture: ComponentFixture<FullCardHost>;
  let card: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullCardHost, BareCardHost, ElementTitleHost],
    }).compileComponents();

    fixture = TestBed.createComponent(FullCardHost);
    fixture.detectChanges();
    card = fixture.nativeElement.querySelector('ds-card') as HTMLElement;
  });

  it('defaults to variant outline and padding comfortable (CA-019.1/019.3)', () => {
    expect(card.getAttribute('data-variant')).toBe('outline');
    expect(card.getAttribute('data-padding')).toBe('comfortable');
  });

  it('reflects each variant on data-variant with tokenized styles (CA-019.1)', () => {
    for (const variant of ['outline', 'elevated', 'flat'] as const) {
      fixture.componentInstance.variant.set(variant);
      fixture.detectChanges();
      expect(card.getAttribute('data-variant')).toBe(variant);
    }
    expect(css).toContain('--ds-component-card-shadow');
    expect(css).toContain('--ds-component-card-shadow-elevated');
    expect(css).toContain('--ds-component-card-bg-elevated');
    expect(css).toContain('--ds-component-card-radius');
    expect(css).toContain('--ds-component-card-border');
  });

  // Scenario: las variantes con sombra elevan al hover (aaa-053); flat es plana
  // por contrato. jsdom no computa :hover, así que se asserta sobre la fuente.
  it('eleva al hover en outline/elevated con transición de motion; flat no', () => {
    expect(css).toMatch(
      /:host\(\[data-variant='outline'\]:hover\),\s*:host\(\[data-variant='elevated'\]:hover\)\s*\{[^}]*var\(--ds-component-card-shadow-hover\)/,
    );
    expect(css).toMatch(/transition:\s*box-shadow\s+var\(--ds-motion-duration-/);
    expect(css).toMatch(/prefers-reduced-motion[^{]*\{\s*:host\s*\{\s*transition:\s*none/);
    expect(css).not.toMatch(/\[data-variant='flat'\]:hover/);
  });

  it('maps padding modes to tokens (CA-019.3)', () => {
    expect(css).toContain('--ds-component-card-padding-md');

    fixture.componentInstance.padding.set('compact');
    fixture.detectChanges();
    expect(card.getAttribute('data-padding')).toBe('compact');
    expect(css).toContain('--ds-component-card-padding-sm');
  });

  it('renders every optional sub-part with its element (CA-019.2)', () => {
    expect(fixture.nativeElement.querySelector('ds-card-header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ds-card-content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ds-card-footer')).toBeTruthy();
    expect(css).toContain('--ds-component-card-gap');
  });

  it('renders a bare card without sub-parts, projecting content directly (CA-019.2)', () => {
    const bare = TestBed.createComponent(BareCardHost);
    bare.detectChanges();
    const bareCard = bare.nativeElement.querySelector('ds-card') as HTMLElement;

    expect(bareCard.textContent?.trim()).toBe('Solo contenido proyectado');
    expect(bare.nativeElement.querySelector('ds-card-header')).toBeNull();
    expect(bare.nativeElement.querySelector('ds-card-footer')).toBeNull();
  });

  it('applies title and description as attribute preserving the consumer element (CA-019.2/019.4)', () => {
    const title = fixture.nativeElement.querySelector('[dsCardTitle]') as HTMLElement;
    const description = fixture.nativeElement.querySelector('[dsCardDescription]') as HTMLElement;

    expect(title.tagName).toBe('H2');
    expect(title.textContent?.trim()).toBe('Cookie Settings');
    expect(description.tagName).toBe('P');
    expect(description.textContent?.trim()).toBe('Manage your cookie settings here.');
  });

  it('applies title as element with the same projection (CA-019.2)', () => {
    const el = TestBed.createComponent(ElementTitleHost);
    el.detectChanges();
    const title = el.nativeElement.querySelector('ds-card-title') as HTMLElement;

    expect(title).toBeTruthy();
    expect(title.textContent?.trim()).toBe('Como elemento');
  });

  it('imposes no role on the card host (CA-019.4)', () => {
    expect(card.getAttribute('role')).toBeNull();
  });

  it('styles use only tokens: no hex codes nor color literals in the CSS source (CA-019.5)', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-card-');
  });

  it('exports the family and its types from public-api (CA-019.6)', () => {
    expect(publicApi.DsCard).toBe(DsCard);
    expect(publicApi.DsCardHeader).toBe(DsCardHeader);
    expect(publicApi.DsCardContent).toBe(DsCardContent);
    expect(publicApi.DsCardFooter).toBe(DsCardFooter);
    expect(publicApi.DsCardTitle).toBe(DsCardTitle);
    expect(publicApi.DsCardDescription).toBe(DsCardDescription);
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [FullCardHost] }).compileComponents();

    const fixture = TestBed.createComponent(FullCardHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
