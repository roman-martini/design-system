# ADR-008 — Convención de IDs de OpenSpec

- **Fecha**: 2026-06-06
- **Estado**: Aceptado
- **Dominio**: transversal / openspec
- **ADRs relacionados**: ninguno (cambio de convención del sistema de gobernanza, ortogonal a las decisiones técnicas del kit).

## Contexto

Hasta `CHG-007` el repo usó dos sistemas de IDs paralelos en OpenSpec:

- **`CHG-NNN`** para changes (rango único de 3 dígitos = 999 changes máximo).
- **`SPC-NNN`** para specs base (rango único, alineado uno-a-uno con changes que las introducen).

El sistema funciona, pero acumuló tres fricciones detectadas durante los primeros 7 changes:

1. **Cap nominal de 999 changes** — generoso a corto plazo pero finito. Un repo activo puede consumirlo en años, no en décadas. Cuando se agote no hay extensión natural.
2. **SPC-NNN duplica información** — la spec ya se identifica por su carpeta (`openspec/specs/<name>/`). El ID `SPC-NNN` agrega un layer sin valor: el ID nunca se usa para resolver una spec (siempre se usa el nombre), y agrega un punto extra a mantener al renombrar.
3. **Sin agrupación visual por hitos** — `CHG-001..CHG-099` son todos del bootstrap, `CHG-100..CHG-199` podrían ser de "componentes nivel 2", etc. Pero el formato actual no facilita esa agrupación al ojo. Filtrar el historial por bloque temático requiere convención mental, no soporte del naming.

Esta es una decisión transversal (afecta openspec/, docs/architecture/, CLAUDE.md, config.yaml, BACKLOG.md, skills DS, research docs) y **one-way door** en cuanto al naming pasado (renombrar archivos archivados es costoso de revertir). Cumple los criterios de ADR obligatorio.

## Opciones consideradas

### Opción A — Status quo (CHG-NNN + SPC-NNN, 999 cap)

Mantener la convención actual hasta acercarse al cap de 999.

- **Pros**: cero refactor. 7 changes archivados, 5 specs ya con IDs estables.
- **Contras**:
  - El cap llegará. Posponerlo es trabajo similar dentro de 5 años en lugar de hoy.
  - Persiste la duplicación SPC-NNN ↔ nombre de carpeta.
  - Sin agrupación visual.

### Opción B — Extender CHG-NNNN (4 dígitos)

Pasar a `CHG-0001`..`CHG-9999`, sin tocar specs.

- **Pros**: cap nuevo de ~10K. Refactor menor (solo width del padding).
- **Contras**:
  - Posterga el problema; no lo resuelve estructuralmente.
  - Sigue sin agrupar visualmente.
  - Igual hay que renombrar todo lo archivado (CHG-001 → CHG-0001).
  - Duplicación SPC-NNN persiste.

### Opción C — Bloques alfabéticos + numéricos `aaa-NNN` (Adoptada)

Sistema de dos componentes:

- **Bloque alfabético**: 3 letras lowercase (`aaa`, `aab`, …, `zzz`).
- **Número**: 3 dígitos (`001` a `999`).

Cuando `<bloque>-999` se llena, el siguiente change arranca `<bloque++>-001`. Total: 17576 × 999 ≈ 17.5M IDs posibles.

Las **specs pierden ID por completo**: se identifican solo por su carpeta `openspec/specs/<name>/`.

- **Pros**:
  - Cap virtualmente infinito (17.5M).
  - Bloques permiten **agrupación retroactiva por hitos** opcional (ej. `aaa-*` = bootstrap + primera tanda, `aab-*` = features mayores, etc.). No obligatorio — el bloque puede ser puramente mecánico de overflow.
  - Reduce drift: una sola fuente de verdad para el ID de spec (el nombre de la carpeta).
  - Búsqueda en el historial archivado más fácil (`grep aaa-*` filtra por bloque).
- **Contras**:
  - Refactor único de 7 changes y 5 specs hoy + actualización de docs cruzados (~30 archivos tocados).
  - El bloque inicial `aaa` aplicado retroactivamente al bootstrap mezcla "bootstrap" y "primeros componentes" en un solo bloque. Aceptado — la agrupación temática es opcional, no obligatoria.

### Opción D — IDs ULIDs / UUIDs / hashes cortos

Generar IDs aleatorios únicos (`01HXY...`, `f3a8b`, etc.).

- **Pros**: cap real infinito, sin colisiones nunca.
- **Contras**:
  - Pierde legibilidad y orden cronológico implícito.
  - Imposible recordar de memoria.
  - Búsqueda visual peor (no se ordena alfabéticamente).
  - Anti-patrón para human-driven workflows como OpenSpec.

## Decisión

Se adopta la **Opción C — bloques alfabéticos `<aaa-zzz>-NNN`** con las siguientes precisiones:

### Formato

- **ID de change**: `<bloque>-<numero>` donde `<bloque>` ∈ `[aaa..zzz]` (lowercase, 3 letras) y `<numero>` ∈ `[001..999]` (3 dígitos zero-padded).
- **Próximo ID** post-rebrand: `aaa-008` (continúa el contador del bootstrap: 7 changes ya consumidos, el 8º arranca con la nueva convención).
- **Overflow**: cuando `<bloque>-999` se llena, el siguiente change arranca `<bloque++>-001`. Algorítmicamente: `aaa→aab→aac→…→aaz→aba→abb→…`.

### Specs sin IDs

- Las specs base viven en `openspec/specs/<name>/spec.md` (sin prefijo en el path).
- El frontmatter de la spec **no incluye `id` ni `introduced-by`**: solo `name`, `type`, `status`, `created`.
- Las referencias cross-doc usan el nombre de la spec (`monorepo-structure`, `components-package`, etc.).

### Paths

- **Change activo**: `openspec/changes/<kebab-name>/` (sin prefijo de ID). El ID vive solo en el frontmatter del `proposal.md`.
- **Change archivado**: `openspec/changes/archive/<id>-<kebab-name>/`. El prefijo del ID se agrega al renombrar/mover al archivar.

### Migración aplicada en este ADR

- 7 changes archivados renombrados: `CHG-001-*` → `aaa-001-*`, …, `CHG-007-*` → `aaa-007-*`.
- 5 specs renombradas: `SPC-001-monorepo-structure/` → `monorepo-structure/`, …, `SPC-005-ci-cd-pipeline/` → `ci-cd-pipeline/`.
- Frontmatters de los 7 proposals archivados actualizados (`id: CHG-NNN` → `id: aaa-NNN`, `introduces-specs:` y `modifies-specs:` con nombres de spec sin prefijo SPC).
- Frontmatters de las 5 specs limpiados (sin `id`, sin `introduced-by`).
- `openspec/IDS.md` reescrito como catálogo solo de changes (specs ya no listadas allí; viven en `docs/architecture/README.md` § "Catálogo de Specs").
- `openspec/config.yaml` actualizado (rules de proposal/specs/tasks mencionan `aaa-NNN` y rutas sin prefijo SPC).
- Refs cruzadas en `CLAUDE.md`, `docs/architecture/README.md`, `docs/architecture/FUTURE-WORK.md`, `openspec/BACKLOG.md`, `.claude/commands/ds/README.md`, `.claude/skills/research-design-system/SKILL.md`, `docs/design/research/atlassian-design.md` actualizadas.
- **NO se tocan ADR-001 a ADR-007**: son inmutables. Sus menciones históricas a `CHG-NNN` y `SPC-NNN` se preservan como contexto del momento en que fueron escritos. La regla del repo "no editar contenido de ADR aceptado" se respeta.

### Convención del proceso

- Este change se ejecuta como **commit directo + ADR-008**, no como CHG OpenSpec. Razón: usar OpenSpec para redefinir el ID system del propio OpenSpec sería paradójico — un CHG-008 que se llama "eliminar sistema CHG" mezcla dos sistemas en el mismo identifier. Coherente con la regla de CLAUDE.md "cambios triviales o de implementación local no requieren propuesta OpenSpec": este es cambio de convención del propio sistema de gobernanza, no de feature.

## Consecuencias

### Positivas

- **Cap virtualmente infinito**: 17.5M IDs posibles vs 999.
- **Drift reducido**: las specs tienen una sola fuente de verdad (nombre de carpeta) en lugar de dos (nombre + SPC-NNN).
- **Agrupación opcional por bloques**: futuras tandas pueden saltar a `aab-*` deliberadamente para marcar un hito (ej. "todos los componentes nivel 2 viven en `aab-*`"). Si no se decide saltar, el bloque siguiente arranca por overflow natural cuando `aaa-999` se llena.
- **Historial archivado más navegable**: `ls openspec/changes/archive/aaa-*` lista la primera tanda completa; `grep aaa-` filtra por bloque.
- **Convención alineada con OpenSpec CLI**: el CLI exige nombres lowercase kebab-case sin prefijo de mayúsculas; `aaa-NNN` cumple sin trabajo extra.

### Negativas / trade-offs aceptados

- **Migración única costosa**: ~30 archivos tocados (renames + edits + ADR + IDS rewrite). Mitigación: hecho en un solo commit transversal documentado.
- **Bloque inicial `aaa` mezcla bootstrap + primer batch de componentes**: el bloque no tiene significado temático retroactivo. Aceptable porque la agrupación es opcional. Si en el futuro Roman decide agrupar bootstrap como `aaa-*` y dejar `aab-*` para "primera tanda de componentes post-bootstrap", se puede decidir desde el próximo change (`aab-001`) — sin más renames retroactivos.
- **Lectura en voz alta menos natural**: "aaa-cero-cero-ocho" vs "CHG-008". Aceptable — el contexto escrito (markdown, código) es el caso de uso primario.
- **Menciones históricas en ADRs viejos**: ADR-006 y otros menciones a `CHG-001`, `CHG-003`, `CHG-004`, `SPC-001`, etc. quedan como están — son contexto inmutable del momento en que se escribieron. Un lector del repo cruzando un ADR viejo verá `CHG-NNN` ahí, pero la convención viva (este ADR-008 + IDS.md + CLAUDE.md) lo aclara. Igual que en ADR-007 las menciones a `rmd-` se preservaron como histórico.

### Acciones de seguimiento

- Próximo change del repo arranca con ID `aaa-008` en el frontmatter del `proposal.md`.
- Cuando se acerque `aaa-999` (probable que esté lejos), decidir si el bloque `aab` se reserva para un hito particular o queda como overflow puro. La decisión va en un ADR posterior si vale la pena, o en una sección del IDS.md.
- Si se decide en el futuro agrupar temáticamente bloques desde cero (ej. retroactivamente reorganizar archivado en `aaa-*`=bootstrap, `aab-*`=componentes nivel 1, etc.), eso requiere un nuevo ADR que reemplace o complemente este.

## Nota de scope (2026-06-08)

Este ADR documenta el **evento histórico de migración** `CHG-NNN`/`SPC-NNN` → `aaa-NNN`/specs-sin-ID que ocurrió el 2026-06-06. Ese evento sí fue una decisión arquitectónica del repo: tocó ~30 archivos, renames físicos, frontmatters, docs y refs cruzadas.

La **convención viva y futura** (formato `aaa-NNN`, frontmatter de change/spec, paths, próximo ID disponible) se considera **operativa del tool OpenSpec, no decisión arquitectónica del producto** y vive en [`openspec/README.md`](../../../openspec/README.md). Si en el futuro la convención evoluciona sin un evento de migración masivo del repo, ese cambio NO genera ADR nuevo: solo se actualiza `openspec/README.md`. Esta clarificación se decidió al borrar `openspec/IDS.md` en commit posterior a este ADR.
