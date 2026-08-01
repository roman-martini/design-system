# OpenSpec — Convenciones del repo

Documento **operativo** del tool OpenSpec en este repo. No es decisión arquitectónica: cubre formato de IDs, frontmatter, paths y workflow del propio sistema de gobernanza.

Para el **catálogo histórico de changes y specs**, ver [`docs/architecture/catalog.md`](../docs/architecture/catalog.md).

> **README ↔ `config.yaml`**: las convenciones que el CLI inyecta al generar artefactos (`context` + `rules` por artefacto, vía `openspec instructions`) viven en [`config.yaml`](config.yaml). Este README y ese config se solapan a propósito — este documenta para humanos/Claude, aquel alimenta al CLI. Si cambiás una convención en uno, sincronizá el otro.

---

## IDs de Changes

### Formato

`<bloque>-<numero>` donde:

- `<bloque>`: 3 letras lowercase (`aaa`, `aab`, …, `zzz`).
- `<numero>`: 3 dígitos zero-padded (`001` a `999`).

Cuando `<bloque>-999` se llena, el siguiente change arranca el bloque siguiente (`aaa-999` → `aab-001`). Los bloques pueden agruparse retroactivamente por hitos (ej. `aaa-*` = bootstrap + primera tanda de componentes) o ser overflow mecánico — ambos válidos.

> Los IDs `CHG-NNN`/`SPC-NNN` que aparecen en ADRs tempranos y en el archive previo a `aaa-007` son la nomenclatura anterior al rebrand del 2026-06-06 ([ADR-008](../docs/architecture/adr/ADR-008-convencion-ids-openspec.md)); esos textos son inmutables y no se reescriben.

### Próximo ID disponible

**`aaa-046`**

Actualizar al crear un change nuevo.

### IDs en vuelo

IDs asignados a changes **no archivados** (en `changes/`). Al archivar un change, su línea se borra de acá — su historia queda en el catálogo de `docs/architecture/catalog.md` y en `archive/`. Esta lista audita el hueco entre el último ID archivado y el próximo disponible; no es un historial.

> `aaa-045` asignado a `components-fix-menu` (status `proposed`; primer change de la Parte G de la review integral 2026-07-26).
>
> `aaa-012` asignado a `tokens-figma-export` (status `proposed`; genera ADR-009).
>
> ⏸️ **En pausa desde el 2026-07-03 por decisión del PO**, ratificada por [D-027](../docs/product/decisiones.md): el change queda activo acá con sus 4 artefactos intactos, pero **no se debe aplicar**. Sus 29 tasks están sin ejecutar a propósito — que estén "listas para apply" no es una invitación. Condición de reactivación: que el PO lo pida explícitamente; su validación final depende además de conectar Tokens Studio en Figma, trabajo del PO. Coordinar con la migración a formato DTCG de la fuente de tokens ([D-024](../docs/product/decisiones.md)).

### Specs sin IDs

Las specs se identifican únicamente por su nombre de carpeta (`openspec/specs/<name>/`). No tienen `id` en frontmatter ni prefijo en el path. Cualquier change refiere a la spec por su nombre (`introduces-specs: - components-package`).

### Dónde va el delta de un change de componente (ADR-018)

Desde `aaa-030`, las specs del kit se organizan como una capability **transversal** (`components-package`: identidad, peer deps, build, naming, disabled accesible, iconografía) más una **por componente** (`component-<name>`). Un change:

- de un componente **nuevo** → `introduces-specs: component-<name>` con delta `ADDED`;
- de un componente **existente** → `modifies-specs: component-<name>` con delta `MODIFIED`;
- que cambia algo **transversal** (peer dep, build, una convención cross-cutting) → `modifies-specs: components-package`.

Regla de partición (ADR-018): un requirement es transversal si gobierna el package o ≥2 componentes; es per-componente si gobierna exactamente uno.

---

## Referencias dentro de artefactos de change

Los artefactos de un change (`proposal.md`, `design.md`, `tasks.md`, deltas de spec) **NO usan links markdown relativos**. Referencian por **ID**.

**Por qué**: los changes se mueven al archivarse (`changes/<name>/` → `changes/archive/<id>-<name>/`), lo que baja un nivel toda ruta relativa y rompe cada link. No es hipotético: el 2026-07-28 se corrigieron **110 links rotos** en 56 archivos, acumulados en 37 changes archivados — ninguno resolvía. Los IDs no dependen de dónde viva el archivo.

Esto **no aplica a `docs/`** (ADRs, producto, backlog, arquitectura), donde los links markdown sí se usan: esos archivos no se mueven.

| Destino                       | Cómo se referencia                                 |
| ----------------------------- | -------------------------------------------------- |
| ADR                           | `ADR-021`                                          |
| Decisión de producto          | `D-028`                                            |
| HU / épica                    | `HU-022`, `EP-003`                                 |
| Criterio de aceptación        | `CA-018.3`                                         |
| Otro change                   | `aaa-037`                                          |
| Spec                          | por su nombre de carpeta (`components-package`)    |
| Archivo sin ID (código, docs) | el path desde el root del repo, en `código inline` |

```markdown
<!-- bien -->

Lockstep (ADR-015); ejecuta D-014. Evidencia en `docs/reviews/2026-07-26-review-integral/hallazgos.md`.

<!-- mal: se rompe al archivar -->

Lockstep ([ADR-015](../../../docs/architecture/adr/ADR-015-versionado-lockstep.md)).
```

---

## Paths

| Estado           | Ubicación                                                                        |
| ---------------- | -------------------------------------------------------------------------------- |
| Change activo    | `openspec/changes/<kebab-name>/` (sin prefijo de ID — el ID vive en frontmatter) |
| Change archivado | `openspec/changes/archive/<id>-<kebab-name>/` (rename al archivar)               |
| Spec base        | `openspec/specs/<kebab-name>/spec.md`                                            |

---

## Frontmatter

### Change (`proposal.md`)

> **Un change en curso usa `status: proposed`, no `active`.** No es cosmético: `openspec validate --all` —el step de `pr.yml`— **solo descubre los changes en `proposed`**. Con `status: active` el change se valida si se lo nombra (`openspec validate <name>`) y aparece en `openspec list`, pero el gate de CI lo ignora en silencio. Verificado el 2026-07-31 al crear `aaa-042`.

```yaml
---
id: aaa-NNN
name: <kebab-name>
type: change
status: active | proposed | archived | deprecated
archived: YYYY-MM-DD # solo si status=archived
modifies-specs: # opcional
  - <spec-name> (opcional detalle entre paréntesis)
introduces-specs: # opcional
  - <spec-name>
related-adrs: # opcional
  - ADR-NNN
related-decisions: # opcional — decisiones de producto (docs/product/decisiones.md)
  - D-NNN
---
```

`related-decisions` enlaza el change con las decisiones de producto que lo originan o lo condicionan, y es lo que hace bidireccional la trazabilidad **HU/decisión ↔ change**. Se usa desde `aaa-031`.

### Spec base (`spec.md`)

```yaml
---
name: <kebab-name>
type: spec
status: active | deprecated
created: YYYY-MM-DD
---
```

---

## Reglas

- Los **IDs de change son permanentes**. Si un change se reemplaza, el ID original NO se reutiliza; el reemplazo recibe el siguiente disponible.
- Los **paths no cambian** mientras el change está activo. Al archivarlo, el directorio se renombra de `<name>` a `<id>-<name>` y se mueve a `archive/`.
- Las **specs no se reemplazan**: se modifican vía deltas en `openspec/changes/<change>/specs/<spec>/spec.md` (`ADDED` / `MODIFIED` / `REMOVED` / `RENAMED Requirements`). Al archivar, los deltas se promueven a la spec base.
- Una spec que pierde relevancia pasa a `status: deprecated` (no se borra del filesystem).

---

## Workflow

1. **Crear change**: en la práctica se crea con `/opsx:propose <kebab-name>` (o a mano siguiendo la estructura de arriba). Asignar ID en frontmatter (próximo disponible arriba). Actualizar en este README el próximo ID y la lista de IDs en vuelo.
2. **Generar artifacts** (proposal, design opcional, specs delta, tasks). Validar con `pnpm openspec validate --changes`.
3. **Apply**: implementar tasks marcando checkboxes. Última task siempre es "proponer mensaje de commit y esperar OK del usuario".
4. **Archivar**: mover dir a `archive/<id>-<name>/`, sincronizar spec base con deltas, verificar que los artefactos no tengan links relativos (ver § "Referencias dentro de artefactos de change" — es lo que el movimiento rompe), borrar la línea del change de "IDs en vuelo" en este README, agregar fila al catálogo histórico en `docs/architecture/catalog.md`. Ver el [checklist completo de archive](../docs/product/README.md#checklist-de-archive) — incluye los registros de producto y el gate visual del PO ([D-022](../docs/product/decisiones.md)).

> El CLI es **`@fission-ai/openspec`**, pinneado como devDependency del root (`aaa-039`): se invoca con `pnpm openspec <cmd>` o `pnpm exec openspec <cmd>`, y así queda bajo `pnpm install --frozen-lockfile` igual que el resto del toolchain.
>
> **No usar `npx --yes openspec`**: el package `openspec` del registry de npm es un placeholder de 2019 sin ejecutable, no este CLI. Localmente el comando parecía funcionar solo porque el binario estaba instalado global; en CI nunca validó nada.

### `.openspec.yaml` — marker opcional

Algunos changes tienen un `.openspec.yaml` (`schema: spec-driven` + `created:`) y otros no: lo genera el scaffold del CLI cuando el change se crea con `openspec new change`, y falta en los creados a mano. **No es requerido**: `openspec validate --all` descubre y valida los changes sin él (verificado el 2026-07-27 sobre `tokens-figma-export`, que no lo tiene). No hace falta backfillearlo; si está, se preserva al archivar. Desde el CLI 1.7.0 admite `skip_specs: true` para changes que intencionalmente no tocan specs (tooling, docs, refactor puro) — sin eso, `validate` exige al menos un delta.
