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

El refinamiento (bootstrap aaa-001…aaa-005) consolidó el alcance en el monorepo actual. Este espacio de producto se creó el 2026-07-10 y las épicas se definieron **retro-mapeando el valor ya entregado** (12 changes archivados) más el pendiente (BACKLOG + el entonces `FUTURE-WORK.md`, fusionado el 2026-07-20 en la [Cantera del BACKLOG](../backlog/BACKLOG.md#cantera-sin-disparador)).

## Estructura

```
docs/product/
├── README.md          ← esta guía + índice de épicas + roadmap
├── decisiones.md      ← registro de decisiones de producto (D-XXX), append-only
├── templates/         ← plantillas para crear épicas y HUs nuevas
└── epics/
    └── EP-XXX-nombre-corto/    ← una carpeta por épica, autocontenida
        ├── EP-XXX-nombre-corto.md  ← el documento de la épica (homónimo a la carpeta)
        └── HU-XXX-*.md         ← las HUs de esa épica, al lado
```

Principio: **todo lo que pertenece a una épica vive en su carpeta**. Lo que cruza épicas (decisiones, plantillas, esta guía) vive en la raíz de `docs/product/`.

## Cómo encaja con la gobernanza existente (no mezclar)

Este espacio responde **por qué y para quién** — no reemplaza a ninguna fuente de verdad existente:

| Artefacto                                                                           | Responde                                          | Relación con producto                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `docs/product/` (HUs, épicas, D-XXX)                                                | ¿Qué valor, para qué actor, por qué ahora?        | Una HU Refinada se **ejecuta** vía uno o más changes OpenSpec |
| `openspec/changes/` (`aaa-NNN`)                                                     | ¿Cómo se ejecuta un cambio significativo?         | El change referencia la HU que materializa (si existe)        |
| `openspec/specs/`                                                                   | ¿Qué debe hacer el sistema? (contratos testables) | Los CAs de una HU se vuelven scenarios de spec al implementar |
| `docs/architecture/adr/`                                                            | ¿Por qué esta decisión técnica?                   | Las D-XXX son de **producto/negocio**; lo técnico va a ADR    |
| [`docs/backlog/`](../backlog/BACKLOG.md)                                            | Cola operativa con disparadores (Now/Next/Later)  | El roadmap de producto se materializa como items del backlog  |
| [`docs/backlog/BACKLOG.md` § Cantera](../backlog/BACKLOG.md#cantera-sin-disparador) | Inspiración no normativa                          | Cantera de HUs candidatas (ideas sin disparador)              |

## Índice de épicas

| ID                                                                         | Épica                         | Actor principal | HUs                            | Estado                                                      |
| -------------------------------------------------------------------------- | ----------------------------- | --------------- | ------------------------------ | ----------------------------------------------------------- |
| [EP-001](epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md)     | Fundamentos: tokens y theming | Dev consumidor  | 004, 018                       | En desarrollo (base entregada)                              |
| [EP-002](epics/EP-002-kit-componentes/EP-002-kit-componentes.md)           | Kit de componentes Angular    | Dev consumidor  | 003, 005–010, 012–017, 019–025 | En desarrollo (tandas 1-2 completas; tanda 3 D-014 en cola) |
| [EP-003](epics/EP-003-consumo-distribucion/EP-003-consumo-distribucion.md) | Consumo y distribución        | Dev consumidor  | 002                            | En desarrollo (npm-ready, sin publicar)                     |
| [EP-004](epics/EP-004-puente-codigo-diseno/EP-004-puente-codigo-diseno.md) | Puente código ↔ diseño        | Diseñador       | 001                            | En refinamiento (aaa-012 propuesto)                         |
| [EP-005](epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md)   | Calidad profesional           | Mantenedor      | —                              | En desarrollo (primera tanda 2026-07-11)                    |
| [EP-006](epics/EP-006-playground/EP-006-playground.md)                     | Playground                    | Dev consumidor  | 011                            | En desarrollo (HU-011 Hecha 2026-07-19)                     |

Próximos IDs libres: **EP-007**, **HU-026**, **D-018**.

## Roadmap

Sin fechas: el avance lo marcan los **disparadores y las decisiones directas del PO** (D-015) y el orden operativo vive en [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md). El rumbo se expresa como **hitos de producto**, cada uno con su condición de salida binaria:

| Hito                                         | Qué lo compone                                                                                        | Condición de salida                                               | Estado                                                                                                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — Kit mínimo viable para una app real** | Tanda 1 ([D-009](decisiones.md)) completa + tanda 2 ([D-011](decisiones.md)): HU-012…HU-016 (EP-002)  | Una app real se construye 100% con componentes del DS             | Tandas 1 y 2 completas (2026-07-20); condición de salida pendiente: construir una app real 100% con el DS (decisión del PO sobre cómo verificarla) |
| **H2 — Libs consumibles desde otros repos**  | Primer release npm: [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) (EP-003) | Un proyecto externo instala desde npm y arranca con el quickstart | **Cumplido** (2026-07-18) — 0.2.0/0.2.0 en npm, consumo verificado ([D-010](decisiones.md), aaa-020)                                               |
| **H3 — Puente con diseño**                   | Figma export: [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) (EP-004)          | Variables de Figma sincronizadas desde el código (one-way, D-006) | aaa-012 propuesto, 4/4 artefactos; en pausa por el PO                                                                                              |

Los hitos H2 y H3 no dependen de H1 — se activan por decisión del PO en cualquier momento. El horizonte más largo (multi-framework, patterns/recipes) vive en la [Cantera del BACKLOG](../backlog/BACKLOG.md#cantera-sin-disparador) (marco conceptual: [roadmap de madurez](../reference/roadmap-madurez-ds.md)); no es compromiso.

### Foto táctica

```
EP-002: tanda 1 (D-009) COMPLETA  → HU-003 + HU-005…HU-010 Hechas (11 componentes + 1 directiva
                                    + 1 service, 2026-07-19)
EP-002: tanda 2 (D-011)           → COMPLETA (2026-07-20): HU-012…HU-016 Hechas (aaa-025…029;
                                    Breadcrumbs genera ADR-017). + HU-017 Button loading Hecha
                                    (aaa-031, 2026-07-22; genera D-013)
EP-002: tanda 3 (D-014)           → EN COLA (2026-07-22): HU-019…HU-025 (Card, Button variants,
                                    Badge, Avatar, Switch, Textarea, Slider — referencia
                                    moder-minimal); arranca components-add-card
EP-003: HU-002 (primer release)   → Hecha (2026-07-18): tokens y components 0.2.0 publicados en npm
                                    (D-010, lockstep ADR-015, aaa-020)
EP-004: HU-001 (Figma export)     → aaa-012 propuesto, 4/4 artefactos; en pausa por decisión del PO
EP-005: /ds:audit-tokens          → posible activación (primer hardcode detectado en la auditoría)
EP-006: HU-011 (showcase)         → Hecha (2026-07-19): sidebar + ruta lazy por componente + demos
                                    con snippet copiable; la página única del playground ya no existe
```

Última entrega: HU-017 (Button loading) Hecha — aaa-031 archivado el 2026-07-22 (genera D-013, refinamiento visual del botón); el kit mantiene 16 componentes + 3 directivas + 1 service. **Tanda 3 (D-014) en cola** con 7 HUs.

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

1. **Idea nueva** → si es grande, crear carpeta de épica con [plantilla-epica.md](templates/plantilla-epica.md) como documento homónimo `EP-XXX-nombre-corto.md`; si es chica, crear la HU con [plantilla-hu.md](templates/plantilla-hu.md) dentro de la épica que corresponda (estado: Identificada). Las HUs candidatas sin refinar pueden listarse en el documento de la épica sin archivo propio. Las ideas crudas sin disparador ni aprobación del PO van a la [Cantera del BACKLOG](../backlog/BACKLOG.md#cantera-sin-disparador), no generan artefactos acá.
2. **Refinamiento** → cada ambigüedad se resuelve con el product owner y se registra como **D-XXX en [decisiones.md](decisiones.md)** — las HUs referencian decisiones, no las repiten.
3. **Ejecución** → una HU Refinada se implementa vía **change OpenSpec** (`aaa-NNN`, flujo del repo). Las decisiones técnicas que surjan van como ADR a `docs/architecture/adr/`.
4. **Cierre** → CAs tildados al archivar el change, estado Hecha. La épica se cierra cuando todas sus HUs están Hechas (o queda abierta como flujo continuo).

## Reglas de oro

- **Una HU = un archivo.** Si un archivo acumula más de un actor o más de una capacidad, se parte.
- **Una épica = un flujo de valor.** Si mezcla actores u objetivos que se entregan por separado, se divide.
- **Los CAs son binarios**: se puede responder sí/no sin interpretación. Formato Dado/Cuando/Entonces.
- **Las decisiones viven en un solo lugar** (decisiones.md); épicas y HUs enlazan por ID. Nada de copiar la decisión en tres archivos.
- **Fuera de alcance explícito** en cada HU: lo que no está escrito ahí se discute, no se asume.
- **Sin HUs en silencio** (D-015): una HU entra con disparador/caso de uso real **o** como buena idea fundamentada que el PO aprueba — el norte es un kit completo, capaz de soportar cualquier requerimiento futuro. La Cantera del BACKLOG es la cola de ideas aún no aprobadas.
