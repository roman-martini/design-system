---
id: aaa-008
name: components-add-radio
type: change
status: archived
archived: 2026-06-08
modifies-specs:
  - components-package (agrega DsRadio + DsRadioGroup)
related-adrs:
  - ADR-004
  - ADR-007
---

## Why

`@romanmartinidev/components` tiene Button + Checkbox. Radio es la pareja conceptual del Checkbox para selección **única** dentro de un grupo. Sin Radio, una app de formularios real no se puede armar con solo este DS — hoy un dev tendría que importar otra lib solo para esto.

Este change cierra el siguiente ítem del Nivel 1 de FUTURE-WORK (`docs/architecture/FUTURE-WORK.md`) y figura como item activo en BACKLOG.md (`openspec/BACKLOG.md`). Adicionalmente, valida que el patrón "componente compuesto con context injection" (DsRadioGroup contiene DsRadio que se inyecta el grupo) escala en el repo siguiendo las convenciones de ADR-004 y ADR-007.

Respalda las 3 prioridades del repo:

1. **Buenas prácticas**: ControlValueAccessor completo en el group (no en el radio individual) — convención Angular para inputs de selección única. ARIA `role="radiogroup"` en el group, `role="radio"` en cada radio, `aria-checked` con flecha-derecha/izquierda para keyboard nav. Standalone + OnPush + signals según ADR-004.
2. **Escalar ordenado**: replica exactamente la convención de aaa-006 (Checkbox) — carpeta flat por componente, naming `DsRadio` + `DsRadioGroup` (ADR-007), CVA en el group, 3 sizes consistentes con Button y Checkbox.
3. **Mantenibilidad**: tests Vitest cubren el group + radios individuales + integración con FormControl reactivo + keyboard nav. Stories Storybook documentan todas las variantes. Sin tokens nuevos: aprovecha los semantic existentes.

Este change toca **2 packages** (`@romanmartinidev/components` y `apps/playground` como consumidor interno) pero **no es one-way door** (es feature aditiva). Modifica el spec `components-package` agregando 2 requirements ADDED. **NO genera ADR nuevo** — la arquitectura general ya está en ADR-004 + ADR-007. Toca el área frontend / components.

## What Changes

### Nuevos componentes en @romanmartinidev/components

**`DsRadioGroup`** (selector `ds-radio-group`):

- Standalone + OnPush + signal-based API.
- `value` model two-way binding tipado genérico.
- `name` input opcional (auto-genera si no se provee, para evitar colisiones cross-form).
- `disabled` model boolean.
- Implementa `ControlValueAccessor` para integración con FormControl reactivo o template-driven.
- Provee contexto interno que los `DsRadio` hijos consumen via context injection — el group es el que coordina la selección única y propaga `disabled` y `name`.

**`DsRadio`** (selector `ds-radio`):

- Standalone + OnPush + signal-based API.
- `value` input tipado (el valor que representa).
- `disabled` input boolean (puede heredarse del group).
- `label` input string + slot `<ng-content>` (fallback como Checkbox).
- `size` input `'sm' | 'md' | 'lg'` (default `'md'`).
- Si vive dentro de un group: el group maneja la selección. Si vive standalone: emite output `selected` para casos sin group.

### API en uso

```html
<!-- Caso común: group con two-way binding -->
<ds-radio-group [(value)]="state.framework">
  <ds-radio value="angular" label="Angular" />
  <ds-radio value="react" label="React" />
  <ds-radio value="vue" label="Vue" />
</ds-radio-group>

<!-- Caso group con FormControl reactivo -->
<ds-radio-group [formControl]="frameworkCtrl">
  <ds-radio value="angular">Angular</ds-radio>
  <ds-radio value="react">React</ds-radio>
</ds-radio-group>

<!-- Caso standalone (raro pero permitido) -->
<ds-radio value="opt-a" (selected)="handle('opt-a')" />
```

### Tokens

NO se agregan tokens nuevos a `@romanmartinidev/tokens`. Los semantic tokens existentes (`space`, `color.bg`, `border`, `shadow.focus`, `opacity`) son suficientes — misma estrategia que Checkbox (aaa-006).

### Surface en components

- `packages/components/src/lib/radio-group/` con `radio-group.component.ts`, `.html`, `.css`, `.spec.ts`, `radio-group.stories.ts`, `index.ts`.
- `packages/components/src/lib/radio/` con `radio.component.ts`, `.html`, `.css`, `.spec.ts`, `radio.stories.ts`, `index.ts`.
- `packages/components/src/public-api.ts` re-exporta ambos via `export * from './lib/radio';` + `export * from './lib/radio-group';`.

### Spec delta

`openspec/changes/components-add-radio/specs/components-package/spec.md` con 2 ADDED Requirements: **Componente DsRadio** + **Componente DsRadioGroup**. Cada uno con scenarios Given/When/Then en lenguaje de comportamiento observable del consumidor — los mecanismos internos (context injection, signals) viven en `design.md`.

### Tests

`vitest` cubre:

- `DsRadio` standalone (renderiza, emite `selected`, respeta `disabled`).
- `DsRadioGroup` con varios `DsRadio` hijos (selección única, cambio de valor, propagación de `disabled` y `name`).
- Integración con `FormControl` reactivo (`setValue`, `disable`, value-change).
- Keyboard navigation (flecha derecha/izquierda mueve el foco al siguiente/anterior radio del grupo).

### Story Storybook

Variantes: `Default`, `WithGroup`, `Sizes`, `Disabled`, `WithReactiveForm`, `WithRichContent` (slot `<ng-content>` con ícono o link en el label).

### Playground

Sumar sección "Radio" a `apps/playground/src/app/app.html` con 3 demos: group básico, group con FormControl, sizes.

### Changeset

`pnpm changeset` → bump `minor` de `@romanmartinidev/components` (feature aditiva, no rompe nada existente).

## Capabilities

### New Capabilities

Ninguna nueva. El spec `components-package` ya existe (introducido por aaa-003); este change suma 2 componentes más a esa capability.

### Modified Capabilities

- `components-package`: 2 nuevos requirements ADDED (Componente DsRadio + Componente DsRadioGroup). NO se modifican requirements existentes.

## Impact

### Código

- **Creados**:
  - `packages/components/src/lib/radio/{radio.component.ts, .html, .css, .spec.ts, radio.stories.ts, index.ts}` (6 archivos).
  - `packages/components/src/lib/radio-group/{radio-group.component.ts, .html, .css, .spec.ts, radio-group.stories.ts, index.ts}` (6 archivos).
- **Modificados**:
  - `packages/components/src/public-api.ts` — 2 nuevas re-exports.
  - `packages/components/README.md` — tabla de componentes actualizada + ejemplo de uso de Radio.
  - `apps/playground/src/app/app.ts` — sumar imports + signals/FormControl para demo.
  - `apps/playground/src/app/app.html` — sumar sección Radio.
  - `apps/playground/src/app/app.spec.ts` — sumar test de presencia de `<ds-radio-group>`.
- **Eliminados**: ninguno.

### APIs públicas

Aditivo, **no breaking**. Nuevos exports desde `@romanmartinidev/components`:

- `DsRadio` (class)
- `DsRadioGroup` (class)
- `DsRadioSize` (type) — reusable con Button y Checkbox conceptualmente; se decide en `design.md` si se exporta como type compartido o se mantiene aislado al componente.

### Dependencias

Sin nuevas runtime ni devDeps. `@angular/forms` ya está como peerDependency desde aaa-006.

### Spec deltas

- `components-package`: 2 requirements ADDED. Sin REMOVED ni MODIFIED.

## Alternativas evaluadas

### Opción A — DsRadio sin DsRadioGroup (radio "suelto")

Cada DsRadio maneja su propio `checked` state. El dev sincroniza manualmente la selección entre varios radios con un signal compartido.

- **Pros**: API más simple, menos código generado.
- **Contras**: anti-patrón. Radio es semánticamente "selección única dentro de un set". Sin group, el dev tiene que reinventar el binding + keyboard nav + ARIA `role="radiogroup"` cada vez. No es lo que el HTML semántico hace ni lo que devs Angular esperan.

### Opción B — DsRadioGroup que renderiza opciones desde un input `[options]` array

`<ds-radio-group [options]="[{value: 'a', label: 'A'}, ...]" />` sin DsRadio individual.

- **Pros**: API muy concisa para casos simples.
- **Contras**: pierde flexibilidad para custom content (icono + label, link en el label, etc.). El patrón "options array" es más adecuado para Select que tiene muchas opciones con `<option>` rígido. Radio es típicamente 2-5 opciones con custom content y debe permitirlo.

### Opción C — DsRadioGroup + DsRadio con context injection (esta propuesta)

Group y Radio como componentes separados que se coordinan via injection del group desde el radio hijo.

- **Pros**: patrón Angular estándar usado por Material (`<mat-radio-group>` + `<mat-radio-button>`), ng-zorro (`<nz-radio-group>` + `<nz-radio>`), Taiga UI (`<tui-radio-group>`). Flexibilidad total para custom content via slot. Funciona en grupo o standalone. Keyboard nav y ARIA correctos vienen del group, no del radio individual.
- **Contras**: dos componentes en lugar de uno → más superficie API. Aceptable: es el patrón profesional de la convención Angular para radio groups.

**Decisión**: **Opción C** — alineada con Mat / Nz / Tui y con la convención Angular estándar.

## ADRs y follow-ups

- **NO genera ADR nuevo**. La arquitectura general de components está en ADR-004; el naming en ADR-007. Detalles específicos del componente compuesto (contexto de injection, propagación de `disabled` y `name`, keyboard nav implementation) viven en el `design.md` del change y mueren cuando se archiva.

- **Follow-ups posibles** (cada uno como CHG independiente):
  - `tokens-add-z-index` (próximo del backlog) — desbloquea Modal/Tooltip/Toast.
  - `components-decide-icon-library` (ADR-009) — bloquea Modal (X de cierre) y Select (chevron).
  - `components-add-select` — más complejo, requiere `@floating-ui/dom` como nueva runtime dep.
