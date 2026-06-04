---
id: CHG-007
name: components-unify-ds-prefix
type: change
status: archived
archived: 2026-06-04
modifies-specs:
  - SPC-003 (components-package — unifica prefijo de selector + class)
related-adrs:
  - ADR-007 (nuevo — naming y prefijos)
  - ADR-004 (supersedes parcial §4 + §5)
---

## Why

Hoy el package `@romanmartinidev/components` convive con **3 prefijos heterogéneos**: `rmd-` en el selector HTML, `--ds-*` en las CSS custom properties, y sin prefijo en las class TypeScript (`ButtonComponent`, `CheckboxComponent`). Esta disonancia está reconocida como trade-off aceptado en [ADR-004 § Negativas](../../docs/architecture/adr/ADR-004-arquitectura-components.md) y figuraba como duda explícita en el TODO `contexto_post_fases.md` (borrado en CHG-006).

Resolverlo **ahora** tiene ventana óptima: el package no se publicó nunca, solo hay 2 componentes (Button, Checkbox) sin consumidores externos, y el patrón establecido por CHG-006 (Checkbox) no se replicó todavía a más componentes. Cada CHG futuro de componente (Radio, Modal, Tabs, …) perpetúa la disonancia si no se cierra ahora.

Esta propuesta respalda las tres prioridades del repo:

1. **Buenas prácticas**: la convención unificada `Ds<Name>` (sin sufijo `Component`) es el patrón estándar de libs Angular publicables con identidad propia (`MatButton`, `NzButton`, `TuiButton`, PrimeNG con prefix `p`). El sufijo `Component` es legacy de cuando convivían con NgModules y necesitaban distinguir `ButtonModule` de `ButtonComponent`. En lib standalone moderna sobra.
2. **Escalar ordenado**: un solo prefix conceptual `Ds` (Design System) para todo el sistema (selector + var + class + types). Cierra la duda heredada de naming antes de que se replique a 5+ componentes futuros.
3. **Mantenibilidad**: elimina la fricción cognitiva entre `rmd-button` (HTML) y `--ds-*` (CSS). Roman aclaró explícitamente que NO busca marca personal — `Ds` describe qué es (Design System), no quién lo construye.

Esta propuesta toca **2 packages** (`@romanmartinidev/components` y `apps/playground` como consumidor interno) y es **one-way door** para la API pública (selector + class name son contrato): **genera ADR-007** al cerrarse, que supersede puntualmente §4 y §5 de ADR-004 en esos puntos específicos (el resto de ADR-004 sigue Aceptado).

Afecta el área **frontend / components** del repo. Cero impacto en `@romanmartinidev/tokens` (las CSS custom properties ya eran `--ds-*` desde ADR-003).

## What Changes

### API pública (BREAKING)

- **BREAKING** — Selector HTML: `rmd-button` → `ds-button`; `rmd-checkbox` → `ds-checkbox`.
- **BREAKING** — Class TypeScript: `ButtonComponent` → `DsButton`; `CheckboxComponent` → `DsCheckbox`. Drop del sufijo `Component`.
- **BREAKING** — Type exports: `CheckboxSize` → `DsCheckboxSize` (y cualquier otro type público de Button, si existe — verificar).
- Re-exports en `public-api.ts`: surface API actualizada; el barrel sigue siendo el único entry point.

### Sin cambios

- CSS custom properties `--ds-*` (ya estaban unificadas con la nueva convención desde ADR-003).
- Folder y file naming: `src/lib/button/button.component.ts`, etc.
- Estructura de tests, stories, public-api.ts (solo cambian referencias internas a class names).
- Tokens package, build tooling, CI/CD.

### Documentos arquitectónicos

- **ADR-007 (nuevo)** — Convención de naming y prefijos. Establece `Ds`/`ds-`/`--ds-*` como prefix unificador del sistema y justifica el drop del sufijo `Component`.
- **ADR-004** — sin tocar contenido inmutable; al final del documento se agrega una nota indicando que §4 y §5 quedan **superseded en esos puntos específicos** por ADR-007. El resto sigue Aceptado.
- **decisions-log.md** — fila ADR-007.
- **CLAUDE.md**, **README.md** (root), **docs/architecture/README.md**, **packages/components/README.md** — actualizar referencias a `rmd-` y a class names sin prefix.

### Changeset

Bump `@romanmartinidev/components` con changeset. Detalle del bump (major vs minor) se resuelve en `design.md` y `tasks.md`; pre-1.0 la convención Changesets permite ambos para breaking.

## Capabilities

### New Capabilities

Ninguna. El package `@romanmartinidev/components` ya existe (SPC-003); este change ajusta la convención de naming de su API pública sin sumar capabilities.

### Modified Capabilities

- `components-package` (SPC-003): se modifican los requirements **"Selector prefix fijo"**, **"Naming convention de class y archivo"**, y **"Componente Checkbox"** para reflejar el prefix `ds-` y la class `Ds<Name>` (sin sufijo `Component`). Scenarios que mencionan `rmd-button`, `rmd-checkbox`, `ButtonComponent`, `CheckboxComponent` quedan reescritos. **No se agregan ni eliminan requirements** — solo se modifican.

## Impact

### Código

- **Modificados**: ~12 archivos.
  - `packages/components/src/lib/button/{button.component.ts, button.component.spec.ts, button.stories.ts, index.ts}`.
  - `packages/components/src/lib/checkbox/{checkbox.component.ts, checkbox.component.spec.ts, checkbox.stories.ts, index.ts}`.
  - `packages/components/src/public-api.ts` (sin cambios si los `export *` cubren todo, pero hay que verificar).
  - `packages/components/README.md` (ejemplos `<ds-button>`).
  - `apps/playground/src/app/{app.ts, app.html, app.spec.ts}`.
- **Creados**: ningún archivo de código. Solo `docs/architecture/adr/ADR-007-naming-prefijos.md`.
- **Eliminados**: ninguno.

### APIs públicas — BREAKING

Consumidores deben renombrar:

- `import { ButtonComponent } from '@romanmartinidev/components'` → `import { DsButton } from '@romanmartinidev/components'`.
- `import { CheckboxComponent, type CheckboxSize } from '@romanmartinidev/components'` → `import { DsCheckbox, type DsCheckboxSize } from '@romanmartinidev/components'`.
- `<rmd-button>` → `<ds-button>` en templates.
- `<rmd-checkbox>` → `<ds-checkbox>` en templates.

Sin consumidores externos hoy: solo `apps/playground` se actualiza en este mismo change.

### Dependencias

Sin cambios — ni nuevas runtime deps ni nuevas devDeps.

### Spec deltas

- SPC-003: 3 requirements modificados (selector prefix, naming convention, Componente Checkbox). Resto de SPC-003 intacto. No se modifican SPC-001/002/004/005.

### Sistemas / fases siguientes

- **Patrón establecido**: todo CHG futuro de componente nuevo (Radio, Modal, Tabs, Select, etc.) hereda automáticamente `ds-<name>` + `Ds<Name>`. ADR-004 + ADR-007 son la fuente de verdad combinada para naming.
- **CI**: la PR de este change pasa por lint + build + test + openspec validate + changeset enforcement (CHG-005 / SPC-005). Sin cambios en pipelines.
- **Versionado**: changeset bump definido durante apply.
