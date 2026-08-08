---
id: aaa-053
name: tokens-deuda-component
type: change
status: proposed
modifies-specs:
  - component-button (capa de color por variante y peso tipográfico)
  - component-checkbox (estado hover del control)
  - component-radio (estado hover del control)
  - component-card (elevación al hover)
  - component-switch (thumb theme-aware)
related-adrs:
  - ADR-003
related-decisions:
  - D-033
  - D-015
---

# Deuda de la capa component.\*: conectar o retirar

## Why

La auditoría formal del 2026-08-04 (`docs/design/tokens/2026-08-04-audit.md`) dejó triada la deuda de la capa `component.*`: tokens declarados que el CSS no consume — el mismo patrón que en la Parte G derivó dos veces en render contradiciendo al token. D-033 resolvió los cuatro puntos que estaban abiertos, y la sesión de playground del 2026-08-05 cerró los tres que pedían verse: el botón es **semibold** (el token era la verdad, el CSS se desvió), el thumb del switch **se invierte con el theme** (mejor práctica, cadena de `aaa-051`), y los estados hover prometidos **se implementan** (el switch ya los renderiza; checkbox, radio y card se emparejan).

Respalda la **prioridad 3 (mantenibilidad)**: después de este change, cada token de `component.*` o tiene consumidor o no existe — la clase de bug "token muerto que un día diverge" se queda sin lugar donde vivir. Y la **prioridad 1** en los hovers y el thumb: estados de interacción consistentes en toda la familia de controles.

Es el segundo y último bloque de la Parte H de la review del 2026-07-26; el primero (capas primitives/semantic) es `aaa-052`.

## What Changes

**A. Retiros — 41 tokens que no describen nada real:**

- `component/alert.json` completo (24): componente inexistente. La capacidad no se pierde: HU-041 la registra en el roadmap y sus tokens se rediseñarán con el componente [D-033a].
- Capa de focus ring per-componente (6): `button.focus-ring-color`, `button.focus-ring-width`, `checkbox.focus-ring`, `input.focus-ring`, `radio.focus-ring`, `switch.focus-ring`. El modelo del sistema es el anillo único `semantic.shadow.focus` (que `aaa-052` vuelve theme-aware) [D-033b].
- `component.radio.dot-size.sm/md` (2): veredicto de deuda desde `aaa-051` — el dot se dimensiona por otra vía.
- `component.modal.z-index` (1): el modal usa el top layer del `<dialog>` nativo; el token es engañoso.
- `component.avatar.status-border`, `status-size` (2): feature "indicador de status" no implementada; si aparece su disparador, entra como HU propia (D-015).
- `component.card.padding.lg` (1): la spec de card fija el contrato en `padding.md`/`padding.sm`; `lg` quedó fuera del diseño real.
- `component.button.link.*` (5, descubierto en el apply): `DsButtonVariant` no incluye `link` — la variante no existe en el componente, así que no hay nada a qué conectar estos tokens. Mismo criterio que `avatar.status`: si aparece el disparador de una variante link, entra como HU propia (D-015).

**B. Botón — la capa component deja de estar muerta (cambio visual):**

- Las variantes `primary`, `secondary`, `ghost`, `danger-ghost` y el borde de `danger` (18 tokens) están declaradas en `component/button.json` pero `button.css` consume los semantic directamente — inconsistente con `danger` y `outline`, que sí pasan por la capa. El CSS se conecta a su capa component. **Sin cambio visual** (los tokens alias los mismos semantic; el theming cascadea igual con `outputReferences`).
- `component.button.font-weight` (600, semibold) pasa a consumirse: **el token era la verdad y el CSS se desvió a 500** (PO, 2026-08-05, gate visual pendiente). **Cambio visual en todos los botones del kit.**

**C. Switch — thumb theme-aware (cambio visual en dark):**

- `component.switch.thumb.bg` pasa de `{color.white}` a la cadena de `aaa-051` (`{semantic.color.text.inverse}`): blanco en light, `neutral.900` en dark (PO, 2026-08-05). El gate del spec (thumb vs track ≥3:1 en los 4 themes) lo verifica.

**D. Hovers prometidos se implementan (cambio visual):**

- Checkbox: `bg-off-hover` y `bg-on-hover` se renderizan.
- Radio: `bg-off-hover` se renderiza y se agrega `bg-on-hover` por simetría con checkbox.
- Card: `shadow-hover` se renderiza en las variantes con sombra (`outline`, `elevated`); `flat` queda plana a propósito.
- (PO, 2026-08-05: "implementar hover". El switch ya renderiza los suyos — esto empareja la familia.)

**Fuera de alcance:** los fixes chicos que la auditoría marcó para commit directo (detector de consumo desde TS, documentar `badge.solid-*`); un input `interactive` para card (API nueva — necesita su disparador, D-015); todo lo de capas primitives/semantic (es `aaa-052`).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `component-button`: requirement nuevo — colores de variante y peso tipográfico salen de la capa `component.button.*` (hoy solo el dimensionamiento lo exige); el peso renderizado es el que declara el token (semibold).
- `component-checkbox`: el requirement de estilos gana el estado hover del control (off y on).
- `component-radio`: ídem checkbox, con el token `bg-on-hover` sumado al contrato.
- `component-card`: el requirement de la familia gana la elevación al hover en `outline`/`elevated`.
- `component-switch`: el requirement declara el thumb theme-aware (hoy solo lo exige para `bg-off`).

## Impact

- **`packages/tokens/src/component/`** — `alert.json` se elimina; `button.json`, `checkbox.json`, `input.json`, `radio.json`, `switch.json`, `card.json`, `avatar.json`, `modal.json` pierden tokens o cambian referencias; `radio.json` gana `bg-on-hover`.
- **`packages/components/src/lib/`** — `button/button.css`, `checkbox/checkbox.css`, `radio/radio.css`, `card/card.css`, `switch/switch.css` cambian consumo; sin cambios de API pública ni de templates.
- **Tests** — suites de checkbox/radio/card/switch/button acompañan (hover, no-hardcodes); el gate de contraste del switch cubre el thumb nuevo; re-corrida de `/ds:audit-tokens` debe dar ~0 deuda en `component.*`.
- **Consumidores** — cambios visuales: peso del botón (todo el kit), thumb del switch en dark, hovers nuevos. Pre-1.0 (ADR-015); el changeset los describe como cambio visible.
- **Gate visual del PO (D-022)** — bloqueante para archivar: botón en 600, switch en dark (on y off — atención al thumb oscuro sobre track gris), hovers de checkbox/radio/card.

## Alternativas evaluadas

**A. Retirar también la capa de color del botón** (los 23 de bypass) en vez de conectarla — la capa component de color quedaría "solo para variantes que difieren de semantic", documentado. **Descartada**: contradice el contrato que checkbox, radio y switch ya cumplen ("fondo y borde vía `component.*`, no semantic directo") y dejaría al botón como excepción permanente del patrón; la conexión es mecánica y sin cambio visual.

**B. Conservar los tokens huérfanos "por si acaso"** (alert, avatar.status, focus ring per-componente) como spec anticipada. **Descartada**: D-015 prohíbe capacidad sin disparador, y la auditoría mostró que la capa muerta es donde nacen los bugs de divergencia. El roadmap (HU-041) conserva la intención sin conservar los tokens.

**C. Implementar el hover solo en checkbox/radio y retirar `card.shadow-hover`** (una card no es un control). **Descartada**: la card `outline` de la referencia ya combina borde y sombra sutil; la elevación al hover es el affordance estándar de cards en grillas y el PO pidió implementar. La objeción real (¿y si la card no es clickeable?) se mira en el gate; si molesta, el camino es un input `interactive` con su propio disparador, no el retiro del token.

## ADR

No genera ADR: ejecuta D-033 y D-015 dentro de ADR-003, en un solo package por capa (tokens + components, pero sin decisión one-way door nueva: cada movimiento aplica contratos ya escritos en las specs).
