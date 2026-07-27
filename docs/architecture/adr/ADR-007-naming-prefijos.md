# ADR-007 — Convención de naming y prefijos del Design System

- **Fecha**: 2026-06-01
- **Estado**: Aceptado
- **Dominio**: frontend / components / tokens
- **ADRs relacionados**: supersede parcialmente §4 y §5 de [ADR-004](ADR-004-arquitectura-components.md); coherente con [ADR-003](ADR-003-arquitectura-design-tokens.md).

## Contexto

`@romanmartinidev/components` arrancó con **tres prefijos heterogéneos**:

| Pieza               | Prefijo previo                  | Origen                                                    |
| ------------------- | ------------------------------- | --------------------------------------------------------- |
| Selector HTML       | `rmd-` (ej. `rmd-button`)       | ADR-004 §4, por afinidad con marca "Roman Martini Design" |
| CSS custom property | `--ds-*`                        | ADR-003, agnóstico del sistema                            |
| Class TypeScript    | sin prefijo (`ButtonComponent`) | ADR-004 §5, convención Angular clásica                    |

ADR-004 §"Negativas / trade-offs aceptados" reconoció explícitamente la **disonancia entre `rmd-` y `--ds-*`** como deuda aceptada. Esa deuda fue marcada como pendiente de resolución en el TODO del autor (`contexto_post_fases.md`, borrado en CHG-006). Si no se cerraba, cada componente futuro perpetuaba la inconsistencia.

Además, las class TypeScript sin prefijo (`ButtonComponent`, `CheckboxComponent`) **colisionan** con componentes homónimos del consumidor — anti-patrón en libs publicables (cf. Material `MatButton`, ng-zorro `NzButton`, Taiga UI `TuiButton`, PrimeNG `p-button`).

Esta decisión se toma con ventana óptima: el package está en `0.0.0`, nunca publicado, solo 2 componentes (Button, Checkbox), sin consumidores externos.

## Opciones consideradas

### Opción A — Status quo (rmd- selector + --ds-\* CSS + sin prefix en class)

- **Pros**: cero refactor.
- **Contras**: la disonancia queda viva; class names colisionan con consumidores; deuda reconocida en ADR-004 no se resuelve.

### Opción B — Unificar todo bajo `rmd-` (`--rmd-*` + `rmd-` + `RmdButton`)

- **Pros**: un solo prefijo, marca coherente.
- **Contras**: BREAKING masivo sobre tokens (200+ occurrencias de `--ds-*`); ata el sistema a marca personal Roman Martini Design — explícitamente NO deseado por el autor.

### Opción C — Unificar todo bajo `Ds` (`--ds-*` + `ds-` + `DsButton`) — **Adoptada**

- **Pros**:
  - Agnóstico de marca personal (`Ds` describe "Design System", no quién lo construye).
  - Cero cambios en tokens (`--ds-*` ya estaba alineado desde ADR-003).
  - Convención profesional alineada con libs Angular publicables con identidad propia (Mat, Nz, Tui, p).
  - Drop del sufijo `Component` reduce ruido en imports y es estándar moderno en libs standalone.
- **Contras**: BREAKING en `@romanmartinidev/components` (selectores y class names). Mitigado por: cero consumidores externos al momento del cambio, package no publicado.

### Opción D — `Ngx<Component>` (sugerencia ChatGPT)

- **Pros**: convención conocida en comunidad Angular (`ngx-bootstrap`, `ngx-toastr`).
- **Contras**: `ngx-` históricamente identifica "Angular community extensions" genéricas. Las libs con identidad propia (Mat, Nz, Tui, Prime) **no usan `ngx-`** justamente para diferenciarse. Adoptarlo mete la lib en el saco anónimo de extensiones comunitarias.

### Opción E — Status quo + prefix solo en class name (`rmd-button` + `RmdButton`)

- **Pros**: refactor mínimo, resuelve colisión de class names.
- **Contras**: la disonancia entre `rmd-` selector y `--ds-*` CSS persiste — el problema central no se cierra.

## Decisión

Se adopta la **Opción C — unificación bajo `Ds` / `ds-` / `--ds-*`** con drop del sufijo `Component`:

| Pieza                 | Convención                                      | Ejemplo                                             |
| --------------------- | ----------------------------------------------- | --------------------------------------------------- |
| Selector HTML         | `ds-<name>` (kebab-case)                        | `ds-button`, `ds-checkbox`                          |
| Class TypeScript      | `Ds<Name>` (PascalCase, sin sufijo `Component`) | `DsButton`, `DsCheckbox`                            |
| Type exports públicos | `Ds<Name><TypeName>`                            | `DsButtonVariant`, `DsButtonSize`, `DsCheckboxSize` |
| CSS custom properties | `--ds-*` (sin cambios)                          | `--ds-semantic-color-bg-primary`                    |
| Folder y file naming  | sin cambios                                     | `src/lib/button/button.component.ts`                |

**Reglas adicionales**:

- La convención aplica a **todo lo exportado desde `public-api.ts`** (componentes, types, directives futuras, pipes, services).
- **Story titles de Storybook NO llevan prefijo** (`title: 'Components/Button'`, no `'Components/DsButton'`). El título es etiqueta visual para usuarios humanos; el código (class) sí lleva prefijo. Decisión registrada en la fase de design del CHG-007.
- **Folder y file naming se mantienen** (sin sufijo `Component` en el código, pero el archivo sigue `<name>.component.ts` para alineación con la convención Angular del repo). Si se quiere evolucionar a `<name>.ts` al estilo Angular 21 moderno, va en un CHG separado.

Esta decisión **supersede parcialmente** las siguientes secciones de ADR-004:

- §4 **"Selector prefix `rmd-`"** → queda reemplazada por `ds-` aquí.
- §5 **"Naming convention"** columna **"Class TypeScript"** → `<Name>Component` queda reemplazada por `Ds<Name>` aquí.

El resto de ADR-004 (§1 build tool, §2 arquitectura flat, §3 standalone+signals, §6 CSS plain, §7 ViewEncapsulation, §8 testing, §9 exports, §10 peerDependency a tokens) sigue **Aceptado** sin cambios.

## Consecuencias

### Positivas

- **Identidad agnóstica**: `Ds` describe lo que es (Design System), no a quién pertenece. Mantenible aunque cambie la marca personal del autor.
- **Coherencia interna**: un solo prefijo conceptual (`Ds`/`ds-`/`--ds-*`) en toda la API pública del sistema.
- **Resolución de colisión**: class names `DsButton` no colisionan con `ButtonComponent` del consumidor.
- **Alineación con convención profesional**: libs publicables con identidad propia (Mat/Nz/Tui/p) siguen este patrón.
- **Reducción de ruido visual**: `import { DsButton, DsCheckbox } from '@romanmartinidev/components'` lee mejor que `ButtonComponent, CheckboxComponent` cuando hay múltiples imports.
- **Deuda explícita de ADR-004 §"Negativas" queda cerrada**.

### Negativas / trade-offs aceptados

- **BREAKING en la API pública del package** (selector y class name). Consumidores tendrían que renombrar — pero **no hay consumidores externos** hoy. Único consumidor interno (`apps/playground`) se migra en el mismo change.
- **Drop del sufijo `Component`** diverge del default de `ng generate component`. Aceptado porque es el patrón estándar en libs Angular publicables con marca (Mat, Nz, Tui).
- **Documentación de ADR-004** queda con menciones a `rmd-` y `ButtonComponent` como contexto histórico (ADRs son inmutables). Mitigación: ADR-004 recibe nota al final indicando el supersede parcial.
- **El cálculo "qué supersede" requiere lectura cruzada** de ADR-004 + ADR-007. Mitigación: nota explícita al final de ADR-004 + referencia desde la tabla de naming del README del package.

## Open questions

- **¿La convención aplica a directives, pipes y services públicos futuros?** **Sí, por default.** La regla "todo lo exportado desde `public-api.ts` lleva prefix `Ds`" es uniforme. Cuando aparezca el primer directive (ej. `DsTooltipDirective` o `[dsTooltip]`), pipe (`DsCurrency`) o service (`DsToastService`), ese change documenta cómo se aplica la convención al artefacto específico.
- **¿`<small>`/`<code>`/`<h5>`/`<h6>` no tienen variantes hoy?** Confirmado por los componentes existentes. Si en el futuro un componente lo necesita, se decide en su propio CHG.
- **¿Migrar también el folder/file naming a la convención Angular 21 moderna (`button.ts` sin `.component`)?** Postergado. Es otro refactor independiente; mezclarlo aquí acoplaría decisiones. Si aparece motivación, va en CHG separado.

## ADRs relacionados

- [ADR-003 — Arquitectura de design tokens](ADR-003-arquitectura-design-tokens.md): el prefijo `--ds-*` ya estaba decidido ahí. Esta ADR lo confirma como parte del prefijo unificador.
- [ADR-004 — Arquitectura de @romanmartinidev/components](ADR-004-arquitectura-components.md): ADR-007 supersede parcialmente §4 (selector prefix) y §5 (class naming).
- [ADR-010 — File naming sin sufijo de rol](ADR-010-file-naming-sin-sufijo-component.md): supersede parcialmente este ADR (ver nota abajo).

## Nota de supersesión parcial

El **2026-07-03**, la parte de este ADR referida a **folder y file naming** fue superseded por [ADR-010](ADR-010-file-naming-sin-sufijo-component.md) (change `aaa-010`):

- La fila **"Folder y file naming | sin cambios | `src/lib/button/button.component.ts`"** de la tabla de Decisión → reemplazada por **`src/lib/button/button.ts`**: los archivos no llevan sufijo de rol, alineado con el style guide de Angular v20+. Lo mismo aplica a `.css` y `.spec.ts`.
- La **regla adicional** que mantenía `<name>.component.ts` "para alineación con la convención Angular del repo" → ya no rige.
- La **open question** "¿Migrar también el folder/file naming a la convención Angular 21 moderna (`button.ts` sin `.component`)?" → **resuelta afirmativamente** por ADR-010, en el change separado que este ADR anticipaba.

El resto de ADR-007 (prefijos `Ds` / `ds-` / `--ds-*` en selector, class, types y CSS custom properties) sigue **Aceptado** sin cambios, y el estado global del ADR sigue siendo **Aceptado**.

Las menciones a `button.component.ts` en el cuerpo de este documento se preservan como **contexto histórico** (los ADRs son inmutables). Ver ADR-010 para el estado actual del file naming.
