# Design — aaa-013 — components-decide-icon-library

> Decide el detalle técnico de la adopción de Lucide. Lee `proposal.md`. La decisión de fondo (Lucide vs custom) se promueve a ADR-012.

## Context

Decisión del proposal: adoptar **`@lucide/angular`** (package Angular oficial de Lucide: standalone, signals, zoneless, Angular 17+). API verificada contra la doc oficial (jul-2026):

- **Import por icono** (tree-shaking óptimo): `import { LucideX } from '@lucide/angular'` → `<svg lucideX></svg>`.
- **Componente dinámico**: `import { LucideIcon, LucideHouse }` → `<svg [lucideIcon]="icon">` — para iconos que varían en runtime.
- **Props**: `size` (default 24), `color` (default `currentColor`), `strokeWidth` (default 2). Config global vía `provideLucideConfig(...)`.

Restricción del research (`atlassian-design.md`): starting point del DS = **16px + 1.5px stroke** (≠ defaults de Lucide: 24/2).

En este change **ningún componente publicado consume iconos** (Modal/Select llegan después). Eso condiciona dónde vive la dependencia.

## Goals / Non-Goals

**Goals:**

- `@lucide/angular` instalada y funcionando en el monorepo, con demo real renderizada (X + ChevronDown).
- Convención de uso documentada y testable (spec delta): import por icono, estilo 16/1.5, `currentColor`, a11y.
- ADR-012 con la decisión y el criterio de migración futura a package propio.

**Non-Goals:**

- NO Modal/Select; NO migrar el checkmark del checkbox; NO wrapper `DsIcon`; NO package `@romanmartinidev/icons` (todo en proposal §Non-Goals).
- NO tocar `packages/components` (ver Decisión 1).

## Decisions

### 1. Dónde vive la dependencia hoy: **solo en `apps/playground`** (la convención peer llega con Modal)

- **Hoy**: `@lucide/angular` como `dependency` de `apps/playground` (app interna, no publicable) — ahí vive la demo. `packages/components` **no se toca**: no hay código publicado que use iconos, y declarar una `peerDependency` sin uso generaría warnings especulativos a todos los consumidores.
- **Convención a futuro** (fijada en el spec delta): cuando un componente **publicado** consuma iconos (Modal será el primero), `@lucide/angular` SHALL declararse como **`peerDependency`** de `@romanmartinidev/components` — mismo criterio que Angular y `@romanmartinidev/tokens` (ADR-004): librería compartida cuya versión controla el consumidor, evitando duplicados en el bundle.
- **Alternativa evaluada**: `dependencies` + `allowedNonPeerDependencies` en ng-packagr. Descartada para el futuro: una lib de componentes Angular que embebe otra lib de componentes Angular como dependencia normal arriesga versiones duplicadas si el consumidor también usa Lucide directo. Peer es el patrón APF correcto para esto.
- **Consecuencia**: este change **no lleva changeset** — `packages/*` publicables no cambian. El changeset llegará con Modal.

### 2. Forma de consumo: **componentes standalone por icono** (no el dinámico)

`import { LucideX } from '@lucide/angular'` + `<svg lucideX>`. Es la forma con tree-shaking garantizado y type-safe (icono inexistente = error de compilación). El componente dinámico (`[lucideIcon]`) queda reservado para casos donde el icono varía en runtime — hoy ninguno.

### 3. Estilo del DS: **explícito en cada uso, no vía config global**

Los usos de iconos del DS llevan `size="16"` y `strokeWidth="1.5"` **explícitos** (o valores justificados por el componente). No se depende de `provideLucideConfig` porque esa config vive en la app consumidora — un componente del DS debe verse igual en cualquier app sin exigirle configuración. Las apps pueden usar `provideLucideConfig` para su propio contenido; el DS no lo asume.

- Color: **`currentColor`** (default de Lucide) — el icono hereda el `color` del contexto, que ya está tokenizado (`--ds-semantic-color-*`). Sin acoplamiento nuevo a tokens.

### 4. A11y por convención

- Icono **decorativo** (acompaña texto visible): `aria-hidden="true"`.
- Icono **semántico** (único contenido del control, ej. botón X de cierre): el elemento interactivo lleva `aria-label`; el svg queda `aria-hidden="true"` igualmente (el nombre lo da el control, no el dibujo).

### 5. Demo de integración: **sección "Iconografía" en el playground**

Renderiza `LucideX` y `LucideChevronDown` a 16/1.5 con `currentColor` (uno heredando un color de token para demostrarlo) + un ejemplo del patrón semántico (botón con `aria-label`). Sin story en `packages/components`: las stories están co-ubicadas por componente y acá no hay componente — agregar `icons.stories.ts` suelto obligaría además a meter la dependencia en `components`. La story de iconos llegará naturalmente con la de Modal.

### 6. Versión: **pinnear con caret** la última estable

`pnpm add @lucide/angular` resuelve la última; queda `^x.y.z` en `apps/playground/package.json`. Compatibilidad verificada: requiere Angular 17+, el repo corre 21.

## Risks / Trade-offs

- [El estilo del DS queda atado al lenguaje visual Lucide] → Aceptado explícitamente en ADR-012, con criterio de migración a `@romanmartinidev/icons` si aparece necesidad de identidad. El patrón de consumo (import por icono) hace la migración barata.
- [La convención peer-al-primer-uso puede olvidarse al implementar Modal] → El spec delta la deja como Requirement testable; el change de Modal la ejecuta o falla la review.
- [Lucide v1 removió brand icons y puede cambiar sets en majors] → Pin con caret + lockfile; los 2 iconos usados (`x`, `chevron-down`) son core del set, riesgo de remoción ~nulo.
- [Demo en playground sin componente publicado podría leerse como "feature hipotética"] → No lo es: es la **prueba de integración** de una decisión con disparador real (Modal bloqueado por esto), análoga a los tokens de aaa-009 que llegaron antes que Modal.

## Migration Plan

No aplica — aditivo, sin cambios en packages publicables. Rollback = revert del commit.

## Open Questions

Ninguna — la única ambigüedad real del proposal (modalidad de la dependencia) quedó cerrada en la Decisión 1.
