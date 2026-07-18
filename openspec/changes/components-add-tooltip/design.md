# Design — components-add-tooltip

## Context

Primera **directiva** del kit y segundo consumidor de ADR-014 (su validación como patrón). La complejidad no está en el posicionamiento (heredado) sino en el ciclo de vida (delay, triggers duales, 1.4.13) y en cómo una directiva porta estilos.

## Goals / Non-Goals

**Goals:**

- Cumplir los 8 CAs de HU-007; WCAG 1.4.13 completo.
- Reutilizar ADR-014 sin re-decidir nada de capa/posicionamiento.
- API pública mínima: solo la directiva.

**Non-Goals:**

- Popover interactivo/rich, comportamiento táctil dedicado (fuera de alcance de la HU).
- Extraer un helper de posicionamiento compartido con Select: las formas difieren (Select ancla abajo con ancho del trigger; Tooltip centra en 4 placements sin ancho) — se reevalúa recién con un tercer consumidor.

## Decisions

### 1. Directiva pública + panel interno no exportado

Una directiva no puede declarar `styleUrl`: la superficie visual es un componente interno `DsTooltipPanel` (texto, `role="tooltip"`, id, clases y CSS tokenizado) que la directiva crea perezosamente con `createComponent` al primer show y destruye en `OnDestroy`. **No se exporta** desde `public-api.ts` — la API es solo `[dsTooltip]`; el panel es detalle de implementación (mismo espíritu que la interfaz de registración del kit: superficie mínima).

- Alternativa descartada — CSS global en el package de tokens: mezcla responsabilidades (tokens no shippea CSS de componentes) y rompe el encapsulamiento Emulated (ADR-004 §7).

### 2. `popover="manual"` (no `auto`)

El cierre del tooltip lo gobierna 1.4.13 (hover-out, blur, ESC), no el light-dismiss: `auto` cerraría al clickear en cualquier lado (incluido el propio anfitrión) y pelearía con el ciclo hover. Con `manual`, la directiva maneja ESC a nivel `document` **solo mientras está visible** (dismissable sin mover el foco, incluso si el tooltip se abrió por hover con el foco en otro lado). Sigue siendo top layer — la garantía anti-clipping de ADR-014 se mantiene.

### 3. Ciclo de vida de triggers (1.4.13)

- **Hover**: `mouseenter` del anfitrión arranca el timer del delay; `mouseleave` lo cancela o cierra. `mouseenter` del **panel** cancela el cierre (hoverable); `mouseleave` del panel cierra si el mouse tampoco está en el anfitrión.
- **Foco**: `focusin` abre inmediato (sin delay — el usuario de teclado ya expresó intención); `focusout` cierra.
- **Persistent**: no hay timer de auto-cierre.
- Con `dsTooltip` vacío la directiva queda inerte (sin listeners activos que creen panel, sin ARIA).

### 4. Delay: token CSS leído en runtime con fallback

Default en `component.tooltip.delay` → `{motion.duration.slower}` (500ms). La directiva lo lee una vez por show con `getComputedStyle` (parse de `ms`); si el consumidor pasa `dsTooltipDelay` (number ms), ese gana; si el entorno no resuelve la var (jsdom), cae al default hardcodeado 500 — documentado en el código. El delay **no** se anula con `prefers-reduced-motion` (no es motion; evita aperturas accidentales igual).

### 5. `aria-describedby` dinámico y componible

Al mostrar, la directiva **agrega** el id del panel al `aria-describedby` existente del anfitrión (sin pisar valores del consumidor, ej. el hint de un `ds-input`); al ocultar, remueve solo el suyo. El panel existe en DOM solo entre show/hide — no hay referencias colgantes.

### 6. Posicionamiento: 4 placements con flip (fallback JS de ADR-014)

`dsTooltipPlacement` (`top | bottom | left | right`, default `top`): centrado sobre el eje correspondiente, offset por token, flip al opuesto si no hay espacio en viewport. Reposición en scroll/resize mientras esté visible (mismo esquema que Select).

### 7. `aria-describedby` imperativo (excepción del gate `/ng:review`, con aviso al PO)

El review marcó como media el manejo del `aria-describedby` con `get/set/removeAttribute` en vez de un attribute binding reactivo. Se mantiene imperativo como **excepción justificada**: un host binding del atributo **pisaría** el valor estático del consumidor (los bindings ganan sobre atributos) y congelaría cualquier escritor externo dinámico — exactamente lo que la composición de §5 debe soportar. La lectura viva del DOM en show/hide es la única forma de agregar/quitar _solo el id propio_ sin adueñarse del atributo (mismo enfoque que el `AriaDescriber` de Material). El comportamiento está contractualizado en el spec y cubierto por test (incluido el caso con valor preexistente).

## Risks / Trade-offs

- [Timers + listeners de document] → todos con cleanup en hide/`OnDestroy` (el spec lo testea); fake timers en jsdom.
- [`getComputedStyle` por show] → costo trivial (una lectura por apertura, no por frame).
- [Panel creado con `createComponent`] → primer uso del API en el kit; si resulta frágil en tests, la alternativa (elemento imperativo con Renderer2 + clases) queda anotada — sin cambio de contrato.
- [Touch sin hover] → limitación conocida y documentada en la HU/story: la información debe existir por otra vía.
