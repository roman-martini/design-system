---
id: CHG-002
name: bootstrap-fase-2-tokens
type: change
status: archived
archived: 2026-05-31
introduces-specs:
  - SPC-002 (design-tokens-package)
related-adrs:
  - ADR-003
---

## Why

`packages/tokens` quedó dentro del monorepo después de Fase 1 pero todavía con metadata insuficiente para publicarse a npm (`@ds/tokens` placeholder, sin `engines`, `publishConfig`, `repository`, `license`, README ni `files`). Además, una auditoría rápida de los JSON existentes encontró bugs concretos (ej. `border.subtle` con la jerarquía rota en light theme) y huecos en cobertura (ej. falta de `shadow.focus` para accesibilidad). Fase 2 cierra esa brecha: deja el package listo para publicar como `@romanmartinidev/tokens`, audita y corrige bugs de severidad alta, y formaliza la arquitectura de tokens vía **ADR-003**.

Esta propuesta respalda las tres prioridades del repo:

1. **Buenas prácticas**: metadata completa de publicación, `sideEffects` declarados, `exports` granulares, README profesional.
2. **Escalar ordenado**: arquitectura de tokens documentada (primitives → semantic → component → theme) abre la puerta a sumar packages dependientes (`components`, `icons`) sin acoplar a internals.
3. **Mantenibilidad**: la auditoría establece un baseline limpio antes de que `packages/components` (Fase 3) los empiece a consumir.

Corresponde a **Fase 2 del bootstrap-plan**.

## What Changes

### Metadata de publicación (`packages/tokens/package.json`)

- Renombrar `@ds/tokens` → `@romanmartinidev/tokens`. **BREAKING** para cualquier consumidor hipotético del nombre anterior.
- Agregar `description`, `author`, `license` (MIT), `repository` (con `directory: packages/tokens`), `homepage`, `bugs`, `keywords`.
- Agregar `engines` alineado con root (`node >=22.12.0`, `pnpm >=9.0.0`).
- Agregar `publishConfig: { access: "public" }` (org `@romanmartinidev` requiere publicación explícita).
- Agregar `files` (qué se publica al registry: solo `dist/`).
- Agregar `sideEffects` (CSS tiene side effects, JS no).

### Estructura de `exports` (granularidad fina)

```jsonc
{
  ".": { "import": "./dist/tokens.js", "types": "./dist/tokens.d.ts" },
  "./css": "./dist/tokens.css",
  "./themes/dark": "./dist/themes/dark.css",
  "./themes/brand-a": "./dist/themes/brand-a.css",
  "./themes/brand-b": "./dist/themes/brand-b.css",
}
```

### Auditoría de tokens — fixes de severidad alta

- **`semantic/color.json` (light)**: `border.subtle` apunta a `{color.neutral.100}` igual que `border.default` → jerarquía rota. Corregir a `{color.neutral.200}` (o equivalente que mantenga subtle < default < strong).
- **`primitives/shadow.json`**: agregar `shadow.focus` para focus rings accesibles (token primitive + uso semántico).
- **`semantic/color.json`**: agregar `focus-ring` ya existe — verificar que se mapea coherentemente en dark theme.

### Auditoría de tokens — findings de severidad media (proponer follow-up, NO aplicar en esta fase)

- Duplicado intencional `color.neutral.0` ↔ `color.white` (documentar política).
- Falta `font.weight.black: 900` (Inter lo soporta).
- `semantic/space.json`: `radius.full: 9999px` hardcoded en lugar de referenciar un primitive.
- Faltan dimensiones grandes (256, 384, etc.) para max-widths de layout.
- Faltan tokens de `text-decoration` y `text-transform`.

Cada uno se documenta en el `design.md` y se propone como change futuro.

### README del package (`packages/tokens/README.md`)

Cómo se consume (CSS + JS), prefix `--ds-*`, lista de exports, themes disponibles, política de versionado, ejemplo de uso, link a ADR-003.

### Decisión arquitectónica formal

- **ADR-003** Arquitectura de design tokens: documenta la jerarquía (primitives → semantic → component → theme), el modelo de theming via `data-theme`/`data-brand` con CSS variables, mantener prefix `--ds-*`, y por qué Style Dictionary 4 vs alternativas (style-dictionary v3, theo, terrazzo).

### Validación

- `pnpm -F @romanmartinidev/tokens build` debe producir `dist/tokens.{css,js,d.ts}` + `dist/themes/{dark,brand-a,brand-b}.css` sin errores.
- `pnpm -F @romanmartinidev/tokens pack --dry-run` debe listar solo lo declarado en `files`.

## Capabilities

### New Capabilities

- `design-tokens-package`: el package `@romanmartinidev/tokens` como artefacto publicable. Cubre: nombre y scope, surface de exports, metadata de publicación, jerarquía interna de tokens (primitives/semantic/component/theme), modelo de theming con CSS variables y atributos HTML, contrato de prefix de variables, política de tree-shaking (`sideEffects`).

### Modified Capabilities

Ninguna. `monorepo-structure` (creada en Fase 1) ya cubre los contratos generales del monorepo; esta fase los **materializa** en un workspace concreto pero no cambia los requirements existentes.

## Impact

### Código

- **Modificados**: `packages/tokens/package.json`, `packages/tokens/sd.config.mjs` (si la auditoría requiere ajustes), `packages/tokens/src/semantic/color.json` (fix border.subtle), `packages/tokens/src/primitives/shadow.json` (add focus).
- **Creados**: `packages/tokens/README.md`, `docs/architecture/adr/ADR-003-arquitectura-design-tokens.md`.
- **No tocados en esta fase**: `packages/tokens/src/component/*.json`, `packages/tokens/src/theme/*.json` (auditoría de severidad media/baja queda como follow-up).

### APIs públicas

- **BREAKING** para consumidores hipotéticos del nombre `@ds/tokens` (no hay ninguno fuera del repo actualmente, pero al publicar la 0.x.y a npm el nombre queda fijado).
- Nueva surface de `exports`: rutas `./css`, `./themes/dark`, etc. quedan parte del contrato API.
- Prefix `--ds-*` queda fijado y documentado (cambiarlo en el futuro es **BREAKING** y exige nuevo ADR).

### Dependencias

- Sin cambios de deps en root.
- `packages/tokens` mantiene `style-dictionary@^4.3.0` como única devDep.
- Sin nuevas peer deps.

### Sistemas / fases siguientes

- **Fase 3 (`packages/components`)** depende de que esta fase cierre con package publicable y prefix estable.
- **Fase 4 (`apps/playground`)** consumirá los tokens via `workspace:*`.

## Alternativas evaluadas

### Opción A — Migración mínima (status quo extendido)

Solo renombrar el package y agregar metadata de publicación. No auditar contenido.

- **Pros**: scope chico, rápido de cerrar.
- **Contras**: deja bugs documentados (border.subtle) que `packages/components` va a empezar a consumir en Fase 3 y replicar. La regla "buenas prácticas" del repo se viola por omisión consciente. Costo de corregir crece con cada consumidor.

### Opción B — Migración + auditoría + fixes alta severidad (esta propuesta)

Migración completa + corregir lo que viola buenas prácticas verificables (jerarquía rota, falta de focus shadow para a11y) + documentar resto como follow-up.

- **Pros**: respeta las tres prioridades del repo. Corrige solo lo verifiable y documentable. Followups quedan trazados.
- **Contras**: scope ligeramente mayor que A.

### Opción C — Migración + reorganización mayor de tokens

Auditoría + replantear toda la jerarquía (renombres, nuevos primitives, removidos, etc.).

- **Pros**: oportunidad de hacer un baseline ideal antes de que componentes consuman.
- **Contras**: rompe trabajo previo de tokens hecho fuera del repo, scope demasiado grande para una "fase de bootstrap", múltiples decisiones que merecen ADRs propios. Mejor postergar a un change posterior cuando haya criterio sobre qué falta.

**Decisión**: Opción B (Roman lo aprobó al elegir "Migración + auditoría de tokens" en kickoff de la propuesta).

## ADRs y follow-ups

- **Se crea**: ADR-003 Arquitectura de design tokens.
- **Se proponen follow-ups** (changes futuros, fuera del scope de esta propuesta):
  - `tokens-audit-medium-severity`: aplicar findings de severidad media (radius.full, font.weight.black, dimensiones grandes, text tokens).
  - `tokens-rich-types`: generar tipos TS estructurados (objeto vs escalares planas).
  - `tokens-versioning-policy`: política definitiva pre-1.0 → 1.0.
