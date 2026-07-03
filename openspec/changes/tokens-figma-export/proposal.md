---
id: aaa-012
name: tokens-figma-export
type: change
status: proposed
modifies-specs:
  - design-tokens-package (suma output DTCG para Figma)
related-adrs:
  - ADR-009
  - ADR-003
---

## Why

`@romanmartinidev/tokens` hoy emite **CSS** (`--ds-*`) y **JS/TS** desde las fuentes en `packages/tokens/src/` (Style Dictionary, ADR-003). No hay forma de llevar esos valores a **Figma**: diseño define color/espaciado/tipografía a mano, lo que crea **dos fuentes de verdad de facto** (el repo y lo que el diseñador tipea) que derivan con el tiempo. El contraste, la escala de espaciado y la jerarquía documentados en código no se reflejan en los mockups.

Aclaración que enmarca el scope: **tokens ≠ componentes**. Este package distribuye **variables**, no componentes de Figma. La integración hace que las Variables de Figma —y por ende los componentes que las consumen— tomen sus valores del repo. **No genera componentes de Figma** (eso es diseño manual; ver Non-Goals en `design.md`).

La dirección, la herramienta y el formato de esta integración se deciden en **[ADR-009](../../../docs/architecture/adr/ADR-009-figma-tokens-export.md)** (Propuesto): **code → Figma one-way**, vía **Tokens Studio for Figma**, alimentado por un **export DTCG (W3C)** con aliases preservados. ADR-003 ya había anticipado este ADR (su Opción D postergada y su acción de seguimiento "sync Figma"). Este change **implementa** esa decisión sin tocar build tool, jerarquía ni prefix de ADR-003: es **aditivo** (un target más de Style Dictionary).

Respalda las 3 prioridades del repo:

1. **Buenas prácticas**: DTCG es el formato W3C estándar; el output queda como contrato testable en el spec (JSON válido, aliases preservados, paridad con el set CSS). Una sola fuente de verdad de tokens.
2. **Escalar ordenado**: cualquier token nuevo que ya respeta la jerarquía aparece automáticamente en el DTCG y, por ende, disponible para Figma — sin trabajo extra por token.
3. **Mantenibilidad**: la deriva mockup↔código se elimina; cambiar un primitive propaga a Figma igual que a CSS (aliases encadenados como Variables).

Toca **1 package** (`@romanmartinidev/tokens`) y **no es one-way door** en su implementación (es aditivo: agregar un target; quitarlo es borrarlo). La **decisión de proceso** (dirección/herramienta) sí amerita ADR → **ADR-009**. Modifica el spec `design-tokens-package` con 1 Requirement ADDED (output DTCG observable/testable).

## What Changes

> Nivel de requerimiento. El detalle técnico (mecanismo de transformación a DTCG, layout de archivos, path versionado para el Git sync de Tokens Studio, mapeo de modos theme/brand, scope del primer corte) va en `design.md`; el secuenciado, en `tasks.md`.

- **Agregar un target DTCG** en `packages/tokens/sd.config.mjs` que emita los tokens en formato W3C Design Tokens (`$value`/`$type`) **con aliases preservados** (`{color.blue.500}`), sin resolver a valores crudos.
- **Emitir los temas** (`dark`, `brand-a`, `brand-b`) como sets diferenciados para mapearlos a **modes** de Figma.
- **Validar el artefacto DTCG** con tests Vitest: JSON válido, aliases preservados, paridad de cantidad de tokens con el set CSS base.
- **Documentar en `packages/tokens/README.md`** cómo conectar Tokens Studio al repo (Git sync) y la convención de modos.
- **No tocar** los outputs CSS/JS existentes, la jerarquía, ni el prefix `--ds-*`.

### A resolver en `design.md`

- **Mecanismo de transformación a DTCG**: soporte nativo de Style Dictionary 4 (custom format/transform) vs `@tokens-studio/sd-transforms`. Trade-off de dependencia vs control.
- **Layout de archivos**: un único DTCG multi-set vs un archivo por nivel/tema (`primitives.json`, `semantic.json`, `component.json`, `themes/dark.json`, …).
- **Path versionado para el Git sync**: Tokens Studio lee del repo; `dist/` suele estar ignorado. ¿Emitir a una carpeta **versionada** (ej. `packages/tokens/figma/`) con guard de CI "está sincronizado", o leer del package publicado?
- **Mapeo de modos `theme × brand`**: los modes de Figma son unidimensionales por colección. Cómo modelar light/dark + brand-a/brand-b (modos en una dimensión + sets/colecciones para la otra) o documentar la limitación del primer corte.
- **Scope del primer corte**: ¿temas incluidos desde el día 1 o sólo base + light/dark primero?

## Capabilities

### New Capabilities

Ninguna. El spec `design-tokens-package` ya existe (introducido por aaa-002).

### Modified Capabilities

- `design-tokens-package`: 1 Requirement ADDED (output DTCG para Figma). Sin REMOVED ni MODIFIED.

## Impact

### Código

- **Modificados**:
  - `packages/tokens/sd.config.mjs` — agregar el target DTCG (+ builds por tema).
  - `packages/tokens/package.json` — posible nuevo sub-path en `exports` y/o devDep (`@tokens-studio/sd-transforms`, a decidir en design); posible entry en `files` si el DTCG se publica.
  - `packages/tokens/README.md` — sección de integración con Figma.
- **Creados**:
  - Artefacto(s) DTCG emitido(s) por el build (path exacto en design).
  - `packages/tokens/test/figma-dtcg.spec.ts` (o equivalente) — validación del artefacto.
- **Eliminados**: ninguno.

### APIs públicas

Aditivo, **no breaking**. Nuevo output DTCG; posible nuevo sub-path de `exports`. Los outputs CSS/JS y el prefix `--ds-*` no cambian.

### Dependencias

Posible nueva devDep `@tokens-studio/sd-transforms` (a decidir en design vs custom format con Style Dictionary 4 puro). Sin nuevas runtime deps.

### Spec deltas

- `design-tokens-package`: 1 Requirement ADDED ("Output DTCG para integración con Figma").

## Alternativas evaluadas

> Las alternativas **arquitectónicas** (dirección, herramienta, formato) se evalúan en [ADR-009](../../../docs/architecture/adr/ADR-009-figma-tokens-export.md) (Opciones A–E). Acá quedan las alternativas **de implementación** del change una vez fijada la Opción B del ADR.

### Opción A — Custom format/transform con Style Dictionary 4 puro

Escribir un format propio que serialice a DTCG con aliases.

- **Pros**: sin dependencia extra; control total del output.
- **Contras**: más código a mantener; reimplementar el mapeo de tipos DTCG (`$type`) que `sd-transforms` ya resuelve.

### Opción B — `@tokens-studio/sd-transforms`

Usar el paquete oficial de Tokens Studio que adapta Style Dictionary a su formato/DTCG.

- **Pros**: mapeo de tipos y compatibilidad con Tokens Studio probados; menos código propio.
- **Contras**: una devDep más atada al ecosistema Tokens Studio; hay que pinnear y monitorear.

**Decisión**: a tomar en `design.md` (se inclina a B por "preferir herramientas probadas", salvo que el output requerido sea trivial).

## ADRs y follow-ups

- **Generado**: [ADR-009](../../../docs/architecture/adr/ADR-009-figma-tokens-export.md) — Figma como consumidor de tokens (export DTCG vía Tokens Studio). Estado **Propuesto**; se promueve a **Aceptado** al cerrar este change.
- **Coordinación de IDs de ADR**: ADR-009 se asigna a este change por ser el **primer ADR escrito físicamente** (regla del repo: los ADRs se numeran al crearse, no se reservan). Los changes `aaa-011 components-accessible-disabled` y el futuro `components-decide-icon-library`, que mencionaban tentativamente ADR-009, tomarán **ADR-010+** al crear sus ADRs al cerrarse.
- **Follow-ups posibles**:
  - Si la sincronización manual vía plugin se vuelve fricción, evaluar la **API REST de Variables de Figma** (Opción C del ADR) en un ADR futuro.
  - Diseñar/enlazar los **componentes de Figma** a las Variables importadas — trabajo de diseño, fuera del scope de este repo de código.
