# ADR-019 — Modelo de variantes: dos ejes `tone × appearance` para componentes de estado

- **Fecha**: 2026-07-22
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-004](ADR-004-arquitectura-components.md) (arquitectura de components), [ADR-003](ADR-003-arquitectura-design-tokens.md) (jerarquía de tokens)
- **Decisiones de producto**: [D-017](../../product/decisiones.md) (kit grado profesional, patrones como estándar)

## Contexto

Hasta `aaa-033`, los componentes con variantes de color usaban un **único input `variant` plano** que mezcla intención y estilo en un solo eje. En `DsButton` esto funciona bien: sus variantes (`primary`, `secondary`, `ghost`, `outline`) expresan **énfasis de acción**, un solo eje natural; `danger` es una intención puntual que se combinó ad-hoc (`danger-outline`, `danger-ghost`).

`DsBadge` (HU-021) expone el límite del modelo plano. Un badge es un componente de **estado/categoría**: su variabilidad es intrínsecamente **bidimensional** — un **tono** (neutral, primary, danger, success, warning, info) por un **peso visual** (solid, subtle, outline). Aplanarlo a un solo eje obliga a enumerar el producto cartesiano (`success`, `success-outline`, `success-subtle`, `warning`, `warning-outline`, …): 18 valores, imposible de mantener y con combinaciones faltantes ad-hoc — el mismo síntoma que `danger-outline` en Button, pero multiplicado por 6 tonos.

El PO fijó como dirección (D-017) que el kit debe ser **grado profesional y escalable**, adoptando patrones estándar y aplicándolos consistentemente donde correspondan, sin medias tintas que rompan con estándares futuros. Esto exige decidir **el modelo de variantes de una vez** y su ámbito de aplicación.

## Opciones consideradas

### Opción A — `variant` plano para todos (status quo)

Un solo input `variant` en cada componente, enumerando cada combinación.

- **Pros**: un solo patrón; API idéntica entre componentes; simple para componentes de un solo eje.
- **Contras**: para componentes de estado el eje único **no escala** (producto cartesiano tono×estilo); genera combinaciones faltantes que se agregan ad-hoc (`danger-outline`); ilegible con 6 tonos.

### Opción B — `tone × appearance` para todos

Dos ejes en todos los componentes, incluido Button.

- **Pros**: un solo patrón, escalable.
- **Contras**: **fuerza un modelo bidimensional donde no aplica**. Las variantes de Button son énfasis de acción (`primary`/`secondary`/`ghost`), no tonos — `tone="primary" appearance="solid"` es una descripción forzada y peor que `variant="primary"`. Refactorizar Button (ya publicado, `aaa-033`) sería un breaking change sin valor.

### Opción C — Modelo por naturaleza del componente (elegida)

**Dos ejes `tone × appearance`** para componentes de **estado/display**; **`variant` de énfasis plano** para componentes de **acción**.

- **Pros**: cada componente usa el modelo que refleja su naturaleza real; el naming del vocabulario se mantiene consistente (`danger`, `primary`, …) en ambos; escala donde importa (tonos de estado) sin forzar dos ejes donde sobra; no refactoriza Button.
- **Contras**: dos modelos coexisten → exige una **regla explícita** de cuál usar (este ADR) para que los componentes futuros elijan bien.

## Decisión

Se adopta la **Opción C**. La regla de partición:

| Naturaleza                                                                  | Modelo                         | Inputs                                                                                                              | Componentes                                                           |
| --------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Estado / display** (comunican estado, categoría o severidad)              | **`tone × appearance`**        | `tone` (`neutral \| primary \| danger \| success \| warning \| info`) × `appearance` (`solid \| subtle \| outline`) | `DsBadge` (HU-021); futuros `DsAlert`, `DsTag`, `DsChip`, status dots |
| **Acción / énfasis** (disparan una acción; su variante expresa prominencia) | **`variant` plano de énfasis** | `variant` (`primary \| secondary \| ghost \| outline` + intención `danger*` donde aplique)                          | `DsButton` (se mantiene como está)                                    |

Convenciones del modelo `tone × appearance`:

- **`tone`** usa el vocabulario semántico del kit (los mismos nombres que los tokens `semantic.color.*`): `neutral`, `primary`, `danger`, `success`, `warning`, `info`. Nunca `error`/`destructive`/`grey`.
- **`appearance`** default = **`subtle`** (fondo tintado + texto del tono): es el peso más legible y el estándar moderno de badges; `solid` (saturado) y `outline` (borde + texto del tono) son opt-in.
- Cada combinación `tone × appearance` **cumple WCAG AA** verificada por el gate de contraste por script en los 4 themes. En `solid`, el color de texto se elige **por tono** (blanco para tonos oscuros; texto oscuro para `warning`/tonos claros) — la uniformidad es de API, no de implementación.
- Los tokens viven en `component.<name>.<tone>.<appearance>-*` (ADR-003), referenciando `semantic` para adaptarse a los themes.

Criterios contra las prioridades del repo: (1) **buenas prácticas** — es el modelo estándar de la industria (Radix, Chakra, Atlassian) para componentes de estado; (2) **escalar ordenado** — agregar un tono o una apariencia es aditivo, sin explosión de variantes; (3) **mantenibilidad** — regla explícita de qué modelo usa cada componente.

## Consecuencias

### Positivas

- Los componentes de estado escalan sin enumerar el producto cartesiano; sumar tono/apariencia es aditivo.
- Vocabulario de tono consistente con la capa `semantic` y con el resto del kit.
- Button no se toca: su modelo de énfasis es el correcto para su naturaleza.
- Base lista para `DsAlert`/`DsTag`/`DsChip`: adoptan el patrón sin rediscutirlo.

### Negativas / trade-offs aceptados

- **Dos modelos coexisten** — exige criterio al sumar un componente (¿estado o acción?). Mitigado por la tabla de este ADR.
- **Deuda declarada, no silenciosa**: la familia `danger-outline`/`danger-ghost` de `DsButton` es un vestigio del modelo plano. Se mantiene (API publicada, `aaa-033`); si Button incorporara más tonos, se reevaluaría alinearlo — pero hoy su naturaleza de énfasis no lo requiere y no se considera medias tintas, sino el modelo correcto para su categoría.

### Acciones de seguimiento

- `DsBadge` (HU-021) es la primera implementación de referencia del patrón.
- Todo componente de estado futuro cita este ADR en su change.
