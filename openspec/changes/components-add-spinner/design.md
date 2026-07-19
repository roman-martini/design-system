# Design — components-add-spinner (aaa-023)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Sexto componente de la tanda 1 (D-009). HU-009 refinada (PO 2026-07-19) fija: spinner solo (sin tocar `DsButton`), `currentColor`, pulso de opacidad en reduced-motion, anuncio con opt-out, sizes `xs/sm/md/lg`. Primer componente puramente decorativo/animado del kit: no es form control, no es overlay (ADR-014 no aplica), sin iconos (ADR-012 no aplica).

## Goals / Non-Goals

**Goals:**

- `DsSpinner` accesible que funcione standalone e inline (dentro de un botón) sin API de color.
- Animación tokenizada con alternativa reduced-motion que comunique actividad sin movimiento espacial.

**Non-Goals:**

- Estado `loading` de `ds-button` (item `components-button-loading` del BACKLOG).
- Progreso determinado (`ds-progress`), variante overlay/fullscreen, variantes de color.

## Decisions

### 1. API pública mínima

```ts
// public-api.ts
DsSpinner; // selector ds-spinner
type DsSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
// inputs: size (default 'md'), label (default 'Cargando')
```

- Sin outputs, sin content projection: es un indicador puro. Cualquier input extra (color, velocidad) violaría D-005.
- `label=""` activa el modo decorativo (decisión 4 de la HU). Se resuelve con `computed`: label no vacío → `role="status"` + texto visually-hidden; vacío → `aria-hidden="true"` en el host y sin role.

### 2. Render: SVG inline (círculo track + arco), no border CSS

- **SVG con dos `<circle>`**: track completo con `stroke="currentColor"` y `opacity` tokenizada; arco (≈75% del perímetro vía `stroke-dasharray`) con `stroke="currentColor"` pleno y `stroke-linecap="round"`.
- **Descartado** el spinner de `border` CSS (`border-top-color` distinta): no permite extremos redondeados ni control fino del largo del arco, y el track con opacidad exigiría `color-mix`. El SVG expresa track/arco/grosor de forma declarativa y hereda `currentColor` gratis (CA-009.2).
- `viewBox` constante y `vector-effect: non-scaling-stroke` para que `stroke-width` tome el px del token por size sin escalar con el diámetro.

### 3. Sizes por `data-size` + tokens `component.spinner.*`

Mismo patrón de `button.css` (`[data-size]` + vars):

| Token                        | Referencia                |
| ---------------------------- | ------------------------- |
| `spinner.size-xs/sm/md/lg`   | `{dimension.16/20/32/48}` |
| `spinner.stroke-xs/sm/md/lg` | `{dimension.2/2/3/4}`     |
| `spinner.track-opacity`      | `{opacity.25}`            |
| `spinner.duration-spin`      | `800ms` raw documentado   |
| `spinner.duration-pulse`     | `2000ms` raw documentado  |

- `xs` = 16px alinea con el icon size de `ds-button` (caso embebido); `lg` = 48px para cargas de página/sección.
- Duraciones raw: no hay primitive de motion en esa escala (mismo criterio que `toast.duration` 5000ms, aaa-021). Easing del spin: `{motion.easing.linear}` (rotación continua sin aceleración).

### 4. Animaciones: `@keyframes` propios con bloque reduced-motion por reemplazo

- Default: `transform: rotate(360deg)` infinito sobre el SVG (`spinner.duration-spin`, linear). Solo `transform` — compositor-friendly, sin layout thrashing.
- `@media (prefers-reduced-motion: reduce)`: la animación de rotación se **reemplaza** (no se apaga) por `@keyframes` de opacidad sobre el arco (`1 → 0.4 → 1`, `spinner.duration-pulse`, ease-in-out). Es el primer componente del kit cuyo bloque reduced-motion sustituye una animación en vez de solo anular transiciones (`transition: none` del resto) — si el patrón se repite (Skeleton es candidato), se evalúa convención transversal al cierre.

### 5. A11y: live region con opt-out

- Modo anunciado: host con `role="status"` (live region cortés implícita) + `<span class="visually-hidden">{{ label }}</span>`. El SVG siempre `aria-hidden="true"` (el canal accesible es el texto, no el dibujo).
- Modo decorativo (`label=""`): host con `aria-hidden="true"`, sin role — el contexto contenedor es dueño del anuncio (ej. botón "Guardando…").
- El kit no tiene utilidad visually-hidden todavía: se define la clase localmente en `spinner.css` (clip-path/clip estándar). Si un tercer componente la necesita (toast ya inyecta texto visible, no aplica), se promueve a utilidad compartida — no antes (D-005).
- Sin pares de contraste propios: `currentColor` delega el contraste al contexto (CA-009.5); el gate de contraste por script no suma pares nuevos.

## Risks / Trade-offs

- [`vector-effect: non-scaling-stroke` en jsdom no es verificable visualmente] → los tests asertan atributos/clases y tokens en el CSS; la geometría real se verifica en playground/Storybook (mismo criterio que ADR-013 §6).
- [El pulso de opacidad podría leerse como "colgado" en esperas largas] → la duración 2s mantiene ritmo perceptible; validación manual en showcase con emulación de reduced-motion.
- [Live region que aparece con el spinner: algunos SR anuncian tarde el contenido inicial] → aceptado: `role="status"` es cortés por diseño (paridad con toast aaa-021 §5); el caso crítico (errores) no es del spinner.

## Open Questions

(ninguna — el refinamiento de HU-009 cerró todas las decisiones de producto)
