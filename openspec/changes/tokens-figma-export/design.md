## Context

`@romanmartinidev/tokens` emite CSS + JS/TS desde `packages/tokens/src/` con Style Dictionary (ADR-003). No hay puente a Figma. [ADR-009](../../../docs/architecture/adr/ADR-009-figma-tokens-export.md) fija la arquitectura: **code → Figma one-way**, vía **Tokens Studio for Figma**, alimentado por un **export DTCG (W3C)** con aliases preservados, sin tocar build tool / jerarquía / prefix de ADR-003. Este `design.md` resuelve el **cómo** de implementación.

Aclaración estructural que enmarca el alcance: **tokens ≠ componentes de Figma**. El export provee Variables; el diseño de componentes en Figma y su enlace a esas Variables es trabajo manual de diseño, fuera de este change.

## Goals / Non-Goals

### Goals

- Agregar un target DTCG a `packages/tokens/sd.config.mjs` que emita `$value`/`$type` con **aliases preservados**.
- Emitir los temas (`dark`, `brand-a`, `brand-b`) como sets diferenciados aptos para modes de Figma.
- Validar el artefacto con Vitest (JSON válido, aliases preservados, paridad con el set CSS).
- Documentar en el README del package cómo conectar Tokens Studio (Git sync) + convención de modos.
- Build sigue verde; outputs CSS/JS intactos.

### Non-Goals

- **NO generar componentes de Figma** — la integración provee Variables, no componentes; el diseño es manual.
- **NO sincronización bidireccional** (Figma → code) — contradice ADR-003 (Opción E descartada en ADR-009).
- **NO API REST de Variables de Figma** — Opción C del ADR, requiere Enterprise; follow-up futuro.
- **NO cambiar** jerarquía, prefix `--ds-*`, build tool ni outputs CSS/JS.
- **NO resolver aliases a valores crudos** en el DTCG — destruiría el encadenado de Variables, que es el valor central.

## Decisions

### 1. Mecanismo de transformación: `@tokens-studio/sd-transforms` (a confirmar contra esfuerzo de custom format)

Style Dictionary 4 puede emitir DTCG, pero el mapeo fino de `$type` (color, dimension, duration, cubicBezier, shadow, fontFamily, …) y la compatibilidad exacta con lo que Tokens Studio espera es donde está el trabajo. `@tokens-studio/sd-transforms` resuelve ese mapeo y es el camino soportado por el ecosistema.

- **Decisión preliminar**: usar `@tokens-studio/sd-transforms` (pinneado) salvo que un spike muestre que un custom format mínimo cubre el caso con menos riesgo.
- **Por qué**: "preferir herramientas probadas del ecosistema" (mismo criterio que ADR-003 para elegir Style Dictionary sobre script propio).
- **Riesgo**: dependencia atada a Tokens Studio. Mitigación: el output es DTCG estándar; si el paquete se abandona, el JSON sigue siendo válido para otra herramienta.

### 2. Aliases preservados, no resueltos

El target DTCG emite referencias como **aliases DTCG** (`"$value": "{color.blue.500}"`), no como valores resueltos (`"$value": "#3b82f6"`).

- **Por qué**: en Figma, un alias DTCG se importa como una **Variable que apunta a otra Variable**. Así `component.button.primary.bg → semantic.color.bg.primary → color.blue.500` se reconstruye encadenado. Cambiar `blue.500` en el repo propaga a todo, igual que la cascada CSS con `outputReferences: true` que ya usa el build.
- **Implicancia**: el orden de carga importa — los primitives deben existir antes que los semantics que los referencian. Se cubre con el layout de archivos (Decisión 3) y/o el orden de sets en Tokens Studio.

### 3. Layout de archivos: un archivo por nivel + uno por tema

```
packages/tokens/figma/        # versionado (ver Decisión 4)
├── primitives.json           # color, dimension, typography, motion, opacity, shadow
├── semantic.json             # bg, text, border, space, radius, shadow, z-index, motion, effect
├── component.json            # button, input, card, … (component tokens)
└── themes/
    ├── dark.json             # overrides de semantic
    ├── brand-a.json
    └── brand-b.json
```

- **Por qué separar por nivel**: mapea 1:1 a **token sets** de Tokens Studio y a colecciones de Figma (Primitives / Semantic / Component). Hace explícito el orden de resolución de aliases.
- **Por qué un archivo por tema**: cada tema es un set que Tokens Studio activa como un **mode**. Espeja la estructura de `src/theme/` y el patrón de los builds por tema que ya existen en `sd.config.mjs`.

### 4. Path versionado para el Git sync (no `dist/`)

Tokens Studio lee el DTCG **desde el repositorio vía Git**. `dist/` es output de build y suele estar ignorado, así que no sirve como fuente estable para el plugin.

- **Decisión preliminar**: emitir el DTCG a una carpeta **versionada** `packages/tokens/figma/` y agregar un **guard de CI** que falle si el DTCG commiteado no coincide con el regenerado (mismo patrón que un lockfile o un snapshot). Así el repo es la fuente que Tokens Studio consume y el guard impide drift.
- **Alternativa**: leer el DTCG del package publicado (npm/CDN). Descartada para el primer corte: agrega latencia de release entre cambiar un token y verlo en Figma.
- **Open question** asociada abajo (publicar o no el DTCG en el tarball).

### 5. Mapeo de modos `theme × brand`

Figma: una Variable Collection tiene **una sola dimensión de modos**. El sistema tiene **dos dimensiones**: theme (light/dark) y brand (a/b).

- **Decisión del primer corte**: modelar **theme (light/dark) como modos** de la colección Semantic (el caso de uso más común). **Brand** se maneja como **sets adicionales** de Tokens Studio que se activan por separado (Tokens Studio themes), o como colección aparte.
- **Por qué**: light/dark es la conmutación más frecuente y la que más valor da resuelta como modos nativos. La combinación completa theme × brand como matriz de modos excede lo que una colección permite sin duplicación.
- **Documentar** la limitación en el README para que diseño no espere las 4 combinaciones como modos de una sola colección.

### 6. Validación del artefacto (Vitest en `packages/tokens`)

Tests que parsean el/los JSON emitido(s) y verifican el contrato (ver spec delta). Se testea el **artefacto DTCG**, no Tokens Studio ni Figma (fuera de nuestro control).

- JSON válido y parseable.
- Estructura DTCG: los tokens hoja tienen `$value` (y `$type` donde corresponde).
- **Aliases preservados**: al menos un token semantic referencia un primitive vía `{…}` (no un valor crudo).
- **Paridad**: la cantidad de tokens en el DTCG base coincide con la del set que produce el CSS (no se pierde ni inventa ningún token en la transformación).

### 7. Documentación en el README del package

Sección "Integración con Figma" con: qué es (Variables, no componentes), cómo conectar Tokens Studio al repo (Git sync apuntando a `packages/tokens/figma/`), la convención de sets/colecciones, y la limitación de modos theme × brand.

## Risks / Trade-offs

| Riesgo                                                                         | Mitigación                                                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **`sd-transforms` agrega acoplamiento al ecosistema Tokens Studio**            | El output es DTCG estándar; portable a otra herramienta. Pinnear versión y monitorear.              |
| **El DTCG versionado puede quedar desincronizado del `src/`**                  | Guard de CI que regenera y compara; falla el PR si difiere.                                         |
| **Modos theme × brand no caben como matriz en una colección**                  | Primer corte resuelve theme como modos; brand como sets; limitación documentada.                    |
| **Expectativa de "componentes en Figma" no cumplida**                          | Comunicado explícito en proposal, README y Non-Goals: la integración da Variables, no componentes.  |
| **Aliases mal ordenados rompen la resolución en Figma**                        | Layout por nivel + orden de sets en Tokens Studio garantiza primitives antes que semantics.         |
| **Tipos DTCG (`$type`) mal mapeados** (ej. `cubic-bezier`, `shadow` compuesto) | Cubierto por `sd-transforms`; tests verifican estructura; spike inicial sobre motion/shadow/effect. |

## Migration Plan

No aplica — feature aditiva. Consumidores actuales (CSS/JS) no se rompen. El DTCG es output nuevo.

## Open Questions

- **¿`@tokens-studio/sd-transforms` o custom format?** Resolver con un spike corto al inicio (sección 1 de tasks). Decide según esfuerzo/riesgo real sobre los tipos compuestos (motion, shadow, effect).
- **¿El DTCG se publica en el tarball npm** (entry en `files` + `exports`) **o queda sólo como fuente del Git sync?** Preliminar: sólo versionado en el repo para el Git sync; publicar se evalúa si un consumidor externo lo pide.
- **¿Primer corte con temas o sólo base + light/dark?** Preliminar: incluir light/dark desde el día 1 (mayor valor); brand-a/brand-b en el mismo corte si el spike de modos no agrega fricción, si no como follow-up.
- **¿`figma/` versionado o regenerado en CI y publicado a una rama?** Preliminar: versionado en `main` con guard. Reconsiderar si genera ruido de diffs en cada cambio de token.
