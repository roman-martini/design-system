# @romanmartinidev/components

Componentes Angular del sistema de diseño **romanmartinidev**. Standalone + signals API (Angular 21), consumen `@romanmartinidev/tokens` vía CSS custom properties. Distribuidos siguiendo [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format) con [ng-packagr](https://github.com/ng-packagr/ng-packagr).

## Instalación

```bash
pnpm add @romanmartinidev/components @romanmartinidev/tokens @lucide/angular
# + peer deps Angular si tu proyecto aún no las tiene:
pnpm add @angular/core @angular/common
```

`@romanmartinidev/tokens` es **peer dependency** — debe instalarse explícitamente. Esto evita que múltiples consumidores instalen versiones distintas de los tokens en el mismo árbol.

`@lucide/angular` es **peer dependency** desde que `DsModal` consume iconos Lucide ([ADR-012](../../docs/architecture/adr/ADR-012-iconografia-lucide.md)): la versión la controla el consumidor, evitando copias duplicadas si tu app también usa Lucide directamente.

## Uso

### Orden de import obligatorio

**Importá los tokens CSS antes de usar componentes** (típicamente en el entry point de la app):

```ts
// main.ts (o equivalente)
import '@romanmartinidev/tokens/css';
// si vas a usar dark mode:
import '@romanmartinidev/tokens/themes/dark';
```

Sin esto, los componentes pintan sin estilos (las variables `--ds-*` no están definidas).

### Ejemplo: Button

```ts
import { Component, signal } from '@angular/core';
import { DsButton } from '@romanmartinidev/components';

@Component({
  standalone: true,
  imports: [DsButton],
  template: `
    <ds-button variant="primary" size="md" [disabled]="loading()" (clicked)="handleSubmit($event)">
      Enviar
    </ds-button>
  `,
})
export class MyFormComponent {
  loading = signal(false);

  handleSubmit(event: MouseEvent) {
    console.log('clicked', event);
  }
}
```

### Ejemplo: Checkbox con FormControl

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsCheckbox } from '@romanmartinidev/components';

@Component({
  standalone: true,
  imports: [DsCheckbox, ReactiveFormsModule],
  template: `<ds-checkbox [formControl]="terms">Acepto los términos</ds-checkbox>`,
})
export class MyFormComponent {
  terms = new FormControl(false, { nonNullable: true });
}
```

### Ejemplo: RadioGroup con FormControl

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsRadio, DsRadioGroup } from '@romanmartinidev/components';

@Component({
  standalone: true,
  imports: [DsRadio, DsRadioGroup, ReactiveFormsModule],
  template: `
    <ds-radio-group [formControl]="framework">
      <ds-radio [value]="'angular'" label="Angular" />
      <ds-radio [value]="'react'" label="React" />
      <ds-radio [value]="'vue'" label="Vue" />
    </ds-radio-group>
  `,
})
export class MyFormComponent {
  framework = new FormControl<string>('angular', { nonNullable: true });
}
```

Keyboard nav (WAI-ARIA APG): `Arrow`/`Arrow Down` siguiente, `Arrow Left`/`Arrow Up` anterior, `Home`/`End` extremos. Radios deshabilitados se saltan.

## Componentes disponibles

| Componente     | Selector         | Variants / Estado                                                      | Sizes            |
| -------------- | ---------------- | ---------------------------------------------------------------------- | ---------------- |
| `DsButton`     | `ds-button`      | `primary`, `secondary`, `ghost` + `disabledReason` accesible           | `sm`, `md`, `lg` |
| `DsCheckbox`   | `ds-checkbox`    | `checked`, `indeterminate`, `disabled` + CVA                           | `sm`, `md`, `lg` |
| `DsRadio`      | `ds-radio`       | `value` (genérico), `disabled`, `label` slot + standalone              | `sm`, `md`, `lg` |
| `DsRadioGroup` | `ds-radio-group` | `value` model two-way, `disabled` + CVA, `name` auto-gen, keyboard nav | —                |
| `DsModal`      | `ds-modal`       | `open` two-way, `heading`, `closeOnEscape`/`closeOnOverlay`, top layer | `sm`, `md`, `lg` |
| `DsSelect`     | `ds-select`      | `DsOption` proyectadas, CVA, keyboard nav APG, Popover API (ADR-014)   | —                |
| `DsInput`      | `ds-input`       | `type` whitelist, `label`/`hint`/`error`, prefix/suffix, CVA           | —                |
| `DsTabs`       | `ds-tabs`        | `DsTab` proyectados, `value` two-way, roving tabindex, ARIA APG        | —                |
| `DsTooltip`    | `[dsTooltip]`    | Directiva; delay configurable, hoverable/dismissable (WCAG 1.4.13)     | —                |

Más componentes en changes futuros (Toast, Spinner, Skeleton, etc. — ver backlog).

## Convenciones

- **Standalone components** + signal-based API (`input()`, `output()`, `model()`).
- **Prefix unificado `Ds` / `ds-` / `--ds-*`** — parte del contrato API público.
  - Selector HTML: `ds-<name>`.
  - Class TypeScript: `Ds<Name>` (sin sufijo `Component`).
  - CSS custom properties: `--ds-*`.
- **CSS plain** consumiendo tokens vía `var(--ds-*)`. Sin pre-procesadores.
- **ViewEncapsulation Emulated** (default Angular) — los estilos no leak.
- **Arquitectura flat por componente** — una carpeta `src/lib/<name>/` por componente.

Detalle de arquitectura en [ADR-004](../../docs/architecture/adr/ADR-004-arquitectura-components.md).
Detalle de naming y prefijos en [ADR-007](../../docs/architecture/adr/ADR-007-naming-prefijos.md).

## Build (solo desarrollo)

```bash
pnpm -F @romanmartinidev/components build   # ng-packagr → dist/
pnpm -F @romanmartinidev/components test    # vitest (una suite por componente)
pnpm -F @romanmartinidev/components watch   # ng-packagr en watch mode
```

## Versionado

Pre-1.0. La superficie API puede cambiar entre minors según política del repo. Cambios significativos siguen el flujo de [Changesets](../../CONTRIBUTING.md).

**El prefix `Ds` / `ds-` queda parte del contrato API público**: cambiarlo es BREAKING y exige un ADR que reemplace al ADR-007.

## Licencia

[MIT](../../LICENSE) © 2026 Roman Martini
