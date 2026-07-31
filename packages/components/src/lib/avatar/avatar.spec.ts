import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsAvatar, avatarInitials, avatarToneFromName } from './avatar';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss } from '../../testing/css';

const css = readComponentCss('avatar');

@Component({
  standalone: true,
  imports: [DsAvatar],
  template: `<ds-avatar [name]="name()" [src]="src()" [size]="size()" [tone]="tone()" />`,
})
class Host {
  name = signal('Sofia Davis');
  src = signal<string | null>(null);
  size = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  tone = signal<'auto' | 'neutral' | 'info'>('auto');
}

describe('DsAvatar', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const avatarEl = (): HTMLElement => fixture.nativeElement.querySelector('ds-avatar');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sin src renderiza iniciales con nombre accesible (CA-022.1/022.4)', () => {
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    const initials = fixture.nativeElement.querySelector('.ds-avatar__initials') as HTMLElement;
    expect(initials.textContent?.trim()).toBe('SD');
    expect(initials.getAttribute('role')).toBe('img');
    expect(initials.getAttribute('aria-label')).toBe('Sofia Davis');
  });

  it('una sola palabra da una inicial', () => {
    host.name.set('Sofia');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.ds-avatar__initials') as HTMLElement;
    expect(initials.textContent?.trim()).toBe('S');
  });

  it('con src renderiza la imagen con alt = name (CA-022.1)', () => {
    host.src.set('avatar.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('alt')).toBe('Sofia Davis');
    expect(fixture.nativeElement.querySelector('.ds-avatar__initials')).toBeNull();
  });

  it('error de carga de imagen cae al fallback de iniciales (CA-022.1)', () => {
    host.src.set('rota.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    const initials = fixture.nativeElement.querySelector('.ds-avatar__initials') as HTMLElement;
    expect(initials.textContent?.trim()).toBe('SD');
  });

  it('un src nuevo re-intenta la imagen tras un error previo', () => {
    host.src.set('rota.png');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    host.src.set('nueva.png');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });

  it('el tono por hash es determinístico y se refleja en data-tone (CA-022.2)', () => {
    const expected = avatarToneFromName('Sofia Davis');
    expect(avatarToneFromName('Sofia Davis')).toBe(expected);
    expect(avatarEl().getAttribute('data-tone')).toBe(expected);
  });

  it('tone manual pisa el hash (CA-022.2)', () => {
    host.tone.set('info');
    fixture.detectChanges();
    expect(avatarEl().getAttribute('data-tone')).toBe('info');
  });

  it('con imagen visible no expone data-tone', () => {
    host.src.set('avatar.png');
    fixture.detectChanges();
    expect(avatarEl().getAttribute('data-tone')).toBeNull();
  });

  it('el size se refleja en data-size (CA-022.1)', () => {
    expect(avatarEl().getAttribute('data-size')).toBe('md');
    host.size.set('xl');
    fixture.detectChanges();
    expect(avatarEl().getAttribute('data-size')).toBe('xl');
  });

  it('sin name es decorativo: aria-hidden y sin role (CA-022.4)', () => {
    host.name.set('');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.ds-avatar__initials') as HTMLElement;
    expect(initials.getAttribute('aria-hidden')).toBe('true');
    expect(initials.getAttribute('role')).toBeNull();
    expect(initials.getAttribute('aria-label')).toBeNull();
  });
});

describe('helpers puros', () => {
  it('avatarInitials recorta a dos palabras y sube a mayúsculas', () => {
    expect(avatarInitials('sofia davis')).toBe('SD');
    expect(avatarInitials('  Jackson  ')).toBe('J');
    expect(avatarInitials('Ana María López')).toBe('AM');
    expect(avatarInitials('')).toBe('');
  });

  it('avatarToneFromName es una función pura estable', () => {
    expect(avatarToneFromName('Isabella Nguyen')).toBe(avatarToneFromName('Isabella Nguyen'));
    expect(avatarToneFromName('')).toBeDefined();
  });
});

describe('DsAvatar CSS y API pública', () => {
  it('usa solo tokens: sin hex ni literales de color en el CSS fuente (CA-022.2)', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain('var(--ds-component-avatar-');
  });

  it('el solape del grupo usa el token de overlap (space.negative) (CA-022.3)', () => {
    expect(css).toContain('var(--ds-component-avatar-group-overlap)');
  });

  it('exporta DsAvatar desde public-api (CA-022.1)', () => {
    expect(publicApi.DsAvatar).toBe(DsAvatar);
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
