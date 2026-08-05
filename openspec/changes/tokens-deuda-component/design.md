# Diseño — aaa-053

Cinco decisiones. Las tres que eran del PO ya están tomadas (sesión de playground del 2026-08-05); acá queda el cómo y las dos técnicas.

---

## D1 — Conectar la capa de color del botón, no retirarla

Los 23 tokens de color de `primary`/`secondary`/`ghost`/`link`/`danger-ghost`/`danger.border` alias a los mismos semantic que `button.css` consume directo, así que la conexión es mecánica y sin cambio visual. El punto no es estético sino estructural: con la capa conectada, la cadena emitida es

```css
--ds-component-button-primary-bg: var(--ds-semantic-color-bg-primary);
```

y el CSS consume `var(--ds-component-button-primary-bg)`. El theming por `data-theme`/`data-brand` cascadea igual (los overrides pegan en el semantic, que sigue en la cadena), y cualquier divergencia futura entre token y render se vuelve imposible por construcción — la clase de bug de `aaa-049`.

**Alternativa (retirar la capa de color)**: descartada en `proposal.md`. Dejaría al botón como excepción permanente del contrato que checkbox, radio y switch ya cumplen, y la spec de esos tres exige explícitamente "no consumir semantic directo para valores que la capa component declara".

**Verificación**: el scenario nuevo de `component-button` + el diff del CSS emitido (`dist/tokens.css`) antes/después: mismos valores resueltos.

## D2 — El botón es semibold: el token era la verdad

Decisión del PO (2026-08-05, comparación 500↔600 en playground; el gate visual da el OK final). `semantic.font.weight.button` = 600 existía deliberadamente desde el bootstrap — la capa semantic distingue label (500) de button (600) — y `button.css` se desvió en silencio a `var(--ds-font-weight-medium)`.

Mecánica: `button.css` pasa a `font-weight: var(--ds-component-button-font-weight)`. No afecta la altura del control (la declara `component.button.height.*`, gate de `aaa-047`) ni el centrado vertical.

**Si el PO rechaza el peso en el gate**: la vuelta atrás no es restaurar el bypass, sino corregir la cadena — `component.button.font-weight` → `{semantic.font.weight.label}` — y dejar el CSS consumiendo el token. La capa queda viva en ambos desenlaces.

## D3 — Thumb del switch por la cadena de superficie invertida

Decisión del PO (2026-08-05): `component.switch.thumb.bg` pasa de `{color.white}` a `{semantic.color.text.inverse}` — blanco en light, `{color.neutral.900}` en dark. Es la cadena exacta de `aaa-051` para `checkbox.check-color` y `radio.dot-color`, con el mismo racional: el elemento va sobre `bg.primary`, que en dark aclara.

**Alternativa (`{semantic.color.bg.surface}`)**: hoy resuelve idéntico (white / neutral.900). Se elige `text.inverse` por el precedente — los tres controles de la familia quedan sobre la misma cadena y un cambio futuro de esa cadena los mueve juntos.

**Punto de atención para el gate**: en dark con el switch **apagado**, el thumb `neutral.900` queda sobre track `bg-off` (`bg.secondary-active` → `neutral.600` en dark), ~2.3:1. El gate de contraste del spec solo exige ≥3:1 contra el track **encendido** (estado que comunica), así que no falla; pero si al PO el estado off se le ve barroso, el fallback es overridear solo el caso off en dark vía un token intermedio — se decide viéndolo, no acá.

## D4 — Hovers: valores ya declarados, falta pintarlos

Los tokens hover ya declaran valores correctos (`bg-off-hover` → `bg.secondary-hover`, `bg-on-hover` → `bg.primary-hover`); la implementación es CSS puro sobre `:hover:not(:disabled)` (checkbox/radio) y `:hover` del host (card). Nada de JS ni cambios de template.

- **Radio gana `bg-on-hover`** (`{semantic.color.bg.primary-hover}`), que el checkbox ya tiene — sin él, la mitad de la familia reaccionaría al hover solo sin marcar.
- **Card**: la elevación al hover aplica a `outline` y `elevated` (las variantes con sombra); `flat` es plana por contrato y lo sigue siendo. Transición con los tokens de motion existentes y anulada bajo `prefers-reduced-motion` (mismo patrón que el thumb del switch).
- **Sin pares de contraste nuevos**: los fondos hover son semantic que ya pasan por el gate en sus pares existentes; el spec de card lo exige explícitamente.

**Cuidado señalado en el gate**: una card no-clickeable que eleva al hover puede sugerir interactividad falsa. Si molesta en el gate, el camino es un input `interactive` (API nueva, disparador propio, D-015) — no entra acá.

## D5 — Retiros: borrar es el fix

36 tokens sin estado real que describir. Mecánica: `alert.json` se elimina como archivo; el resto son claves borradas de sus JSON. Nada los consume (verificado por la auditoría), así que ni el build ni la suite cambian de output — la verificación es que `pnpm build` + tests sigan verdes y que la re-corrida de `/ds:audit-tokens` deje la deuda de `component.*` en 0 (los 6 falsos positivos del detector TS no son deuda y siguen hasta el fix del script, que va por commit directo).

`alert.json` no se "migra" a ningún lado: HU-041 registra la capacidad sin heredar los tokens como contrato (decisión explícita del PO en D-033a).

---

## Orden de ejecución

Retiros primero (D5 — reduce la superficie antes de tocarla), después tokens (D3 + `radio.bg-on-hover`), después CSS (D1, D2, D4), tests al final de cada grupo, y un único gate visual del PO al cierre: botón semibold, switch en dark on/off, hovers de los tres componentes.

## ADR

No genera ADR. Cada decisión aplica contratos existentes (ADR-003, specs de componente) o ejecuta decisiones ya registradas (D-033, D-015).
