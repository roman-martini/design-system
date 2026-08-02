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
| [EP-002](epics/EP-002-kit-componentes/EP-002-kit-componentes.md)           | Kit de componentes Angular    | Dev consumidor              | 003, 005–010, 012–017, 019–025, 033, 034 | En desarrollo (tandas 1-2-3 completas; quedan HU-033/034 fuera de tanda)  |
| [EP-003](epics/EP-003-consumo-distribucion/EP-003-consumo-distribucion.md) | Consumo y distribución        | Dev consumidor              | 002                                      | En desarrollo (0.2.0 en npm; su bundle violaba APF, corregido en aaa-038) |
| [EP-004](epics/EP-004-puente-codigo-diseno/EP-004-puente-codigo-diseno.md) | Puente código ↔ diseño        | Diseñador                   | 001                                      | En refinamiento (aaa-012 activo y pausado, D-027)                         |
| [EP-005](epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md)   | Calidad profesional           | Mantenedor                  | 026–032                                  | En desarrollo (gates de D-021 en 5/7; HU-028 solo su fase 1)              |
| [EP-006](epics/EP-006-playground/EP-006-playground.md)                     | Playground                    | Dev consumidor              | 011, 035, 036                            | En desarrollo (HU-011 Hecha 2026-07-19)                                   |
| [EP-007](epics/EP-007-template-lume/EP-007-template-lume.md)               | Template-lume                 | Dev consumidor · Mantenedor | 037–040                                  | Identificada (creada 2026-07-26 por D-020)                                |

Próximos IDs libres: **EP-008**, **HU-041**, **D-032**.

## Tabla de HUs

Vista global del avance, pedida por [D-019](decisiones.md) — antes el estado de una HU solo se veía entrando a su épica. El detalle (fecha, change, artefactos generados) vive en el frontmatter de cada HU; acá está lo escaneable.

| HU                                                                             | Título                                 | Épica  | Estado                                                          |
| ------------------------------------------------------------------------------ | -------------------------------------- | ------ | --------------------------------------------------------------- |
| [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md)          | Tokens como Variables de Figma         | EP-004 | Refinada — en pausa                                             |
| [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md)       | Primer release publicado en npm        | EP-003 | Hecha (2026-07-18)                                              |
| [HU-003](epics/EP-002-kit-componentes/HU-003-select-formularios.md)            | Select/Combobox para formularios       | EP-002 | Hecha (2026-07-11)                                              |
| [HU-004](epics/EP-001-fundamentos-tokens/HU-004-contraste-aa-tokens.md)        | Tokens interactivos con contraste AA   | EP-001 | Hecha (2026-07-11)                                              |
| [HU-005](epics/EP-002-kit-componentes/HU-005-input-textfield.md)               | Input/TextField                        | EP-002 | Hecha (2026-07-11)                                              |
| [HU-006](epics/EP-002-kit-componentes/HU-006-tabs-navegacion.md)               | Tabs de navegación de contenido        | EP-002 | Hecha (2026-07-14)                                              |
| [HU-007](epics/EP-002-kit-componentes/HU-007-tooltip.md)                       | Tooltip de ayuda contextual            | EP-002 | Hecha (2026-07-18)                                              |
| [HU-008](epics/EP-002-kit-componentes/HU-008-toast-notificaciones.md)          | Toast para feedback asíncrono          | EP-002 | Hecha (2026-07-18)                                              |
| [HU-009](epics/EP-002-kit-componentes/HU-009-spinner.md)                       | Spinner de carga                       | EP-002 | Hecha (2026-07-19)                                              |
| [HU-010](epics/EP-002-kit-componentes/HU-010-skeleton.md)                      | Skeleton de contenido en carga         | EP-002 | Hecha (2026-07-19)                                              |
| [HU-011](epics/EP-006-playground/HU-011-showcase-componentes.md)               | Showcase navegable del playground      | EP-006 | Hecha (2026-07-19)                                              |
| [HU-012](epics/EP-002-kit-componentes/HU-012-menu-dropdown.md)                 | Menu/Dropdown de acciones              | EP-002 | Hecha (2026-07-19)                                              |
| [HU-013](epics/EP-002-kit-componentes/HU-013-accordion.md)                     | Accordion colapsable                   | EP-002 | Hecha (2026-07-20)                                              |
| [HU-014](epics/EP-002-kit-componentes/HU-014-breadcrumbs.md)                   | Breadcrumbs de ubicación               | EP-002 | Hecha (2026-07-20)                                              |
| [HU-015](epics/EP-002-kit-componentes/HU-015-pagination.md)                    | Pagination de listados                 | EP-002 | Hecha (2026-07-20)                                              |
| [HU-016](epics/EP-002-kit-componentes/HU-016-progress.md)                      | Progress de avance medible             | EP-002 | Hecha (2026-07-20)                                              |
| [HU-017](epics/EP-002-kit-componentes/HU-017-button-loading.md)                | Estado loading de Button               | EP-002 | Hecha (2026-07-22)                                              |
| [HU-018](epics/EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md)  | Tokens aditivos del research Atlassian | EP-001 | Identificada — 1/3 cerrado                                      |
| [HU-019](epics/EP-002-kit-componentes/HU-019-card.md)                          | Card contenedor                        | EP-002 | Hecha (2026-07-22)                                              |
| [HU-020](epics/EP-002-kit-componentes/HU-020-button-outline-destructive.md)    | Variantes outline y danger de Button   | EP-002 | Hecha (2026-07-22)                                              |
| [HU-021](epics/EP-002-kit-componentes/HU-021-badge.md)                         | Badge de estado                        | EP-002 | Hecha (2026-07-22)                                              |
| [HU-022](epics/EP-002-kit-componentes/HU-022-avatar.md)                        | Avatar y grupo de avatares             | EP-002 | Hecha (2026-07-26)                                              |
| [HU-023](epics/EP-002-kit-componentes/HU-023-switch.md)                        | Switch/Toggle                          | EP-002 | Hecha (2026-07-23)                                              |
| [HU-024](epics/EP-002-kit-componentes/HU-024-textarea.md)                      | Textarea                               | EP-002 | Hecha (2026-07-26)                                              |
| [HU-025](epics/EP-002-kit-componentes/HU-025-slider.md)                        | Slider (range)                         | EP-002 | Hecha (2026-08-01, aaa-044 — genera ADR-023, cierra la tanda 3) |
| [HU-026](epics/EP-005-calidad-profesional/HU-026-coverage-typecheck-ci.md)     | Coverage y typecheck en CI             | EP-005 | **Hecha** (2026-07-29)                                          |
| [HU-027](epics/EP-005-calidad-profesional/HU-027-gate-contraste-aa-ci.md)      | Gate de contraste WCAG AA en CI        | EP-005 | **Hecha** (2026-07-30)                                          |
| [HU-028](epics/EP-005-calidad-profesional/HU-028-a11y-automatizada-axe.md)     | Accesibilidad automatizada con axe     | EP-005 | **Fase 1 hecha** (2026-07-31)                                   |
| [HU-029](epics/EP-005-calidad-profesional/HU-029-angular-eslint.md)            | angular-eslint (templates y a11y)      | EP-005 | Refinada (2026-07-26)                                           |
| [HU-030](epics/EP-005-calidad-profesional/HU-030-bundle-size-budget.md)        | Presupuesto de tamaño de bundle        | EP-005 | **Hecha** (2026-07-31)                                          |
| [HU-031](epics/EP-005-calidad-profesional/HU-031-storybook-publicado.md)       | Storybook publicado                    | EP-005 | Refinada (2026-07-26)                                           |
| [HU-032](epics/EP-005-calidad-profesional/HU-032-audit-tokens-skill.md)        | Auditoría de consistencia de tokens    | EP-005 | **Hecha** (2026-07-27)                                          |
| [HU-033](epics/EP-002-kit-componentes/HU-033-ajuste-dimensional-referencia.md) | Ajuste dimensional a modern-minimal    | EP-002 | Identificada (2026-07-26)                                       |
| [HU-034](epics/EP-002-kit-componentes/HU-034-estetica-spinner.md)              | Refinamiento estético del Spinner      | EP-002 | Identificada (2026-07-26)                                       |
| [HU-035](epics/EP-006-playground/HU-035-interaction-tests-storybook.md)        | Interaction tests de overlays          | EP-006 | Refinada (2026-07-26)                                           |
| [HU-036](epics/EP-006-playground/HU-036-docs-tokens-storybook.md)              | Documentación de tokens en Storybook   | EP-006 | Refinada (2026-07-26)                                           |
| [HU-037](epics/EP-007-template-lume/HU-037-rename-theme-modern-minimal.md)     | Rename del theme a modern-minimal      | EP-007 | Refinada (2026-07-26)                                           |
| HU-038                                                                         | Research del sitio de referencia       | EP-007 | Identificada — sin archivo                                      |
| HU-039                                                                         | Inventario de componentes faltantes    | EP-007 | Identificada — sin archivo                                      |
| HU-040                                                                         | Web-page del template en el playground | EP-007 | Identificada — sin archivo                                      |

**Resumen sobre 40 HUs**: 23 Hechas, 10 Refinadas (una de ellas en pausa) y 7 Identificadas, tres de las cuales todavía no tienen archivo propio.

## Roadmap

Sin fechas: el avance lo marcan los **disparadores y las decisiones directas del PO** (D-015) y el orden operativo vive en [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md). El rumbo se expresa como **hitos de producto**, cada uno con su condición de salida binaria:

| Hito                                         | Qué lo compone                                                                                        | Condición de salida                                               | Estado                                                                                                                                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — Kit mínimo viable para una app real** | Tanda 1 ([D-009](decisiones.md)) completa + tanda 2 ([D-011](decisiones.md)): HU-012…HU-016 (EP-002)  | Una app real se construye 100% con componentes del DS             | Tandas 1, 2 y 3 completas (la 3 cerró el 2026-08-01 con Slider `aaa-044`). **La verificación quedó habilitada** ([D-023](decisiones.md)): un prototipo de la referencia `modern-minimal` en el playground, no un checklist de componentes — pendiente de agendar |
| **H2 — Libs consumibles desde otros repos**  | Primer release npm: [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) (EP-003) | Un proyecto externo instala desde npm y arranca con el quickstart | **Cumplido** (2026-07-18) — 0.2.0/0.2.0 en npm, consumo verificado ([D-010](decisiones.md), aaa-020)                                                                                                                                                             |
| **H3 — Puente con diseño**                   | Figma export: [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) (EP-004)          | Variables de Figma sincronizadas desde el código (one-way, D-006) | aaa-012 con 4/4 artefactos, **activo y pausado** ([D-027](decisiones.md)); fuera de la cola operativa, en [intake](intake/figma-export-tokens-studio.md)                                                                                                         |

Los hitos H2 y H3 no dependen de H1 — se activan por decisión del PO en cualquier momento. El horizonte más largo (multi-framework, patterns/recipes) vive en [intake/horizonte-largo.md](intake/horizonte-largo.md) (marco conceptual: [roadmap de madurez](../reference/roadmap-madurez-ds.md)); no es compromiso.

### Foto táctica

```
EP-001: tokens base + contraste AA → HU-004 Hecha; HU-018 (aditivos Atlassian) 1/3 cerrado
                                    (space.negative entregado vía Avatar, 2026-07-26)
EP-002: tandas 1 y 2 (D-009/D-011) → COMPLETAS. + HU-017 Button loading (aaa-031; genera D-013)
EP-002: tanda 3 (D-014)           → COMPLETA 7/7 (2026-08-01): Card, Button variants, Badge,
                                    Switch, Textarea, Avatar (aaa-032…037) y Slider (aaa-044;
                                    genera ADR-023). Verificación del hito H1 habilitada (D-023)
EP-002: fixes de componentes       → Parte G de la review, 3/7: aaa-045 endurece el menú
                                    (hover-timer, panel cerrado, superficie de exports),
                                    aaa-046 el select (touched, typeahead, ancho estable) y
                                    aaa-047 el toast (el primer anuncio ya no se pierde)
EP-002: refinamiento visual        → HU-033 (ajuste dimensional) y HU-034 (Spinner) Identificadas,
                                    traídas del inbox del PO a producto por D-019
EP-003: HU-002 (primer release)   → Hecha (2026-07-18): tokens y components 0.2.0 en npm
                                    (D-010, lockstep ADR-015, aaa-020). Ese bundle violaba APF
                                    (full compilation mode): corregido en aaa-038 (2026-07-28,
                                    ADR-021). Veto levantado (D-028); la versión sana sale como
                                    0.3.0, bloqueada por Parte E + G + I
EP-004: HU-001 (Figma export)     → aaa-012 con 4/4 artefactos, activo y pausado (D-027)
EP-005: gates automáticos          → 7 HUs aprobadas por D-021 (HU-026…HU-032), 5/7 entregadas:
                                    HU-032 /ds:audit-tokens (2026-07-27), HU-026 coverage +
                                    typecheck (2026-07-29, aaa-040), HU-027 gate de contraste AA
                                    (2026-07-31, aaa-041; genera D-030), HU-028 fase 1 axe
                                    (2026-07-31, aaa-042) y HU-030 bundle size budget
                                    (2026-07-31, aaa-043; genera D-031). Siguen Refinadas
                                    angular-eslint y Storybook publicado; HU-028 fase 2 depende
                                    de HU-031
EP-006: HU-011 (showcase)         → Hecha (2026-07-19). + HU-035/HU-036 Refinadas (interaction
                                    tests y docs de tokens en Storybook)
EP-007: template-lume              → Creada (D-020). HU-037 (rename del theme) Refinada;
                                    HU-038…040 Identificadas sin archivo
```

Última entrega: **`aaa-047` — el anuncio del toast**, archivado el 2026-08-02: **el tercero de los siete changes de la Parte G**, sobre [HU-008](epics/EP-002-kit-componentes/HU-008-toast-notificaciones.md). Un solo defecto, pero de los que no se ven: **el primer toast de la sesión podía no anunciarse en un lector de pantalla** — y el primero suele ser el que más importa, la confirmación de que algo se guardó o el error de que no. El contenedor se creaba recién en el primer `show()` y el rol de live region viajaba en el elemento insertado en ese mismo ciclo; una región que aparece junto con su contenido no se anuncia de forma confiable. El hallazgo proponía crear el contenedor antes, pero con el código delante eso no alcanzaba: el contenedor es un popover, **cerrado computa `display: none` y queda fuera del árbol de accesibilidad**, así que cualquier región alojada ahí adentro seguía apareciendo con el primer toast. El anuncio salió del popover a dos regiones persistentes en el `body` (`polite` y `assertive` —dos, porque la urgencia de una región no se puede mutar de forma confiable—) y el elemento visual dejó de declarar rol para no duplicarlo. La guarda de plataforma **no fue opcional**: mover el acceso al DOM al arranque de un service `providedIn: 'root'` habría roto el renderizado en servidor, que hoy sobrevive solo por accidente. Y el presupuesto de bundle volvió a hablar: el techo de `components` subió a 51.94 kB bajo [D-031](decisiones.md), pero al aplicar la regla apareció que **el margen del 5% ya vale más que un componente entero** (2.47 contra 2.32 kB), justo lo que la política existía para impedir — el gate dejó de detectar la entrada silenciosa de un componente y corregirlo pide una decisión.

Entrega anterior: **`aaa-046` — fixes del select**, archivado el 2026-08-01: **el segundo de los siete changes de la Parte G**, sobre [HU-003](epics/EP-002-kit-componentes/HU-003-select-formularios.md). Cinco fixes, y el que más importa no venía de la review sino del uso: **el control se contraía al elegir una opción de label corto**. Medido en Chromium antes de tocar código —siguiendo la lección de `aaa-045`— resultaron ser dos defectos encadenados: el trigger se dimensionaba por el label seleccionado (133 px con el placeholder, 79 px con "Chile") y el posicionador le clavaba ese ancho al listado, que partía las opciones largas en dos líneas. Se resolvió con un piso tokenizado en el trigger y usando su ancho como **mínimo** del listado, no como medida exacta; dimensionarlo por la opción más larga (lo que hace el `<select>` nativo) quedó evaluado y descartado por costo en bundle, no por criterio. De la review salieron los otros cuatro: `touched` no se marcaba nunca si el usuario tabulaba sin abrir —el contrato de forms era inconsistente con `DsFieldBase`—, faltaba el typeahead que el patrón APG exige y `DsMenu` ya tenía, la separación trigger↔listado estaba hardcodeada en JS mientras submenú y tooltip la leían de un token, y el listbox cerrado generaba caja igual que el menú. **Esa última pasó a requirement de `components-package`** con un test que barre todos los CSS de overlay del kit: el select era el último que la violaba, y la convención ya no depende de que el próximo autor tenga un vecino a mano. El change también agotó los dos techos de bundle de `tokens` —el trinquete de [D-031](decisiones.md) frenó el PR y se recalcularon— y dejó `components` **a 60 B de su techo**: el próximo change de la Parte G va a tener que moverlo.

Y antes: **`aaa-045` — fixes del menú**, archivado el 2026-08-01: **el primero de los siete changes de la Parte G** de la review integral. No suma componentes, endurece uno existente ([HU-012](epics/EP-002-kit-componentes/HU-012-menu-dropdown.md)). El bug de fondo era de interacción real: `DsMenuItem` agendaba la apertura de su submenú por hover y no cancelaba ese timer en ningún camino de salida, así que mover el puntero a otro item le robaba el foco de vuelta y un Esc a destiempo dejaba un panel huérfano en el top layer. La cancelación se resolvió **sin tocar la API**: va en `closeOwnSubmenu()`, que ya era el punto único de cierre, en lugar de sumarle un miembro al contrato público `DsMenuItemRegistration` como recomendaba el hallazgo. En el camino apareció el fix visual que reportó el PO —barras de scroll al reabrir un menú con submenús—, cuyo diagnóstico solo cerró **midiendo en Chromium**: el panel cerrado declaraba `display: flex`, lo que pisa la regla del navegador que oculta un `[popover]` cerrado, y el `transform` del panel padre durante la animación lo capturaba como containing block de su hijo `position: fixed`. La primera hipótesis (el `overflow` heredado del UA) era plausible y falsa, y quedó registrada como tal. Lo que este change deja para el resto de la Parte G es un patrón: **tres de sus cuatro ítems eran convenciones que el kit ya cumplía en algún componente y nunca había escrito** —los índices con exports enumerados, el `display` del popover cerrado y el `max-height` de los overlays—, propagadas por imitación y rotas donde el autor no tenía un vecino a mano. Dos pasaron a ser requirements con test; la tercera quedó como ítem de `components-fix-select`.

Y antes: **`aaa-044` — `DsSlider`**, archivado el 2026-08-01 (entrega [HU-025](epics/EP-002-kit-componentes/HU-025-slider.md)) y **con eso cierra la tanda 3 (7/7)**, habilitando la verificación del hito H1 ([D-023](decisiones.md)). Es el componente más complejo de la tanda y estrena dos cosas. Primero, el **patrón híbrido** promovido a [ADR-023](../architecture/adr/ADR-023-controles-de-rango-hibridos.md): el `<input type="range">` nativo invisible es el motor (teclado APG completo, arrastre, forms — cero JS de interacción propio) y la capa visual son elementos tokenizados sincronizados por una custom property con corrección por ancho de thumb; gobierna a los futuros controles de la familia (rating, range de dos thumbs). Segundo, es el **primer componente que mueve el techo de bundle bajo [D-031](decisiones.md)** como estaba previsto: costó 2.88 kB gzip (43.22 → 46.10) y el techo pasó de 45.38 a 48.41 kB, con el peso registrado en el commit. El gate de contraste también hizo su trabajo antes de CI: el fill con `bg.primary` daba 2.12:1 contra el track en dark, y salió corregido a la cadena de `text.link` (la de `DsProgress`) desde el primer build. Extras opt-in (`showValue`, `ticks`, `valueTooltip`), CVA tipado a `number`, 25 tests nuevos (904 total) y axe limpio con y sin extras.

Y antes: **`aaa-043` — presupuesto de tamaño de bundle**, archivado el 2026-07-31 (Parte F3 de la review, entrega [HU-030](epics/EP-005-calidad-profesional/HU-030-bundle-size-budget.md)) y **con eso cierra la Parte F**. No suma componentes: pone techo al peso que paga el consumidor, que hasta ahora no medía nadie. Los cinco entrypoints publicables de ambos packages tienen presupuesto gzip declarado, medido sobre el `dist` que construye el propio PR y bloqueante al excederse. Lo que hizo falta decidir no fue la herramienta sino **el margen**: tenía que quedar por debajo del costo de un componente para ser un gate y no un colchón, y eso exigió medir cuánto pesa un componente real (2 316 B, quitando `accordion` del `public-api.ts`) contra los 2 162 B del 5% que eligió el PO ([D-031](decisiones.md)). Consecuencia deliberada y ya anotada en el backlog: **el próximo componente del kit va a subir el techo en su propio PR**, dejando registrado cuánto pesó. El gate se probó fallando en las dos cadenas de build —ng-packagr y Style Dictionary— y también en el caso que la Parte F volvió obligatorio preguntar: ante un `dist` ausente falla, no reporta cero.

Y antes: **`aaa-042` — gate de accesibilidad y fidelidad de la suite**, archivado el 2026-07-31 (Parte F2 de la review, entrega la **fase 1 de [HU-028](epics/EP-005-calidad-profesional/HU-028-a11y-automatizada-axe.md)**). Tampoco suma componentes: pone enforcement sobre [D-007](decisiones.md), que declaraba la accesibilidad como parte del valor del producto sin un solo test que la verificara sobre el DOM. Ahora axe corre sobre el render de los 23 componentes dentro de la suite que el pipeline ya ejecuta, y el kit entró limpio (26 de 27 casos medidos sin violaciones). Lo importante del diseño es lo que el gate **no** acepta: con un `<dialog open>` en el árbol, axe deja de detectar violaciones que existen en jsdom, así que conformarse con "cero violaciones" habría dado verde falso sobre el modal desde el día uno — el helper exige además que el motor haya evaluado algo, y lo no auditable queda declarado con su motivo y asignado a la fase 2. En paralelo se cerraron tres brechas de fidelidad: la suite pasa a correr **zoneless** como producción (los 316 tests existentes pasaron sin tocarse), el smoke del showcase cubre las 23 vistas del registro en vez de 2 escritas a mano, y los scenarios de spec sin test de select, modal y button quedaron cubiertos. El gate encontró trabajo real: **`DsButton` no admite nombre accesible** —no reenvía `aria-label` al botón interno—, encauzado como ítem de `components-fix-button` en la Parte G.

Y antes: **`aaa-041` — gates de calidad de tokens**, archivado el 2026-07-31 (Parte F1-b de la review, entrega [HU-027](epics/EP-005-calidad-profesional/HU-027-gate-contraste-aa-ci.md)). No suma componentes: convierte en tests tres contratos que el package declaraba verificables por cálculo y que nadie verificaba. El **contraste WCAG AA** deja de depender de que alguien invoque una skill a mano — la lógica se mudó al repo productivo como única implementación del ratio, y los 107 pares que las specs declaran normativos son ahora datos versionados que corren en cada PR sobre los 4 scopes (428 evaluaciones). Se suman un gate de **jerarquía de referencias** sobre los 827 tokens fuente y otro sobre el **artefacto emitido** (prefijo, referencias resueltas, contención de themes), que era lo que quedaba pendiente de [HU-026](epics/EP-005-calidad-profesional/HU-026-coverage-typecheck-ci.md) al dejar `tokens` sin umbral de cobertura. El gate encontró trabajo real el primer día: el borde del checkbox y el radio desmarcados daba 2.52:1 contra el 3:1 de WCAG 1.4.11, corregido bajo [D-030](decisiones.md).

Antes de eso: **`aaa-039` — corrección y hardening del pipeline de CI**, archivado el 2026-07-29 (Parte E de la review). Tampoco suma componentes: destraba el camino al release. Los dos gates obligatorios de `pr.yml` estaban rotos — el enforcement de changesets hacía imposible mergear el PR de versionado, y el step de OpenSpec nunca validó nada porque `npx --yes openspec` resuelve un package placeholder sin ejecutable (el CLI real es `@fission-ai/openspec`, ahora pinneado bajo lockfile). Sobre eso, el publish a npm quedó detrás del environment `npm-publish` con required reviewer ([ADR-022](../architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)), materializando el control técnico de [D-018](decisiones.md)(b): el veto deja de ser memoria humana y pasa a ser aprobación explícita por versión. Con esto el `0.3.0` de [D-028](decisiones.md) solo espera las Partes G e I.

Y más atrás: **`aaa-038` — corrección de Angular Package Format y del empaquetado publicable**, archivado el 2026-07-28 (Parte D de la review). No suma componentes: repara el artefacto. El `0.2.0` publicado se había compilado en _full compilation mode_, lo que lo rompía para consumidores en otra versión de Angular 21.x y lo habría roto seguro en Angular 22; el guard que ng-packagr había plantado nunca corría porque se publicaba desde el root del package. Ahora `components` publica su `dist/` con el manifest generado como contrato único ([ADR-021](../architecture/adr/ADR-021-estrategia-publicacion-packages.md)), ambos tarballs llevan la licencia MIT, y `pnpm verify:packaging` verifica todo eso en cada PR sobre el artefacto emitido — el gate que ADR-017 prometía desde julio. La entrega anterior de kit sigue siendo **HU-022 (Avatar)** (`aaa-037`, 2026-07-26): 22 componentes y familias más el service de Toast.

El movimiento más grande del 2026-07-26 no fue de código sino de gobernanza: la [review integral del repo](../reviews/2026-07-26-review-integral/plan-de-accion.md) produjo 140 hallazgos verificados y un plan por partes A–N. Ya se ejecutaron **A, B, C, M, D, E** y **F completa** (decisiones D-018…D-031, sincronización documental, ecosistema `.claude/`, release-readiness, el pipeline de CI y los gates de cobertura, typecheck, tokens, accesibilidad y tamaño de bundle), y la **G arrancó con `aaa-045` (1 de 7)**. El resto se sigue desde [BACKLOG § Now](../backlog/BACKLOG.md). La Parte F se ejecutó en cuatro sub-partes: **F1-a** (HU-026), **F1-b** (gates de tokens, HU-027), **F2** (a11y con axe y playground, HU-028 fase 1) y **F3** (presupuesto de bundle, HU-030) — con eso `pr.yml` pasa a 12 steps bloqueantes y la suite a 878 tests.

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
- [ ] `docs/architecture/catalog.md`: fila nueva en el catálogo de changes (y en el de specs si introdujo alguna).
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
