import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { DsAvatar } from './avatar';
import { DsAvatarGroup } from './avatar-group';
import * as publicApi from '../../public-api';
import { expectNoAxeViolations } from '../../testing/axe';

@Component({
  standalone: true,
  imports: [DsAvatar, DsAvatarGroup],
  template: `
    <ds-avatar-group label="Miembros del equipo" [max]="max()">
      <ds-avatar name="Sofia Davis" size="sm" />
      <ds-avatar name="Jackson Lee" size="sm" />
      <ds-avatar name="Isabella Nguyen" size="sm" />
      <ds-avatar name="Liam Brown" size="sm" />
      <ds-avatar name="Emma Wilson" size="sm" />
    </ds-avatar-group>
  `,
})
class GroupHost {
  max = signal<number | null>(null);
}

describe('DsAvatarGroup', () => {
  let fixture: ComponentFixture<GroupHost>;
  let host: GroupHost;

  const group = (): HTMLElement => fixture.nativeElement.querySelector('ds-avatar-group');
  const avatars = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('ds-avatar'));
  const hidden = (): HTMLElement[] => avatars().filter((a) => a.hasAttribute('data-group-hidden'));
  const more = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.ds-avatar-group__more');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GroupHost] }).compileComponents();
    fixture = TestBed.createComponent(GroupHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('expone role="group" con aria-label del input label', () => {
    expect(group().getAttribute('role')).toBe('group');
    expect(group().getAttribute('aria-label')).toBe('Miembros del equipo');
  });

  it('los avatares proyectados quedan marcados como parte del grupo (CA-022.3)', () => {
    expect(avatars()).toHaveLength(5);
    for (const a of avatars()) {
      expect(a.hasAttribute('data-in-group')).toBe(true);
    }
  });

  it('sin max no oculta nada ni muestra "+N"', () => {
    expect(hidden()).toHaveLength(0);
    expect(more()).toBeNull();
  });

  it('max colapsa los excedentes en "+N" accesible (CA-022.3)', () => {
    host.max.set(3);
    fixture.detectChanges();
    expect(hidden()).toHaveLength(2);
    // los primeros `max` quedan visibles
    expect(
      avatars()
        .slice(0, 3)
        .some((a) => a.hasAttribute('data-group-hidden')),
    ).toBe(false);
    const plus = more()!;
    expect(plus.textContent?.trim()).toBe('+2');
    expect(plus.getAttribute('role')).toBe('img');
    expect(plus.getAttribute('aria-label')).toBe('y 2 más');
  });

  it('el "+N" hereda el size de los avatares del grupo', () => {
    host.max.set(2);
    fixture.detectChanges();
    expect(more()!.getAttribute('data-size')).toBe('sm');
  });

  it('max mayor o igual que la cantidad no colapsa', () => {
    host.max.set(5);
    fixture.detectChanges();
    expect(hidden()).toHaveLength(0);
    expect(more()).toBeNull();
  });

  it('exporta DsAvatarGroup desde public-api', () => {
    expect(publicApi.DsAvatarGroup).toBe(DsAvatarGroup);
  });
});

@Component({
  standalone: true,
  imports: [DsAvatar, DsAvatarGroup],
  template: `
    <ds-avatar-group [max]="max()" [moreLabel]="moreLabel">
      <ds-avatar name="Sofia Davis" size="sm" />
      <ds-avatar name="Jackson Lee" size="sm" />
      <ds-avatar name="Isabella Nguyen" size="sm" />
    </ds-avatar-group>
  `,
})
class TranslatedGroupHost {
  readonly max = signal<number | null>(2);
  // El caso que motivó el input: pluralización, que un string con placeholder
  // no cubre.
  readonly moreLabel = (count: number): string => (count === 1 ? '1 more' : `${count} more`);
}

// Scenario: overflow "+N" accesible y traducible (components-09). Era el único
// texto anunciado por tecnología asistiva que el consumidor no podía cambiar.
describe('DsAvatarGroup — texto del overflow', () => {
  const more = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-avatar-group__more') as HTMLElement;

  it('sin configurar conserva el texto por defecto', async () => {
    await TestBed.configureTestingModule({ imports: [GroupHost] }).compileComponents();
    const fixture = TestBed.createComponent(GroupHost);
    fixture.componentInstance.max.set(3);
    fixture.detectChanges();
    expect(more(fixture).getAttribute('aria-label')).toBe('y 2 más');
  });

  it('usa el texto del consumidor, que recibe la cantidad oculta', async () => {
    await TestBed.configureTestingModule({ imports: [TranslatedGroupHost] }).compileComponents();
    const fixture = TestBed.createComponent(TranslatedGroupHost);
    fixture.detectChanges();
    expect(more(fixture).getAttribute('aria-label')).toBe('1 more');
  });

  it('el override puede pluralizar según la cantidad', async () => {
    await TestBed.configureTestingModule({ imports: [TranslatedGroupHost] }).compileComponents();
    const fixture = TestBed.createComponent(TranslatedGroupHost);
    fixture.componentInstance.max.set(1);
    fixture.detectChanges();
    expect(more(fixture).getAttribute('aria-label')).toBe('2 more');
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el render por defecto. El helper falla
// tanto ante una violación como ante una corrida que no pudo evaluar nada.
describe('a11y (axe)', () => {
  it('el render por defecto no tiene violaciones WCAG A/AA', async () => {
    await TestBed.configureTestingModule({ imports: [GroupHost] }).compileComponents();

    const fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement);
  });
});
