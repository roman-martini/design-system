# ADR-012 — Iconografía del DS: adopción de Lucide

- **Fecha**: 2026-07-03
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-003](ADR-003-arquitectura-design-tokens.md) (criterio "herramientas probadas del ecosistema"), [ADR-004](ADR-004-arquitectura-components.md) (política de peerDependencies)

## Contexto

El DS no tenía sistema de iconos — gap explícito del research de Atlassian (`docs/design/research/atlassian-design.md §1.8`). El único "icono" existente es el checkmark del `ds-checkbox`, embebido como `data:image/svg+xml` en su CSS (patrón correcto para un pseudo-control, pero no un sistema).

El disparador es concreto: los próximos componentes del roadmap necesitan iconos como elemento del template — la **X de cierre** del Modal y el **chevron** del Select. Sin decisión, cada componente hardcodearía SVGs ad-hoc, fragmentando el estilo.

Restricciones:

- Stack Angular 21 zoneless + signals + standalone (ADR-005) — la integración debe ser de primera clase, no un wrapper de segunda mano.
- El research fijó el starting point visual: **16px + 1.5px stroke**.
- Prioridades del repo: buenas prácticas > escalar ordenado > mantenibilidad. ADR-003 ya sentó el criterio aplicable: _"mantener [una herramienta] propia es trabajo recurrente que no agrega valor de producto; preferir herramientas probadas del ecosistema"_.

La decisión afecta a todos los componentes futuros con iconos (transversal) → ADR. La ejecución fue el change [`aaa-013 components-decide-icon-library`](../../../openspec/changes/archive/aaa-013-components-decide-icon-library/).

## Opciones consideradas

### Opción A — Lucide (`@lucide/angular`) — elegida

Fork comunitario activo de Feather. Package Angular **oficial**: standalone, signals, zoneless, Angular 17+. ~1700 iconos, 1.5px stroke por default, licencia ISC, v1.0 (jun-2026).

- **Pros**: único package Angular oficial del mercado de iconos — encaje exacto con el stack; estilo = starting point del research; tree-shaking por icono con imports type-safe (`import { LucideX }` → `<svg lucideX>`); activo y con comunidad grande; cero mantenimiento de set propio.
- **Contras**: dependencia externa en la superficie visual del DS; el lenguaje visual queda atado al de Lucide.

### Opción B — Heroicons

Set de Tailwind Labs (~500 iconos, MIT, outline + solid).

- **Pros**: activo, respaldo de Tailwind, buena calidad visual.
- **Contras**: **sin package Angular oficial** (los maintainers no aceptan más frameworks) — integración vía wrappers community o SVG crudo, siempre de segunda mano. Menor cobertura. Descartada.

### Opción C — Feather

- **Contras**: **abandonado** — sin iconos nuevos desde marzo 2022, cientos de issues/PRs sin atender. Lucide es precisamente su fork comunitario activo. Descartada.

### Opción D — Set custom en package propio `@romanmartinidev/icons`

Iconos propios curados, distribuidos en un package publicable nuevo con naming `Ds` (el camino Atlassian: librería propia).

- **Pros**: identidad visual propia; los iconos como parte del contrato del DS; cero dependencia externa; control total.
- **Contras**: un package publicable nuevo (infra + release + README + tests) más la curación y el mantenimiento del set — para una necesidad actual de **2 iconos**; el beneficio de identidad es especulativo sin una divergencia visual planificada (el plan de arranque era seedear desde los SVGs de Lucide, es decir, Lucide con extra pasos); contradice el criterio ADR-003. Atlassian lo justifica con un equipo de diseño dedicado y cientos de iconos propios — condiciones que este repo no tiene hoy.

## Decisión

Se adopta la **Opción A — Lucide vía `@lucide/angular`** (pinneado `^1.23.0`), con estas reglas:

### 1. Convención de consumo (spec `components-package`, Requirement "Convención de iconografía")

- **Import por icono, tree-shakeable y type-safe**: `import { LucideX } from '@lucide/angular'` → `<svg lucideX>`. Prohibido un registry central por nombre (rompe tree-shaking y type-safety).
- **Estilo explícito del DS**: `size="16"` + `strokeWidth="1.5"` en cada uso (o valores justificados por el componente). No se depende de `provideLucideConfig` — un componente del DS debe verse igual en cualquier app sin exigirle configuración.
- **Color por `currentColor`**: el icono hereda el `color` del contexto, ya tokenizado (`--ds-semantic-color-icon-*` / `text-*`).
- **A11y**: icono decorativo → `aria-hidden="true"`; icono como único contenido de un control → `aria-label` en el control (el svg sigue `aria-hidden`).

### 2. Modalidad de dependencia: **peer al primer consumo publicado**

Mientras ningún componente publicado de `@romanmartinidev/components` consuma iconos, `@lucide/angular` **no** se declara en el package (evita peer-warnings especulativos). Cuando el primer componente publicado los consuma (Modal), se declara como **`peerDependency`** — mismo criterio que Angular y `@romanmartinidev/tokens` (ADR-004): librería compartida cuya versión controla el consumidor. Hoy la dependencia vive solo en `apps/playground` (demo de integración).

### 3. Criterio de activación para migrar a un package propio (`@romanmartinidev/icons`)

La Opción D no muere: queda como **evolución futura** que se activa si (cualquiera):

- Aparece necesidad real de **identidad visual divergente** de Lucide (iconos que el DS quiere dibujar distinto, no solo re-exportar).
- El DS necesita **exponer un set curado** a consumidores como parte de su contrato (naming `Ds`, subset controlado).

En ese caso, el package propio puede **seedear desde Lucide** (ISC permite derivados). La migración es barata: el patrón de consumo (import por icono + componente svg) no cambia, solo la fuente de los imports.

## Consecuencias

### Positivas

- Modal y Select quedan **desbloqueados** con una convención lista para consumir.
- Tree-shaking real: cada consumidor bundlea solo los iconos que usa, del set de ~1700.
- Integración de primera clase con el stack (standalone/signals/zoneless) sin wrappers.
- Cero mantenimiento de set propio; estilo alineado al research sin trabajo de dibujo.
- La puerta a identidad propia queda abierta con criterio explícito, no cerrada.

### Negativas / trade-offs aceptados

- **Dependencia externa en la superficie visual**: un cambio de rumbo de Lucide (estilo, licencia, abandono) impacta al DS. Mitigación: ISC + pin con caret + el criterio de migración del §3; el riesgo histórico ya ocurrió con Feather y la comunidad respondió con el fork (Lucide).
- **El lenguaje visual del DS es el de Lucide**: aceptado conscientemente — hoy no hay divergencia visual planificada que lo justifique de otro modo.
- **Convención peer-al-primer-uso requiere disciplina**: el change de Modal debe declararla. Mitigado: es Requirement testable del spec `components-package`.

### Acciones de seguimiento

- `components-add-modal`: consumir `LucideX` + declarar `@lucide/angular` como peerDependency + documentar en README del package + changeset.
- Si se cumple el criterio del §3, abrir change `icons-package-bootstrap` para `@romanmartinidev/icons`.
