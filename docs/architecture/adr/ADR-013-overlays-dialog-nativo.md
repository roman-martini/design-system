# ADR-013 — Overlays modales sobre `<dialog>` nativo (top layer)

- **Fecha**: 2026-07-10
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-011](ADR-011-estado-disabled-accesible.md) (precedente "no sumar CDK sin necesidad real"), [ADR-012](ADR-012-iconografia-lucide.md) (botón X del modal), ADR-003 §z-index vía [aaa-009](../../../openspec/changes/archive/aaa-009-tokens-add-z-index/)

## Contexto

`DsModal` (change [`aaa-014`](../../../openspec/changes/archive/aaa-014-components-add-modal/)) es el primer componente overlay del kit y necesita: capa por encima de todo el contenido, focus trap, restauración de foco, fondo inerte, cierre por ESC y backdrop estilable. La elección del mecanismo que provee todo eso **sienta el patrón para todos los overlays modales futuros** (Drawer, posibles variantes de Dialog) → decisión transversal que amerita ADR.

Restricciones: stack Angular 21 zoneless/signals/standalone; prioridad #1 del repo (buenas prácticas — preferir la plataforma antes que reimplementar); tests en Vitest + jsdom.

## Opciones consideradas

### Opción A — `<dialog>` nativo con `showModal()` (elegida)

- **Pros**: la plataforma provee **top layer** (por encima de todo, sin coordinación de z-index), **focus trap**, **restauración de foco**, **fondo inerte** (interacción + árbol de accesibilidad), **ESC** vía evento `cancel` cancelable y **`::backdrop`** estilable. Semántica `dialog`/`aria-modal` implícita. Baseline de browsers desde 2022. Cero dependencias.
- **Contras**: las animaciones de entrada/salida requieren CSS moderno (`@starting-style` + `transition-behavior: allow-discrete`, Baseline 2024) — en engines viejos degradan a "sin animación" (progressive enhancement, funcionalidad intacta). El top layer ignora la jerarquía z-index del DS (ver Consecuencias). No bloquea el scroll del fondo por sí solo (se resuelve con un scroll lock propio mínimo). jsdom aún no implementa sus métodos (polyfill de 10 líneas en test-setup).

### Opción B — `div` + `@angular/cdk` (Overlay/FocusTrap)

- **Pros**: API Angular conocida, portal/overlay configurables.
- **Contras**: dependencia pesada nueva para **reimplementar lo que la plataforma ya da**; contradice el precedente de ADR-011 ("no sumar CDK sin necesidad real"). El trap del CDK es emulación en JS del comportamiento que `showModal()` da nativo. Descartada.

### Opción C — `div` + focus trap manual

- **Contras**: reimplementar trap/inert/restauración a mano es la categoría de código sutilmente roto contra la que advierte ARIA APG (tab order, elementos dinámicos, AT). Máximo riesgo de a11y, cero beneficio sobre A. Descartada.

## Decisión

**Todo overlay modal del DS se implementa sobre `<dialog>` nativo con `showModal()`.** Reglas del patrón (establecidas por `DsModal`, reutilizables por Drawer y futuros):

1. **Estado controlado por el consumidor** vía `model()` two-way (`[(open)]`); un `effect` sincroniza el signal con `showModal()`/`close()`. El evento `cancel` (ESC) se `preventDefault()` siempre y el cierre pasa **por el model** — el DOM nunca diverge del estado del consumidor.
2. **Click en backdrop** = click con `event.target === dialog` (el contenido va en un wrapper interno); configurable por input.
3. **Siempre hay una vía de cierre visible** (botón X según ADR-012), aunque ESC y overlay estén deshabilitados.
4. **Animaciones 100% CSS** con los tokens de overlay de aaa-009 (`overlay-enter`/`overlay-exit` asimétricos vía transición por estado), `@starting-style` para la entrada, `allow-discrete` para la salida, `prefers-reduced-motion` obligatorio (regla ya vigente).
5. **Scroll lock propio** con contador compartido a nivel módulo (N modales anidados → se restaura al cerrar el último). Es el único estado compartido; no existe "stack manager": el top layer apila en orden de apertura y entrega ESC al diálogo superior por sí solo.
6. **jsdom**: polyfill mínimo de `showModal`/`close` + evento `close` en `test-setup.ts`; el trap/top-layer no se testean (son de la plataforma), se testea el cableado propio (atributos, model, scroll lock).

## Consecuencias

### Positivas

- A11y de diálogo modal **por plataforma**, no por emulación: menos código propio, menos bugs sutiles, mejor comportamiento con AT.
- Cero dependencias nuevas (el CDK queda fuera, coherente con ADR-011).
- El "stack manager" del backlog se elimina por diseño — infraestructura que no hay que construir ni mantener.
- Patrón documentado y reutilizable: Drawer futuro es "otro `<dialog>` con otra animación/posición".

### Negativas / trade-offs aceptados

- **El top layer ignora la jerarquía z-index del DS**: `--ds-component-modal-z-index` y `--ds-semantic-z-index-modal` **no aplican** a overlays sobre `<dialog>`. La jerarquía z-index (aaa-009) **sigue vigente** para capas no-top-layer (dropdown, sticky, banner, toast no-modal). Los tokens no se eliminan; su alcance queda acotado. Si en el futuro toda la familia overlay migra a top layer (popover API incluida), evaluar deprecar los niveles superiores en un ADR nuevo.
- **Animación de salida invisible en engines pre-2024**: aceptado como progressive enhancement.
- **Scroll lock manual**: `<dialog>` no lo da; el contador compartido es estado global mínimo del módulo — documentado y testeado.
- **Polyfill en tests hasta que jsdom implemente dialog**: deuda de test acotada a 10 líneas con comentario; se elimina cuando jsdom lo soporte.

### Acciones de seguimiento

- Drawer/overlays futuros: reutilizar el patrón (reglas 1–6) sin re-decidir; si alguno necesita apartarse, ADR nuevo.
- Cuando jsdom implemente `HTMLDialogElement.showModal`, borrar el polyfill de `test-setup.ts`.
- Si aparece la Popover API en el kit (tooltips/menus no modales), evaluar su relación con la jerarquía z-index en su propio change.
