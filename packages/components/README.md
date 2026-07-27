# @romanmartinidev/components

Componentes Angular del sistema de diseño **romanmartinidev**. Standalone + signals API (Angular 21), consumen `@romanmartinidev/tokens` vía CSS custom properties. Distribuidos siguiendo [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format) con [ng-packagr](https://github.com/ng-packagr/ng-packagr).

## Instalación

```bash
pnpm add @romanmartinidev/components @romanmartinidev/tokens @lucide/angular
# + peer deps Angular si tu proyecto aún no las tiene:
pnpm add @angular/core @angular/common @angular/forms
```

| Peer                               | Rango                | Por qué                                                                                                                                                                                               |
| ---------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@angular/core`, `@angular/common` | `^21.0.0`            | Framework base.                                                                                                                                                                                       |
| `@angular/forms`                   | `^21.0.0`            | **Obligatorio**: los form controls del kit (`DsCheckbox`, `DsRadioGroup`, `DsSelect`, `DsInput`, `DsTextarea`, `DsSwitch`) implementan `ControlValueAccessor`.                                        |
| `@romanmartinidev/tokens`          | `>=0.1.0 <1.0.0`     | Evita que dos consumidores instalen versiones distintas de los tokens en el mismo árbol. Rango plano pre-1.0 por el lockstep ([ADR-015](../../docs/architecture/adr/ADR-015-versionado-lockstep.md)). |
| `@lucide/angular`                  | `^1.23.0`            | Iconografía del kit ([ADR-012](../../docs/architecture/adr/ADR-012-iconografia-lucide.md)) — la versión la controla el consumidor.                                                                    |
| `@angular/router`                  | `^21.0.0` (opcional) | Solo si importás el entry point `@romanmartinidev/components/router`.                                                                                                                                 |

### Entry point opcional: `/router`

`DsBreadcrumbsRouter` genera los breadcrumbs a partir de las rutas activas de Angular. Vive en un **secondary entry point** ([ADR-017](../../docs/architecture/adr/ADR-017-secondary-entry-points.md)) para que quien no use el router de Angular no cargue esa dependencia:

```ts
import { DsBreadcrumbsRouter, type DsBreadcrumbResolver } from '@romanmartinidev/components/router';
```

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

21 familias, una spec por familia en `openspec/specs/component-<name>/` ([ADR-018](../../docs/architecture/adr/ADR-018-specs-por-componente.md)).

### Acción y navegación

| Familia         | Selector(es)                                                                  | Notas                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DsButton`      | `ds-button`                                                                   | Variantes de énfasis, `loading`, `disabledReason` accesible ([ADR-011](../../docs/architecture/adr/ADR-011-estado-disabled-accesible.md)); sizes `sm`/`md`/`lg` |
| `DsMenu`        | `ds-menu`, `ds-menu-item`, `ds-menu-separator`, `[dsMenuTriggerFor]`          | Popover API, submenús, typeahead                                                                                                                                |
| `DsTabs`        | `ds-tabs`, `ds-tab`                                                           | `value` two-way, roving tabindex, ARIA APG                                                                                                                      |
| `DsBreadcrumbs` | `ds-breadcrumbs`, `ds-breadcrumb-item`, `ng-template[dsBreadcrumbsSeparator]` | Versión auto-generada desde rutas en el entry point `/router`                                                                                                   |
| `DsPagination`  | `ds-pagination`                                                               | Ventana de páginas como función pura                                                                                                                            |
| `DsAccordion`   | `ds-accordion`, `ds-accordion-item`                                           | Colapsables con transición de grid                                                                                                                              |

### Formularios (implementan `ControlValueAccessor`)

| Familia        | Selector(es)                 | Notas                                                                                                                                 |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DsInput`      | `ds-input`                   | `type` whitelist, `label`/`hint`/`error`, prefix/suffix                                                                               |
| `DsTextarea`   | `ds-textarea`                | Field multilínea sobre `DsFieldBase` ([ADR-020](../../docs/architecture/adr/ADR-020-base-compartida-form-fields.md))                  |
| `DsSelect`     | `ds-select`, `ds-option`     | Opciones proyectadas, keyboard nav APG, Popover API ([ADR-014](../../docs/architecture/adr/ADR-014-overlays-anclados-popover-api.md)) |
| `DsCheckbox`   | `ds-checkbox`                | `checked`, `indeterminate`, `disabled`; sizes `sm`/`md`/`lg`                                                                          |
| `DsRadioGroup` | `ds-radio-group`, `ds-radio` | `value` model two-way, `name` auto-generado, keyboard nav APG                                                                         |
| `DsSwitch`     | `ds-switch`                  | Toggle; `bg-off` themable                                                                                                             |

### Display y feedback

| Familia          | Selector(es)                                                                                             | Notas                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `DsCard`         | `ds-card`, `ds-card-header`, `ds-card-title`, `ds-card-description`, `ds-card-content`, `ds-card-footer` | Familia composicional                                                                                                                     |
| `DsBadge`        | `ds-badge`, `[dsBadgeIcon]`                                                                              | Modelo `tone × appearance` ([ADR-019](../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md))                           |
| `DsAvatar`       | `ds-avatar`, `ds-avatar-group`                                                                           | Color por hash del nombre; solapamiento con `space.negative`                                                                              |
| `DsModal`        | `ds-modal`                                                                                               | `<dialog>` nativo, top layer, focus trap ([ADR-013](../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md)); sizes `sm`/`md`/`lg` |
| `DsTooltip`      | `[dsTooltip]`                                                                                            | Directiva; delay configurable, hoverable/dismissable (WCAG 1.4.13)                                                                        |
| `DsToastService` | (service) + `provideDsToasts`                                                                            | Atajos por variante; `danger` persistente, timers pausables                                                                               |
| `DsProgress`     | `ds-progress`                                                                                            | Determinado e indeterminado; contraste UI 3:1                                                                                             |
| `DsSpinner`      | `ds-spinner`                                                                                             | Respeta `prefers-reduced-motion`                                                                                                          |
| `DsSkeleton`     | `ds-skeleton`                                                                                            | Placeholder de carga; apaga la animación con `prefers-reduced-motion`                                                                     |

## Convenciones

- **Standalone components** + signal-based API (`input()`, `output()`, `model()`).
- **Prefix unificado `Ds` / `ds-` / `--ds-*`** — parte del contrato API público.
  - Selector HTML: `ds-<name>`.
  - Class TypeScript: `Ds<Name>` (sin sufijo `Component`).
  - CSS custom properties: `--ds-*`.
  - Archivos **sin sufijo de rol**: `button.ts`, no `button.component.ts` ([ADR-010](../../docs/architecture/adr/ADR-010-file-naming-sin-sufijo-component.md)).
- **CSS plain** consumiendo tokens vía `var(--ds-*)`. Sin pre-procesadores.
- **ViewEncapsulation Emulated** (default Angular) — los estilos no leak.
- **Arquitectura flat por componente** — una carpeta `src/lib/<name>/` por componente.
- **OnPush + zoneless-ready** — API de signals (`input()`, `output()`, `model()`), sin dependencia de `zone.js`.

Detalle de arquitectura en [ADR-004](../../docs/architecture/adr/ADR-004-arquitectura-components.md).
Detalle de naming y prefijos en [ADR-007](../../docs/architecture/adr/ADR-007-naming-prefijos.md).

## Soporte

| Dimensión    | Soportado                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Angular**  | `^21.0.0`                                                                                                 |
| **Node**     | `>=22.12.0` (solo build/desarrollo)                                                                       |
| **Browsers** | Los 2 majors más recientes de Chrome, Edge, Firefox y Safari — el kit usa `<dialog>` nativo y Popover API |
| **SSR**      | **No soportado todavía**: los overlays acceden a `document` sin guardas de plataforma                     |

**Accesibilidad**: objetivo **WCAG 2.2 nivel AA**. Los patrones de interacción siguen [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) y el contraste de los pares de tokens se verifica por script.

## Build (solo desarrollo)

```bash
pnpm -F @romanmartinidev/components build   # ng-packagr → dist/
pnpm -F @romanmartinidev/components test    # vitest (una suite por componente)
pnpm -F @romanmartinidev/components watch   # ng-packagr en watch mode
```

## Versionado

Pre-1.0. La superficie API puede cambiar entre minors según política del repo. Cambios significativos siguen el flujo de [Changesets](../../CONTRIBUTING.md).

Este package versiona en **lockstep** con `@romanmartinidev/tokens` ([ADR-015](../../docs/architecture/adr/ADR-015-versionado-lockstep.md)): ambos comparten una única versión y suben juntos.

**El prefix `Ds` / `ds-` queda parte del contrato API público**: cambiarlo es BREAKING y exige un ADR que reemplace al ADR-007.

## Licencia

[MIT](../../LICENSE) © 2026 Roman Martini
