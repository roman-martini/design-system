## Context

`openspec/specs/components-package/spec.md` tiene 1592 líneas y 33 `### Requirement:`. Nació en el bootstrap (aaa-003) como el contrato del package publicable, con Button como único componente. Cada componente posterior (checkbox, radio, select, input, modal, tabs, tooltip, toast, spinner, skeleton, menu, accordion, breadcrumbs, pagination, progress) sumó su(s) requirement(s) al mismo archivo. Hoy conviven dos naturalezas en un solo documento: **contratos del package** (identidad, peer deps, build, naming, convenciones a11y) y **contratos de cada componente** (comportamiento de DsMenu, DsProgress, etc.).

OpenSpec modela specs como **capabilities** identificadas por carpeta (`openspec/specs/<name>/`), sin ID. El repo ya tiene 5 specs (`components-package`, `design-tokens-package`, `monorepo-structure`, `playground-app`, `ci-cd-pipeline`). Este change parte una de ellas en 16 capabilities (1 transversal reencuadrada + 15 nuevas por componente).

**Restricción dura**: es una reorganización documental, **no un cambio de contrato**. La verificación de éxito es que el conjunto de `SHALL`/scenarios sea idéntico antes y después, solo redistribuido. Ningún test de `packages/components/` cambia.

## Goals / Non-Goals

**Goals:**

- Un archivo de spec por componente (`component-<name>`), autocontenido y navegable, espejo de `packages/components/src/lib/<name>/`.
- `components-package` acotado a lo transversal.
- Una **regla de partición determinista** que resuelva sin criterio subjetivo dónde va cada requirement, y que rija los changes futuros.
- Cero cambio de comportamiento; cero cambio de código.
- Trazabilidad intacta: todo enlace vivo a un requirement movido apunta a su nueva ubicación.

**Non-Goals:**

- Reescribir, mejorar o normalizar el contenido de los requirements (se promueven **verbatim**).
- Cambiar la API de los componentes o sus tests.
- Partir las otras specs (`design-tokens-package`, etc.) — fuera de alcance; si algún día crecen, se decide por separado.
- Emitir un changeset (no hay cambio publicable).

## Decisions

### D1 — Regla de partición: "gobierna ≥2 componentes o el package → transversal; gobierna exactamente 1 → per-componente"

El criterio para ubicar cada requirement es **cuántos componentes gobierna su texto normativo**, no su título ni el componente que usó de ejemplo:

- **Transversal (`components-package`)**: gobierna el **artefacto package** (identidad, peer deps, build APF, `public-api.ts`, arquitectura flat, naming, styles, ViewEncapsulation, reglas de dependencia) **o ≥2 componentes** (patrón disabled accesible ADR-011 — regula acción vs `ds-checkbox`/`ds-radio`; iconografía Lucide ADR-012 — regula todo componente con iconos).
- **Per-componente (`component-<name>`)**: gobierna **exactamente un** componente (comportamiento de DsMenu, tests de DsButton, etc.).

**Por qué esta regla y no "por el título"**: dos requirements tienen títulos engañosos. "Estado disabled accesible **del ds-button**" gobierna en su texto también a checkbox y radio (contrasta acción vs form control) → transversal pese al título. "Tests **del Button**" gobierna solo a Button → per-componente pese a estar históricamente en el package. La regla por conteo de componentes gobernados los resuelve a ambos sin ambigüedad, y es la misma pregunta que se hará cada change futuro.

**Alternativa descartada** — clasificar por el título/nombre del requirement: falla en los dos casos anteriores; reintroduce juicio subjetivo.

### D2 — Granularidad: una spec por componente (no por familia)

Ver "Alternativas evaluadas" del `proposal.md` (Opción A elegida vs B familias vs C único). Resumen del porqué: la familia obliga a re-decidir el encaje de cada componente nuevo (¿select es form u overlay?) y deja archivos multi-componente; la spec por componente escala plano y hace que el delta de un change futuro toque un solo archivo.

### D3 — Agrupación de sub-componentes acoplados en una sola spec

Los pares que solo existen juntos comparten spec: `DsRadioGroup`+`DsRadio` → `component-radio`; `DsSelect`+`DsOption` → `component-select`; `DsTabs`+`DsTab` → `component-tabs`. Criterio: son un **contrato de composición único** (el hijo no tiene sentido fuera del padre, comparten CVA/estado). No se parten en `component-option` etc. porque violaría "un contrato navegable" sin ganancia — nadie consume `DsOption` sin `DsSelect`.

### D4 — Nombre `component-<name>` (singular, kebab-case)

Espeja `packages/components/src/lib/<name>/` y contrasta con el plural `components-package` (el package) — se lee "la capability component-menu". Alternativa `components-<name>` descartada: colisiona visualmente con `components-package` y sugiere plural donde hay una pieza.

### D5 — Mecánica de deltas OpenSpec

- `components-package` recibe un delta con **`## REMOVED Requirements`** listando cada requirement por-componente promovido (header exacto para que el tooling los quite de la base al archivar).
- Cada `component-<name>` es una spec nueva → delta con **`## ADDED Requirements`** conteniendo el/los requirement(s) **copiados carácter por carácter** desde la base actual, con sus scenarios.
- Al archivar, el tooling promueve: `components-package` queda sin los movidos; las 15 specs nuevas nacen con su contenido.
- **Paths relativos**: los requirements movidos contienen enlaces `../../../docs/architecture/adr/ADR-NNN-*.md` calculados desde `openspec/specs/components-package/`. Una spec nueva en `openspec/specs/component-<name>/` está a la **misma profundidad** (`openspec/specs/<x>/spec.md`), así que los `../../../` siguen siendo válidos sin reescritura. Verificación explícita en tasks.

### D6 — Genera ADR-018

La convención "specs del package = capability por componente + transversal, con la regla D1" rige **todos** los changes de componente futuros (2+ changes) y elige entre alternativas de granularidad estructural. Cumple el criterio de ADR del repo. Se escribe al aplicar y se acepta al archivar. `openspec/README.md` (operativo) referencia el ADR para el "dónde va el delta".

## Risks / Trade-offs

- **[Alterar un `SHALL` sin querer al copiar]** → Mitigación: promoción verbatim con verificación mecánica — tras el split, comparar el conjunto de requirements+scenarios (por conteo y por diff de texto normalizado) entre el archivo original (en git) y la unión de los 16 destinos. Task dedicada con criterio binario.
- **[Enlaces entrantes rotos]** → Mitigación: `grep` de `components-package` en todo el repo antes y después; reapuntar solo los que referencian un requirement movido (los que apuntan a uno transversal se mantienen). Lista cerrada en tasks.
- **[Proliferación de archivos chicos]** → Aceptado: 16 archivos es el costo de la navegabilidad; espejan 1:1 la estructura de `src/lib/` que el repo ya considera legible. La regla D3 evita partir de más.
- **[La regla D1 se olvida en un change futuro]** → Mitigación: queda en ADR-018 + `openspec/README.md` + el paso de spec-delta de la skill `add-component`.
- **[Un requirement futuro genuinamente transversal se mete en un `component-<name>`]** → Mitigación: la regla D1 por conteo de componentes gobernados es la prueba; documentada con los dos casos límite reales (disabled accesible, tests de button) como ejemplo.

## Migration Plan

1. Snapshot del `components-package/spec.md` actual (git ya lo tiene en HEAD) como oráculo de verificación.
2. Escribir el delta `REMOVED` de `components-package` y los 15 deltas `ADDED` de `component-<name>` (16 con button), copiando verbatim.
3. Validar con `openspec validate --changes`.
4. Verificación de paridad (conteo + diff normalizado) contra el snapshot.
5. Reapuntar enlaces entrantes (lista cerrada de tasks) y actualizar catálogos + `openspec/README.md` + skill + ADR-018.
6. **Rollback**: como no toca código, revertir es `git revert` del commit del apply; el archivo único vuelve intacto desde git.

## Open Questions

- Ninguna bloqueante. (Confirmado en refinamiento: granularidad por componente, sub-componentes acoplados juntos, sin changeset.)
