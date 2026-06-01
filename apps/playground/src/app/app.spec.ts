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

  it('renders at least one rmd-button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('rmd-button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
