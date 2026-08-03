import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';

export type PlaygroundTheme = 'light' | 'dark';
export type PlaygroundBrand = 'default' | 'a' | 'b';

const STORAGE_KEY = 'ds-playground-theme';

/**
 * Toggle de theme y brand del playground. Existe para que el gate visual previo
 * al archive (D-022) pueda ejercerse sobre los themes: hasta ahora el playground
 * cargaba solo los tokens base y no había forma de ver dark ni las brands, así
 * que los defectos de theming solo aparecían midiendo con herramientas.
 *
 * Setea `data-theme` / `data-brand` en el root, que es el contrato que declaran
 * las hojas de theme del package de tokens.
 */
@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="switcher" role="group" aria-label="Apariencia del playground">
      <label class="switcher__field">
        <span>Theme</span>
        <select [value]="theme()" (change)="setTheme($event)">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label class="switcher__field">
        <span>Brand</span>
        <select [value]="brand()" (change)="setBrand($event)">
          <option value="default">Default</option>
          <option value="a">Brand A</option>
          <option value="b">Brand B</option>
        </select>
      </label>
    </div>
  `,
  styles: `
    .switcher {
      display: flex;
      gap: var(--ds-semantic-space-md);
      align-items: center;
    }

    .switcher__field {
      display: inline-flex;
      gap: var(--ds-semantic-space-2xs);
      align-items: center;
      color: var(--ds-semantic-color-text-secondary);
      font-size: var(--ds-font-size-sm);
    }

    /* Controles nativos a propósito: la barra de herramientas del laboratorio no
       debe depender del kit que está validando — si un componente del DS se
       rompe, el switcher tiene que seguir funcionando para poder verlo. */
    select {
      border: var(--ds-dimension-1) solid var(--ds-semantic-color-border-default);
      border-radius: var(--ds-semantic-radius-sm);
      background: var(--ds-semantic-color-bg-surface);
      color: var(--ds-semantic-color-text-primary);
      font: inherit;
      font-size: var(--ds-font-size-sm);
      padding: var(--ds-semantic-space-2xs);
    }
  `,
})
export class ThemeSwitcher {
  protected readonly theme = signal<PlaygroundTheme>(restoreTheme());
  protected readonly brand = signal<PlaygroundBrand>('default');

  constructor() {
    effect(() => {
      const root = document.documentElement;
      const theme = this.theme();
      const brand = this.brand();

      // El theme light es la ausencia del atributo: los tokens base ya son light.
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }

      if (brand === 'default') {
        root.removeAttribute('data-brand');
      } else {
        root.setAttribute('data-brand', brand);
      }

      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  protected setTheme(event: Event): void {
    this.theme.set((event.target as HTMLSelectElement).value as PlaygroundTheme);
  }

  protected setBrand(event: Event): void {
    this.brand.set((event.target as HTMLSelectElement).value as PlaygroundBrand);
  }
}

/** El theme elegido sobrevive al reload: un gate visual suele ser iterativo. */
function restoreTheme(): PlaygroundTheme {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}
