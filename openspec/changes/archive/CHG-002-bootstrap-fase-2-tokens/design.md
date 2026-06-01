## Context

`packages/tokens` quedó migrado al monorepo pnpm en Fase 1 pero conserva metadata de placeholder (`@ds/tokens@0.1.0` sin `engines`, `publishConfig`, `repository`, `license`, etc.) y nunca se auditó el contenido de los JSON heredados del repo previo.

Estado actual:

- **Build**: `node sd.config.mjs` con [Style Dictionary 4.3.0](https://amzn.github.io/style-dictionary/). Configurado en `packages/tokens/sd.config.mjs`. Produce `dist/tokens.{css,js,d.ts}` + un CSS por theme.
- **Estructura**: `src/{primitives,semantic,component,theme}/*.json`.
- **Prefix CSS**: `--ds-*` (configurado en sd.config como `prefix: 'ds'`).
- **Cobertura primitives**: color (8 escalas + white/black), dimension (29 valores), motion, opacity, shadow (6 niveles), typography (family/size/weight/line-height/letter-spacing).
- **Cobertura semantic**: color (text/bg/border/icon/focus-ring), motion, shadow, space, typography, z-index.
- **Cobertura component**: 11 componentes (alert, avatar, badge, button, card, checkbox, input, modal, radio, switch, tabs).
- **Themes**: `dark`, `brand-a`, `brand-b`.

Restricciones:

- No hay consumidores externos del nombre `@ds/tokens` (chequeable: el package nunca se publicó). Cambiar el nombre es seguro.
- Pre-1.0: política de breaking changes permisiva (semver 0.x.y donde minor puede romper).
- Fase 3 (`packages/components`) depende de que esta fase cierre con package consumible vía `workspace:*` y prefix estable.

## Goals / Non-Goals

**Goals:**

- Dejar `@romanmartinidev/tokens` listo para publicar a npm (metadata completa, build reproducible, README profesional).
- Documentar formalmente la arquitectura de tokens en **ADR-003** (jerarquía, theming, prefix, elección de Style Dictionary).
- Corregir bugs verificables de severidad alta detectados en auditoría (no rasurar la lista de findings; cerrar los que rompen reglas).
- Establecer contratos testables (vía spec `design-tokens-package`) que `packages/components` pueda asumir en Fase 3.
- Dejar findings de severidad media/baja documentados como follow-ups (no aplicarlos en esta fase).

**Non-Goals:**

- NO replantear la jerarquía de tokens (primitives/semantic/component/theme se mantiene como está).
- NO renombrar carpetas, archivos JSON, ni tokens semánticos.
- NO migrar a un build system distinto (Vite library mode, terrazzo, etc.).
- NO publicar a npm aún (eso es operación manual posterior; la fase solo deja el package listo).
- NO generar tipos TS ricos (object-shape) — queda como follow-up.
- NO consumir los tokens desde `apps/playground` ni `packages/components` (esas integraciones son Fase 3 y 4).

## Decisions

### 1. Mantener Style Dictionary 4 como build tool

**Alternativas:**

- **A. Style Dictionary 4.x (status quo).** Adoptado por Adobe Spectrum, Atlassian, Microsoft Fluent. Maduro, configurable, soporta CSS + JS + TS + iOS + Android.
- **B. Style Dictionary 3.x.** Versión anterior, sin async transforms ni el nuevo CLI.
- **C. [Terrazzo](https://github.com/terrazzoapp/terrazzo) (ex Cobalt).** Más nuevo, basado en el draft del W3C Design Tokens Format. API más limpia. Menos maduro, ecosistema más chico.
- **D. [Theo](https://github.com/salesforce-ux/theo).** Salesforce. Mantenimiento incierto.
- **E. Script custom con TS + json2css.** Máximo control, máximo costo de mantenimiento.

**Decisión**: A (Style Dictionary 4).

**Por qué**: ya está integrado, la migración a Terrazzo agregaría riesgo sin beneficio claro a esta escala. Style Dictionary tiene la mayor adopción industrial y soporta nuestros 4 outputs (CSS root + temas + JS + TS) sin extensiones. Reevaluar en un ADR futuro si crecemos a multi-plataforma (iOS/Android) y queremos formato W3C.

### 2. Estructura de `exports` granular (multi sub-path)

**Decisión** (ya aprobada por Roman en kickoff de la propuesta):

```jsonc
{
  ".": { "import": "./dist/tokens.js", "types": "./dist/tokens.d.ts" },
  "./css": "./dist/tokens.css",
  "./themes/dark": "./dist/themes/dark.css",
  "./themes/brand-a": "./dist/themes/brand-a.css",
  "./themes/brand-b": "./dist/themes/brand-b.css",
}
```

**Por qué granular y no un solo export**:

- Permite a un consumidor que solo necesita CSS no jalar el JS (Angular apps típicamente solo cargan CSS).
- Cada theme es opt-in: si una app no usa dark mode, no carga el CSS de dark.
- `exports` cerrado bloquea imports a paths internos (`/src`, `/internal`) → la surface API queda explícita.

**Trade-off aceptado**: agregar un nuevo theme implica agregar entry en `exports` (no es automático). Documentado en README.

### 3. `sideEffects` selectivo

**Decisión**: `"sideEffects": ["./dist/*.css", "./dist/themes/*.css"]`

**Por qué**: CSS tiene side effects (inyecta estilos globales aunque no se referencien explícitamente). Si dejamos `sideEffects: false` o lo omitimos, bundlers agresivos podrían eliminar CSS importado pero sin "uso". Si dejamos `sideEffects: true`, perdemos tree-shaking del JS. La forma granular preserva ambos.

### 4. `files` field — solo lo necesario para publicar

**Decisión**: `"files": ["dist", "README.md"]`

**Por qué**: por default npm publica todo lo no ignorado por `.npmignore` o `.gitignore`. Sin `files`, publicaríamos `src/`, `sd.config.mjs`, etc. — innecesario, infla el tarball y expone internals. `LICENSE` y `package.json` se incluyen automáticamente.

### 5. Mantener prefix CSS `--ds-*`

**Decisión** (aprobada en kickoff): mantener `--ds-*`.

**Por qué**: corto (3 chars), legible, ya está en el build. El riesgo de colisión con otro DS que use el mismo prefix existe pero es bajo (los consumidores controlan su propio bundle). Si en el futuro causa fricción real, se cambia con ADR que reemplace al ADR-003 (mayor bump del package).

**Trade-off documentado en spec**: el prefix queda parte del contrato API público — cambiarlo es BREAKING.

### 6. Auditoría: alcance de fixes en esta fase

Se aplican en Fase 2 **solo findings de severidad alta** (rompen reglas verificables: jerarquía, accesibilidad). Findings de severidad media/baja se proponen como changes futuros.

**Findings detallados de la auditoría:**

| Severidad | Token / Archivo                                                    | Problema                                                                           | Acción en Fase 2                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 Alta   | `semantic/color.json` (light) — `border.subtle` y `border.default` | Ambos apuntan a `{color.neutral.100}`. Jerarquía `subtle < default < strong` rota. | **Fix**: `border.subtle` → `{color.neutral.100}`, `border.default` → `{color.neutral.300}`, `border.strong` → `{color.neutral.500}` (manteniendo strong existente). Verificar consistencia con dark. |
| 🔴 Alta   | `primitives/shadow.json` + `semantic/shadow.json`                  | No existe `shadow.focus` para focus rings (WCAG 2.4.7).                            | **Add**: `primitives/shadow.focus = "0 0 0 3px {color.blue.200}"` (light) — definir también en theme `dark` (probablemente `{color.blue.700}`). Exponer como `semantic.shadow.focus` o directo.      |
| 🟡 Media  | `primitives/color.json`                                            | Duplicado intencional: `color.neutral.0 = color.white = #ffffff`.                  | Documentar política en ADR-003 (intencional como "extremo de escala vs valor puro"). No tocar valores. **Follow-up**: `tokens-policy-color-duplicates`.                                              |
| 🟡 Media  | `primitives/typography.json`                                       | `font.weight` no incluye `black: 900` (Inter lo soporta).                          | **Follow-up**: `tokens-audit-medium-severity`.                                                                                                                                                       |
| 🟡 Media  | `semantic/space.json`                                              | `radius.full: "9999px"` hardcoded en lugar de referenciar primitive.               | **Follow-up**: `tokens-audit-medium-severity`.                                                                                                                                                       |
| 🟡 Media  | `primitives/dimension.json`                                        | Faltan dimensiones grandes (256, 384, 512) útiles para `max-width` de containers.  | **Follow-up**: `tokens-audit-medium-severity`.                                                                                                                                                       |
| 🟢 Baja   | `dist/tokens.d.ts`                                                 | Tipos planos (escalares) generados por SD. Sin tipos estructurados (objeto).       | **Follow-up**: `tokens-rich-types`.                                                                                                                                                                  |
| 🟢 Baja   | `primitives/typography.json`                                       | Faltan tokens de `text-decoration` y `text-transform`.                             | **Follow-up**: `tokens-audit-medium-severity` (o evaluar si son tokens válidos).                                                                                                                     |

## Risks / Trade-offs

| Riesgo                                                                   | Mitigación                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cambio de nombre rompe consumidores del nombre `@ds/tokens`**          | No hay consumidores externos (package nunca publicado). Documentar BREAKING en el changeset por prudencia.                                                                                                                                      |
| **Style Dictionary 4 podría tener breaking changes futuros**             | Pinneado en `^4.3.0` (semver permisivo dentro de major). Mover a `~4.3` (más estricto) si aparecen problemas.                                                                                                                                   |
| **Prefix `--ds-*` colisiona con otro DS en consumidor**                  | Bajo riesgo. Si aparece, cambio futuro es BREAKING + nuevo ADR + major bump.                                                                                                                                                                    |
| **Fix de `border.subtle` rompe visualmente algo ya implementado**        | No hay consumidores todavía (la lib no se usa fuera del repo, y `apps/playground` se regenera en Fase 4). Cambio neto-positivo.                                                                                                                 |
| **Auditoría incompleta — pueden quedar findings que detectemos después** | Los findings de severidad alta detectados se cierran. Los de severidad media van a follow-up explícito. Si aparece nuevo finding de severidad alta durante implementación, se agrega al change (`/opsx:continue`) en vez de adelantar a Fase 3. |
| **`exports` granular impide imports legacy a paths internos**            | Es intencional. Documentar la surface clara en README.                                                                                                                                                                                          |

## Migration Plan

### Para el repo (cómo aplicar la fase)

Ver `tasks.md`. Sin downtime — solo afecta archivos en `packages/tokens/`, no servicios corriendo.

### Para consumidores hipotéticos (cómo migrar de `@ds/tokens` a `@romanmartinidev/tokens`)

Aplicaría a partir del primer release público. Steps:

1. Reemplazar dependencia: `pnpm remove @ds/tokens && pnpm add @romanmartinidev/tokens`.
2. Reemplazar imports: `from '@ds/tokens/css'` → `from '@romanmartinidev/tokens/css'`.
3. Variables CSS NO cambian (prefix `--ds-*` se mantiene).
4. Themes ahora bajo sub-path: `from '@romanmartinidev/tokens/themes/dark'`.

(Documentar en CHANGELOG del package al publicar.)

## Open Questions

- **¿`shadow.focus` se expone solo como primitive o también como semantic.shadow.focus?** Tentativa: ambos (primitive como valor, semantic como uso). Confirmar al implementar.
- **¿Política definitiva de versionado pre-1.0?** Diferida al primer release (igual que en ADR-002). Por ahora cada minor puede ser breaking.
- **¿Generar tipos TS ricos (objeto) en lugar de constantes planas?** Diferido a follow-up `tokens-rich-types`. La decisión depende de cómo `packages/components` los consuma en Fase 3.
