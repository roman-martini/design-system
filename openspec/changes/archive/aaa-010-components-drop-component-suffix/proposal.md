---
id: aaa-010
name: components-drop-component-suffix
type: change
status: archived
archived: 2026-07-03
modifies-specs:
  - components-package (file naming `<name>.ts` sin sufijo `.component`)
  - playground-app (sana referencias a `app.component.*` — drift preexistente, los archivos reales ya son `app.ts`/`app.html`/`app.css`/`app.spec.ts`)
related-adrs:
  - ADR-004
  - ADR-007
  - ADR-010
---

## Why

[ADR-007](../../../docs/architecture/adr/ADR-007-naming-prefijos.md) unificó el naming del DS bajo `Ds` / `ds-` / `--ds-*` y **dropeó el sufijo `Component` de la clase** (`DsRadio`, no `DsRadioComponent`), pero **conservó el sufijo `.component` en el nombre de archivo** (`radio.component.ts`). Esa conservación fue una decisión **deliberadamente postergada**, no un cierre:

- ADR-007 §Decisión, fila "Folder y file naming": _"sin cambios … el archivo sigue `<name>.component.ts` … Si se quiere evolucionar a `<name>.ts` al estilo Angular 21 moderno, va en un CHG separado."_
- ADR-007 §Open questions: _"¿Migrar también el folder/file naming a la convención Angular 21 moderna (`button.ts` sin `.component`)? Postergado. … Si aparece motivación, va en CHG separado."_

**Este change es ese CHG separado.** No contradice ADR-007: ejecuta lo que ADR-007 anticipó.

La motivación apareció: el style-guide moderno de Angular (v20+) recomienda nombres de archivo sin sufijo de rol (`radio.ts`, `radio.html`, `radio.css`, `radio.spec.ts`), y el repo corre Angular `21.2.15`. Además, la incorporación del grupo de agentes `ng-*` tomó esa convención moderna como estándar en `.claude/knowledge/ng-best-practices.md` §1, lo que obligó a declarar la divergencia del repo como **excepción por consistencia** en `.claude/knowledge/ng-stack-profile.md`. Mantener la excepción es deuda viva: cada componente nuevo la perpetúa y el perfil del DS la arrastra.

Hoy hay **4 componentes** (`button`, `checkbox`, `radio`, `radio-group`) con el patrón `<name>.component.*` — ~16 archivos. La ventana es óptima: package en `0.x`, **sin consumidores externos** (único consumidor: `apps/playground`, que se migra en el mismo change). Cuanto más se demore, más caro el rename.

Respalda las prioridades del repo:

1. **Buenas prácticas**: alinea el file naming con el style-guide oficial vigente de Angular, cerrando la última divergencia de la convención de naming del DS.
2. **Mantenibilidad**: una sola convención de naming sin excepción que arrastrar en cada componente futuro ni en el perfil del DS de los agentes `ng-*`.

Toca **1 package** (`@romanmartinidev/components`). Es **decisión de convención** que evoluciona la tabla de naming de ADR-007 → **genera un ADR nuevo al cerrarse**. No es one-way door (rename mecánico, reversible; cero cambio de comportamiento).

## What Changes

> Nivel de requerimiento (qué y por qué). El desglose en tareas concretas y, si hace falta, el `design.md`, se redactan al activar el change.

En cada `packages/components/src/lib/<name>/`, renombrar:

- `<name>.component.ts` → `<name>.ts`
- `<name>.component.html` → `<name>.html`
- `<name>.component.css` → `<name>.css`
- `<name>.component.spec.ts` → `<name>.spec.ts`

Y, como consecuencia del rename:

- Actualizar dentro de cada componente: `templateUrl: './<name>.html'` y `styleUrl: './<name>.css'`.
- Actualizar imports internos entre componentes (ej. `radio` importa `../radio-group/radio-group.component` → `../radio-group/radio-group`).
- Actualizar `public-api.ts` (barrel) y cualquier path en `ng-package.json` / entry points si referencian rutas con `.component`.
- Actualizar imports en `apps/playground` que usen rutas con `.component`.
- Verificar `<name>.stories.ts` (no lleva `.component`, pero sus imports al componente sí cambian de path).

**Sin cambios**: clase (`Ds<Name>`), selector (`ds-<name>`), type exports (`Ds<Name><TypeName>`), CSS custom properties (`--ds-*`). Esto es **exclusivamente file naming** — la convención de identificadores ya está cerrada por ADR-007.

### Docs y config a sincronizar (al cerrar)

- `openspec/config.yaml` — la línea _"Folder y file kebab-case (`button/`, `button.component.ts`)"_ pasa a `button.ts`.
- README del package, si menciona `.component.ts`.
- `.claude/knowledge/ng-stack-profile.md` — quitar la excepción de nomenclatura (ya alineada).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- **`components-package`**: la spec **formaliza el file naming como contrato** — el Requirement "Naming" declara _"Los archivos SHALL nombrarse `<name>.component.ts`"_ y varios Requirements/Scenarios enumeran `<name>.component.{ts,html,css,spec.ts}` (estructura por componente, Checkbox, RadioGroup, Radio). Renombrar sin delta violaría la spec activa. → Requirements **MODIFIED** actualizando el patrón a `<name>.{ts,html,css,spec.ts}`. La API pública (barrel, selectores, class names, type exports, CSS vars) no cambia.
- **`playground-app`**: **drift preexistente detectado al activar el change** — la spec quedó desincronizada de la realidad en dos frentes del mismo tema (naming): (1) referencia `app.component.ts` / `app.component.spec.ts`, pero los archivos reales ya son `app.ts` / `app.spec.ts` (naming moderno del `ng new` de Angular 21); (2) referencia identificadores pre-ADR-007 (`ButtonComponent`, `<rmd-button>`, `AppComponent`) que el código real ya no usa (`DsButton`, `<ds-button>`, `App`) — sync que aaa-007 omitió en esta spec. Varios scenarios hoy no pueden pasar. → Requirements **MODIFIED** alineando la spec con la realidad. Cero cambio de código en playground (ya está bien); es puro spec-sync.

## Impact

### Código

- **Renombrados**: ~16 archivos (4 componentes × 4 archivos).
- **Modificados**: `templateUrl`/`styleUrl` e imports internos en cada componente; `public-api.ts`; entry points de `ng-package.json` si aplican; imports de `apps/playground`; imports en `*.stories.ts`.
- **Creados/Eliminados**: ninguno (solo renames).

### APIs públicas

**No breaking.** Los consumidores importan desde el barrel `@romanmartinidev/components`; los paths de archivo internos no son superficie pública. _A confirmar al implementar_: que ningún import (interno o de playground) use deep paths a `.../lib/<name>/<name>.component`.

### Dependencias

Sin nuevas runtime ni devDeps.

### Spec deltas

- `components-package`: Requirements MODIFIED (patrón de file naming `<name>.*` sin `.component` en naming, estructura y scenarios de Checkbox/Radio/RadioGroup).
- `playground-app`: Requirements MODIFIED (referencias `app.component.*` → `app.*` + identificadores pre-ADR-007 `ButtonComponent`/`rmd-button`/`AppComponent` → `DsButton`/`ds-button`/`App`, alineando la spec con el código real).

## Alternativas evaluadas

### Opción A — Mantener `.component.ts` (status quo)

- **Pros**: cero churn.
- **Contras**: perpetúa la divergencia con el style-guide moderno; cada componente nuevo y el `ng-stack-profile.md` arrastran la excepción; el costo de migración crece con cada componente que se suma.

### Opción B — Migrar a `<name>.ts` (esta propuesta)

- **Pros**: alinea con Angular 21 y cierra la open question de ADR-007; ventana óptima (4 componentes, sin consumidores externos); refactor mecánico sin cambio de comportamiento, cubierto por los tests existentes.
- **Contras**: rename de ~16 archivos + ajuste de imports. Mitigación: cambio mecánico, validable con `build` + `test` + `npm pack` sin diferencias de comportamiento.

### Opción C — Migrar archivos + reorganizar carpetas

Como B, pero aprovechando para reestructurar la organización de `src/lib`.

- **Pros**: "un solo refactor grande".
- **Contras**: ADR-004 §2 fijó **arquitectura flat**; mezclar reorganización con rename acopla decisiones independientes — el mismo argumento con el que ADR-007 postergó este cambio. Descartada.

**Decisión propuesta**: **Opción B**.

## ADRs y follow-ups

- **Genera un ADR nuevo al cerrarse**: "Convención de file naming sin sufijo `.component`". Resuelve la open question de ADR-007 y evoluciona la fila "Folder y file naming" de su tabla de decisión. Número a asignar al redactarlo (próximo disponible: **ADR-010** — ADR-009 fue tomado por `tokens-figma-export`; los ADRs se numeran al crearse, no se reservan).
- **Sin `design.md`**: es un refactor mecánico sin ambigüedad técnica — la verificación al activar confirmó que no hay deep imports externos (playground importa solo del barrel y ya usa naming sin sufijo).
- **`tasks.md` y `specs/` creados al activar el change** (esta instancia), vía `/opsx:continue`.
- **Relación con `aaa-011`** (`components-accessible-disabled`): ambos tocan los mismos componentes. Este change va **primero** (renames mecánicos); aaa-011 se implementa sobre los archivos ya renombrados. Su `design.md` en working tree no colisiona (no referencia paths `.component`).
