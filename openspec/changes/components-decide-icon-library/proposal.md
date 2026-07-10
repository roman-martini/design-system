---
id: aaa-013
name: components-decide-icon-library
type: change
status: proposed
modifies-specs:
  - components-package (dependencia de iconos + convención de uso)
related-adrs:
  - ADR-012
  - ADR-004
---

## Why

El design system **no tiene sistema de iconos** — gap explícito del research de Atlassian (`docs/design/research/atlassian-design.md §1.8`: "Gap completo del DS — no hay decisiones tomadas sobre iconografía"). Hoy el único "icono" es el checkmark del `ds-checkbox`, hardcodeado como `data:image/svg+xml` en su CSS — válido para un pseudo-control, pero no un sistema.

La necesidad tiene disparador real: los próximos componentes del roadmap necesitan iconos en el template — la **X de cierre** del Modal (`components-add-modal`, bloqueado por este change) y el **chevron** del Select. Sin decisión de iconografía, cada componente hardcodearía SVGs ad-hoc, repitiendo el parche del checkbox y fragmentando el estilo.

Decisión tomada (con Roman, kickoff de este change, tras evaluar custom-vs-librería): adoptar **Lucide** vía su package Angular oficial **`@lucide/angular`**. Criterios:

1. **Único package Angular oficial del mercado de iconos**: standalone + signals + zoneless, Angular 17+ — encaje exacto con el stack (Angular 21 zoneless, ADR-005).
2. **Estilo alineado al research**: 1.5px stroke @ 16-24px es el starting point que el research de Atlassian fijó para el DS (§255: "Librería: Lucide … en lugar de hacer una propia").
3. **Activo y sano**: fork comunitario de Feather (que está abandonado — sin iconos nuevos desde 2022); v1.0 en jun-2026, ~1700 iconos, licencia ISC.
4. **Mismo criterio que ADR-003** (Style Dictionary sobre script custom): mantener un set de iconos propio es trabajo recurrente que no agrega valor de producto a esta escala. Un package custom `@romanmartinidev/icons` queda documentado en el ADR como **camino futuro** con criterio de activación explícito (necesidad real de identidad visual divergente), no como punto de partida.

Respalda las 3 prioridades del repo:

1. **Buenas prácticas**: herramienta probada del ecosistema; tree-shaking por icono (imports explícitos, type-safe); a11y por convención (`aria-hidden` decorativo / `aria-label` semántico).
2. **Escalar ordenado**: convención única de uso de iconos para todos los componentes futuros; sumar un icono = un import.
3. **Mantenibilidad**: cero set propio que curar; la decisión y la convención quedan en ADR + spec.

Fija una **decisión de dependencia transversal** (todos los componentes futuros con iconos la usan) → **genera ADR-012** y modifica el spec `components-package` (convención de iconografía testable).

## What Changes

> Nivel de requerimiento. El detalle (peerDependency vs allowedNonPeerDependencies en ng-packagr, versión a pinnear, forma exacta del import, tamaño default) va en `design.md`; el secuenciado, en `tasks.md`.

- **Adoptar `@lucide/angular`** como dependencia del package `@romanmartinidev/components` (modalidad exacta — peer vs bundled — a decidir en design según Angular Package Format).
- **Definir la convención de uso de iconos** del DS: import explícito por icono (tree-shakeable), tamaño default 16px, `stroke-width` 1.5 (default Lucide), color vía `currentColor` (hereda del contexto/tokens), a11y (`aria-hidden="true"` para iconos decorativos; `aria-label` cuando el icono es el único contenido semántico).
- **Primer uso demostrable**: validar la integración con un uso real renderizado (demo en playground y/o story) con los 2 iconos del disparador: `X` y `ChevronDown`. Sin componente hipotético — es la prueba de integración de la dependencia (build, tree-shaking, estilo).
- **Spec delta `components-package`**: Requirement ADDED con la convención de iconografía (dependencia declarada, import tree-shakeable, estilo, a11y).
- **ADR-012**: decisión Lucide (opciones evaluadas: Lucide / Heroicons / Feather / custom+package propio) + criterio explícito de migración futura a `@romanmartinidev/icons` si aparece necesidad de identidad.

### Fuera de scope (Non-Goals)

- **NO construir Modal ni Select** — sus changes consumen la convención después (este change los desbloquea).
- **NO migrar el checkmark del `ds-checkbox`** — el SVG en `background-image` es el patrón correcto para un pseudo-control.
- **NO crear `@romanmartinidev/icons`** — queda como camino futuro documentado en ADR-012, con criterio de activación.
- **NO wrapper `DsIcon` propio** de entrada — `@lucide/angular` ya provee el componente; envolver sin necesidad concreta es abstracción prematura (mismo criterio que aaa-011 con la primitiva compartida). Si al implementar Modal/Select aparece repetición real de props (size/aria), se evalúa entonces.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `components-package`: 1 Requirement ADDED — convención de iconografía (dependencia `@lucide/angular`, uso tree-shakeable, estilo 1.5px stroke/currentColor, a11y). Sin REMOVED ni MODIFIED.

## Impact

### Código

- **Modificados**:
  - `packages/components/package.json` — dependencia `@lucide/angular` (modalidad en design).
  - `apps/playground/src/app/` y/o una story — demo de integración con `X` y `ChevronDown`.
  - Docs: decisions-log (fila ADR-012), BACKLOG (item pasa a propuesta activa → archivado al cerrar).
- **Creados**:
  - `docs/architecture/adr/ADR-012-*.md`.
  - Spec delta en el change.
  - Changeset de `@romanmartinidev/components` (dependencia nueva — bump y tipo a confirmar en design según modalidad peer/bundled).

### APIs públicas

Si la modalidad es **peerDependency**, los consumidores del package que usen componentes con iconos deberán instalar `@lucide/angular` (documentar en README). Si es dependencia normal permitida (`allowedNonPeerDependencies`), no hay acción del consumidor. Decisión en design.

### Dependencias

- `@lucide/angular` (ISC) — nueva. Pinneo y modalidad en design.

### Spec deltas

- `components-package`: 1 Requirement ADDED (convención de iconografía).

## Alternativas evaluadas

> El detalle completo va en ADR-012. Resumen:

### Opción A — Lucide (`@lucide/angular`) — elegida

- **Pros**: único package Angular oficial (standalone/signals/zoneless); estilo = starting point del research; activo, ~1700 iconos, ISC; tree-shaking por icono; cero mantenimiento de set propio.
- **Contras**: dependencia externa en la superficie visual; el estilo del DS queda atado al lenguaje Lucide (mitigado: es intercambiable — ver ADR-012 criterio de migración).

### Opción B — Heroicons

- **Pros**: activo (Tailwind), MIT, estilo outline+solid.
- **Contras**: **sin package Angular oficial** — integración vía wrappers community (2da mano) o SVG crudo. Menor cobertura (~500). Descartada.

### Opción C — Feather

- **Contras**: **abandonado** (sin iconos nuevos desde 2022, cientos de issues abiertos). Lucide es su fork activo. Descartada.

### Opción D — Custom set en package propio `@romanmartinidev/icons`

- **Pros**: identidad visual propia; los iconos como parte del contrato del DS; sin dependencia externa.
- **Contras**: package publicable nuevo + curación/mantenimiento del set para 2 iconos hoy; el beneficio de identidad es especulativo sin divergencia visual real planificada; contradice el criterio ADR-003 ("preferir herramientas probadas; no mantener lo que no agrega valor de producto"). **Descartada como punto de partida; documentada en ADR-012 como evolución futura** con criterio de activación (necesidad real de identidad divergente o de exponer un set curado a consumidores).

**Decisión**: **Opción A**. El mecanismo de datos de Lucide (componente + constantes tree-shakeables) además deja la migración futura a D barata: el patrón de consumo no cambia, solo la fuente de los imports.

## ADRs y follow-ups

- **Genera ADR-012** "Iconografía del DS: adopción de Lucide" — Propuesto al crear; Aceptado al cerrar el change.
- **`design.md` requerido**: hay una decisión técnica real (modalidad de la dependencia en APF: peerDependency vs `allowedNonPeerDependencies`) con impacto en los consumidores.
- **Desbloquea**: `components-add-modal` (X de cierre) y `components-add-select` (chevron) — sus changes consumen la convención.
- **Follow-up condicional**: `icons-package-bootstrap` (`@romanmartinidev/icons` custom) si se cumple el criterio de activación del ADR-012.
