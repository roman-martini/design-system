import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowcaseCase } from './showcase-case';

const SNIPPET = '<ds-button variant="primary">Ok</ds-button>';

@Component({
  standalone: true,
  imports: [ShowcaseCase],
  template: `
    <app-showcase-case title="Caso demo" [snippet]="snippet">
      <p>demo renderizada</p>
    </app-showcase-case>
  `,
})
class Host {
  readonly snippet = SNIPPET;
}

describe('ShowcaseCase', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  afterEach(() => {
    delete (navigator as { clipboard?: unknown }).clipboard;
  });

  it('renderiza título, demo proyectada y snippet', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent).toContain('Caso demo');
    expect(el.textContent).toContain('demo renderizada');
    expect(el.querySelector('pre code')?.textContent).toBe(SNIPPET);
  });

  it('copiar escribe el snippet en el clipboard y anuncia por toast', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const copiar = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Copiar'),
    ) as HTMLButtonElement | undefined;
    expect(copiar).toBeDefined();

    copiar?.click();
    await fixture.whenStable();
    TestBed.inject(ApplicationRef).tick();

    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    expect(document.querySelector('ds-toast-container')?.textContent).toContain('Snippet copiado');
  });

  it('sin Clipboard API el botón no rompe (no-op)', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const copiar = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Copiar'),
    ) as HTMLButtonElement | undefined;

    expect(() => copiar?.click()).not.toThrow();
  });
});
