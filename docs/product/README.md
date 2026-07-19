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

Conservado para trazabilidad — el pedido original ([docs/contexto_inicial.md](../contexto_inicial.md), 2026-05-29):

> Este proyecto lo voy a utilizar para desarrollar librerías. Las librerías solo van a tener alcance de arquitecturas frontend. […] `packages/tokens`: es un sistema de diseño […] `packages/components`: debe ser una librería de componentes Angular, estos componentes utilizarán la librería `packages/tokens`. […] Una app para probar los componentes […] también se va a usar para crear prototipos de casos de uso reales.

El refinamiento (bootstrap aaa-001…aaa-005) consolidó el alcance en el monorepo actual. Este espacio de producto se creó el 2026-07-10 y las épicas se definieron **retro-mapeando el valor ya entregado** (12 changes archivados) más el pendiente (BACKLOG + FUTURE-WORK).

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

| Artefacto                                                  | Responde                                          | Relación con producto                                         |
| ---------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `docs/product/` (HUs, épicas, D-XXX)                       | ¿Qué valor, para qué actor, por qué ahora?        | Una HU Refinada se **ejecuta** vía uno o más changes OpenSpec |
| `openspec/changes/` (`aaa-NNN`)                            | ¿Cómo se ejecuta un cambio significativo?         | El change referencia la HU que materializa (si existe)        |
| `openspec/specs/`                                          | ¿Qué debe hacer el sistema? (contratos testables) | Los CAs de una HU se vuelven scenarios de spec al implementar |
| `docs/architecture/adr/`                                   | ¿Por qué esta decisión técnica?                   | Las D-XXX son de **producto/negocio**; lo técnico va a ADR    |
| [`docs/backlog/`](../backlog/BACKLOG.md)                   | Cola operativa con disparadores (Now/Next/Later)  | El roadmap de producto se materializa como items del backlog  |
| [`docs/backlog/FUTURE-WORK.md`](../backlog/FUTURE-WORK.md) | Inspiración no normativa                          | Cantera de HUs candidatas                                     |

## Índice de épicas

| ID                                                                         | Épica                         | Actor principal | HUs          | Estado                                                |
| -------------------------------------------------------------------------- | ----------------------------- | --------------- | ------------ | ----------------------------------------------------- |
| [EP-001](epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md)     | Fundamentos: tokens y theming | Dev consumidor  | 004          | En desarrollo (base entregada)                        |
| [EP-002](epics/EP-002-kit-componentes/EP-002-kit-componentes.md)           | Kit de componentes Angular    | Dev consumidor  | 003, 005–010 | En desarrollo (5 componentes; tanda 1 aprobada D-009) |
| [EP-003](epics/EP-003-consumo-distribucion/EP-003-consumo-distribucion.md) | Consumo y distribución        | Dev consumidor  | 002          | En desarrollo (npm-ready, sin publicar)               |
| [EP-004](epics/EP-004-puente-codigo-diseno/EP-004-puente-codigo-diseno.md) | Puente código ↔ diseño        | Diseñador       | 001          | En refinamiento (aaa-012 propuesto)                   |
| [EP-005](epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md)   | Calidad profesional           | Mantenedor      | —            | En desarrollo (primera tanda 2026-07-11)              |
| [EP-006](epics/EP-006-playground/EP-006-playground.md)                     | Playground                    | Dev consumidor  | 011          | En desarrollo (HU-011 Hecha 2026-07-19)               |

Próximos IDs libres: **EP-007**, **HU-012**, **D-011**.

## Roadmap

Sin fechas: el avance lo marcan los **disparadores** (D-005) y el orden operativo vive en [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md). El rumbo se expresa como **hitos de producto**, cada uno con su condición de salida binaria:

| Hito                                         | Qué lo compone                                                                                        | Condición de salida                                               | Estado                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **H1 — Kit mínimo viable para una app real** | Tanda 1 ([D-009](decisiones.md)): HU-003 + HU-005…HU-010 (EP-002)                                     | Una app real se construye 100% con componentes del DS             | En curso — Toast activada (BACKLOG § Now)                                                            |
| **H2 — Libs consumibles desde otros repos**  | Primer release npm: [HU-002](epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) (EP-003) | Un proyecto externo instala desde npm y arranca con el quickstart | **Cumplido** (2026-07-18) — 0.2.0/0.2.0 en npm, consumo verificado ([D-010](decisiones.md), aaa-020) |
| **H3 — Puente con diseño**                   | Figma export: [HU-001](epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) (EP-004)          | Variables de Figma sincronizadas desde el código (one-way, D-006) | aaa-012 propuesto, 4/4 artefactos; en pausa por el PO                                                |

Los hitos H2 y H3 no dependen de H1 — se activan por decisión del PO en cualquier momento. El horizonte más largo (multi-framework, patterns/recipes) vive en [FUTURE-WORK § niveles de madurez](../backlog/FUTURE-WORK.md#estado-actual-respecto-a-los-niveles-de-madurez); no es compromiso.

### Foto táctica

```
EP-002: tanda 1 del kit (D-009)   → HU-003 Select, HU-005 Input, HU-006 Tabs, HU-007 Tooltip,
                                    HU-008 Toast Hechas; HU-009 Spinner ACTIVADA (BACKLOG § Now);
                                    HU-010 Skeleton en cola (se promueve al cerrar la anterior)
EP-003: HU-002 (primer release)   → Hecha (2026-07-18): tokens y components 0.2.0 publicados en npm
                                    (D-010, lockstep ADR-015, aaa-020)
EP-004: HU-001 (Figma export)     → aaa-012 propuesto, 4/4 artefactos; en pausa por decisión del PO
EP-005: /ds:audit-tokens          → posible activación (primer hardcode detectado en la auditoría)
EP-006: HU-011 (showcase)         → Hecha (2026-07-19): sidebar + ruta lazy por componente + demos
                                    con snippet copiable; la página única del playground ya no existe
```

Última entrega: HU-011 (Showcase) Hecha — aaa-022 archivado el 2026-07-19.

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

1. **Idea nueva** → si es grande, crear carpeta de épica con [plantilla-epica.md](templates/plantilla-epica.md) como documento homónimo `EP-XXX-nombre-corto.md`; si es chica, crear la HU con [plantilla-hu.md](templates/plantilla-hu.md) dentro de la épica que corresponda (estado: Identificada). Las HUs candidatas sin refinar pueden listarse en el documento de la épica sin archivo propio. Las ideas crudas sin disparador van a [FUTURE-WORK](../backlog/FUTURE-WORK.md) (la cantera), no generan artefactos acá.
2. **Refinamiento** → cada ambigüedad se resuelve con el product owner y se registra como **D-XXX en [decisiones.md](decisiones.md)** — las HUs referencian decisiones, no las repiten.
3. **Ejecución** → una HU Refinada se implementa vía **change OpenSpec** (`aaa-NNN`, flujo del repo). Las decisiones técnicas que surjan van como ADR a `docs/architecture/adr/`.
4. **Cierre** → CAs tildados al archivar el change, estado Hecha. La épica se cierra cuando todas sus HUs están Hechas (o queda abierta como flujo continuo).

## Reglas de oro

- **Una HU = un archivo.** Si un archivo acumula más de un actor o más de una capacidad, se parte.
- **Una épica = un flujo de valor.** Si mezcla actores u objetivos que se entregan por separado, se divide.
- **Los CAs son binarios**: se puede responder sí/no sin interpretación. Formato Dado/Cuando/Entonces.
- **Las decisiones viven en un solo lugar** (decisiones.md); épicas y HUs enlazan por ID. Nada de copiar la decisión en tres archivos.
- **Fuera de alcance explícito** en cada HU: lo que no está escrito ahí se discute, no se asume.
- **Sin HUs hipotéticas**: una HU entra cuando hay disparador o necesidad real (misma regla que el BACKLOG). FUTURE-WORK es la cantera, no el contrato.
