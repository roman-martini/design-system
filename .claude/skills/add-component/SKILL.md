---
name: add-component
description: Guided workflow to add a new Angular component to @romanmartinidev/components following the repo's ADRs and the established OpenSpec change pattern. Use when the user wants to add a component to the kit ("/ds:add-component select", "sumemos un tooltip", "agregá el componente X") — it produces the OpenSpec change (proposal, design, spec delta, tasks) and optionally drives the implementation.
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "1.0"
---

# add-component

Guiá el alta de un componente nuevo en `@romanmartinidev/components` reproduciendo el patrón consolidado por los changes de Checkbox (`aaa-006`), Radio (`aaa-008`) y Modal (`aaa-014`): **relevamiento → clasificación → change OpenSpec → (con OK) implementación por tasks**.

**Agregar un componente es un cambio significativo del kit** — según el anti-patrón documentado en `.claude/commands/ds/README.md`, esta skill **emite una propuesta OpenSpec** en lugar de aplicar directo. La skill automatiza la producción de los artefactos y la disciplina del flujo; no saltea el review del usuario.

---

## Input

`/ds:add-component <nombre>` con notas opcionales de API/alcance, o descripción en lenguaje natural ("sumemos un select con búsqueda"). Si falta el nombre, preguntar. Si el componente ya existe en `packages/components/src/lib/`, declararlo y parar (eso sería un change de modificación, no un alta).

---

## Fuentes normativas (leer antes de generar nada)

1. `openspec/README.md` — **próximo ID disponible** y convención de frontmatter/paths.
2. [ADR-004](../../../docs/architecture/adr/ADR-004-arquitectura-components.md) — flat por componente, standalone + signals, CSS plain, ViewEncapsulation default, Vitest, peerDependency a tokens.
3. [ADR-007](../../../docs/architecture/adr/ADR-007-naming-prefijos.md) — `Ds<Name>` / `ds-<name>` / types `Ds<Name><Type>`; story titles sin prefijo.
4. [ADR-010](../../../docs/architecture/adr/ADR-010-file-naming-sin-sufijo-component.md) — archivos sin sufijo `.component` (`<name>.ts`, `<name>.html`, `<name>.css`, `<name>.spec.ts`, `<name>.stories.ts`, `index.ts`).
5. [ADR-011](../../../docs/architecture/adr/ADR-011-estado-disabled-accesible.md) — patrón disabled por tipo (acción vs form control).
6. [ADR-012](../../../docs/architecture/adr/ADR-012-iconografia-lucide.md) — iconos Lucide: import por icono, `size="16"` + `strokeWidth="1.5"`, `currentColor`, reglas a11y, peer al primer consumo.
7. [ADR-013](../../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md) — si el componente es overlay modal: `<dialog>` nativo, reglas 1–6.
8. [ADR-018](../../../docs/architecture/adr/ADR-018-specs-por-componente.md) — organización de specs: transversal (`components-package`) vs una por componente (`component-<name>`); dónde va el delta.
9. `openspec/specs/components-package/spec.md` — requirements **transversales** vigentes que el delta debe respetar; si el componente ya existe, además su `openspec/specs/component-<name>/spec.md`.
10. Un change archivado de referencia (`openspec/changes/archive/aaa-014-components-add-modal/`) — estructura de proposal/design/tasks a replicar.

---

## Workflow

### 1. Relevamiento (con el usuario)

Resolver antes de escribir artefactos — preguntar solo lo que no se pueda inferir:

- **Nombre y propósito**: `ds-<name>`, qué problema resuelve, caso de uso real que lo dispara (D-005: sin features hipotéticas — si no hay disparador, declararlo y sugerir FUTURE-WORK).
- **API propuesta**: inputs/outputs/model, variantes, sizes, contenido proyectado.
- **Estados**: default, hover, active, focus, disabled, checked/expanded/etc. según aplique.
- **Dependencias**: ¿consume iconos? ¿necesita tokens component nuevos?

### 2. Clasificación → decisiones derivadas (no re-decidir lo decidido)

| Si el componente es… | Entonces (fuente) |
|---|---|
| **Form control** (recibe valor de un form) | Implementa **CVA** (`ControlValueAccessor`); disabled **nativo** (ADR-011) |
| **Botón/control de acción** | `aria-disabled` + guarda + `disabledReason` (ADR-011) |
| **Overlay modal** (modal, drawer, sheet) | Sobre `<dialog>` nativo, reglas 1–6 de ADR-013; no crear stack manager |
| **Overlay no modal** (dropdown, tooltip, popover) | Evaluar plataforma primero (Popover API / anchor positioning) con el criterio de ADR-013 antes de sumar dependencia de posicionamiento — si la decisión no es obvia, va al `design.md` del change |
| **Consume iconos** | Convención ADR-012 §1; verificar peer `@lucide/angular` ya declarada (lo está desde aaa-014) |

Si el componente no encaja en ninguna fila o requiere una decisión one-way door nueva (dependencia externa, patrón de interacción sin precedente), la decisión se documenta en el `design.md` del change y, si corresponde, se promueve a ADR al archivar — no la toma la skill en silencio.

### 3. Tokens primero

- Revisar si existe `packages/tokens/src/component/<name>.json`; si falta, definirlo **referenciando semantic** (`{semantic.color.…}`), nunca valores crudos ni primitives directos (jerarquía de ADR-003).
- Los componentes consumen `var(--ds-*)` exclusivamente: **cero valores hardcodeados** en el CSS.

### 4. Generar el change OpenSpec

Crear `openspec/changes/components-add-<name>/` con el próximo ID de `openspec/README.md`:

- **`proposal.md`** — frontmatter (`id`, `name`, `type: change`, `status: proposed`, `introduces-specs: component-<name>` para un componente nuevo — o `modifies-specs: component-<name>` si ya existe —, `modifies-specs: components-package` solo si cambia algo transversal, `design-tokens-package` si toca tokens), porqué/qué/impacto. Referenciar la HU de producto si existe. (Convención: [ADR-018](../../../docs/architecture/adr/ADR-018-specs-por-componente.md).)
- **`design.md`** — solo si hay decisiones no triviales del paso 2 (posicionamiento, patrón nuevo, trade-offs). Si todo es aplicación mecánica de ADRs, omitirlo y decirlo en el proposal.
- **`specs/component-<name>/spec.md`** — delta `ADDED Requirements` (componente nuevo) o `MODIFIED` (existente) con scenarios Given/When/Then **testables** que cubran: API pública, estados, a11y (ARIA, teclado, foco, reduced motion), tokens consumidos. Un requirement transversal nuevo va en `specs/components-package/spec.md`.
- **`tasks.md`** — replicar la estructura de 8 fases de `aaa-014`, cada task ≤2h con criterio binario:
  1. **Pre-flight**: suite verde (`pnpm -r build && pnpm -r test`); soporte jsdom de las APIs usadas; tokens confirmados en `dist/tokens.css`.
  2. **Tokens**: `component/<name>.json` + build + test de tokens.
  3. **Dependencias** (si aplica): peers + verificación de que ng-packagr no bundlea + README.
  4. **Componente**: `src/lib/<name>/` — standalone, OnPush, signals (`input()`/`output()`/`model()`), template en `.html` con control flow nativo, CSS tokenizado, `index.ts` + export en `public-api.ts`, build APF verde. La generación de los archivos puede **delegarse a `/ng:create`** (agente `ng-component`): el `ng-stack-profile.md` cubre el stack (prefijo de selector, motor de estilos, framework de test) y también las convenciones del repo — naming `Ds<Name>` sin sufijo, los 6 archivos + export en `public-api.ts`, CSS solo con `var(--ds-*)`, `DsFieldBase` obligatorio en form fields (ADR-020) y los patrones de ADR-011/012/013/014/019. Igual **revisar el resultado contra las tasks del change**: el perfil es la base común, el change manda sobre lo específico del componente.
  5. **Tests de comportamiento** (`<name>.spec.ts`): un test por scenario del delta; suite completa verde.
  6. **Story + showcase**: `<name>.stories.ts` CSF 3 (title `Components/<Name>` sin prefijo Ds); vista del showcase en el playground: `apps/playground/src/app/showcase/<slug>/<slug>-showcase.ts/.html` (casos de uso con `ShowcaseCase` + snippets) **+ entrada en `SHOWCASE_ENTRIES`** (`showcase/registry.ts` — alimenta ruta y sidebar, aaa-022); `build-storybook` + test de playground verdes.
  7. **Validación de cierre**: `pnpm openspec validate <change> --strict`, `pnpm lint`, `pnpm format:check`, `pnpm -r build`, `pnpm -r test`, auditoría **`/ng:review`** sobre los archivos del componente nuevo como quality gate (sin hallazgos de severidad alta ni media — "crear y revisar con el mismo rasero"; **pasarle el path de salida**: `docs/design/reviews/<fecha>-<componente>.md` o el scratchpad de la sesión — nunca el default "junto al componente", que escribiría dentro del package publicable), `npm pack --dry-run` (sin `*.spec.ts`/`*.stories.ts` en el tarball), changeset **minor** de components (+ **patch/minor** de tokens si tocó tokens). Última task: **proponer mensaje de commit y esperar OK**.
  8. **Gate visual del PO** ([D-022](../../../docs/product/decisiones.md)): mostrarle el componente renderizado (showcase o Storybook) y **esperar su OK explícito**. Es bloqueante: sin ese OK no se archiva. Los gates automáticos no detectan defectos visuales — el de centrado vertical del Button llegó a `main` con todo en verde.
  9. **ADR + archive** (si hubo decisión promovible): ADR, decisions-log, mover a `archive/<id>-<name>/`, sincronizar spec base, y el resto del [checklist de archive](../../../docs/product/README.md#checklist-de-archive) — próximo ID en `openspec/README.md`, catálogo en `docs/architecture/README.md`, HU a Hecha, doc de la épica, README de producto y grooming del BACKLOG. Última task: proponer commit del archive y esperar OK.
- Validar: `pnpm openspec validate --changes`.
- Actualizar `openspec/README.md` (ID consumido) y el BACKLOG (item pasa a `propuesta activa` con link) — esto forma parte del commit de la propuesta.

### 5. Checkpoint con el usuario

Presentar el resumen de la propuesta (API, decisiones, tasks) y **parar**. Con OK explícito, continuar con la implementación siguiendo `tasks.md` en orden, marcando checkboxes. Sin OK, la skill termina con la propuesta lista para review.

---

## Constraints

- **Nunca commitear sin OK explícito** del usuario sobre el mensaje propuesto (regla del repo).
- **No re-decidir** lo que un ADR aceptado ya decidió; si algo pide apartarse de un ADR, parar y decirlo (el camino es un ADR nuevo, no una excepción silenciosa).
- **Staging solo con paths explícitos** (nunca `git add -A`).
- **Cero valores hardcodeados** en CSS de componentes; **cero primitives directos** en component tokens.
- Los scenarios del spec delta deben ser convertibles a test — si un scenario no se puede testear, reescribirlo.
- **Cero emojis** en los artefactos.

## Quality checks (auto-verificación antes del checkpoint)

1. ¿El ID del change es el "próximo disponible" de `openspec/README.md` y quedó actualizado?
2. ¿`pnpm openspec validate --changes` pasa?
3. ¿El delta cubre API + estados + a11y + tokens (las 4 áreas)?
4. ¿`tasks.md` termina cada fase de cierre con "proponer commit y esperar OK"?
5. ¿La clasificación del paso 2 quedó registrada (en proposal o design) con su ADR fuente?

## When to use

- `/ds:add-component <nombre>` o pedidos de sumar un componente nuevo al kit.

## When NOT to use

- Modificar/extender un componente existente (change OpenSpec normal, sin esta skill).
- Componentes del playground o prototipos no publicables (no requieren change ni este rigor).
- Crear componentes en otros repos (esta skill asume las convenciones de este DS).
