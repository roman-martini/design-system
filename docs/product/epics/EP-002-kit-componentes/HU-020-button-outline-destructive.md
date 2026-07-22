---
epica: EP-002
actor: Dev consumidor
estado: Identificada (tanda 3, D-014 2026-07-22; CAs binarios al refinar, justo antes de su change)
decisiones: [D-005, D-007, D-012]
adrs: [ADR-011]
---

# HU-020 — Variantes outline y destructive de Button (dev consumidor)

**COMO** dev que arma acciones en la UI
**QUIERO** las variantes `outline` y `destructive` en `DsButton`
**PARA** ofrecer acciones secundarias con borde (outline) y acciones peligrosas (destructive/borrar) sin salir del componente ni recrear estilos.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (fila COMPONENTS: Primary, Secondary, **Outline**, Ghost, **Delete**). Enhancement de `DsButton` (hoy: primary/secondary/ghost).

## Criterios de aceptación (candidatos)

- [ ] **CA-020.1 (outline)** — `variant="outline"`: fondo transparente, borde `border.default`, texto primario; hover/active tokenizados. Sin hardcodes.
- [ ] **CA-020.2 (destructive)** — `variant="destructive"`: fondo `bg.danger` + texto inverso, hover/active `danger-hover`/`danger-active` (reutiliza [D-012](../../decisiones.md)); contraste AA verificado por el script (gate).
- [ ] **CA-020.3 (compatibilidad)** — Las nuevas variantes coexisten con primary/secondary/ghost y respetan el disabled accesible ([ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md)) y el estado `loading` ([HU-017](HU-017-button-loading.md)).
- [ ] **CA-020.4 (showcase)** — El showcase de `DsButton` muestra las 5 variantes.

## Decisiones a resolver al refinar

1. ¿`destructive` también en modo outline/ghost, o solo sólido? (la referencia muestra Delete solo sólido).
2. Nombre de la variante: `destructive` (shadcn) vs `danger` (naming del kit, coherente con tokens `danger`).

## Dependencias

- Reutiliza tokens `bg.danger`/`text.danger` existentes (D-012) — sin tokens nuevos previstos.

## Fuera de alcance

- Nuevas sizes o iconografía de botón.
- Cambios al patrón de disabled/loading (se respetan).

## Notas

- Enhancement aditivo → changeset **minor**. Change tentativo: `components-button-variants`.
- Verificar el par de contraste de `destructive` (texto sobre `bg.danger` = red.500) en los 4 themes antes de fijar. Si algún par falla AA, el ajuste es subir un paso el token (mismo criterio que D-008/D-012) y registrar la decisión — no hardcodear en el componente.
