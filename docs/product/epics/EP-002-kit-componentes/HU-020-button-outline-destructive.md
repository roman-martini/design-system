---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-07-22, aaa-033 components-button-variants archivado — segunda entrega de la tanda 3; genera D-016, gate de contraste 9 pares × 4 themes verde, /ng:review 0 altas/medias, verificación visual del PO OK)
decisiones: [D-007, D-012, D-014, D-015, D-016]
adrs: [ADR-011]
---

# HU-020 — Variantes outline y danger de Button (dev consumidor)

**COMO** dev que arma acciones en la UI
**QUIERO** las variantes `outline` y `danger` (sólida, outline y ghost) en `DsButton`
**PARA** ofrecer acciones secundarias con borde y acciones peligrosas (borrar, confirmar destrucción) sin salir del componente ni recrear estilos.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (fila COMPONENTS: Primary, Secondary, **Outline**, Ghost, **Delete**). Enhancement de `DsButton` (hoy: primary/secondary/ghost).

## Decisiones de refinamiento (PO, 2026-07-22)

1. **Naming `danger`** (no `destructive`) — coherente con el vocabulario ya establecido del kit: tokens `danger.*`, item danger de `DsMenu` (D-012), `text.danger`. Badge (HU-021) hereda el mismo término.
2. **Contraste en la fuente** ([D-016](../../decisiones.md)) — el PO delegó en la mejor práctica: se sube la cadena semantic de fondos danger del default (`bg.danger` 500→600, hover 600→700, active 700→800) en vez de parchear por componente. Par sobre red.600 = 4.83:1 ✓ en default/brands; en dark el gate reveló base 3.71:1 ✗ y su cadena corre un paso aclarando (500/400/300 → 4.76:1 ✓). Cualquier consumidor futuro de `bg.danger` hereda el fix.
3. **Alcance completo de danger** — sólida + `danger-outline` + `danger-ghost` (el PO optó por cubrir confirmaciones secundarias desde ya, D-015). Los pares de texto danger ya están sanos por D-012 (6.47:1 sobre surface, 5.91:1 sobre danger-subtle).

## Criterios de aceptación

<!-- Binarios: al implementar se vuelven scenarios del spec component-button
     (delta MODIFIED del change components-button-variants). -->

- [x] **CA-020.1 (outline)** — Dado `variant="outline"`, entonces el botón renderiza fondo transparente, borde `border.default` y texto primario, con hover/active tokenizados (mismos fondos de interacción que ghost); todo por `var(--ds-*)`.
- [x] **CA-020.2 (danger sólida)** — Dado `variant="danger"`, entonces usa el bloque `component.button.danger.*` del bootstrap (bg/hover/active/texto inverso) y el par texto/fondo cumple AA ≥4.5:1 en los 4 themes (gate por script).
- [x] **CA-020.3 (danger-outline y danger-ghost)** — Dado `variant="danger-outline"` (borde y texto danger, fondo transparente) o `variant="danger-ghost"` (solo texto danger), entonces el hover usa `danger-subtle` y los pares de texto cumplen AA (pares D-012).
- [x] **CA-020.4 (cadena semantic D-016)** — Dado el theme default, entonces `bg.danger`/`danger-hover`/`danger-active` referencian `red.600/700/800` y la cadena dark aclara un paso (`red.500/400/300`); el gate de contraste post-build pasa sin regresión en ningún par existente.
- [x] **CA-020.5 (compatibilidad)** — Dadas las 4 variantes nuevas, entonces coexisten con primary/secondary/ghost sin cambios de API previa, y el disabled accesible (ADR-011) y el estado `loading` (HU-017) funcionan en todas.
- [x] **CA-020.6 (showcase)** — Dado el playground, entonces el showcase de `DsButton` muestra las 7 variantes, incluyendo los estados hover/disabled/loading de danger.

## Dependencias

- Ninguna bloqueante. Reutiliza el bloque `button.danger.*` del bootstrap y los pares de texto danger de D-012.

## Fuera de alcance

- Variante `link` (el bootstrap dejó tokens `button.link.*`, pero no está en la referencia — queda latente, entra con aprobación del PO si aparece el caso, D-015).
- Nuevas sizes o iconografía de botón.
- Cambios al patrón de disabled/loading (se respetan).

## Notas

- Change OpenSpec: `components-button-variants` — delta MODIFIED de `component-button` + edición del semantic `color.json` (D-016).
- Tokens: el bloque sólido `button.danger.*` ya existe (bootstrap); se agregan `button.outline.*`, `button.danger-outline.*` y `button.danger-ghost.*` referenciando semantic existentes. Changeset **minor** de components + tokens (lockstep ADR-015).
- Ratios calculados: blanco sobre red.500 = 3.76:1 ✗ · red.600 = 4.83:1 ✓ · red.700 ≈ 6.2:1 ✓ (los fija el gate del change).
