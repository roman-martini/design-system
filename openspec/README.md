# OpenSpec — Convenciones del repo

Documento **operativo** del tool OpenSpec en este repo. No es decisión arquitectónica: cubre formato de IDs, frontmatter, paths y workflow del propio sistema de gobernanza.

Para el **catálogo histórico de changes y specs**, ver [`docs/architecture/README.md`](../docs/architecture/README.md) §§ "Catálogo de Specs" y "Catálogo de Changes".

---

## IDs de Changes

### Formato

`<bloque>-<numero>` donde:

- `<bloque>`: 3 letras lowercase (`aaa`, `aab`, …, `zzz`).
- `<numero>`: 3 dígitos zero-padded (`001` a `999`).

Cuando `<bloque>-999` se llena, el siguiente change arranca el bloque siguiente (`aaa-999` → `aab-001`). Los bloques pueden agruparse retroactivamente por hitos (ej. `aaa-*` = bootstrap + primera tanda de componentes) o ser overflow mecánico — ambos válidos.

### Próximo ID disponible

**`aaa-037`**

Actualizar al crear un change nuevo.

### IDs en vuelo

IDs asignados a changes **no archivados** (en `changes/`). Al archivar un change, su línea se borra de acá — su historia queda en el catálogo de `docs/architecture/README.md` y en `archive/`. Esta lista audita el hueco entre el último ID archivado y el próximo disponible; no es un historial.

> `aaa-012` asignado a `tokens-figma-export` (status `proposed`; genera ADR-009).

### Specs sin IDs

Las specs se identifican únicamente por su nombre de carpeta (`openspec/specs/<name>/`). No tienen `id` en frontmatter ni prefijo en el path. Cualquier change refiere a la spec por su nombre (`introduces-specs: - components-package`).

### Dónde va el delta de un change de componente (ADR-018)

Desde `aaa-030`, las specs del kit se organizan como una capability **transversal** (`components-package`: identidad, peer deps, build, naming, disabled accesible, iconografía) más una **por componente** (`component-<name>`). Un change:

- de un componente **nuevo** → `introduces-specs: component-<name>` con delta `ADDED`;
- de un componente **existente** → `modifies-specs: component-<name>` con delta `MODIFIED`;
- que cambia algo **transversal** (peer dep, build, una convención cross-cutting) → `modifies-specs: components-package`.

Regla de partición (ADR-018): un requirement es transversal si gobierna el package o ≥2 componentes; es per-componente si gobierna exactamente uno.

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
---
```

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

1. **Crear change**: `pnpm openspec new change <kebab-name>` o equivalente. Asignar ID en frontmatter (próximo disponible arriba). Actualizar en este README el próximo ID y la lista de IDs en vuelo.
2. **Generar artifacts** (proposal, design opcional, specs delta, tasks). Validar con `pnpm openspec validate --changes`.
3. **Apply**: implementar tasks marcando checkboxes. Última task siempre es "proponer mensaje de commit y esperar OK del usuario".
4. **Archivar**: mover dir a `archive/<id>-<name>/`, sincronizar spec base con deltas, borrar la línea del change de "IDs en vuelo" en este README, agregar fila al catálogo histórico en `docs/architecture/README.md`.

---

## Histórico del rebrand `CHG → aaa`

Hasta `aaa-007` el repo usó IDs `CHG-NNN` para changes y `SPC-NNN` para specs. El 2026-06-06 se migró todo a `aaa-NNN` y se eliminaron IDs de specs. El evento de migración (renames físicos, edits cruzados, ~30 archivos) está documentado en [ADR-008](../docs/architecture/adr/ADR-008-convencion-ids-openspec.md). La convención presente y futura vive aquí, no en un ADR — porque es operativa del tool OpenSpec, no decisión arquitectónica del producto.
