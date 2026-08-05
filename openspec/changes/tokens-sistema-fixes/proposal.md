---
id: aaa-052
name: tokens-sistema-fixes
type: change
status: proposed
modifies-specs:
  - design-tokens-package (focus ring theme-aware, elevación en dark, tipografía de component vía semantic, motion compuesto por referencias, par inverse)
related-adrs:
  - ADR-003
related-decisions:
  - D-025
---

# Fixes y consistencia de los tokens de sistema

## Why

La auditoría formal de tokens del 2026-08-04 (`docs/design/tokens/2026-08-04-audit.md`) confirmó que el contrato duro se cumple —cero hardcodes, cero violaciones de jerarquía— pero dejó a la vista un patrón que la Parte G ya destapó tres veces: **tokens que declaran una cosa y el render pinta otra**. Este change ataca ese patrón en las capas `primitives`/`semantic`, donde el defecto no depende de ninguna decisión de producto abierta.

El caso más grave es un **bug funcional de accesibilidad**: `brand-a` y `brand-b` overridean `semantic.color.focus-ring` (verde y violeta), pero `semantic.shadow.focus` compone desde `{color.blue.500}` y ningún theme de marca lo redefine. El anillo de foco se pinta azul con cualquier marca activa — el token de marca existe y no gobierna nada. En dark pasa lo inverso: `dark.json` sí redefine `semantic.shadow.focus`, pero duplicando el composite como literal, así que la marca y el theme no componen.

Respalda la **prioridad 3 (mantenibilidad vía estándares y convenciones claras)**: cada ítem elimina una duplicación de valor que puede derivar en silencio. Secundariamente la prioridad 1, porque el focus ring es un requisito WCAG 2.4.7 que hoy no responde al theming publicado.

**Ahora** porque este es el bloque desbloqueado de la Parte H: la deuda de la capa `component.*` (66 tokens) depende de cuatro decisiones del PO y se trata aparte en un change propio, mientras que estos seis ítems tienen su decisión ya tomada o no la necesitan.

## What Changes

Seis ítems, fusión de la lista de la Parte H de la review del 2026-07-26 con el reporte de auditoría del 2026-08-04.

1. **Focus ring theme-aware** [tokens-01] — `semantic.shadow.focus` recompone su color desde `semantic.color.focus-ring` en vez de referenciar la primitiva `{color.blue.500}`. Con eso el override de marca cascadea solo y `dark.json` deja de duplicar el composite. Requiere además **realinear los valores de `semantic.color.focus-ring`**, que hoy discrepan del render en los cuatro scopes, no solo en las marcas (ver D1 en `design.md`): conectar el token tal como está degradaría el anillo del scope default de `blue.500` a `blue.200`. **Cambio visual**: el anillo de foco pasa a verde en `brand-a` y violeta en `brand-b` — hoy es azul en ambas; en default y dark no cambia.

2. **Elevación en dark** [tokens-07] — `dark.json` overridea `semantic.shadow.*` con mayor opacidad, ejecutando D-025. Hoy el theme dark hereda sombras `rgba(0,0,0,0.1)` casi invisibles sobre fondo oscuro: modal, dropdown, toast y card pierden su canal de separación del fondo. **Cambio visual** en dark.

3. **Tipografía de component vía semantic** [tokens-08] — los tokens tipográficos de `tooltip` (`font-size` → `{font.size.xs}`) e `input` (`font-size.sm/md/lg`, `helper.font-size`) saltan la capa semantic y consumen primitivas, pese a que la escala semantic equivalente existe y el propio `input.label.*` ya la usa bien. Se repuntan a `semantic.font.*`. **Sin cambio visual** (los semantic alias resuelven a las mismas primitivas).

4. **Motion compuesto por referencias** [tokens-09] — los 6 `semantic.motion.transition.*` duplican como string literal composiciones de `motion.duration` + `motion.easing` que ya existen como primitivas. `fast`/`normal`/`slow`/`spring` se conectan sin cambio de valor y de paso des-huérfanan `motion.easing.ease-in` y `motion.easing.spring`. `overlay-enter` (250ms) y `overlay-exit` (150ms) son el caso difícil: sus duraciones **no están en la escala primitiva**, y D2 en `design.md` resuelve alinearlas a la escala (200ms y 100ms) en vez de agregar dos peldaños innombrables. **Cambio visual acotado**: los overlays entran y salen 50 ms más rápido.

5. **Superficie invertida `bg.inverse`** [tokens-11] — `component.tooltip.bg` referencia `{semantic.color.text.primary}` y `component.tooltip.text` referencia `{semantic.color.bg.surface}`: usa un token de texto como fondo y uno de fondo como texto. Resuelve al color correcto por casualidad de la paleta, no por intención. Se introduce `semantic.color.bg.inverse` y el tooltip se repunta a él. La review pedía además un `text.on-inverse`, pero D3 lo descarta: `semantic.color.text.inverse` ya existe con exactamente ese significado y crear el segundo sería un sinónimo. **Sin cambio visual.**

6. **Separar definición de ejecución del build** [tokens-13] — `sd.config.mjs` declara las plataformas _y_ corre el build (`await sdBase.buildAllPlatforms()` al final del archivo), por lo que `pnpm build` es `node sd.config.mjs` y la configuración no se puede importar sin ejecutarla. Se extrae la ejecución a `build.mjs` y `sd.config.mjs` queda como módulo de definición exportable. **Refactor de tooling, sin cambio de output.**

**Fuera de alcance, deliberadamente:**

- Los 66 tokens de deuda de `component.*` (alert, button, focus ring per-componente, hovers no renderizados) y `component.switch.thumb.bg` — van a un change propio detrás de cuatro decisiones del PO.
- Los tokens tipográficos de `component/alert.json`, aunque son el mismo defecto del ítem 3: el destino del archivo entero (roadmap o retiro) es una de esas cuatro decisiones, y arreglarle la tipografía a un componente que puede retirarse es trabajo perdido.
- `tokens-10` (autorizar referencias intra-nivel no circulares): **ya está cerrado**. La regla vive en el requirement de jerarquía de `design-tokens-package` desde `aaa-041`, y `packages/tokens/test/hierarchy.spec.ts` la verifica. La fila del plan de acción quedó desactualizada.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `design-tokens-package`:
  - **Requirement "Token shadow.focus para accesibilidad"** — se extiende para exigir que el focus ring responda al theme de marca activo, no solo al de color scheme. Hoy el requirement solo pide que el token exista y emita un box-shadow no vacío, lo que el bug de marca satisface sin cumplir su intención.
  - **Requirement "Modelo de theming via CSS variables y atributos HTML"** — se suma la elevación como dimensión que el theme dark redefine (D-025), verificable en la suite.
  - **Requirement "Jerarquía interna primitives → semantic → component → theme"** — la regla de no-duplicación de `component` (hoy escrita con un scenario de color) se generaliza a la tipografía: si existe el semantic equivalente, el token de component lo referencia.
  - **Requirement "Tokens semantic de motion para overlays"** — los presets de transición se declaran por composición de primitivas, no por string literal duplicado.
  - **Nuevo token semantic** `color.bg.inverse` como superficie invertida, emparejado con el `color.text.inverse` existente.

## Impact

- **`packages/tokens/src/`** — `primitives/shadow.json`, `primitives/motion.json` (condicional al ítem 4), `semantic/shadow.json`, `semantic/motion.json`, `semantic/color.json`, `theme/dark.json`, `theme/brand-a.json`, `theme/brand-b.json`, `component/tooltip.json`, `component/input.json`.
- **`packages/tokens/`** — `sd.config.mjs` se parte en dos; `package.json` cambia los scripts `build` y `watch`.
- **`packages/tokens/test/`** — `hierarchy.spec.ts`, `build.spec.ts` y `contrast-pairs.json` acompañan; el gate de contraste debe cubrir el focus ring por marca, que es justo lo que hoy no verifica.
- **`packages/components/`** — sin cambios de código. Los tokens de component conservan su nombre; solo cambia a qué apuntan.
- **Consumidores del package** — los ítems 1, 2 y 4 alteran el render de apps que usan `brand-a`/`brand-b`, el theme dark o cualquier overlay. Pre-1.0 con superficie móvil (ADR-015), pero el changeset debe describirlo como cambio visual, no como fix interno.
- **Gate visual del PO** — los ítems 1, 2 y 4 son cambios visuales verificables en el playground (que ya tiene toggle de theme y de marca); no se archiva sin OK visual.

## Alternativas evaluadas

**A. Overridear `semantic.shadow.focus` en cada theme de marca** (lo que sugería la fila original de la review). Cada uno de `brand-a.json` y `brand-b.json` declara su propio composite con su color. **Descartada**: mantiene la duplicación del composite en cuatro lugares (primitiva, dark, y las dos marcas) y garantiza que el próximo brand nazca con el bug — si alguien agrega `brand-c` y olvida la línea, el anillo vuelve a ser azul en silencio. Recomponer desde `semantic.color.focus-ring` hace que un brand nuevo herede el comportamiento correcto por omisión. Nota: si el gate de contraste llegara a exigir un composite distinto por marca (grosor, no solo color), el override sigue disponible **encima** de la recomposición, así que la opción no se cierra.

**B. Un change único con toda la Parte H** (los 6 ítems de sistema más los 66 de deuda de `component.*`). **Descartada**: las cuatro decisiones del PO que la deuda necesita bloquearían también estos seis, que no las necesitan; y un `tasks.md` de trece frentes es difícil de verificar al cierre. El único punto de solape entre ambas listas —motion compuesto por referencias, que aparece en la review como `tokens-09` y en la auditoría como "conectables a primitivas"— queda entero acá, así que la fusión de listas se respeta sin fusionar los changes.

**C. Podar `semantic.color.focus-ring` en vez de conectarlo.** Si nadie lo consume, retirarlo y dejar el composite como única verdad. **Descartada**: invierte la regla de `aaa-049` (decidir primero cuál es la verdad). Acá la verdad es clara — las tres marcas declararon deliberadamente un color de foco propio y el sistema las ignora. El defecto está en el consumo, no en la declaración.

## ADR

No genera ADR: toca un solo package y no revierte ninguna decisión aceptada. Opera **dentro** de ADR-003 (la jerarquía no cambia; se cumple mejor) y ejecuta D-025, ya decidido.
