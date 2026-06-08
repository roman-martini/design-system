---
id: aaa-009
name: tokens-add-z-index
type: change
status: archived
archived: 2026-06-08
modifies-specs:
  - design-tokens-package (formaliza z-index + suma transition overlay-enter/exit + effect blur.overlay)
related-adrs:
  - ADR-003
---

## Why

El package `@romanmartinidev/tokens` ya contiene `packages/tokens/src/semantic/z-index.json` con 13 niveles (hide, base, docked, dropdown, sticky, banner, overlay, modal, popover, skiplink, toast, tooltip — escala en miles estilo Bootstrap). Pero el spec `design-tokens-package` NO tiene Requirement que documente esa jerarquía como contrato testable, y NO hay test que valide su completitud. La auditoría disparada por el backlog "tokens-add-z-index" revela que el archivo existe pero **no es contrato formal** — un dev que borre accidentalmente un nivel rompe el sistema sin que ningún test lo detecte.

Adicionalmente, el próximo CHG (Modal — `aaa-011` esperado) necesita 2 tokens secundarios que hoy no existen:

1. **Transitions compuestas para overlays** (`motion.transition.overlay-enter/exit`) — el research Atlassian recomendó componer duration + easing + property por intent en lugar de soltar primitives a cada componente. Modal/Toast/Tooltip comparten el mismo intent "overlay aparece/desaparece" y deben verse consistentes.
2. **Blur de overlay** (`effect.blur.overlay`) — los Modales modernos usan `backdrop-filter: blur(8px)` sobre un `bg.overlay` semitransparente. El valor del blur debe ser tokenizado para mantener consistencia entre Modal y Toast (y posibles Drawer, Tooltip futuros).

El `bg.overlay = rgba(0, 0, 0, 0.5)` (scrim) **ya existe** en `semantic/color.json` — no se toca.

Este change cierra el ítem `tokens-add-z-index` del [BACKLOG.md](../../openspec/BACKLOG.md) (auditoría) y desbloquea parcialmente `aaa-011 components-add-modal` (transitions + blur listos).

Respalda las 3 prioridades del repo:

1. **Buenas prácticas**: formaliza el contrato z-index en el spec (con SHALL/MUST + scenarios), de modo que un dev que rompa la jerarquía falla en CI. Composite transitions por intent es el patrón Atlassian validado en `docs/design/research/atlassian-design.md`.
2. **Escalar ordenado**: los tokens nuevos llegan ANTES que el componente que los consume — cuando Modal aparezca, su CSS es `transition: var(--ds-motion-transition-overlay-enter)` en lugar de hardcoded ad-hoc.
3. **Mantenibilidad**: una sola fuente de verdad para "cómo se ven los overlays del sistema". Si en el futuro se decide cambiar la duración estándar, se ajusta el token y todos los componentes que lo consumen se actualizan a la vez.

Este change toca **1 package** (`@romanmartinidev/tokens`) y **no es one-way door** (es aditivo: sumar tokens y formalizar contrato, sin breaking de tokens existentes). Modifica el spec `design-tokens-package` agregando Requirements ADDED. **NO genera ADR nuevo** — ADR-003 ya cubre la arquitectura general de tokens.

## What Changes

### Tokens nuevos en `@romanmartinidev/tokens`

**`semantic/motion.json`** — Sumar bajo `semantic.motion.transition`:

```json
"overlay-enter": { "value": "250ms cubic-bezier(0, 0, 0.2, 1)" },
"overlay-exit":  { "value": "150ms cubic-bezier(0.4, 0, 1, 1)" }
```

Compuestos por intent (duration + easing). Resultado en CSS: `--ds-motion-transition-overlay-enter` y `--ds-motion-transition-overlay-exit`. Modal/Toast/Tooltip/Drawer los usan vía `transition: opacity var(--ds-motion-transition-overlay-enter), transform var(--ds-motion-transition-overlay-enter)`.

**`semantic/effect.json`** — Archivo nuevo:

```json
{
  "semantic": {
    "effect": {
      "blur": {
        "overlay": { "value": "8px" }
      }
    }
  }
}
```

Resultado: `--ds-effect-blur-overlay = 8px`. Modal/Drawer lo usan en `backdrop-filter: blur(var(--ds-effect-blur-overlay))`.

### Sin cambios (verificado)

- `semantic/z-index.json` ya completo (13 niveles, escala miles).
- `semantic/color.json` ya tiene `bg.overlay = rgba(0, 0, 0, 0.5)` — sirve como scrim, no se toca.

### Spec base `design-tokens-package`

Sumar 3 Requirements ADDED:

1. **Tokens semantic de z-index** — formaliza los 13 niveles, escala en miles, orden ascendente, valor especial `auto`. 5-6 scenarios testables.
2. **Tokens semantic de motion para overlays** — formaliza `transition.overlay-enter` y `transition.overlay-exit` como composed transitions con duration + easing por intent.
3. **Tokens semantic de effect** — formaliza el archivo `semantic/effect.json` y el token `effect.blur.overlay`.

### Test en `packages/tokens`

Sumar `packages/tokens/test/z-index.spec.ts` (o similar) con Vitest. Verifica:

- Existen los 13 niveles esperados.
- `hide` < `base` < `docked` < … < `tooltip` (orden ascendente, excepto `auto` que no se compara).
- Escala en miles cumple (dropdown ≥ 1000, tooltip ≥ 1090).

### Docs

`docs/architecture/README.md` — sumar sección "Jerarquía de z-index" con tabla de niveles y orden de uso. Reemplaza la decisión informal del research atlassian.

### Changeset

`pnpm changeset` → bump **minor** de `@romanmartinidev/tokens` (feature aditiva: nuevos tokens, contrato formalizado).

## Capabilities

### New Capabilities

Ninguna. El spec `design-tokens-package` ya existe (introducido por aaa-002).

### Modified Capabilities

- `design-tokens-package`: 3 nuevos Requirements ADDED. Sin REMOVED ni MODIFIED.

## Impact

### Código

- **Creados**:
  - `packages/tokens/src/semantic/effect.json` (1 archivo, ~10 líneas).
  - `packages/tokens/test/z-index.spec.ts` (o equivalente — confirmar ubicación de tests en design.md).
- **Modificados**:
  - `packages/tokens/src/semantic/motion.json` — agregar 2 entries.
  - `docs/architecture/README.md` — sumar sección z-index.
- **Eliminados**: ninguno.

### APIs públicas

Aditivo, **no breaking**. Nuevos CSS custom properties expuestos vía `@romanmartinidev/tokens/css`:

- `--ds-motion-transition-overlay-enter`
- `--ds-motion-transition-overlay-exit`
- `--ds-effect-blur-overlay`

Y formalización (sin cambio de valor) de los 13 `--ds-z-index-*` ya existentes.

### Dependencias

Sin nuevas runtime ni devDeps.

### Spec deltas

- `design-tokens-package`: 3 Requirements ADDED.

## Alternativas evaluadas

### Opción A — Solo formalizar z-index (auditoría pura, sin sumar tokens)

Sumar Requirement + tests al z-index existente. NO sumar motion compuesto ni effect blur.

- **Pros**: scope mínimo, cero "tokens hipotéticos".
- **Contras**: cuando Modal arranque, va a tener que sumar motion + blur ad-hoc en ese change. Eso fragmenta el trabajo: tokens del sistema (acá) y tokens del componente (allá) no quedan coordinados. El research Atlassian recomendó motion compuesto por intent justamente para evitar inconsistencia.

### Opción B — Auditoría + motion compuesto + effect blur (esta propuesta)

Formalizar z-index + sumar 2 motion semánticos + 1 effect.

- **Pros**: Modal arranca con base sólida. Los 3 tokens nuevos son **validados por patrón industria** (Atlassian + Mat) y conservadores. Cero changes intermedios.
- **Contras**: ~30% más esfuerzo que A. Mitigación: los tokens son chicos y bien delimitados.

### Opción C — Auditoría + motion compuesto + effect + tokens específicos por componente (modal.shadow, tooltip.bg, etc.)

Como B pero sumando tokens dedicados como `component/modal.json`.

- **Pros**: máxima preparación para Modal.
- **Contras**: tokens por componente sin componente que los consume es **anti-patrón explícito** del repo ("Sin features hipotéticas" — regla del BACKLOG.md). Mejor decidir tokens específicos cuando arranque el CHG del componente.

**Decisión**: **Opción B** — alineada con Roman, scope balanceado, conservadora.

## ADRs y follow-ups

- **NO genera ADR nuevo**. ADR-003 (Arquitectura de design tokens) ya cubre la jerarquía primitive → semantic → component → theme. Los tokens nuevos respetan esa jerarquía sin nueva decisión arquitectónica.

- **Follow-ups posibles** (cada uno como CHG independiente):
  - `aaa-010 components-decide-icon-library` (ADR-009) — bloquea Modal (X de cierre) y Select (chevron).
  - `aaa-011 components-add-modal` — consume los tokens introducidos en este change.
  - Si aparece patrón claro de "tooltip aparece más rápido que modal", evaluar sumar `transition.tooltip-enter` por separado de `overlay-enter`. Por ahora un solo intent.
