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
        ├── README.md          ← el documento de la épica
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

| ID                                                    | Épica                         | Actor principal | HUs | Estado                                  |
| ----------------------------------------------------- | ----------------------------- | --------------- | --- | --------------------------------------- |
| [EP-001](epics/EP-001-fundamentos-tokens/README.md)   | Fundamentos: tokens y theming | Dev consumidor  | —   | En desarrollo (base entregada)          |
| [EP-002](epics/EP-002-kit-componentes/README.md)      | Kit de componentes Angular    | Dev consumidor  | 003 | En desarrollo (5 componentes)           |
| [EP-003](epics/EP-003-consumo-distribucion/README.md) | Consumo y distribución        | Dev consumidor  | 002 | En desarrollo (npm-ready, sin publicar) |
| [EP-004](epics/EP-004-puente-codigo-diseno/README.md) | Puente código ↔ diseño        | Diseñador       | 001 | En refinamiento (aaa-012 propuesto)     |
| [EP-005](epics/EP-005-calidad-profesional/README.md)  | Calidad profesional           | Mantenedor      | —   | Identificada (disparadores activados)   |

Próximos IDs libres: **EP-006**, **HU-004**, **D-008**.

## Roadmap (foto actual)

El orden operativo lo marca [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md); acá va la lectura de producto:

```
EP-004: HU-001 (Figma export)     → aaa-012 ya propuesto, 4/4 artefactos; en pausa por decisión del PO
EP-002: HU-003 (Select)           → desbloqueado (iconos ADR-012 + dialog ADR-013 listos)
EP-005: skills /ds:*              → disparadores ACTIVADOS (3 CHGs add-component, 5 componentes)
EP-003: HU-002 (primer release)   → cuando el PO decida estrenar el pipeline de aaa-005
```

## Convenciones

### Identificadores (estables, nunca se renumeran)

- **EP-XXX** — épica. Secuencial global.
- **HU-XXX** — historia de usuario. Secuencial global (no por épica). El archivo vive en la carpeta de su épica.
- **CA-XXX.Y** — criterio de aceptación Y de la HU-XXX.
- **D-XXX** — decisión de producto, en [decisiones.md](decisiones.md). Se agregan al final; si una decisión se revierte, no se borra: se marca como **Reemplazada por D-YYY**.

El relleno a 3 dígitos es cosmético: si algún día se supera 999, se usa un cuarto dígito sin migrar nada.

### Nombres de archivo y carpeta

- Épica: carpeta `epics/EP-XXX-nombre-corto/` con el documento en `README.md` (se renderiza automáticamente al navegar la carpeta en GitHub/GitLab).
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

1. **Idea nueva** → si es grande, crear carpeta de épica con [plantilla-epica.md](templates/plantilla-epica.md) como `README.md`; si es chica, crear la HU con [plantilla-hu.md](templates/plantilla-hu.md) dentro de la épica que corresponda (estado: Identificada). Las HUs candidatas sin refinar pueden listarse en el README de la épica sin archivo propio.
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
