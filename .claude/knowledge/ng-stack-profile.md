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
- **Form fields → `DsFieldBase` obligatorio** ([ADR-020](../../docs/architecture/adr/ADR-020-base-compartida-form-fields.md)): todo componente del kit que sea un campo de formulario **extiende la base compartida** `packages/components/src/lib/field/field-base.ts` (`@Directive()` abstracto, interno — no se exporta desde `public-api.ts`). La base resuelve, una sola vez y para todos: el `ControlValueAccessor` por auto-registración de `NgControl`, la a11y de `label`/`hint`/`error` con sus `aria-describedby`, y la reactividad del estado de validación vía `control.events` + `markForCheck` (el fix del staleness con OnPush). **Implementar `ControlValueAccessor` a mano en un field nuevo es un hallazgo**, no una alternativa. Hoy la extienden `DsInput` y `DsTextarea`; `hostDirectives` se evaluó y se descartó en el ADR.
- **Overlays**: los modales van sobre `<dialog>` nativo ([ADR-013](../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md)) y los anclados sobre Popover API con el posicionamiento propio del repo ([ADR-014](../../docs/architecture/adr/ADR-014-overlays-anclados-popover-api.md), [ADR-016](../../docs/architecture/adr/ADR-016-posicionamiento-placements-por-overlay.md)). No agregar librerías de posicionamiento.
- **Estado `disabled`** ([ADR-011](../../docs/architecture/adr/ADR-011-estado-disabled-accesible.md)): los botones de acción usan `aria-disabled` + guarda + `disabledReason` (siguen siendo focuseables y se anuncian); los form controls usan el `disabled` nativo.
- **Variantes** ([ADR-019](../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md)): componentes de estado/display usan dos ejes `tone × appearance`; los de acción usan un `variant` de énfasis plano.
- **Iconos**: `@lucide/angular`, import por icono (tree-shakeable), 16px / stroke 1.5, `currentColor` ([ADR-012](../../docs/architecture/adr/ADR-012-iconografia-lucide.md)).
- **Tailwind**: no aplica (no se usa).

---

## Convenciones del repo (detectadas en los componentes existentes)

Estas convenciones del proyecto **tienen prioridad por consistencia** (cf. `ng-best-practices.md` §3). `ng-component` las sigue al generar; `ng-review` no las marca como hallazgo.

- **Nomenclatura de archivos**: **sin sufijo de rol** → `<nombre>.ts` / `.html` / `.css` / `.spec.ts`, todos con el mismo nombre base (alineado con el style-guide moderno de Angular; migrado en el change `aaa-010`, ADR-010).
- **Nombre de clase**: prefijo `Ds`, **sin** sufijo `Component` → `export class DsRadio` (no `DsRadioComponent`).
- **Ubicación y archivos**: un directorio por componente bajo `packages/components/src/lib/<nombre>/`, con sus **6 archivos** juntos:
  1. `<nombre>.ts` — la clase.
  2. `<nombre>.html` — el template (siempre separado, nunca inline).
  3. `<nombre>.css` — los estilos.
  4. `<nombre>.spec.ts` — los tests de comportamiento.
  5. `<nombre>.stories.ts` — la story de Storybook (co-ubicada; Storybook la levanta desde `apps/playground`).
  6. `index.ts` — re-export interno de la carpeta.

  Además, **el componente se exporta desde `packages/components/src/public-api.ts`**: sin esa línea no forma parte de la superficie pública del package. Un componente al que le falte cualquiera de estos siete puntos está incompleto.
- **Autoría**: `standalone: true` + `ChangeDetectionStrategy.OnPush` + `templateUrl`/`styleUrl` separados; signals-first (`input()`/`input.required()`, `output()`, `model()`, `viewChild()`); `inject()` para DI; miembros `readonly` para lo que Angular setea.
- **Estilos**: CSS plano; `:host` para el layout del host; clases BEM-ish (`.radio`, `.radio--disabled`); valores siempre vía `var(--ds-*)`.
- **Dónde van los artefactos de review**: `docs/design/reviews/<YYYY-MM-DD>-<componente>.md` si el review se conserva, o el scratchpad de la sesión si es descartable. **Nunca dentro de `packages/components/src/`**: es la fuente de una librería publicada en npm y el default genérico de `ng-review` ("junto al componente revisado") apuntaría ahí. Sigue la misma convención de reportes fechados que `docs/design/a11y/` y `docs/design/research/`.
- **Tests (`vitest`)**: importar `{ ComponentFixture, TestBed } from '@angular/core/testing'` y `{ describe, it, expect, beforeEach, vi } from 'vitest'`; setear signal inputs con `fixture.componentRef.setInput('input', valor)`; `compileComponents()` con el componente standalone en `imports`; tests de **comportamiento** (queries por rol/label sobre el DOM renderizado), no de implementación.
