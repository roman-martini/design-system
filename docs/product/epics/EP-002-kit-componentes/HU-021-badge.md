---
epica: EP-002
actor: Dev consumidor
estado: Identificada (tanda 3, D-014 2026-07-22; CAs binarios al refinar, justo antes de su change)
decisiones: [D-007, D-012, D-015]
adrs: [ADR-004]
---

# HU-021 — Badge de estado (dev consumidor)

**COMO** dev que muestra estados o categorías (roles, tags, estados de un recurso)
**QUIERO** un `ds-badge` con variantes
**PARA** etiquetar de forma consistente sin recrear pills a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (fila Badge/Secondary/Outline/Error) y las etiquetas Owner/Developer/Billing del team (img 5, aunque ahí son outline).

## Criterios de aceptación (candidatos)

- [ ] **CA-021.1 (variantes)** — `<ds-badge>` (standalone, OnPush) inline, variantes `default | secondary | outline | destructive`; texto proyectado.
- [ ] **CA-021.2 (tokens y contraste)** — Padding/radius/tipografía por `component.badge.*`; cada variante cumple contraste AA (gate del script).
- [ ] **CA-021.3 (a11y)** — Decorativo por defecto; el estado se comunica por el **texto**, no solo por color (no depende del color para el significado).
- [ ] **CA-021.4 (showcase)** — El showcase muestra las variantes y un ejemplo en contexto (ej. el rol en una fila de team).

## Decisiones a resolver al refinar

1. ¿Size única o `sm`/`md`? (la referencia sugiere una sola).
2. ¿Badge con ícono (leading)? ¿Badge con punto de estado?
3. Naming variante peligrosa: `destructive` vs `error`/`danger` (coherencia con HU-020).

## Dependencias

- Reutiliza colores danger (D-012). Alinear naming de variante con [HU-020](HU-020-button-outline-destructive.md).

## Fuera de alcance

- Badge numérico / notification dot sobre otro elemento (composición).
- Badge removible/closable (chip).

## Notas

- Change tentativo: `components-add-badge`.
