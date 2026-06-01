# OpenSpec — Índice maestro de IDs

Tabla de referencia de **Changes** (`CHG-NNN`) y **Specs** (`SPC-NNN`) del repo. Ver convención en [`CLAUDE.md → Fuentes de verdad`](../CLAUDE.md).

Los IDs son **permanentes**. Los paths de los directorios llevan el ID al inicio (`CHG-001-<name>`, `SPC-001-<name>`) y el frontmatter YAML del `proposal.md` / `spec.md` repite el ID para que sea parseable.

## Changes

| ID          | Nombre                      | Estado   | Fecha archive | Specs introducidas                                     | ADRs relacionados                                                                                                                                       | Path                                                                                                |
| ----------- | --------------------------- | -------- | ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **CHG-001** | bootstrap-fase-1-monorepo   | archived | 2026-05-30    | [SPC-001](specs/SPC-001-monorepo-structure/spec.md)    | [ADR-001](../docs/architecture/adr/ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](../docs/architecture/adr/ADR-002-conventional-commits-changesets.md) | [archive/CHG-001-bootstrap-fase-1-monorepo](changes/archive/CHG-001-bootstrap-fase-1-monorepo/)     |
| **CHG-002** | bootstrap-fase-2-tokens     | archived | 2026-05-31    | [SPC-002](specs/SPC-002-design-tokens-package/spec.md) | [ADR-003](../docs/architecture/adr/ADR-003-arquitectura-design-tokens.md)                                                                               | [archive/CHG-002-bootstrap-fase-2-tokens](changes/archive/CHG-002-bootstrap-fase-2-tokens/)         |
| **CHG-003** | bootstrap-fase-3-components | archived | 2026-05-31    | [SPC-003](specs/SPC-003-components-package/spec.md)    | [ADR-004](../docs/architecture/adr/ADR-004-arquitectura-components.md)                                                                                  | [archive/CHG-003-bootstrap-fase-3-components](changes/archive/CHG-003-bootstrap-fase-3-components/) |
| **CHG-004** | bootstrap-fase-4-playground | archived | 2026-06-01    | [SPC-004](specs/SPC-004-playground-app/spec.md)        | [ADR-005](../docs/architecture/adr/ADR-005-arquitectura-playground.md)                                                                                  | [archive/CHG-004-bootstrap-fase-4-playground](changes/archive/CHG-004-bootstrap-fase-4-playground/) |

**Próximo ID disponible**: `CHG-005`.

## Specs

| ID          | Nombre                | Estado | Introducida por                                                 | Path                                                                                       |
| ----------- | --------------------- | ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **SPC-001** | monorepo-structure    | active | [CHG-001](changes/archive/CHG-001-bootstrap-fase-1-monorepo/)   | [specs/SPC-001-monorepo-structure/spec.md](specs/SPC-001-monorepo-structure/spec.md)       |
| **SPC-002** | design-tokens-package | active | [CHG-002](changes/archive/CHG-002-bootstrap-fase-2-tokens/)     | [specs/SPC-002-design-tokens-package/spec.md](specs/SPC-002-design-tokens-package/spec.md) |
| **SPC-003** | components-package    | active | [CHG-003](changes/archive/CHG-003-bootstrap-fase-3-components/) | [specs/SPC-003-components-package/spec.md](specs/SPC-003-components-package/spec.md)       |
| **SPC-004** | playground-app        | active | [CHG-004](changes/archive/CHG-004-bootstrap-fase-4-playground/) | [specs/SPC-004-playground-app/spec.md](specs/SPC-004-playground-app/spec.md)               |

**Próximo ID disponible**: `SPC-005`.

## Convención

- **IDs son permanentes**. Si un change se reemplaza o un spec se deprecia, el ID original no se reutiliza; el nuevo recibe el siguiente disponible.
- **Paths incluyen el ID al inicio**: `openspec/specs/SPC-NNN-<name>/` y `openspec/changes/archive/CHG-NNN-<name>/`. Los changes activos (no archivados) viven en `openspec/changes/CHG-NNN-<name>/`.
- **Frontmatter YAML al inicio** del `proposal.md` (para changes) y `spec.md` (para specs):

```yaml
---
id: CHG-NNN # o SPC-NNN
name: <kebab-case> # nombre sin prefijo de ID (lo que va después del CHG-NNN-)
type: change # o "spec"
status: active | proposed | archived | deprecated
archived: YYYY-MM-DD # solo si status=archived
introduces-specs: # solo en changes — IDs de specs que introduce/modifica
  - SPC-NNN (nombre)
related-adrs: # ADRs que documentan decisiones de este change
  - ADR-NNN
---
```

- **Cuando se crea un change nuevo** (`openspec new change <name>`):
  1. Crear el directorio con el siguiente `CHG-NNN` al inicio: `openspec/changes/CHG-NNN-<name>/`.
  2. Agregar el frontmatter manualmente en `proposal.md` (OpenSpec scaffold no lo genera).
  3. Actualizar este archivo `IDS.md` con la nueva fila + actualizar "Próximo ID disponible".
- **Cuando un change introduce una spec base nueva** al archivar: la spec recibe el siguiente `SPC-NNN`, su directorio se crea como `openspec/specs/SPC-NNN-<name>/`, y se actualiza esta tabla.

## Cómo actualizar este archivo

Cada vez que:

1. Se crea un change nuevo → agregar fila en sección Changes con `status: active`.
2. Se archiva un change → cambiar `status` a `archived`, agregar `Fecha archive`, mover path de `changes/` a `changes/archive/`.
3. Una spec base se crea/promueve → agregar fila en sección Specs.
4. Una spec se deprecia → `status: deprecated` (no eliminar la fila).

Mantener el "Próximo ID disponible" actualizado en cada sección.
