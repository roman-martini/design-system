# ADR-018 — Organización de las specs del kit: una capability por componente

- **Fecha**: 2026-07-20
- **Estado**: Aceptado
- **Dominio**: frontend / components / gobernanza de specs
- **ADRs relacionados**: [ADR-008](ADR-008-convencion-ids-openspec.md) (convención de IDs OpenSpec — este ADR fija la organización de specs, complementaria a la de changes), [ADR-004](ADR-004-surface-libs-publicables.md) (surface del package components, cuyo contrato transversal permanece en `components-package`)

## Contexto

El spec `openspec/specs/components-package/spec.md` creció hasta **33 requirements en 1592 líneas** (change [`aaa-030`](../../../openspec/changes/archive/aaa-030-specs-split-por-componente/)). Mezclaba dos naturalezas: los **contratos transversales del package publicable** (identidad, peer deps, build APF, naming, convenciones a11y/iconografía) y el **comportamiento de cada uno de los ~16 componentes** del kit. Cada componente nuevo sumaba ~70 líneas al mismo archivo compartido; el delta de cada change tocaba ese archivo gigante; y no había forma de leer "el contrato de DsMenu" sin recorrer contratos ajenos. Contradice las prioridades 2 (escalar ordenado) y 3 (mantenibilidad) del repo.

Cómo se organizan las specs es una decisión de gobernanza que rige **todos** los changes de componente futuros (dónde escribe cada uno su delta) → one-way door de convención que amerita ADR.

## Opciones consideradas

### Opción A — Una spec por componente + una transversal (elegida)

`components-package` conserva lo transversal; se introduce `component-<name>` (singular) por componente, con los requirements promovidos verbatim.

- **Pros**: cada contrato de componente es un archivo autocontenido y navegable, espejo 1:1 de `packages/components/src/lib/<name>/`; el delta de un change futuro toca solo su spec; escala plano (un componente = un archivo); la frontera transversal/específico queda explícita y verificable.
- **Contras**: ~16 archivos nuevos; requiere reapuntar los enlaces entrantes que apuntaban a un requirement movido.

### Opción B — Agrupar por familia

`component-forms`, `component-overlays`, `component-feedback`, `component-navigation`, `component-actions`.

- **Contras**: la frontera de familia es discutible (¿select es form u overlay?, ¿menu es overlay o navegación?) y obliga a re-decidir el encaje de cada componente nuevo; los archivos siguen siendo multi-componente (el delta de un componente toca un archivo compartido con hermanos). Descartada: reintroduce el juicio subjetivo que el split busca eliminar.

### Opción C — Mantener el archivo único

- **Contras**: el problema persiste y empeora con cada componente. Descartada por el PO (TASK 1.7).

## Decisión

**Las specs del kit se organizan como una capability transversal (`components-package`) más una capability por componente (`component-<name>`)**, con estas reglas:

1. **Regla de partición (determinista)**: un requirement es **transversal** (`components-package`) si su texto normativo gobierna el **artefacto package** o **≥2 componentes**; es **per-componente** (`component-<name>`) si gobierna **exactamente uno**. El criterio es cuántos componentes gobierna el texto, **no** el título ni el componente que se usó de ejemplo. Casos límite resueltos por esta regla: "Estado disabled accesible del ds-button" es transversal (regula acción vs `ds-checkbox`/`ds-radio`); "Tests del Button con Vitest" es per-componente (solo Button).
2. **Sub-componentes acoplados comparten spec**: los pares que solo existen juntos (`DsRadioGroup`+`DsRadio`, `DsSelect`+`DsOption`, `DsTabs`+`DsTab`) viven en una sola `component-<name>` — son un contrato de composición único.
3. **Naming**: `component-<name>` en kebab-case singular, espejo de `packages/components/src/lib/<name>/`. El plural `components-package` queda reservado al contrato del package.
4. **Dónde va el delta de un change futuro**: un componente **nuevo** introduce `component-<name>` (delta `ADDED`); un cambio a un componente **existente** escribe delta `MODIFIED` contra su `component-<name>`; solo se toca `components-package` cuando cambia algo **transversal** (peer dep, build, naming, una convención a11y cross-cutting).
5. **Promoción sin cambio de contrato**: reorganizar specs nunca altera un `SHALL` ni un scenario; los requirements se mueven verbatim. La operación es documental, no cambia código ni tests.

La convención operativa (el "dónde va el delta") se refleja en `openspec/README.md`; este ADR es su fundamento.

## Consecuencias

### Positivas

- Cada componente tiene un contrato leíble de forma aislada; el catálogo de specs escala plano con el kit.
- El delta de un change de componente deja de tocar un archivo compartido: menos conflicto, revisión más acotada.
- La regla de partición por conteo de componentes gobernados elimina el juicio subjetivo en cada componente futuro.

### Negativas / trade-offs aceptados

- Más archivos de spec (uno por componente) — aceptado: espejan `src/lib/` que el repo ya considera la unidad legible.
- Los enlaces entrantes a un requirement movido debieron reapuntarse una vez (lista cerrada en las tasks de aaa-030); los archivados/ADRs inmutables se dejan como registro histórico.

### Acciones de seguimiento

- Primer componente de una tanda futura: verificar en vivo que su change escribe el delta contra `component-<name>` (nueva spec), no contra `components-package`.
- Si `design-tokens-package` o `playground-app` crecen a una escala comparable, evaluar un split análogo en su propio ADR (no se hace preventivamente — D-005).
