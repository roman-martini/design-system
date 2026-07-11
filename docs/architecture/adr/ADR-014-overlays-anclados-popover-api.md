# ADR-014 — Overlays anclados no modales sobre Popover API

- **Fecha**: 2026-07-11
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-013](ADR-013-overlays-dialog-nativo.md) (mismo criterio de plataforma para overlays modales), [ADR-011](ADR-011-estado-disabled-accesible.md) (este ADR extiende su tabla), [ADR-012](ADR-012-iconografia-lucide.md) (iconografía del trigger)

## Contexto

`DsSelect` (change [`aaa-016`](../../../openspec/changes/archive/aaa-016-components-add-select/)) es el primer **overlay anclado no modal** del kit: un listado que se posiciona relativo a un trigger, no puede quedar recortado por contenedores con `overflow` (CA-003.7 de HU-003) y se cierra al interactuar afuera. La misma necesidad la tienen Tooltip (HU-007, bloqueado por esta decisión), dropdown-menu, popover y datepicker futuros.

FUTURE-WORK sugería `@floating-ui/dom`. El precedente ADR-013 estableció el criterio "plataforma primero" para overlays modales (`<dialog>`); acá se decide si ese criterio se extiende a los anclados y con qué mecanismo de posicionamiento.

Decisión one-way door de patrón (afecta a todos los overlays anclados futuros y a la política de dependencias) → ADR.

## Opciones consideradas

### Opción A — Popover API nativa + posicionamiento propio (elegida)

Capa vía atributo `popover="auto"` + `showPopover()`; posicionamiento respecto del trigger resuelto aparte (ver Decisión §2).

- **Pros**: top layer nativo (el overlay no puede quedar recortado — misma garantía que `<dialog>`); light-dismiss nativo (click fuera y ESC sin listeners globales propios); cero dependencias; coherente con ADR-013.
- **Contras**: la Popover API no posiciona — el posicionamiento hay que resolverlo aparte; jsdom no la implementa (polyfill de test, mismo precedente ADR-013 §6).

### Opción B — `@floating-ui/dom`

- **Pros**: battle-tested; middleware rico (flip, shift, arrow, colisiones múltiples).
- **Contras**: dependencia externa nueva para un caso simple; sin top layer propio (igual necesita portal o popover para escapar del overflow); el repo ya rechazó dos veces el camino de la dependencia (ADR-011 sin CDK, ADR-013 dialog nativo). Su fuerte no se necesita en select/tooltip.

### Opción C — Posicionamiento absoluto en el DOM local

- **Pros**: trivial.
- **Contras**: cualquier ancestro con `overflow: hidden` recorta el overlay — falla el requisito central. Descartada.

### Sub-decisión: CSS anchor positioning vs fallback JS propio

Evidencia relevada en el pre-flight de aaa-016 (caniuse, 2026-07-11): anchor positioning es Baseline 2026 — Chrome/Edge 125+, Firefox 147+ (enero 2026), Safari **parcial en 18.x** (`@position-try`, necesario para el flip, recién en 18.4+/26). El target del repo (2 majors más recientes de Safari: 26 y 18) incluye Safari 18.0–18.3 sin soporte completo.

## Decisión

**Todo overlay anclado no modal del DS se implementa sobre la Popover API nativa.** Reglas del patrón (establecidas por `DsSelect`, reutilizables por Tooltip y futuros):

1. **Capa**: `popover="auto"` + `showPopover()`/`hidePopover()`. El estado del componente se sincroniza con el evento `toggle` — el cierre por light-dismiss de la plataforma nunca diverge del estado propio.
2. **Posicionamiento**: **fallback JS mínimo propio** — `getBoundingClientRect` del trigger al abrir (debajo, mismo ancho, flip vertical si no hay espacio) + reposición en `scroll`/`resize` mientras esté abierto. **Criterio de migración explícito**: cuando Safari 18 salga de la ventana de soporte del repo, migrar a CSS anchor positioning en un change propio (el CSS ya está estructurado para ese reemplazo). Si un overlay futuro necesitara middleware real (colisiones múltiples, shift, arrow), se reevalúa `@floating-ui/dom` en un ADR nuevo — no se agrega por las dudas.
3. **Top layer y z-index**: igual que ADR-013 — el top layer ignora la jerarquía z-index del DS; `semantic.z-index.dropdown` queda para capas no-top-layer.
4. **Animaciones**: 100% CSS con los tokens de overlay (`overlay-enter`/`overlay-exit`), `@starting-style` + `allow-discrete`, bloque `prefers-reduced-motion` obligatorio.
5. **Extensión de la tabla ADR-011**: un **form control cuyo control operable es un botón** (select, futuros combobox/datepicker) usa la rama "botón de acción" — `aria-disabled` + guarda — porque el `disabled` nativo del botón tiene los tres agujeros de a11y que ADR-011 describe. `setDisabledState` del CVA mapea a ese estado.
6. **jsdom**: polyfill mínimo de `showPopover`/`hidePopover` + evento `toggle` en `test-setup.ts`; se testea el cableado propio, no el top layer ni el light-dismiss (son de la plataforma).

Criterios contra las prioridades del repo: (1) **buenas prácticas** — a11y y comportamiento de plataforma, no emulación; (2) **escalar ordenado** — un patrón explícito para toda la familia de overlays anclados, con criterio de migración documentado en vez de deuda implícita; (3) **mantenibilidad** — cero dependencias nuevas y ~30 líneas de posicionamiento propias con reemplazo declarativo previsto.

## Consecuencias

### Positivas

- Tooltip (HU-007) queda **desbloqueado** con el patrón resuelto: es "otro popover con otra animación y sin selección".
- El clipping por overflow —el bug clásico de los dropdowns— es imposible por diseño (top layer).
- Light-dismiss y ESC son de la plataforma: menos listeners globales propios, menos bugs sutiles.
- Cero dependencias nuevas; la puerta a floating-ui queda abierta con criterio explícito, no cerrada.

### Negativas / trade-offs aceptados

- **Posicionamiento propio de ~30 líneas**: menos capaz que floating-ui (sin shift horizontal ni colisiones complejas) — suficiente para select/tooltip; si un caso lo excede, ADR nuevo.
- **Doble rama temporal** (fallback JS hoy, anchor positioning después): mitigada porque la migración es un reemplazo acotado con criterio de activación explícito (Safari 18 fuera del target).
- **Flicker teórico del light-dismiss al clickear el trigger** con el popover abierto: mitigado con la marca `pointerdown` (documentado en el código de DsSelect).
- **Polyfill de test hasta que jsdom implemente Popover API**: deuda acotada con comentario; se elimina cuando jsdom la soporte (mismo caso que dialog).

### Acciones de seguimiento

- Tooltip y overlays anclados futuros: reutilizar las reglas 1–6 sin re-decidir.
- Al actualizar la ventana de soporte de Safari, evaluar la migración a anchor positioning (regla 2).
