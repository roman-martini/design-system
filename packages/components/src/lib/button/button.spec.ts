import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DsButton } from './button';

describe('DsButton', () => {
  let fixture: ComponentFixture<DsButton>;
  let component: DsButton;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
    buttonEl = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.type).toBe('button');
  });

  it('emits clicked when enabled', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    buttonEl.click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
  });

  it('does NOT emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    buttonEl.click();

    expect(spy).not.toHaveBeenCalled();
  });
});
