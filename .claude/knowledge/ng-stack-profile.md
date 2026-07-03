# Perfil del stack del proyecto — `ng-stack-profile`

> **Completar antes del primer uso de `/ng:create` y `/ng:review`.**
> Los agentes `ng-component` y `ng-review` leen este perfil como **primer paso**. Si falta
> cualquier campo crítico, **paran y lo piden** (fail fast): no adivinan el stack. Un componente
> generado o auditado contra un stack adivinado es peor que un agente que pregunta.

---

> **Estado del perfil:** `COMPLETO`
> Cambialo a `COMPLETO` recién cuando los 5 campos críticos estén cargados. Mientras diga
> `PENDIENTE`, `ng-component` y `ng-review` paran y piden completarlo — sin parsear celda por celda.

## Campos críticos (bloquean si faltan)

| Campo | Valor | Por qué importa |
|-------|-------|-----------------|
| `angular_version` | `21.2.15` | APIs disponibles: `signal`, `computed`, `linkedSignal`, `resource`/`rxResource`, `input()`/`output()`/`model()`, signal queries, `@if`/`@for`/`@switch`/`@let`/`@defer`. |
| `style_engine` | `css` | Estilos en archivo separado (`styleUrl`), **CSS plano consumiendo tokens** (custom properties). Sin SCSS/Less/Tailwind. |
| `test_framework` | `vitest` (`vitest@4` + `@analogjs/vitest-angular`, jsdom) | Define imports y matchers del `.spec.ts` (ver convención abajo). |
| `design_system` | `custom` | **Este repo ES el design system.** Los componentes son las primitivas; consumen tokens de `@romanmartinidev/tokens`. |
| `selector_prefix` | `ds` | Selectores `ds-*` (ej. `ds-radio`, `ds-button`, `ds-checkbox`, `ds-radio-group`); clase con prefijo `Ds`. |

## Notas condicionales

- **`design_system: custom` → primitivas/tokens a reutilizar**:
  - **Tokens**: `packages/tokens` — exponen CSS custom properties con prefijo `--ds-*` (semánticos: `--ds-semantic-color-*`, `--ds-semantic-space-*`; primitivos: `--ds-opacity-*`, etc.). **Nunca hardcodear** color/espaciado/tipografía: usar siempre el token correspondiente.
  - **Componentes existentes** (referencia de consistencia): `packages/components/src/lib/<nombre>/` — ej. `radio/`, `radio-group/`, `button/`, `checkbox/`.
- **Tailwind**: no aplica (no se usa).

---

## Convenciones del repo (detectadas en los componentes existentes)

Estas convenciones del proyecto **tienen prioridad por consistencia** (cf. `ng-best-practices.md` §3). `ng-component` las sigue al generar; `ng-review` no las marca como hallazgo.

- **Nomenclatura de archivos**: **sin sufijo de rol** → `<nombre>.ts` / `.html` / `.css` / `.spec.ts`, todos con el mismo nombre base (alineado con el style-guide moderno de Angular; migrado en el change `aaa-010`, ADR-010).
- **Nombre de clase**: prefijo `Ds`, **sin** sufijo `Component` → `export class DsRadio` (no `DsRadioComponent`).
- **Ubicación**: un directorio por componente bajo `packages/components/src/lib/<nombre>/`, con sus 4 archivos juntos.
- **Autoría**: `standalone: true` + `ChangeDetectionStrategy.OnPush` + `templateUrl`/`styleUrl` separados; signals-first (`input()`/`input.required()`, `output()`, `model()`, `viewChild()`); `inject()` para DI; miembros `readonly` para lo que Angular setea.
- **Estilos**: CSS plano; `:host` para el layout del host; clases BEM-ish (`.radio`, `.radio--disabled`); valores siempre vía `var(--ds-*)`.
- **Tests (`vitest`)**: importar `{ ComponentFixture, TestBed } from '@angular/core/testing'` y `{ describe, it, expect, beforeEach, vi } from 'vitest'`; setear signal inputs con `fixture.componentRef.setInput('input', valor)`; `compileComponents()` con el componente standalone en `imports`; tests de **comportamiento** (queries por rol/label sobre el DOM renderizado), no de implementación.
