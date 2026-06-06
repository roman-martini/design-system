## Context

El package `@romanmartinidev/components` arrancó con 2 prefijos heredados de decisiones independientes:

- **`rmd-`** en selectores HTML — decidido en [ADR-004 §4](../../docs/architecture/adr/ADR-004-arquitectura-components.md) por afinidad con la marca "Roman Martini Design".
- **`--ds-*`** en CSS custom properties — decidido en [ADR-003](../../docs/architecture/adr/ADR-003-arquitectura-design-tokens.md) por agnosticismo del sistema.
- **Sin prefijo** en class TypeScript (`ButtonComponent`, `CheckboxComponent`) — convención Angular clásica.

La disonancia entre `rmd-` y `--ds-*` fue reconocida explícitamente como trade-off en ADR-004 § "Negativas". El TODO del autor (`contexto_post_fases.md`, borrado en CHG-006) marcaba esta duda como pendiente de resolución antes de seguir escalando componentes.

Decisión tomada en el kickoff de esta propuesta (Roman): unificar bajo `Ds` (Design System) en sus tres capas. **No buscar marca personal** — la convención debe describir lo que es, no quién lo construye.

Estado actual del package en cifras:

- 2 componentes (Button, Checkbox).
- 5 types públicos exportados: `ButtonVariant`, `ButtonSize`, `CheckboxSize`, más las classes `ButtonComponent` y `CheckboxComponent`.
- 0 consumidores externos (package nunca publicado, sigue `version: 0.0.0`).
- 1 consumidor interno: `apps/playground`.

## Goals / Non-Goals

**Goals:**

- Unificar prefijo HTML selector a `ds-<name>`.
- Unificar prefijo TypeScript class a `Ds<Name>` y droppear el sufijo `Component` (alineado con Mat/Nz/Tui/Prime).
- Renombrar types públicos con prefijo `Ds` (`DsButtonVariant`, `DsButtonSize`, `DsCheckboxSize`).
- Mantener `--ds-*` en CSS sin cambios (ya estaba alineado).
- Mantener folder y file naming sin cambios (`src/lib/button/button.component.ts`).
- Generar **ADR-007** que documenta la convención unificada y supersede §4 y §5 de ADR-004 en esos puntos.
- Migrar SPC-003 (3 requirements modificados).
- Migrar `apps/playground` en el mismo change (cero ventana de inconsistencia).
- Cero tests rotos al cierre del apply.

**Non-Goals:**

- NO tocar `@romanmartinidev/tokens` ni las custom properties `--ds-*` (ya alineado).
- NO cambiar folder ni file naming (`<name>.component.ts` sigue por ahora; si en el futuro se quiere evolucionar a `button.ts` al estilo Angular 21 moderno, va en CHG aparte).
- NO modificar la estructura interna de los componentes (signal-based API, OnPush, CVA, etc.).
- NO modificar tokens, build tooling, CI/CD, Storybook config.
- NO publicar el package en este change (sigue `version: 0.0.0`).
- NO sumar componentes nuevos ni features.
- NO crear `CheckboxGroup`, `ButtonGroup` ni similares.

## Decisions

### 1. Prefix unificador: `Ds` (Design System)

**Decisión**: usar `Ds` / `ds-` / `--ds-*` como prefix para todo (selector HTML, class TypeScript, types públicos, CSS custom properties).

**Alternativas consideradas:**

- **`rmd-` unificado** (rebautizar tokens a `--rmd-*`): rechazado. BREAKING masivo sobre tokens (200+ occurrencias), ata el sistema a la marca personal Roman Martini Design — explícitamente no deseado.
- **`Ngx<Component>`** (sugerencia ChatGPT): rechazado. `ngx-` identifica libs Angular community genéricas (ngx-bootstrap, ngx-toastr, ngx-charts). Las libs con identidad propia (Mat, Nz, Tui, p) no lo usan justamente para diferenciarse. Mete a la lib en el saco anónimo de "una más de la comunidad".
- **Sin prefijo en TypeScript class** (status quo): rechazado. `ButtonComponent` colisiona con consumidores que tengan su propio `ButtonComponent`. La convención profesional de libs publicables (Mat/Nz/Tui) usa prefix.

**Por qué `Ds`:**

- Agnóstico de marca — describe la naturaleza (Design System), no el autor.
- Corto (2 caracteres) — concisión sin sacrificar claridad.
- Coincide con el prefijo CSS ya adoptado (`--ds-*`) → 0 cambios en tokens.
- Convención reconocible en docs y conversaciones técnicas ("DS" es shorthand estándar).
- En lecturas en voz alta de código: "DS Button" lee natural; "RMD Button" lee como sigla forzada.

### 2. Drop del sufijo `Component` en class names

**Decisión**: `ButtonComponent` → `DsButton`, `CheckboxComponent` → `DsCheckbox`. Sin sufijo `Component`.

**Alternativas consideradas:**

- **Mantener `DsButtonComponent`**: rechazado. El sufijo `Component` es legacy de la era NgModule (necesitabas distinguir `ButtonModule` de `ButtonComponent`). En lib standalone moderna el prefijo `Ds` ya identifica el tipo. Sufijo agrega ruido sin valor.
- **Sufijo `.directive` para directives futuras**: postergado. Si en CHG futuro aparece una directiva (`DsTooltip` como directiva), se decide allá; por ahora no hay directivas en la lib.

**Por qué drop:**

- Patrón estándar de libs Angular publicables modernas con identidad propia:
  - Angular Material: `MatButton`, `MatIcon`, `MatFormField`.
  - ng-zorro: `NzButton`, `NzInput`, `NzModal`.
  - Taiga UI: `TuiButton`, `TuiInput`, `TuiDialog`.
  - PrimeNG: prefix en selector (`p-button`), class `Button` o decorada.
- Reduce ruido visual en imports (`import { DsButton, DsCheckbox } from '@romanmartinidev/components'`).
- El prefix `Ds` ya cumple la función de namespace de la lib.

**Trade-off aceptado**: convención divergente de la salida default de `ng generate component` (que genera `<Name>Component`). Lib publicable ≠ app interna. Documentado en ADR-007.

### 3. Type exports también con prefix `Ds`

**Decisión**: renombrar todos los types públicos de la lib con prefix `Ds`. Lista hoy:

| Antes           | Después           |
| --------------- | ----------------- |
| `ButtonVariant` | `DsButtonVariant` |
| `ButtonSize`    | `DsButtonSize`    |
| `CheckboxSize`  | `DsCheckboxSize`  |

**Por qué**: los types también son parte de la API pública del package y pueden colisionar con los del consumidor. La regla "todo lo exportado lleva prefix `Ds`" es uniforme y sin excepciones — fácil de explicar a contributors futuros.

### 4. Sin cambios en folder / file naming

**Decisión**: mantener `packages/components/src/lib/button/button.component.ts` (etc.).

**Alternativas consideradas:**

- **`button.ts` sin sufijo `.component`** (estilo Angular 21 moderno): postergado. Es otro refactor independiente; mezclarlo con el rename de prefijos acopla decisiones que se pueden tomar por separado. Si aparece motivación, va en CHG aparte.

**Por qué postergar**: este change ya toca API pública y especs. Sumar otro cambio convencional al mismo CHG aumenta superficie de revisión sin beneficio inmediato.

### 5. Migración del playground en el mismo change

**Decisión**: actualizar `apps/playground` en el mismo commit que el rename del package — cero ventana de inconsistencia.

**Por qué**: el playground es el único consumidor hoy. Si quedara un commit "rename package" + "rename playground" separados, el primer commit deja el playground roto. Atómico es mejor.

### 6. ADR-007 + nota en ADR-004 (no rewrite)

**Decisión**: crear ADR-007 nuevo y al final de ADR-004 agregar una nota (al final del documento, **no editar contenido inmutable**) marcando §4 y §5 como superseded en esos puntos por ADR-007.

**Alternativas consideradas:**

- **Reescribir ADR-004 completo**: rechazado. Viola la inmutabilidad de ADRs aceptados ([rule arch-architecture-decisions.md](../../../.claude/rules/arch-architecture-decisions.md)).
- **No tocar ADR-004**: rechazado. Sin nota, un dev futuro lee §4 ("Selector prefix `rmd-`") y aplica esa regla sin saber que fue superseded.

**Por qué nota al final**: respeta inmutabilidad (no toca el contenido original) y agrega trazabilidad. Estado de ADR-004 sigue **Aceptado** porque la mayoría del documento (§1, §2, §3, §6, §7, §8, §9, §10) sigue 100% vigente. Solo §4 (prefix selector) y §5 (naming class TS) fueron superseded.

### 7. Bump del changeset: `minor` (no major)

**Decisión**: changeset bump `minor` para `@romanmartinidev/components` aunque sea BREAKING en API pública.

**Razón**: package está en `0.0.0`, nunca publicado. Convención Changesets pre-1.0 permite breaking changes con bump `minor`. Al alcanzar v1.0, este criterio se endurece (cualquier breaking → major).

**Alternativa rechazada**: bump `major` (0.0.0 → 1.0.0). No corresponde — no estamos declarando API estable. v1.0 se reserva para cuando el package se publique a npm con compromiso de estabilidad.

### 8. ADR-007 también referenciado desde CLAUDE.md

**Decisión**: actualizar `CLAUDE.md` para referenciar tanto ADR-004 como ADR-007 cuando se hable de naming. La sección "Cómo trabajar en este repo" pide leer ADRs aceptados antes de cambios estructurales — el dev futuro necesita ver ambos para no caer en la trampa de §4 de ADR-004.

## Risks / Trade-offs

| Riesgo                                                                                                              | Mitigación                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rename de class names rompe imports que el grep no detecta (ej. dynamic imports, string-based references en config) | Pre-flight: `grep -rn "ButtonComponent\|CheckboxComponent" --include="*.ts" --include="*.html" --include="*.json"` antes del refactor + after `pnpm -r build` + `pnpm -r test` deben pasar.                      |
| Storybook stories no encuentran el nuevo nombre y fallan silenciosamente                                            | Tarea explícita: ejecutar `pnpm storybook:build` post-refactor y confirmar que las stories renderizan.                                                                                                           |
| ADR-007 olvida cubrir un caso convencional (ej. ¿prefix en directives?, ¿prefix en pipes?, ¿prefix en services?)    | Limitar scope de ADR-007 a "lo que existe hoy" (Components + types). Cuando aparezca el primer directive/pipe/service público en un CHG futuro, ese change extiende la convención en su propio ADR.              |
| Documentación queda con references mixtas (`rmd-` en algún README olvidado)                                         | Pre-archive: `grep -rn "rmd-\|RmdButton\|ButtonComponent\|CheckboxComponent" --include="*.md" .` debe devolver vacío fuera de `openspec/changes/archive/` y ADR-004 (donde la mención histórica es intencional). |
| `CheckboxFormHost` (host component para tests CVA) lleva el prefix viejo aunque sea interno                         | Renombrar a `DsCheckboxFormHost` por consistencia. Interno al test file, sin impacto en API.                                                                                                                     |
| Sub-decisión de "drop `Component`" se siente extraña a un dev que viene de Angular CLI defaults                     | Documentar la razón en ADR-007 con ejemplos comparativos (Mat/Nz/Tui/Prime). El README del package puede sumar una línea "convención de la lib".                                                                 |

## Migration Plan

Migración interna (sin consumidores externos):

1. **Rename en `packages/components/src/lib/button/`**:
   - `button.component.ts`: class y types.
   - `button.component.spec.ts`: imports + querySelector + `TestBed.createComponent`.
   - `button.stories.ts`: `component: DsButton` + templates con `<ds-button>`.
   - `index.ts`: `export { DsButton, type DsButtonVariant, type DsButtonSize } from './button.component';`.

2. **Rename en `packages/components/src/lib/checkbox/`** (mismo patrón con `DsCheckbox`, `DsCheckboxSize`, host component `DsCheckboxFormHost`).

3. **`packages/components/src/public-api.ts`**: el `export *` cubre automáticamente; no requiere edit. Verificar.

4. **`apps/playground/src/app/`**:
   - `app.ts`: imports + array `imports: [DsButton, DsCheckbox]`.
   - `app.html`: 100% de los `<rmd-...>` → `<ds-...>`.
   - `app.spec.ts`: querySelector `'ds-button'`, `'ds-checkbox'`.

5. **`packages/components/README.md`**: ejemplos de uso `<ds-button>` + `import { DsButton }`.

6. **ADR-007**: nuevo archivo `docs/architecture/adr/ADR-007-naming-prefijos.md` en formato MADR.

7. **ADR-004**: nota final marcando §4 y §5 como superseded por ADR-007. **No tocar contenido inmutable.**

8. **`docs/architecture/decisions-log.md`**: agregar fila ADR-007.

9. **`CLAUDE.md`** + **`README.md` root** + **`docs/architecture/README.md`**: actualizar refs a `rmd-` y a class names sin prefix.

10. **SPC-003**: delta spec con MODIFIED de 3 requirements.

11. **Changeset**: `pnpm changeset` → bump `minor`.

### Rollback strategy

Si algo falla en CI post-merge:

- Revert del commit del apply mantiene los componentes y playground en el estado pre-refactor.
- ADR-007 sería marcado como **Descartado** en lugar de Aceptado (estado MADR válido).
- ADR-004 §4/§5 vuelven a ser la fuente de verdad.
- El CHG-007 sigue archivado como historia (incluso si descartado el ADR).

En la práctica el rollback es trivial: 1 commit a revertir, sin migración de datos.

## Open Questions

- **¿`Ds` también en directives, pipes, services públicos futuros?** Sí, por defecto — la convención aplica a "todo lo exportado desde public-api.ts". ADR-007 lo declara como regla general y cada CHG futuro que sume directive/pipe/service refuerza la convención.
- **¿Renombrar tests internos (`describe('Button', …)` → `describe('DsButton', …)`)?** Sí, por consistencia con el class name. El `describe` no es parte de API pública pero la inconsistencia confunde en logs de test.
- **¿Renombrar también el `title` de las stories Storybook (`Components/Button` → `Components/DsButton`)?** **No** — el `title` es la jerarquía visible en Storybook para usuarios humanos (devs revisando), y "Button" es más legible que "DsButton" en esa columna. Lo que es código (component class) lleva prefix; lo que es etiqueta visual (story title) puede no llevarlo. Decisión registrada en ADR-007.
