# Intake — exploración de ideas antes de comprometerlas

Espacio donde una idea **se explora y se refina a fondo** antes de convertirse en épica o HU. Reemplaza a la ex Cantera del BACKLOG por decisión [D-019](../decisiones.md) (2026-07-26).

## Por qué existe

La Cantera era una lista plana donde toda idea pesaba lo mismo y no había dónde pensarla. El intake da ese lugar: un documento por idea, donde se ordena el pedido, se anotan las preguntas abiertas y se explora el alcance **antes** de asumir el compromiso que implica una épica o una HU.

Es también el lugar natural para invertir razonamiento caro: refinar acá sale mucho más barato que descubrir el alcance real a mitad de un change.

## Los tres niveles

| Nivel                                   | Qué es                                                            | Compromiso                   |
| --------------------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| **Intake** (acá)                        | Idea en exploración: se ordena, se pregunta, se refina            | Ninguno — puede descartarse  |
| **[Épica / HU](../README.md)**          | Requerimiento con actor, valor y criterios de aceptación binarios | Comprometido con el producto |
| **[BACKLOG](../../backlog/BACKLOG.md)** | Cola operativa de lo ya comprometido, con horizonte y disparador  | En cola para ejecutar        |

El BACKLOG **ya no recibe ideas sin comprometer**: sus horizontes Now/Next/Later son para trabajo decidido. Lo que antes iba a la Cantera ahora entra acá.

## Ciclo de vida

1. **Nuevo** — la idea queda registrada de forma legible: qué se pide, para qué actor, qué valor aporta. Refinamiento mínimo: ordenar la idea, no resolverla.
2. **Refinado** — el alcance se exploró, las preguntas se cerraron o se acotaron. Listo para que el PO decida.
3. **Promovido** — se convierte en épica/HU (y de ahí al BACKLOG). **El intake se borra**: su contenido ya vive en la épica/HU y en las decisiones; conservarlo duplica y confunde.
4. **Descartado** — se cierra con la razón escrita. Puede borrarse o dejarse un tiempo como memoria de por qué se dijo que no.

Un intake puede quedar en Nuevo o Refinado **indefinidamente** — no tener disparador no es un problema acá, es la condición normal.

## Reglas

- **Un intake = una idea explorable.** Ideas hermanas que se resuelven de una sola exploración pueden compartir archivo (ej. varios tokens de la misma familia); si al refinar se parten en entregas independientes, se parten en intakes.
- **Nada entra en silencio** ([D-015](../decisiones.md), preservado de la Cantera): la promoción a épica/HU la aprueba siempre el PO, por disparador o por buena idea fundamentada.
- **Las preguntas viven en su intake**, no en un registro global. Si una pregunta es de producto y trasciende la idea, se resuelve como **D-XXX** en [decisiones.md](../decisiones.md) y el intake enlaza.
- **Es efímero**: al promover, se borra. El histórico del porqué vive en la épica/HU y en las D-XXX.
- **No es el inbox del PO**: las notas crudas sin ordenar viven en `TASK.md` (gitignored, [D-019](../decisiones.md)) y se trian en el grooming. Un intake ya es un registro legible y versionado.
- Se usa la [plantilla de requerimiento](../templates/plantilla-requerimiento.md).
