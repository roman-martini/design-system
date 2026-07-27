---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-007, D-002, D-017]
---

# HU-028 — Accesibilidad automatizada con axe (mantenedor)

**COMO** mantenedor de un kit de 23 componentes que declara WCAG AA como compromiso de producto
**QUIERO** que axe corra automáticamente sobre los componentes y que una violación AA falle el build
**PARA** que la garantía de accesibilidad deje de depender de auditorías manuales, que ya no escalan con el tamaño del kit.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **Dos fases, dos alcances distintos** ([D-021](../../decisiones.md)) — la HU se entrega en dos etapas separadas y verificables por sí solas:
   - **Fase 1 (barata, inmediata)**: `vitest-axe` sobre los specs jsdom **ya existentes** de los componentes, mediante un helper compartido. No agrega infraestructura nueva al pipeline: aprovecha la suite que ya corre en CI.
   - **Fase 2 (navegador real)**: Storybook test-runner con `axe-playwright` sobre el build de Storybook, como step de CI. Cubre lo que jsdom no puede evaluar — layout real, foco, top layer, contraste computado.
2. **La fase 1 no espera a la fase 2** — se entrega y se cablea sola; la fase 2 llega con su propio change. Esto evita bloquear el enforcement barato detrás de la infraestructura cara.
3. **Un helper único, aplicado a todos los componentes** — no se instrumenta "de a uno suelto": adoptado el patrón, se aplica en todo el kit ([D-017](../../decisiones.md)).
4. **Es enforcement de [D-007](../../decisiones.md)** — el repo declara WCAG AA sin gate que lo respalde; esta HU cierra esa brecha en la capa DOM (la capa tokens la cubre [HU-027](HU-027-gate-contraste-aa-ci.md)).

## Criterios de aceptación

### Fase 1 — `vitest-axe` sobre los specs jsdom

- [ ] **CA-028.1 (helper compartido)** — Dado el package de componentes, cuando se inspecciona su infraestructura de test, entonces existe un helper único y reutilizable (tipo `expectNoAxeViolations(fixture)`) que corre axe sobre el DOM renderizado de un fixture y no duplica configuración por componente.
- [ ] **CA-028.2 (cobertura del kit)** — Dado cada componente del kit, cuando corre su spec, entonces incluye al menos una aserción de axe sobre su render por defecto; los componentes que no puedan cubrirse en jsdom se listan explícitamente con su motivo y quedan asignados a la fase 2.
- [ ] **CA-028.3 (violación AA falla)** — Dado un componente al que se le introduce una violación de nivel AA (por ejemplo un control sin nombre accesible), cuando corre la suite, entonces el test **falla** identificando la regla de axe violada y el nodo; no se emite solo un warning.
- [ ] **CA-028.4 (reglas acotadas y explícitas)** — Dado que jsdom no puede evaluar algunas reglas (color-contrast entre ellas), cuando se configura axe para la fase 1, entonces el conjunto de reglas evaluadas y las deshabilitadas están declarados en un solo lugar y **justificados**; ninguna se deshabilita para tapar un hallazgo real.
- [ ] **CA-028.5 (en el pipeline sin infraestructura nueva)** — Dado el workflow de PR, cuando corre la suite de tests existente, entonces las aserciones de axe de fase 1 se ejecutan con ella, sin steps ni servicios adicionales.

### Fase 2 — Storybook test-runner con `axe-playwright`

- [ ] **CA-028.6 (test-runner sobre el build de Storybook)** — Dado el Storybook construido, cuando corre el test-runner, entonces cada story se visita en navegador real y se le corre axe.
- [ ] **CA-028.7 (violación AA en navegador falla el build)** — Dada una story con una violación AA detectable solo en navegador (contraste computado, foco, elemento en top layer), cuando corre el step de CI, entonces el job **falla** con el detalle de la violación y su story de origen.
- [ ] **CA-028.8 (cierre de la brecha de fase 1)** — Dados los componentes listados en CA-028.2 como no cubribles en jsdom, cuando termina la fase 2, entonces todos tienen cobertura de axe en navegador; la lista de exclusiones queda vacía o con motivo documentado por ítem.
- [ ] **CA-028.9 (step de CI dedicado)** — Dado el workflow de PR, cuando se ejecuta, entonces existe un step propio para la a11y en navegador, bloqueante, cuyo tiempo de ejecución queda registrado en el change para poder decidir si corre en cada PR o en un job aparte.

## Dependencias

- **Fase 2 depende de la fase 1** (el inventario de exclusiones de CA-028.2 define su alcance) y del build de Storybook en CI.
- `@storybook/addon-a11y` ya está instalado en el playground: aporta feedback en desarrollo pero **no falla nada** — es exactamente la brecha que esta HU cierra.
- Complementa a [HU-027](HU-027-gate-contraste-aa-ci.md) (contraste calculado sobre tokens) sin solaparse.

## Fuera de alcance

- Corregir a fondo violaciones que aparezcan: si el volumen es grande, se releva en el change y se encauza como trabajo propio. Esta HU instala los gates.
- Visual regression testing y deploy de Storybook — es otra HU de EP-005.
- Interaction tests (play functions) de overlays — Parte L del plan, con su propio ítem.
- Auditoría manual: la skill `check-a11y` sigue existiendo para revisiones amplias y de criterio; axe automatiza lo mecánico, no lo reemplaza.
- WCAG AAA.

## Notas

- Hallazgos que la originan: `testing-03` (sin a11y automatizada en ninguna capa, pese a `addon-a11y` instalado) y `ci-cd-10` (a11y automatizada ausente del pipeline pese a ser compromiso del DS) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **fase 1 en la Parte F**, **fase 2 en la Parte L** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md). Cada fase es su propio change.
- Referencia del hallazgo: todo DS profesional publicado (Carbon, Spectrum, Material) corre axe automatizado. Con 23 componentes, el costo de auditar a mano crece lineal y ya dejó pasar hallazgos reales (hardcode de `white` en Checkbox/Radio).
