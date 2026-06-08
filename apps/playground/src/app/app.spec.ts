import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('creates the App', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders at least one ds-button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('ds-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders at least one ds-checkbox', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const checkboxes = fixture.nativeElement.querySelectorAll('ds-checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('renders at least one ds-radio-group', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const groups = fixture.nativeElement.querySelectorAll('ds-radio-group');
    expect(groups.length).toBeGreaterThan(0);
  });
});
