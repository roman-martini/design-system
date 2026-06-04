# OpenSpec — Convenciones del proyecto

Esta carpeta gestiona las propuestas de cambio del proyecto con [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## Estructura

```
openspec/
├── config.yaml          configuración global del proyecto
├── changes/             propuestas activas (en planificación o implementación)
│   └── <prefijo>-<NNN>-<slug>/
│       ├── proposal.md  qué y por qué
│       ├── design.md    cómo
│       ├── specs/       requisitos por capability
│       └── tasks.md     checklist de implementación
├── specs/               specs archivadas (fuente de verdad consolidada)
└── changes/archive/     cambios completados (`<prefijo>-<NNN>-<slug>/`)
```

## Convención de naming

**Formato**: `<prefijo>-<NNN>-<slug>`

- `<prefijo>` = 3 letras minúsculas. Bucket de auto-ordenamiento que crece
  lexicográficamente (`aaa` → `aab` → `aac` → ... → `aaz` → `aba` → ...).
  Sin semántica obligatoria — es solo un mecanismo para que `ls` mantenga el
  orden cronológico de creación.
- `<NNN>` = número secuencial zero-padded dentro del prefijo (`001` → `999`).
- `<slug>` = nombre descriptivo del cambio en kebab-case.

**Ejemplos válidos:**
- `aaa-001-pre-refactor-cleanup`
- `aaa-014-refactor-button-component`
- `aaa-023-refactor-filter-bar`
- `aab-001-card-ghost-variant` (cuando arrancamos un prefijo nuevo)

**Ejemplos inválidos:**
- `AAA-001-...` (mayúsculas)
- `aaa-1-...` (sin zero-padding)
- `001-...` (sin prefijo)
- `pre-refactor-cleanup` (sin ID)
- `aaa-1000-...` (excede 3 dígitos — pasar al siguiente prefijo)

### Cuándo cambia el prefijo

Al agotar `999` dentro del prefijo actual (`aaa-999` → `aab-001`). No hay
otra regla obligatoria. Si en algún momento se quiere usar el prefijo como
agrupador semántico (épica, release, área del kit), queda como opción
futura — pero por defecto el prefijo es opaco.

### Por qué este formato

| Elección | Rationale |
|----------|-----------|
| Prefijo de letras | `ls openspec/changes/archive/` ordena por orden de creación sin necesidad de mirar fechas, porque las letras incrementan lexicográficamente |
| Secuencia por prefijo | Permite hasta 999 changes por prefijo. Si en el futuro el prefijo gana semántica (épica, release), el contador no se agota globalmente |
| Zero-padding `NNN` | Mantiene orden alfabético correcto dentro del prefijo (ej: `aaa-002` antes que `aaa-010`) |
| Minúsculas | Coherencia con kebab-case de Angular/npm; evita problemas de case-sensitivity entre sistemas |
| Slug descriptivo | Self-documenting: ves `aaa-001-pre-refactor-cleanup` y sabés qué es sin abrir nada |

## Cómo asignar el próximo ID

1. Listar `openspec/changes/` y `openspec/changes/archive/`.
2. Filtrar entradas que matcheen `<prefijo>-<NNN>-<slug>`.
3. Encontrar el `<prefijo>-<NNN>` máximo lexicográficamente.
4. Sugerir el siguiente `<NNN>+1` dentro del mismo prefijo.
5. Si `NNN` llega a `999`, pasar al siguiente prefijo (`aab-001`).
6. Si no hay ningún change con el patrón todavía, arrancar en `aaa-001`.

> **Nota**: OpenSpec no asigna IDs automáticamente. La regla vive en este
> archivo y en `CLAUDE.md`. El skill `openspec-propose` viene del blueprint
> upstream y no se modifica — Claude aplica la convención antes de
> invocarlo.

## Referencia en commits

Agregar el ID del change al final del subject del commit, entre paréntesis:

```
chore(theming): resuelve TODOs en primitive colors (aaa-011)
feat(button)!: pilot pattern + tokens en capas (aaa-014)
```

Esto permite tracear fácilmente qué commits pertenecen a qué change al
revisar `git log`.

## Comandos OpenSpec

```bash
/opsx:propose       # crear nueva propuesta (con nombre <prefijo>-<NNN>-<slug>)
/opsx:explore       # explorar idea antes de comprometerse
/opsx:apply         # ejecutar las tareas del change activo
/opsx:archive       # archivar change finalizado
openspec status     # ver estado de un change
openspec list       # listar todos los changes
```
