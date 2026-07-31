---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Gates de calidad de tokens (HU-027, Parte F1-b de la review integral): el contraste WCAG AA, la jerarquía de referencias y la validez del artefacto emitido pasan a verificarse por cálculo en cada PR, dentro de la suite que el pipeline ya corre.

- **Contraste AA versionado**: la lógica de cálculo se muda al repo productivo (`packages/tokens/scripts/contrast.mjs`, única implementación del ratio WCAG) y los pares que las specs declaran normativos quedan como datos en `test/contrast-pairs.json` — 107 pares × 4 scopes = 428 evaluaciones. Antes vivía en una skill de agente y solo corría cuando alguien la invocaba a mano.
- **Jerarquía de tokens**: `test/hierarchy.spec.ts` valida las 4 reglas de referencia entre `primitives`/`semantic`/`component`/`theme` sobre los 827 tokens fuente, más ausencia de ciclos y de referencias a tokens inexistentes.
- **Artefacto emitido**: `test/build.spec.ts` verifica el prefijo `--ds-` universal, cero referencias sin resolver, cero `var()` colgantes y que ningún theme declare custom properties ausentes del scope default.

**Cambio visual (D-030)**: `component.checkbox.border-off` y `component.radio.border-off` pasan de `{color.neutral.400}` a `{semantic.color.border.strong}`. El gate expuso que daban 2.52:1 contra el 3:1 que exige WCAG 1.4.11 en los tres themes claros — el borde es el único indicador visual de un control desmarcado, que no tiene texto propio. Ahora dan 4.74:1 (claros) y 3.78:1 (dark). El borde del checkbox y del radio sin marcar queda un paso más oscuro; sin cambios de API.
