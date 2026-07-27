---
epica: EP-002
actor: Dev consumidor
estado: Identificada
decisiones: [D-014, D-019, D-022]
---

# HU-034 — Refinamiento estético del Spinner (dev consumidor)

**COMO** dev que muestra esperas indeterminadas en una vista construida con el DS
**QUIERO** que `ds-spinner` tenga la estética de la referencia visual del PO
**PARA** que el indicador de carga se lea como parte del mismo lenguaje visual que el resto del kit, y no como una pieza de otro sistema.

## Origen

`DsSpinner` se entregó en [HU-009](HU-009-spinner.md) (aaa-023, 2026-07-19) con su geometría propia, resuelta por tokens `component.spinner.*`. Posteriormente el PO registró en su inbox personal (`TASK.md`, gitignored) un ajuste estético del spinner según una captura de referencia — el mismo defecto de gobernanza que [HU-033](HU-033-ajuste-dimensional-referencia.md): trabajo comprometido que vivía fuera de los artefactos versionados, prohibido por [D-019](../../decisiones.md).

## Criterios de aceptación

- [ ] **CA-034.1 (divergencias identificadas)** — Dado el `ds-spinner` actual y la captura de referencia, cuando se contrastan, entonces queda un registro cerrado de las divergencias estéticas (geometría del arco, grosor, proporción del track, ritmo de la animación) con estado resuelta o documentada para cada una.
- [ ] **CA-034.2 (ajustes tokenizados)** — Dado un ajuste aplicado, entonces su valor sale de los tokens `component.spinner.*` (existentes o nuevos); el CSS del componente no incorpora valores literales de tamaño, grosor ni duración.
- [ ] **CA-034.3 (los 4 sizes siguen coherentes)** — Dados los sizes `xs | sm | md | lg`, cuando se aplica el ajuste, entonces los cuatro conservan la nueva estética de forma proporcional y el caso embebido (`xs` dentro de `ds-button`) sigue alineado con el texto del botón.
- [ ] **CA-034.4 (a11y y reduced-motion sin regresión)** — Dado el spinner ajustado, entonces [CA-009.2](HU-009-spinner.md) (herencia de `currentColor`, sin API de color), [CA-009.3](HU-009-spinner.md) (`role="status"` / `label` / opt-out decorativo) y [CA-009.4](HU-009-spinner.md) (pulso de opacidad bajo `prefers-reduced-motion`) siguen verificados y la suite del componente queda verde.
- [ ] **CA-034.5 (validación: el ajuste excede lo estético)** — Dado un ajuste de la referencia que exigiría cambiar la API pública del componente (nueva variante, nuevo input, nueva API de color) o salir del sistema de tokens, cuando se evalúa, entonces **no se aplica en esta HU**: se documenta y se eleva como capacidad nueva con su propia HU y aprobación del PO ([D-015](../../decisiones.md)).
- [ ] **CA-034.6 (showcase y gate visual del PO)** — Dado el ajuste aplicado, entonces la vista de `ds-spinner` en el showcase refleja la estética nueva en los 4 sizes, y el PO la verifica visualmente contra la captura y da el OK explícito antes de archivar ([D-022](../../decisiones.md)).

## Dependencias

- [HU-009](HU-009-spinner.md): el componente existe y está publicado; esta HU lo refina, no lo crea.
- **Refinamiento bloqueado por el PO**: la captura de referencia del spinner es material del PO; el alcance concreto no puede definirse sin ella.

## Fuera de alcance

- Progreso determinado (`ds-progress`, [HU-016](HU-016-progress.md)): es otro componente.
- Variantes de color semánticas y variante overlay/fullscreen: siguen fuera por las decisiones de refinamiento 2 y 6 de [HU-009](HU-009-spinner.md).
- Cambios de API pública de `DsSpinner` (CA-034.5).
- El ajuste dimensional de los componentes de la tanda 3: es [HU-033](HU-033-ajuste-dimensional-referencia.md).

## Notas

- Origen: hallazgo **backlog-02** de la [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md) (severidad alta), ítem `TASK.md:11` — la misma situación de gobernanza que HU-033.
- Se **registra** en la **Parte B** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md); la Parte que la ejecuta se asigna al refinar.
- **Recomendación: HU nueva (esta), no refinamiento de HU-009.** Fundamento: (a) HU-009 está **Hecha** — sus CAs están tildados y su change (`aaa-023`) archivado; reabrirla borraría el hecho de que lo entregado en 2026-07-19 cumplió lo acordado entonces, y contradice el principio de que el cierre de una HU es un hecho auditable. (b) El disparador es **distinto**: HU-009 nació de la tanda 1 ([D-009](../../decisiones.md)) con el criterio "espera indeterminada accesible"; este ajuste nace de la referencia visual de [D-014](../../decisiones.md), posterior. Mezclarlos rompe la trazabilidad decisión→HU. (c) Precedente del repo: [D-013](../../decisiones.md) trató el refinamiento visual del botón como trabajo con su propio change y su propia decisión, no como reapertura de la HU del botón. (d) Es **una capacidad distinta de valor** ("se ve como la referencia" vs "comunica espera de forma accesible"), y la regla de oro del [README de producto](../../README.md) pide una HU por capacidad. El costo de la alternativa (reabrir HU-009) sería solo ahorrar un archivo, contra las prioridades de trazabilidad y mantenibilidad del repo.
- Igual que HU-033, el refinamiento requiere una sesión con el PO y la captura a la vista: acá no se declara ninguna medida ni valor visual, porque no son verificables sin ella.
- Al migrar este trabajo, corresponde tachar el ítem correspondiente en el inbox del PO (`TASK.md`).
