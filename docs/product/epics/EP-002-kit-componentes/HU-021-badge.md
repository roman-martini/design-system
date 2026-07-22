---
epica: EP-002
actor: Dev consumidor
estado: Refinada (2026-07-22; ejecución vía change components-add-badge — BACKLOG Now, tercera entrega de la tanda 3; primera implementación de ADR-019)
decisiones: [D-007, D-012, D-014, D-015, D-017]
adrs: [ADR-004, ADR-019]
---

# HU-021 — Badge de estado (dev consumidor)

**COMO** dev que muestra estado, categoría o severidad (roles, tags, estados de un recurso)
**QUIERO** un `ds-badge` con tono y apariencia configurables, ícono y punto de estado opcionales
**PARA** etiquetar de forma consistente y accesible sin recrear pills a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (fila Badge/Secondary/Outline/Error) y las etiquetas Owner/Developer/Billing del team (img 5). Primera implementación de referencia del modelo de variantes de [ADR-019](../../../architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md).

## Decisiones de refinamiento (PO, 2026-07-22)

1. **Modelo de dos ejes `tone × appearance`** ([ADR-019](../../../architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md), [D-017](../../decisiones.md)) — el PO estableció el patrón como estándar del kit para componentes de estado. `tone`: `neutral` (default) | `primary` | `danger` | `success` | `warning` | `info`. `appearance`: `subtle` (default) | `solid` | `outline`. El vocabulario de tono es el semantic del kit (`danger`, no `error`/`destructive`).
2. **Sizes `sm | md | lg`** (default `md`) — el PO pidió cubrir los tres, sin medias tintas (D-017). `lg` habilita badges prominentes (headers, estados destacados).
3. **Ícono leading y punto de estado, ambos en scope** — input `icon` (leading, hereda el color del tono) y flag `dot` (punto de estado leading, del color del tono). Excluyentes entre sí (a resolver en implementación: `dot` gana o son mutuamente excluyentes por contrato).

## Criterios de aceptación

<!-- Binarios: al implementar se vuelven scenarios del spec component-badge (nuevo, ADR-018). -->

- [ ] **CA-021.1 (dos ejes)** — Dado `<ds-badge>` (standalone, OnPush) con `tone` (`neutral | primary | danger | success | warning | info`, default `neutral`) y `appearance` (`subtle | solid | outline`, default `subtle`), entonces refleja ambos en `data-tone`/`data-appearance` y el texto va proyectado.
- [ ] **CA-021.2 (contraste AA por combinación)** — Dada cada combinación `tone × appearance`, entonces el par texto/fondo (y borde en `outline`) cumple WCAG AA (≥4.5:1 texto, ≥3:1 borde) en los 4 themes, verificado por el gate de contraste por script. En `solid`, el color de texto se elige por tono (blanco en tonos oscuros; texto oscuro en `warning`).
- [ ] **CA-021.3 (sizes)** — Dado `size` `sm | md | lg` (default `md`), entonces padding, font-size, radius y tamaño de ícono/dot salen de tokens `component.badge.*` por size.
- [ ] **CA-021.4 (ícono y dot)** — Dado `icon` (Lucide, leading) o `dot` (punto de estado leading), entonces se renderiza con el color del tono; el ícono es decorativo (`aria-hidden`) — el significado lo lleva el texto.
- [ ] **CA-021.5 (a11y)** — Dado un badge, entonces es un contenedor de texto sin `role` impuesto; el estado se comunica por el **texto**, nunca solo por color (WCAG 1.4.1).
- [ ] **CA-021.6 (tokens)** — Dado el CSS, entonces todo valor sale de `var(--ds-*)` (`component.badge.*` referenciando semantic), sin hardcodes ni hex.
- [ ] **CA-021.7 (export + showcase)** — Dado `public-api.ts`, exporta `DsBadge`, `DsBadgeTone`, `DsBadgeAppearance`, `DsBadgeSize`; el showcase muestra la matriz tono × apariencia, los 3 sizes, y ejemplos en contexto (roles del team, ícono, dot).

## Dependencias

- Reutiliza el vocabulario y los pares de contraste danger de [D-012](../../decisiones.md)/[HU-020](HU-020-button-outline-destructive.md). Ícono Lucide por [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md).
- Establece el patrón que reutilizarán Alert/Tag/Chip futuros (ADR-019).

## Fuera de alcance

- Badge numérico / notification dot posicionado sobre otro elemento (composición).
- Badge removible/closable (chip): componente aparte si aparece.

## Notas

- Change OpenSpec: `components-add-badge` — introduce el spec `component-badge` (ADR-018) + tokens `component.badge.*`.
- **Contraste solid**: los tonos claros (`warning`, `success` en pasos bajos) no pasan con texto blanco → el token de texto solid es por tono (el gate fija los pasos exactos). Este es el caso que justifica el modelo por tono.
- Changeset **minor** de components + tokens (lockstep ADR-015).
