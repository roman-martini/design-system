---
epica: EP-006
actor: Dev consumidor
estado: Refinada (2026-07-26)
decisiones: [D-007, D-017, D-021]
adrs: [ADR-013]
---

# HU-035 — Interaction tests de overlays en Storybook (dev consumidor)

**COMO** dev que evalúa un componente overlay del DS antes de adoptarlo
**QUIERO** que sus stories ejerciten el comportamiento real —abrir, cerrar, mover el foco, responder al teclado— y que eso corra en CI
**PARA** confiar en que la interacción y la a11y que el kit promete siguen funcionando en el estado abierto, no solo en el render inicial.

## Decisiones de refinamiento

1. **Primera tanda acotada a overlays y componentes de interacción rica** (2026-07-26) — `ds-menu` (con submenús), `ds-modal`, `ds-select`, `ds-tooltip`, `ds-tabs` y `ds-accordion`. Son los que concentran comportamiento de plataforma (`<dialog>` nativo por [ADR-013](../../../architecture/adr/ADR-013-overlays-dialog-nativo.md), Popover API, focus trap) y por eso los que más regresiones silenciosas pueden acumular. El resto del kit se suma después, si aparece valor.
2. **Los interaction tests no reemplazan a la suite unitaria** — la suite de `@romanmartinidev/components` sigue siendo el gate de lógica; las play functions cubren lo que sí necesita entorno de navegador y el estado abierto que `addon-a11y` nunca ve.
3. **Corren en CI y bloquean** — un interaction test rojo falla el pipeline. Un check informativo no cambia comportamiento y no cumple el rol de gate que pide [D-021](../../decisiones.md).
4. **Cobertura como parte del "done" de todo overlay nuevo** — se establece como estándar del kit, coherente con [D-017](../../decisiones.md) regla 2 (un patrón adoptado se aplica consistentemente, no de a uno suelto).

## Criterios de aceptación

- [ ] **CA-035.1 (apertura y cierre)** — Dada la story de cada componente de la tanda, cuando su play function dispara la apertura y luego el cierre por el mecanismo propio del componente, entonces la aserción verifica que el contenido overlay aparece y desaparece del DOM accesible.
- [ ] **CA-035.2 (foco)** — Dado un overlay abierto por play function, entonces la aserción verifica que el foco quedó dentro del overlay al abrir y volvió al elemento disparador al cerrar.
- [ ] **CA-035.3 (teclado)** — Dado un overlay abierto, cuando la play function envía las teclas que el componente declara soportar (como mínimo `Escape` para cerrar y las flechas donde hay navegación entre ítems), entonces el comportamiento resultante se verifica con aserciones — sin `Escape`, sin flechas o sin foco no hay CA cumplido.
- [ ] **CA-035.4 (a11y del estado abierto)** — Dado el overlay en estado abierto dentro de la play function, entonces se ejecuta el chequeo de accesibilidad sobre ese estado (no solo sobre el render inicial) y no reporta violaciones.
- [ ] **CA-035.5 (gate en CI)** — Dado el pipeline de CI, entonces ejecuta los interaction tests en cada push y PR, y **una play function fallida marca el job como fallido** (no es un check informativo).
- [ ] **CA-035.6 (caso de error verificable)** — Dado un interaction test al que se le rompe deliberadamente la aserción (o el componente bajo prueba), cuando corre el gate, entonces falla con el nombre de la story y la aserción que no se cumplió — se demuestra que el gate detecta, no que simplemente pasa.
- [ ] **CA-035.7 (estándar documentado)** — Dado el cierre, entonces la lista de componentes cubiertos está declarada en la documentación de contribución y la regla "todo overlay nuevo suma su play function" queda incorporada al flujo de alta de componentes.

## Dependencias

- Storybook 10 ya instalado en `apps/playground` con `addon-a11y` (hoy audita solo el render inicial — es la brecha que esta HU cierra).
- [D-021](../../decisiones.md): la a11y automatizada fase 2 y esta HU comparten infraestructura de navegador; conviene resolver el orden entre ambas al planificar el change.

## Fuera de alcance

- Visual regression testing (Chromatic o equivalente): evaluado por separado en [D-021](../../decisiones.md).
- Publicación de Storybook en GitHub Pages: HU aparte del mismo bloque.
- Cobertura de los componentes no-overlay del kit: se suma después de esta tanda.
- Tests de comportamiento de plataforma que exijan navegador real fuera de Storybook (focus trap de bajo nivel, top layer): eso es Vitest Browser Mode, trabajo aparte de la misma Parte del plan.
- Cambios a los componentes del kit (EP-002): si un interaction test revela un defecto, se registra como fix con su propio change.

## Notas

- Origen: hallazgo **playground-05** de la [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md) (severidad media): grep sobre las 22 stories del repo devuelve cero `play`, cero `userEvent`, cero import de `@storybook/test` — todas son render-only.
- Se ejecuta en la **Parte L** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md) ("Storybook avanzado y docs públicas"), vía change OpenSpec.
- Ejecuta [D-007](../../decisiones.md) (a11y como feature) dándole enforcement automático justo donde vive el riesgo: los estados interactivos.
- Es el estándar de la industria para design systems publicados (Storybook test module + play functions corridos en CI), coherente con la ambición de [D-017](../../decisiones.md).
