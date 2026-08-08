---
'@romanmartinidev/tokens': patch
'@romanmartinidev/components': patch
---

Deuda de la capa `component.*` saldada: cada token o tiene consumidor o no existe (aaa-053, cierre de la Parte H de la review integral). Trae cambios visibles y retiros de superficie:

- **El botón es semibold (600)**: `component.button.font-weight` siempre lo declaró y el CSS se había desviado a 500 en silencio. El token era la verdad — cambio visual en todos los botones del kit.
- **`button.css` consume su capa component completa**: los colores de `primary`, `secondary`, `ghost`, `danger` y `danger-ghost` pasan de semantic directo a `--ds-component-button-<variant>-*`, el mismo contrato que checkbox, radio y switch ya cumplían. Sin cambio visual (las cadenas resuelven a los mismos valores); `ghost` gana su estado `:active`, que su token declaraba sin consumidor.
- **Thumb del switch theme-aware en dark**: `component.switch.thumb.bg` pasa de `{color.white}` a la cadena de superficie invertida (`semantic.color.text.inverse`) — blanco en light, oscuro en dark, igual que la marca del checkbox y el punto del radio.
- **Hovers nuevos**: checkbox y radio comunican el puntero en ambos estados (`bg-off-hover`/`bg-on-hover`; radio gana `bg-on-hover` por simetría); las cards `outline` y `elevated` elevan al hover con `shadow-hover` y transición anulada bajo `prefers-reduced-motion` (`flat` sigue plana).
- **41 tokens retirados** — para un consumidor pre-1.0 es cambio de superficie: desaparecen del CSS emitido todos los `--ds-component-alert-*` (24; el componente no existe — la capacidad queda registrada como HU-041), los `--ds-component-*-focus-ring*` per-componente (6; el modelo del sistema es el anillo único `--ds-semantic-shadow-focus`), los `--ds-component-button-link-*` (5; `DsButtonVariant` no incluye `link`), `radio.dot-size.sm/md`, `modal.z-index`, `avatar.status-border`, `avatar.status-size` y `card.padding.lg`.
