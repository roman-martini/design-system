# @romanmartinidev/components

Componentes Angular del sistema de diseño **romanmartinidev**. Standalone + signals API (Angular 21), consumen `@romanmartinidev/tokens` vía CSS custom properties. Distribuidos siguiendo [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format) con [ng-packagr](https://github.com/ng-packagr/ng-packagr).

## Instalación

```bash
pnpm add @romanmartinidev/components @romanmartinidev/tokens
# + peer deps Angular si tu proyecto aún no las tiene:
pnpm add @angular/core @angular/common
```

`@romanmartinidev/tokens` es **peer dependency** — debe instalarse explícitamente. Esto evita que múltiples consumidores instalen versiones distintas de los tokens en el mismo árbol.

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
import { ButtonComponent } from '@romanmartinidev/components';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <rmd-button variant="primary" size="md" [disabled]="loading()" (clicked)="handleSubmit($event)">
      Enviar
    </rmd-button>
  `,
})
export class MyFormComponent {
  loading = signal(false);

  handleSubmit(event: MouseEvent) {
    console.log('clicked', event);
  }
}
```

## Componentes disponibles

| Componente        | Selector     | Variants                        | Sizes            | Estado |
| ----------------- | ------------ | ------------------------------- | ---------------- | ------ |
| `ButtonComponent` | `rmd-button` | `primary`, `secondary`, `ghost` | `sm`, `md`, `lg` | ✅     |

Más componentes en changes futuros (Input, Card, Modal, Alert, etc.).

## Convenciones

- **Standalone components** + signal-based API (`input()`, `output()`).
- **Selector prefix `rmd-`** — parte del contrato API público.
- **CSS plain** consumiendo tokens vía `var(--ds-*)`. Sin pre-procesadores.
- **ViewEncapsulation Emulated** (default Angular) — los estilos no leak.
- **Arquitectura flat por componente** — una carpeta `src/lib/<name>/` por componente.

Detalle completo en [ADR-004](../../docs/architecture/adr/ADR-004-arquitectura-components.md).

## Build (solo desarrollo)

```bash
pnpm -F @romanmartinidev/components build   # ng-packagr → dist/
pnpm -F @romanmartinidev/components test    # vitest (3 specs del Button)
pnpm -F @romanmartinidev/components watch   # ng-packagr en watch mode
```

## Versionado

Pre-1.0. La superficie API puede cambiar entre minors según política del repo. Cambios significativos siguen el flujo de [Changesets](../../CONTRIBUTING.md).

**El prefix `rmd-` queda parte del contrato API público**: cambiarlo es BREAKING y exige un ADR que reemplace al ADR-004.

## Licencia

[MIT](../../LICENSE) © 2026 Roman Martini
