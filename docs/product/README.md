# Gestión de producto — guía del espacio de trabajo

Cómo se organizan y gestionan épicas, historias de usuario (HU) y decisiones de producto en este repositorio.

## El producto

**El design system `@romanmartinidev`**: librerías de arquitectura frontend publicables a npm — `@romanmartinidev/tokens` (design tokens con theming) y `@romanmartinidev/components` (componentes Angular) — más `apps/playground` como laboratorio interno y plataforma de prototipado.

**Actores**:

| Actor              | Quién es                                                                                         | Qué valor recibe                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Dev consumidor** | Quien instala las libs en una app Angular (hoy: Roman en sus proyectos; el scope npm es público) | UI consistente, accesible y tokenizada sin construirla desde cero                                         |
| **Diseñador**      | Quien trabaja el visual en Figma                                                                 | Los mismos tokens del código como Variables de Figma (una sola fuente de verdad)                          |
| **Mantenedor**     | Roman como autor del DS                                                                          | Un repo gobernado (specs, ADRs, changes) que escala ordenado y se puede retomar tras semanas sin contexto |

## Origen del producto

Conservado para trazabilidad — el pedido original ([docs/reference/contexto_inicial.md](../reference/contexto_inicial.md), 2026-05-29):

> Este proyecto lo voy a utilizar para desarrollar librerías. Las librerías solo van a tener alcance de arquitecturas frontend. […] `packages/tokens`: es un sistema de diseño […] `packages/components`: debe ser una librería de componentes Angular, estos componentes utilizarán la librería `packages/tokens`. […] Una app para probar los componentes […] también se va a usar para crear prototipos de casos de uso reales.

El refinamiento (bootstrap aaa-001…aaa-005) consolidó el alcance en el monorepo actual. Este espacio de producto se creó el 2026-07-10 y las épicas se definieron **retro-mapeando el valor ya entregado** (12 changes archivados) más el pendiente (BACKLOG + el entonces `FUTURE-WORK.md`, fusionado el 2026-07-20 en la Cantera del BACKLOG, que a su vez fue reemplazada por el [intake](intake/README.md) el 2026-07-26).

## Estructura

```
docs/product/
├── README.md          ← esta guía + índice de épicas + tabla de HUs + roadmap
├── decisiones.md      ← registro de decisiones de producto (D-XXX), append-only
├── intake/            ← ideas en exploración, antes de comprometerlas (D-019)
├── templates/         ← plantillas para crear épicas, HUs y requerimientos
└── epics/
    └── EP-XXX-nombre-corto/    ← una carpeta por épica, autocontenida
        ├── EP-XXX-nombre-corto.md  ← el documento de la épica (homónimo a la carpeta)
        └── HU-XXX-*.md         ← las HUs de esa épica, al lado
```

Principio: **todo lo que pertenece a una épica vive en su carpeta**. Lo que cruza épicas (decisiones, plantillas, esta guía) vive en la raíz de `docs/product/`.

## Cómo encaja con la gobernanza existente (no mezclar)

Este espacio responde **por qué y para quién** — no reemplaza a ninguna fuente de verdad existente:

| Artefacto                                  | Responde                                          | Relación con producto                                         |
| ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| `docs/product/` (HUs, épicas, D-XXX)       | ¿Qué valor, para qué actor, por qué ahora?        | Una HU Refinada se **ejecuta** vía uno o más changes OpenSpec |
| `openspec/changes/` (`aaa-NNN`)            | ¿Cómo se ejecuta un cambio significativo?         | El change referencia la HU que materializa (si existe)        |
| `openspec/specs/`                          | ¿Qué debe hacer el sistema? (contratos testables) | Los CAs de una HU se vuelven scenarios de spec al implementar |
| `docs/architecture/adr/`                   | ¿Por qué esta decisión técnica?                   | Las D-XXX son de **producto/negocio**; lo técnico va a ADR    |
| [`docs/backlog/`](../backlog/BACKLOG.md)   | Cola operativa con disparadores (Now/Next/Later)  | El roadmap de producto se materializa como items del backlog  |
| [`docs/product/intake/`](intake/README.md) | ¿Qué ideas están en exploración, sin comprometer? | Un intake se promueve a épica/HU y ahí se borra (D-019)       |

## Índice de épicas

| ID                                                                         | Épica                         | Actor principal             | HUs                                      | Estado                                                                    |
| -------------------------------------------------------------------------- | ----------------------------- | --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| [EP-001](epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md)     | Fundamentos: tokens y theming | Dev consumidor              | 004, 018                                 | En desarrollo (base entregada)                                            |
| [EP-002](epics/EP-002-kit-componentes/EP-002-kit-componentes.md)           | Kit de componentes Angular    | Dev consumidor              | 003, 005–010, 012–017, 019–025, 033, 034 | En desarrollo (tandas 1-2 completas; tanda 3 en 6/7, falta Slider)        |
| [EP-003](epics/EP-003-consumo-distribucion/EP-003-consumo-distribucion.md) | Consumo y distribución        | Dev consumidor              | 002                                      | En desarrollo (0.2.0 en npm; su bundle violaba APF, corregido en aaa-038) |
| [EP-004](epics/EP-004-puente-codigo-diseno/EP-004-puente-codigo-diseno.md) | Puente código ↔ diseño        | Diseñador                   | 001                                      | En refinamiento (aaa-012 activo y pausado, D-027)                         |
| [EP-005](epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md)   | Calidad profesional           | Mantenedor                  | 026–032                                  | En desarrollo (gates de D-021 en 1/7: HU-032 Hecha)                       |
| [EP-006](epics/EP-006-playground/EP-006-playground.md)                     | Playground                    | Dev consumidor              | 011, 035, 036                            | En desarrollo (HU-011 Hecha 2026-07-19)                                   |
| [EP-007](epics/EP-007-template-lume/EP-007-template-lume.md)               | Template-lume                 | Dev consumidor · Mantenedor | 037–040                                  | Identificada (creada 2026-07-26 por D-020)                                |

Próximos IDs libres: **EP-008**, **HU-041**, **D-029**.

## Tabla de HUs

Vista global del avance, pedida por [D-019](decisiones.md) — antes el estado de una HU solo se veía entrando a su épica. El detalle (fecha, change, artefactos generados) vive en el frontmatter de cada HU; acá está lo escaneable.

| HU                                                                             | Título                                 | Épica  | Estado                        |
| ------------------------------------------------------------------------------ | -------------------------------------- | ------ | ----------------------------- |
| [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md)          | Tokens como Variables de Figma         | EP-004 | Refinada — en pausa           |
| [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md)       | Primer release publicado en npm        | EP-003 | Hecha (2026-07-18)            |
| [HU-003](epics/EP-002-kit-componentes/HU-003-select-formularios.md)            | Select/Combobox para formularios       | EP-002 | Hecha (2026-07-11)            |
| [HU-004](epics/EP-001-fundamentos-tokens/HU-004-contraste-aa-tokens.md)        | Tokens interactivos con contraste AA   | EP-001 | Hecha (2026-07-11)            |
| [HU-005](epics/EP-002-kit-componentes/HU-005-input-textfield.md)               | Input/TextField                        | EP-002 | Hecha (2026-07-11)            |
| [HU-006](epics/EP-002-kit-componentes/HU-006-tabs-navegacion.md)               | Tabs de navegación de contenido        | EP-002 | Hecha (2026-07-14)            |
| [HU-007](epics/EP-002-kit-componentes/HU-007-tooltip.md)                       | Tooltip de ayuda contextual            | EP-002 | Hecha (2026-07-18)            |
| [HU-008](epics/EP-002-kit-componentes/HU-008-toast-notificaciones.md)          | Toast para feedback asíncrono          | EP-002 | Hecha (2026-07-18)            |
| [HU-009](epics/EP-002-kit-componentes/HU-009-spinner.md)                       | Spinner de carga                       | EP-002 | Hecha (2026-07-19)            |
| [HU-010](epics/EP-002-kit-componentes/HU-010-skeleton.md)                      | Skeleton de contenido en carga         | EP-002 | Hecha (2026-07-19)            |
| [HU-011](epics/EP-006-playground/HU-011-showcase-componentes.md)               | Showcase navegable del playground      | EP-006 | Hecha (2026-07-19)            |
| [HU-012](epics/EP-002-kit-componentes/HU-012-menu-dropdown.md)                 | Menu/Dropdown de acciones              | EP-002 | Hecha (2026-07-19)            |
| [HU-013](epics/EP-002-kit-componentes/HU-013-accordion.md)                     | Accordion colapsable                   | EP-002 | Hecha (2026-07-20)            |
| [HU-014](epics/EP-002-kit-componentes/HU-014-breadcrumbs.md)                   | Breadcrumbs de ubicación               | EP-002 | Hecha (2026-07-20)            |
| [HU-015](epics/EP-002-kit-componentes/HU-015-pagination.md)                    | Pagination de listados                 | EP-002 | Hecha (2026-07-20)            |
| [HU-016](epics/EP-002-kit-componentes/HU-016-progress.md)                      | Progress de avance medible             | EP-002 | Hecha (2026-07-20)            |
| [HU-017](epics/EP-002-kit-componentes/HU-017-button-loading.md)                | Estado loading de Button               | EP-002 | Hecha (2026-07-22)            |
| [HU-018](epics/EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md)  | Tokens aditivos del research Atlassian | EP-001 | Identificada — 1/3 cerrado    |
| [HU-019](epics/EP-002-kit-componentes/HU-019-card.md)                          | Card contenedor                        | EP-002 | Hecha (2026-07-22)            |
| [HU-020](epics/EP-002-kit-componentes/HU-020-button-outline-destructive.md)    | Variantes outline y danger de Button   | EP-002 | Hecha (2026-07-22)            |
| [HU-021](epics/EP-002-kit-componentes/HU-021-badge.md)                         | Badge de estado                        | EP-002 | Hecha (2026-07-22)            |
| [HU-022](epics/EP-002-kit-componentes/HU-022-avatar.md)                        | Avatar y grupo de avatares             | EP-002 | Hecha (2026-07-26)            |
| [HU-023](epics/EP-002-kit-componentes/HU-023-switch.md)                        | Switch/Toggle                          | EP-002 | Hecha (2026-07-23)            |
| [HU-024](epics/EP-002-kit-componentes/HU-024-textarea.md)                      | Textarea                               | EP-002 | Hecha (2026-07-26)            |
| [HU-025](epics/EP-002-kit-componentes/HU-025-slider.md)                        | Slider (range)                         | EP-002 | Identificada — cierra tanda 3 |
| [HU-026](epics/EP-005-calidad-profesional/HU-026-coverage-typecheck-ci.md)     | Coverage y typecheck en CI             | EP-005 | Refinada (2026-07-26)         |
| [HU-027](epics/EP-005-calidad-profesional/HU-027-gate-contraste-aa-ci.md)      | Gate de contraste WCAG AA en CI        | EP-005 | Refinada (2026-07-26)         |
| [HU-028](epics/EP-005-calidad-profesional/HU-028-a11y-automatizada-axe.md)     | Accesibilidad automatizada con axe     | EP-005 | Refinada (2026-07-26)         |
| [HU-029](epics/EP-005-calidad-profesional/HU-029-angular-eslint.md)            | angular-eslint (templates y a11y)      | EP-005 | Refinada (2026-07-26)         |
| [HU-030](epics/EP-005-calidad-profesional/HU-030-bundle-size-budget.md)        | Presupuesto de tamaño de bundle        | EP-005 | Refinada (2026-07-26)         |
| [HU-031](epics/EP-005-calidad-profesional/HU-031-storybook-publicado.md)       | Storybook publicado                    | EP-005 | Refinada (2026-07-26)         |
| [HU-032](epics/EP-005-calidad-profesional/HU-032-audit-tokens-skill.md)        | Auditoría de consistencia de tokens    | EP-005 | **Hecha** (2026-07-27)        |
| [HU-033](epics/EP-002-kit-componentes/HU-033-ajuste-dimensional-referencia.md) | Ajuste dimensional a modern-minimal    | EP-002 | Identificada (2026-07-26)     |
| [HU-034](epics/EP-002-kit-componentes/HU-034-estetica-spinner.md)              | Refinamiento estético del Spinner      | EP-002 | Identificada (2026-07-26)     |
| [HU-035](epics/EP-006-playground/HU-035-interaction-tests-storybook.md)        | Interaction tests de overlays          | EP-006 | Refinada (2026-07-26)         |
| [HU-036](epics/EP-006-playground/HU-036-docs-tokens-storybook.md)              | Documentación de tokens en Storybook   | EP-006 | Refinada (2026-07-26)         |
| [HU-037](epics/EP-007-template-lume/HU-037-rename-theme-modern-minimal.md)     | Rename del theme a modern-minimal      | EP-007 | Refinada (2026-07-26)         |
| HU-038                                                                         | Research del sitio de referencia       | EP-007 | Identificada — sin archivo    |
| HU-039                                                                         | Inventario de componentes faltantes    | EP-007 | Identificada — sin archivo    |
| HU-040                                                                         | Web-page del template en el playground | EP-007 | Identificada — sin archivo    |

**Resumen sobre 40 HUs**: 23 Hechas, 10 Refinadas (una de ellas en pausa) y 7 Identificadas, tres de las cuales todavía no tienen archivo propio.

## Roadmap

Sin fechas: el avance lo marcan los **disparadores y las decisiones directas del PO** (D-015) y el orden operativo vive en [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md). El rumbo se expresa como **hitos de producto**, cada uno con su condición de salida binaria:

| Hito                                         | Qué lo compone                                                                                        | Condición de salida                                               | Estado                                                                                                                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — Kit mínimo viable para una app real** | Tanda 1 ([D-009](decisiones.md)) completa + tanda 2 ([D-011](decisiones.md)): HU-012…HU-016 (EP-002)  | Una app real se construye 100% con componentes del DS             | Tandas 1 y 2 completas (2026-07-20), tanda 3 en 6/7. **Cómo se verifica ya está decidido** ([D-023](decisiones.md)): un prototipo de la referencia `modern-minimal` en el playground al cerrar HU-025, no un checklist de componentes |
| **H2 — Libs consumibles desde otros repos**  | Primer release npm: [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) (EP-003) | Un proyecto externo instala desde npm y arranca con el quickstart | **Cumplido** (2026-07-18) — 0.2.0/0.2.0 en npm, consumo verificado ([D-010](decisiones.md), aaa-020)                                                                                                                                  |
| **H3 — Puente con diseño**                   | Figma export: [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) (EP-004)          | Variables de Figma sincronizadas desde el código (one-way, D-006) | aaa-012 con 4/4 artefactos, **activo y pausado** ([D-027](decisiones.md)); fuera de la cola operativa, en [intake](intake/figma-export-tokens-studio.md)                                                                              |

Los hitos H2 y H3 no dependen de H1 — se activan por decisión del PO en cualquier momento. El horizonte más largo (multi-framework, patterns/recipes) vive en [intake/horizonte-largo.md](intake/horizonte-largo.md) (marco conceptual: [roadmap de madurez](../reference/roadmap-madurez-ds.md)); no es compromiso.

### Foto táctica

```
EP-001: tokens base + contraste AA → HU-004 Hecha; HU-018 (aditivos Atlassian) 1/3 cerrado
                                    (space.negative entregado vía Avatar, 2026-07-26)
EP-002: tandas 1 y 2 (D-009/D-011) → COMPLETAS. + HU-017 Button loading (aaa-031; genera D-013)
EP-002: tanda 3 (D-014)           → 6/7 (2026-07-26): Card, Button variants, Badge, Switch,
                                    Textarea y Avatar Hechas (aaa-032…037); falta HU-025 Slider,
                                    que la cierra y habilita la verificación del hito H1 (D-023)
EP-002: refinamiento visual        → HU-033 (ajuste dimensional) y HU-034 (Spinner) Identificadas,
                                    traídas del inbox del PO a producto por D-019
EP-003: HU-002 (primer release)   → Hecha (2026-07-18): tokens y components 0.2.0 en npm
                                    (D-010, lockstep ADR-015, aaa-020). Ese bundle violaba APF
                                    (full compilation mode): corregido en aaa-038 (2026-07-28,
                                    ADR-021). Veto levantado (D-028); la versión sana sale como
                                    0.3.0, bloqueada por Parte E + G + I
EP-004: HU-001 (Figma export)     → aaa-012 con 4/4 artefactos, activo y pausado (D-027)
EP-005: gates automáticos          → 7 HUs aprobadas por D-021 (HU-026…HU-032), 1/7 entregada:
                                    HU-032 /ds:audit-tokens Hecha (2026-07-27). Siguen Refinadas
                                    coverage, contraste AA, axe, angular-eslint, bundle size y
                                    Storybook publicado
EP-006: HU-011 (showcase)         → Hecha (2026-07-19). + HU-035/HU-036 Refinadas (interaction
                                    tests y docs de tokens en Storybook)
EP-007: template-lume              → Creada (D-020). HU-037 (rename del theme) Refinada;
                                    HU-038…040 Identificadas sin archivo
```

Última entrega: **`aaa-039` — corrección y hardening del pipeline de CI**, archivado el 2026-07-29 (Parte E de la review). Tampoco suma componentes: destraba el camino al release. Los dos gates obligatorios de `pr.yml` estaban rotos — el enforcement de changesets hacía imposible mergear el PR de versionado, y el step de OpenSpec nunca validó nada porque `npx --yes openspec` resuelve un package placeholder sin ejecutable (el CLI real es `@fission-ai/openspec`, ahora pinneado bajo lockfile). Sobre eso, el publish a npm quedó detrás del environment `npm-publish` con required reviewer ([ADR-022](../architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)), materializando el control técnico de [D-018](decisiones.md)(b): el veto deja de ser memoria humana y pasa a ser aprobación explícita por versión. Con esto el `0.3.0` de [D-028](decisiones.md) solo espera las Partes G e I.

Entrega anterior: **`aaa-038` — corrección de Angular Package Format y del empaquetado publicable**, archivado el 2026-07-28 (Parte D de la review). No suma componentes: repara el artefacto. El `0.2.0` publicado se había compilado en _full compilation mode_, lo que lo rompía para consumidores en otra versión de Angular 21.x y lo habría roto seguro en Angular 22; el guard que ng-packagr había plantado nunca corría porque se publicaba desde el root del package. Ahora `components` publica su `dist/` con el manifest generado como contrato único ([ADR-021](../architecture/adr/ADR-021-estrategia-publicacion-packages.md)), ambos tarballs llevan la licencia MIT, y `pnpm verify:packaging` verifica todo eso en cada PR sobre el artefacto emitido — el gate que ADR-017 prometía desde julio. La entrega anterior de kit sigue siendo **HU-022 (Avatar)** (`aaa-037`, 2026-07-26): 22 componentes y familias más el service de Toast.

El movimiento más grande del 2026-07-26 no fue de código sino de gobernanza: la [review integral del repo](../reviews/2026-07-26-review-integral/plan-de-accion.md) produjo 140 hallazgos verificados y un plan por partes A–N. Ya se ejecutaron **A, B, C, M, D y E** (decisiones D-018…D-028, sincronización documental, ecosistema `.claude/`, release-readiness y el pipeline de CI). El resto se sigue desde [BACKLOG § Now](../backlog/BACKLOG.md); la próxima es la **Parte F**, los gates de calidad automáticos (HU-026…HU-028, HU-030).

## Convenciones

### Identificadores (estables, nunca se renumeran)

- **EP-XXX** — épica. Secuencial global.
- **HU-XXX** — historia de usuario. Secuencial global (no por épica). El archivo vive en la carpeta de su épica.
- **CA-XXX.Y** — criterio de aceptación Y de la HU-XXX.
- **D-XXX** — decisión de producto, en [decisiones.md](decisiones.md). Se agregan al final; si una decisión se revierte, no se borra: se marca como **Reemplazada por D-YYY**.

El relleno a 3 dígitos es cosmético: si algún día se supera 999, se usa un cuarto dígito sin migrar nada.

### Nombres de archivo y carpeta

- Épica: carpeta `epics/EP-XXX-nombre-corto/` con el documento homónimo `EP-XXX-nombre-corto.md` (identificable por nombre en tabs del editor y búsquedas, a diferencia de un `README.md` genérico).
- HU: `EP-XXX-nombre-corto/HU-XXX-nombre-corto.md`.
- El nombre corto no cambia aunque el título evolucione (los enlaces no se rompen). Si una HU se muda de épica (raro), se mueve el archivo y se actualizan los enlaces; el ID no cambia.
- Si una épica se divide, las nuevas épicas registran el origen en su sección "Contexto".

### Metadata en frontmatter (épicas y HUs)

- La metadata vive en el **frontmatter YAML** del archivo, con **IDs pelados** (sin links — desacopla de rutas que cambian):
  - Épicas: `estado`, `actor` (si son varios, separados con `·`).
  - HUs: `epica`, `actor`, `estado`, `decisiones` (D-XXX de producto) y `adrs` (ADRs técnicos directamente aplicables; la clave se omite si no hay).
- `estado` lleva el valor del ciclo (ver § Estados) y admite un **paréntesis corto** con el detalle: fecha, change que la materializó, artefactos generados — ej. `Hecha (2026-07-11, aaa-016; genera ADR-014)`. El detalle largo va al cuerpo, no al frontmatter.
- En el **cuerpo**, las referencias siguen siendo links markdown relativos (estilo del repo).

### Estados

Para HUs:

| Estado        | Significado                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| Identificada  | Existe el título y poco más; no está lista para estimar.                        |
| Bloqueada     | Refinamiento detenido por una decisión o dependencia pendiente (indicar cuál).  |
| Refinada      | Narrativa + CAs binarios + dependencias + fuera de alcance. Lista para estimar. |
| En desarrollo | Alguien la está implementando (change OpenSpec activo).                         |
| Hecha         | Todos los CAs verificados (change archivado).                                   |

Para épicas: Identificada → En refinamiento → Refinada (todas sus HUs refinadas) → En desarrollo → Hecha (todas sus HUs hechas). Las épicas de un DS son flujos de valor **continuos**: pueden quedar "En desarrollo" con tandas de valor entregadas y backlog abierto.

## Flujo de trabajo

1. **Idea nueva** → las ideas sin comprometer entran al [intake](intake/README.md), donde se exploran y refinan antes de asumir el compromiso de una épica o HU ([D-019](decisiones.md)). Cuando el PO la aprueba: si es grande, se crea la carpeta de épica con [plantilla-epica.md](templates/plantilla-epica.md) como documento homónimo `EP-XXX-nombre-corto.md`; si es chica, la HU con [plantilla-hu.md](templates/plantilla-hu.md) dentro de la épica que corresponda (estado: Identificada), y el intake **se borra**. Las HUs candidatas sin refinar pueden listarse en el documento de la épica sin archivo propio. Las notas crudas del PO viven en su inbox personal (gitignored) y se trian en cada grooming ([D-019](decisiones.md)); ese inbox no se cita desde artefactos versionados.
2. **Refinamiento** → cada ambigüedad se resuelve con el product owner y se registra como **D-XXX en [decisiones.md](decisiones.md)** — las HUs referencian decisiones, no las repiten.
3. **Ejecución** → una HU Refinada se implementa vía **change OpenSpec** (`aaa-NNN`, flujo del repo). Las decisiones técnicas que surjan van como ADR a `docs/architecture/adr/`.
4. **Cierre** → CAs tildados al archivar el change, estado Hecha. La épica se cierra cuando todas sus HUs están Hechas (o queda abierta como flujo continuo). Ver el checklist de abajo.

### Checklist de archive

Lo que hay que actualizar **cada vez que se archiva un change**. Es la lista canónica: la referencian `openspec/config.yaml` (regla de redacción de `tasks.md`) y el § "Cómo se gestiona" del [BACKLOG](../backlog/BACKLOG.md). Se escribió porque los registros de producto quedaban afuera y el README derivaba varias entregas.

**Antes de archivar** (solo changes de componente):

- [ ] **Gate visual del PO** ([D-022](decisiones.md)): OK explícito sobre el resultado renderizado. Sin esto el archive no arranca.

**Al archivar**:

- [ ] Spec base sincronizada con los deltas del change.
- [ ] **Artefactos del change sin links markdown relativos**: referencias por ID (`ADR-021`, `D-028`, `HU-022`, `aaa-037`) o path del repo en código. Convención y motivo en [openspec/README.md § Referencias dentro de artefactos de change](../../openspec/README.md#referencias-dentro-de-artefactos-de-change) — mover el change a `archive/` baja un nivel toda ruta relativa y la rompe.
- [ ] `openspec/README.md`: próximo ID e "IDs en vuelo" al día.
- [ ] `docs/architecture/README.md`: fila nueva en el catálogo de changes (y en el de specs si introdujo alguna).
- [ ] ADR nuevo creado y fila en `decisions-log.md`, si el change generó una decisión one-way door.
- [ ] **HU** → estado `Hecha (fecha, change; artefactos generados)` con sus CAs tildados. Si el change cerró un CA de otra HU, tildarlo también.
- [ ] **Documento de la épica** → frontmatter (`estado`, contador de la tanda), tabla de HUs, tabla "Valor entregado" con la fila de esta entrega, y "Decisiones aplicables" si aparecieron D-XXX nuevas.
- [ ] **Este README** → "Tabla de HUs", "Foto táctica" y "Última entrega". Es el que más se atrasa: el BACKLOG delega acá la dirección del producto.
- [ ] **Grooming del [BACKLOG](../backlog/BACKLOG.md)**: el item cerrado se elimina, se reevalúan disparadores, se promueven horizontes y se tría el inbox del PO.
- [ ] Revisar si algún [intake](intake/README.md) maduró con lo entregado.

## Reglas de oro

- **Una HU = un archivo.** Si un archivo acumula más de un actor o más de una capacidad, se parte.
- **Una épica = un flujo de valor.** Si mezcla actores u objetivos que se entregan por separado, se divide.
- **Los CAs son binarios**: se puede responder sí/no sin interpretación. Formato Dado/Cuando/Entonces.
- **Las decisiones viven en un solo lugar** (decisiones.md); épicas y HUs enlazan por ID. Nada de copiar la decisión en tres archivos.
- **Fuera de alcance explícito** en cada HU: lo que no está escrito ahí se discute, no se asume.
- **Sin HUs en silencio** (D-015): una HU entra con disparador/caso de uso real **o** como buena idea fundamentada que el PO aprueba — el norte es un kit completo, capaz de soportar cualquier requerimiento futuro. El [intake](intake/README.md) es donde viven las ideas aún no aprobadas (D-019).
- **Revisión visual antes de cerrar** (D-022): ningún change de componente se archiva sin el OK visual del PO. Los gates automáticos no cubren esa clase de defecto.
