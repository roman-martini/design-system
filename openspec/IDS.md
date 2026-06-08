# OpenSpec — Catálogo de Changes

Tabla de referencia de **Changes** del repo. Las **specs** ya no usan IDs: se identifican por su nombre de carpeta en `openspec/specs/<name>/` (ver [`docs/architecture/README.md`](../docs/architecture/README.md) sección "Catálogo de Specs").

Decisión formal: [ADR-008 — Convención de IDs de OpenSpec](../docs/architecture/adr/ADR-008-convencion-ids-openspec.md).

---

## Convención

### Formato de IDs de Changes

`<bloque>-<numero>` donde:

- **`<bloque>`**: 3 letras lowercase (`aaa`, `aab`, `aac`, …).
- **`<numero>`**: 3 dígitos (`001` a `999`).

Cuando `<bloque>-999` se llena, el siguiente change arranca el bloque siguiente (`aaa-999` → `aab-001`). Los bloques pueden agruparse retroactivamente por hitos (ej. `aaa-*` = bootstrap + primera tanda de componentes), pero **no es obligatorio** — el bloque puede ser puramente mecánico de overflow.

### Paths

- **Change activo**: `openspec/changes/<kebab-name>/` (sin prefijo en el path). El ID vive solo en el frontmatter `proposal.md`.
- **Change archivado**: `openspec/changes/archive/<id>-<kebab-name>/` (path con prefijo de ID + kebab name).
- **Spec base**: `openspec/specs/<kebab-name>/spec.md`. **Sin ID** ni en path ni en frontmatter.

### Frontmatter de un change

```yaml
---
id: aaa-NNN
name: <kebab-name>
type: change
status: active | proposed | archived | deprecated
archived: YYYY-MM-DD # solo si status=archived
introduces-specs: # solo en changes que crean specs base nuevas
  - <spec-name>
modifies-specs: # solo en changes que modifican specs base existentes
  - <spec-name> (opcional detalle entre paréntesis)
related-adrs: # ADRs vinculados (existentes y nuevos)
  - ADR-NNN
---
```

### Frontmatter de una spec

```yaml
---
name: <kebab-name>
type: spec
status: active | deprecated
created: YYYY-MM-DD
---
```

### Reglas

- Los **IDs de change son permanentes**. Un change reemplazado mantiene su ID; el reemplazo recibe el siguiente disponible.
- Los **paths NO cambian** mientras el change está activo. Al archivarlo, el directorio se renombra de `<name>` a `<id>-<name>` y se mueve a `archive/`.
- Las **specs no se reemplazan**: se modifican vía deltas en `openspec/changes/<change>/specs/<spec>/spec.md` (ADDED / MODIFIED / REMOVED / RENAMED Requirements). Al archivar, los deltas se promueven a la spec base.
- Una spec que pierde relevancia pasa a `status: deprecated` (no se borra).

---

## Changes

| ID          | Nombre                      | Estado   | Fecha archive | Specs introducidas / modificadas                                                               | ADRs relacionados                                                                                                                                                    | Path                                                                                                |
| ----------- | --------------------------- | -------- | ------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **aaa-001** | bootstrap-fase-1-monorepo   | archived | 2026-05-30    | [monorepo-structure](specs/monorepo-structure/spec.md)                                         | [ADR-001](../docs/architecture/adr/ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](../docs/architecture/adr/ADR-002-conventional-commits-changesets.md)              | [archive/aaa-001-bootstrap-fase-1-monorepo](changes/archive/aaa-001-bootstrap-fase-1-monorepo/)     |
| **aaa-002** | bootstrap-fase-2-tokens     | archived | 2026-05-31    | [design-tokens-package](specs/design-tokens-package/spec.md)                                   | [ADR-003](../docs/architecture/adr/ADR-003-arquitectura-design-tokens.md)                                                                                            | [archive/aaa-002-bootstrap-fase-2-tokens](changes/archive/aaa-002-bootstrap-fase-2-tokens/)         |
| **aaa-003** | bootstrap-fase-3-components | archived | 2026-05-31    | [components-package](specs/components-package/spec.md)                                         | [ADR-004](../docs/architecture/adr/ADR-004-arquitectura-components.md)                                                                                               | [archive/aaa-003-bootstrap-fase-3-components](changes/archive/aaa-003-bootstrap-fase-3-components/) |
| **aaa-004** | bootstrap-fase-4-playground | archived | 2026-06-01    | [playground-app](specs/playground-app/spec.md)                                                 | [ADR-005](../docs/architecture/adr/ADR-005-arquitectura-playground.md)                                                                                               | [archive/aaa-004-bootstrap-fase-4-playground](changes/archive/aaa-004-bootstrap-fase-4-playground/) |
| **aaa-005** | bootstrap-fase-5-ci         | archived | 2026-06-01    | [ci-cd-pipeline](specs/ci-cd-pipeline/spec.md)                                                 | [ADR-006](../docs/architecture/adr/ADR-006-estrategia-ci-cd.md)                                                                                                      | [archive/aaa-005-bootstrap-fase-5-ci](changes/archive/aaa-005-bootstrap-fase-5-ci/)                 |
| **aaa-006** | components-add-checkbox     | archived | 2026-06-01    | modifica [components-package](specs/components-package/spec.md)                                | [ADR-004](../docs/architecture/adr/ADR-004-arquitectura-components.md)                                                                                               | [archive/aaa-006-components-add-checkbox](changes/archive/aaa-006-components-add-checkbox/)         |
| **aaa-007** | components-unify-ds-prefix  | archived | 2026-06-04    | modifica [components-package](specs/components-package/spec.md)                                | [ADR-007](../docs/architecture/adr/ADR-007-naming-prefijos.md) (nuevo) + supersede parcial de [ADR-004](../docs/architecture/adr/ADR-004-arquitectura-components.md) | [archive/aaa-007-components-unify-ds-prefix](changes/archive/aaa-007-components-unify-ds-prefix/)   |
| **aaa-008** | components-add-radio        | archived | 2026-06-08    | modifica [components-package](specs/components-package/spec.md) (ADDED DsRadio + DsRadioGroup) | [ADR-004](../docs/architecture/adr/ADR-004-arquitectura-components.md), [ADR-007](../docs/architecture/adr/ADR-007-naming-prefijos.md)                               | [archive/aaa-008-components-add-radio](changes/archive/aaa-008-components-add-radio/)               |

**Próximo ID disponible**: `aaa-009`.

---

## Cómo actualizar este archivo

Cada vez que:

1. **Se crea un change nuevo** → agregar fila en la tabla con `status: active`, `Fecha archive: —`, `Path: changes/<name>/`. Actualizar "Próximo ID disponible" al siguiente.
2. **Se archiva un change** → cambiar `status` a `archived`, completar `Fecha archive`, mover path a `changes/archive/<id>-<name>/`.
3. **Se deprecia una spec** → no aplica acá; vive en `openspec/specs/<name>/` con `status: deprecated`. Se referencia desde el change que la depreció.

Mantener el "Próximo ID disponible" actualizado siempre.

---

## Histórico de la convención

Hasta `aaa-007` el repo usó IDs `CHG-NNN` para changes y `SPC-NNN` para specs (rango único de 999 changes). El rebrand a `aaa-NNN` + drop de IDs en specs ocurrió en commit directo + [ADR-008](../docs/architecture/adr/ADR-008-convencion-ids-openspec.md) (sin pasar por el flujo OpenSpec porque el cambio es de convención del propio sistema OpenSpec — usar OpenSpec para definirlo sería paradójico).
