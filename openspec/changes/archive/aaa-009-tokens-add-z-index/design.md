## Context

`@romanmartinidev/tokens` arrancó en aaa-002 con jerarquía primitives → semantic → component → theme (ADR-003). El archivo `semantic/z-index.json` se sumó allí con 13 niveles inspirados en Bootstrap. Pero **no quedó formalizado en el spec `design-tokens-package`** — el spec habla de Style Dictionary, jerarquía, prefix `--ds-*`, pero no enumera qué tokens semantic son contrato. Cualquier dev podría agregar/quitar niveles de z-index sin que ningún test lo detecte.

Este change cierra ese gap (auditoría = formalización) y aprovecha la ventana para sumar 3 tokens secundarios que Modal — el siguiente componente del backlog — va a consumir.

Decisiones del kickoff con Roman:

1. **Scope B** de la propuesta: A (formalizar z-index) + C limitado (motion overlay + effect blur).
2. **NO sumar `bg.scrim`** — ya existe `bg.overlay = rgba(0, 0, 0, 0.5)` en `semantic/color.json`. Suficiente.
3. **NO sumar tokens dedicados por componente** (`component/modal.json` etc.) — anti-patrón sin componente confirmado.

## Goals / Non-Goals

### Goals

- Formalizar los 13 niveles de z-index existentes como contrato testable en spec `design-tokens-package`.
- Sumar test Vitest que valida la presencia + orden de los niveles z-index.
- Sumar 2 tokens compuestos motion (`transition.overlay-enter`, `transition.overlay-exit`).
- Sumar archivo nuevo `semantic/effect.json` con `effect.blur.overlay`.
- Actualizar `docs/architecture/README.md` con sección "Jerarquía de z-index".
- Build pasa, tokens consumibles vía `--ds-motion-transition-overlay-*` y `--ds-effect-blur-overlay`.

### Non-Goals

- NO modificar `semantic/z-index.json` (ya completo).
- NO tocar `semantic/color.json` (ya tiene `bg.overlay`).
- NO sumar tokens `component/modal.json` ni similar — anti-patrón sin componente confirmado.
- NO modificar primitives.
- NO crear ADR nuevo.
- NO consumir los tokens en componentes existentes (Button, Checkbox, Radio no necesitan z-index).

## Decisions

### 1. Composite transitions con sintaxis CSS shorthand

Los tokens `transition.overlay-enter` y `transition.overlay-exit` son strings con sintaxis CSS shorthand `<duration> <easing>` (sin property — el consumidor define qué propiedad anima).

```json
"overlay-enter": { "value": "250ms cubic-bezier(0, 0, 0.2, 1)" },
"overlay-exit":  { "value": "150ms cubic-bezier(0.4, 0, 1, 1)" }
```

Resultado en CSS:

```css
.modal--entering {
  transition:
    opacity var(--ds-motion-transition-overlay-enter),
    transform var(--ds-motion-transition-overlay-enter);
}
```

**Por qué shorthand sin property**:

- Modal anima `opacity` y `transform` simultáneamente (fade + scale). Si el token incluye property, queda atado a uno solo.
- `motion.transition.fast/normal/slow` existentes siguen el mismo patrón (shorthand sin property). Consistencia interna.

**Por qué dos tokens separados (enter vs exit)**:

- Convención: los exits son ~60% más rápidos que los enters (UX validada). `enter = 250ms`, `exit = 150ms`.
- Easings distintos: enter usa `ease-out` (rápido al final, sensación de "asentarse"), exit usa `ease-in` (rápido al final también, pero acelera al irse).
- Sumar uno solo `overlay-transition` obligaría al consumidor a duplicar.

### 2. Duraciones (250ms enter, 150ms exit)

Calibrado contra:

- **Atlassian Design System** (research/atlassian-design.md §1.7): "Transiciones 150-400ms para elementos entering/moving". `dropdown entrance = 150ms`, `modal entrance = 250ms`. Nuestro `overlay-enter = 250ms` coincide.
- **Material Design 3**: modal enter = 250ms, exit = 200ms. Nuestro exit es más agresivo (150ms) — favorece la sensación de respuesta inmediata al cerrar.
- **Token actual del repo**: `motion.transition.normal = 200ms`. Para overlays se aumenta a 250ms (entradas dramáticas).

### 3. Easings (`(0, 0, 0.2, 1)` enter, `(0.4, 0, 1, 1)` exit)

- **`(0, 0, 0.2, 1)`** = `ease-out` clásico. Lo mismo que `motion.transition.normal`. Sensación "entra rápido y se asienta". Usar el ya conocido por consistencia.
- **`(0.4, 0, 1, 1)`** = `ease-in`. Empieza lento, acelera al final. Apropiado para exits — el ojo "deja ir" el elemento al cierre.

**Por qué NO usar el `spring` existente** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): el spring tiene rebote, apropiado para microinteracciones tipo Checkbox click pero distrae en overlays grandes (Modal sentís el rebote como bug visual). El consumidor puede optar por `spring` manualmente si quiere ese efecto para una alerta toast específica.

### 4. `effect.blur.overlay = 8px` (en archivo nuevo `semantic/effect.json`)

Crear `semantic/effect.json` con estructura paralela a los otros semantic:

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

Resultado: `--ds-effect-blur-overlay = 8px`. Consumidor:

```css
.modal__backdrop {
  background: var(--ds-semantic-color-bg-overlay);
  backdrop-filter: blur(var(--ds-effect-blur-overlay));
}
```

**Por qué 8px**:

- Material Design 3 usa 8-12px para modal backdrops. Apple HIG usa 10-20px (más agresivo).
- 8px es el sweet spot "se nota pero no marea". Suficiente para diferenciar Modal de un overlay simple sin blur.
- Si en el futuro hay caso real para más blur (ej. lockscreen tipo iOS), se suma `blur.strong = 16px` sin breaking.

**Por qué archivo separado y no en `semantic/space.json` o similar**:

- `space` es para layout (padding/margin/gap). Mezclar `effect` rompe la convención semántica.
- `motion` es solo para transitions/animations. Blur no es motion.
- Un archivo dedicado deja claro: "esto es para effects visuales". Cuando aparezca el segundo effect token (ej. `blur.heavy` o `backdrop.saturate`), tiene casa.

### 5. Tests del JSON

Decisión: usar Vitest existente en `packages/tokens` (verificar config — si no existe Vitest acá, sumar `vitest.config.ts` mínimo y `package.json` script `test`).

Test imports el JSON directamente y valida:

```ts
import zIndex from '../src/semantic/z-index.json';

describe('z-index tokens', () => {
  it('declares the 13 expected levels', () => {
    const levels = Object.keys(zIndex.semantic['z-index']);
    expect(levels).toEqual([
      'hide', 'auto', 'base', 'docked', 'dropdown', 'sticky', 'banner',
      'overlay', 'modal', 'popover', 'skiplink', 'toast', 'tooltip',
    ]);
  });

  it('respects strictly ascending order (excluding auto)', () => {
    // ...
  });

  it('hide < base, base = 0', () => { ... });
});
```

**Por qué tests del JSON y no del CSS generado**: el CSS es transformación 1-a-1 del JSON via Style Dictionary. Testear el JSON cubre el contrato; testear el output CSS testería Style Dictionary, no nuestro contrato.

### 6. Formalización en spec sin re-derivar valores

El Requirement nuevo en `design-tokens-package` no duplica los valores numéricos (1000, 1020, etc.) — eso vive en el JSON, single source of truth. El Requirement solo formaliza:

- Cantidad de niveles (13).
- Lista de nombres requeridos.
- Reglas de orden (ascendente, `hide < base`, escala en miles para overlays).
- Que `auto` existe como caso especial.

Eso es testable sin hardcodear valores.

### 7. Docs en `architecture/README.md`

Sumar sección "Jerarquía de z-index" después de "Arquitectura de tokens", con:

- Tabla de los 13 niveles con valor + cuándo usarlos (typical CSS use case).
- Link a `semantic/z-index.json` como fuente de verdad.
- Convención: NO hardcodear z-index en CSS de componente, usar siempre `var(--ds-z-index-*)`.

## Risks / Trade-offs

| Riesgo                                                                                                                    | Mitigación                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tokens nuevos sin uso confirmado pueden volverse "deuda"** si Modal termina necesitando otros valores                   | Los 3 tokens nuevos están **validados por patrón Atlassian/Material**, no son especulativos. Si Modal pide ajuste, refactorizamos. Pero la base es buena.              |
| **`effect.json` nuevo crea otro archivo a mantener**                                                                      | Trade-off aceptado. Mezclarlo en `space` o `motion` sería peor por confusión semántica. Cuando aparezca el 2do effect token, este archivo ya tiene casa.               |
| **Test del JSON puede pasar pero el dist/tokens.css no contener los niveles** (bug de build)                              | Test secundario opcional: leer `dist/tokens.css` post-build y grep `--ds-z-index-hide`. Postergable; el build es determinístico y la CI pipeline ya hace `pnpm build`. |
| **Si el dev usa `var(--ds-z-index-tooltip)` en un context donde el parent tiene `transform`, falla por stacking context** | Issue conocido de CSS, no del token. Documentar como caveat en docs/architecture/README.md si aparece.                                                                 |
| **`bg.overlay` ya existente puede confundir si alguien busca `bg.scrim`**                                                 | Documentar en docs que "scrim = overlay = el rgba semitransparente del Modal/Drawer". Sumar `bg.scrim` como alias en futuro change si confunde.                        |

## Migration Plan

No aplica — feature aditiva. Consumidores actuales no se rompen.

## Open Questions

- **¿Sumar test del CSS generado además del JSON?** Postergado — el build es determinístico y CI corre `pnpm build` antes de tests. Si en algún momento Style Dictionary se updates y se filtran tokens, se evalúa.
- **¿Sumar `motion.transition.popup-enter` separado de `overlay-enter`?** Postergado. Hoy "popup" y "overlay" son intent equivalentes en el sistema. Si en el futuro Tooltip aparece y necesita una duración distinta (ej. 100ms para que se sienta instantáneo), se suma allí.
- **¿Versionado del test (path del archivo)?** Decisión en tasks: `packages/tokens/test/z-index.spec.ts` con `vitest.config.ts` mínimo. Si `packages/tokens` ya tiene config Vitest desde aaa-002, reusar.
