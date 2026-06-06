# Commands `/ds:*` — Design System tooling

Convención del repo para skills + commands relacionados con la gestión del design system. Replica el patrón `opsx:*` (OpenSpec) ya usado.

## Convención

| Capa | Ubicación | Rol | Ejemplo |
|---|---|---|---|
| **Skill** (fuente de verdad) | `.claude/skills/<name>/SKILL.md` | Workflow, instrucciones, constraints. Invocable dinámicamente por Claude o explícitamente por el user. | `research-design-system` |
| **Command** (wrapper thin) | `.claude/commands/ds/<name>.md` | Entry point con prefix namespace `ds:`. Delega a la skill via tool `Skill`. ~10 líneas. | `/ds:research-design-system` |

**Skill = una sola fuente de verdad.** El command es un wrapper que pasa `$ARGUMENTS` a la skill. Si actualizás la skill, no hay que sincronizar nada en el command.

Diferencia con el patrón `opsx:*`: los commands de opsx duplican el contenido del skill (generación automática upstream + auto-contención frente a cambios externos). En `ds:*` controlamos ambos lados, así que aplicamos DRY: command thin → skill rica.

## Existentes

| Command | Skill | Estado | Propósito |
|---|---|---|---|
| `/ds:research-design-system` | `research-design-system` | Activa | Investigar el sistema visual de un sitio externo (Polymer, Stripe, Linear, Vercel…) y producir un reporte de adopción razonado en `docs/design/research/<slug>.md`. |

## Backlog

Cada skill se crea **cuando aparezca la primera necesidad concreta**, no antes (anti-pattern del repo: skills sin uso real).

| Command planificado | Propósito | Cuándo crearlo |
|---|---|---|
| `/ds:audit-tokens` | Auditar consistencia de la jerarquía `primitives → semantic → component → theme`. Detectar tokens huérfanos (definidos pero no referenciados), CSS de componentes con valores hardcoded fuera de `var(--ds-*)`, semantic tokens que no consumen primitives. | Cuando el package `tokens` crezca a >100 tokens o aparezca el primer drift detectado en code review. |
| `/ds:add-component` | Workflow guiado para agregar componente nuevo siguiendo ADR-004 + ADR-007: estructura `src/lib/<name>/`, naming (class `Ds<Name>`, selector `ds-<name>`), CVA si aplica, tests Vitest, story Storybook, public-api, spec delta de components-package, changeset. Equivalente a un change `aaa-NNN-components-add-<x>` semi-automatizado. | Cuando haya ≥3 componentes nuevos en cola y los changes de "add component" tengan estructura repetitiva clara (probable después de Radio + Modal). |
| `/ds:check-a11y` | Auditoría WCAG AA sobre componentes existentes: contraste de tokens (color text/bg), navegación por teclado en stories, ARIA presente y correcta (`aria-checked`, `aria-disabled`, `aria-expanded`, `role`), `prefers-reduced-motion` respetado. | Cuando haya ≥5 componentes (umbral del Nivel 2 "Calidad profesional" de FUTURE-WORK). |

## Cómo agregar un command nuevo `/ds:*`

1. Crear `.claude/skills/<name>/SKILL.md` con frontmatter (`name`, `description`, `metadata`) y el workflow completo. Esta es la fuente de verdad.
2. Crear `.claude/commands/ds/<name>.md` como **wrapper thin** (≤15 líneas) que invoca la skill via tool `Skill` con `$ARGUMENTS`. Ver `research-design-system.md` como ejemplo.
3. Actualizar la tabla "Existentes" de este README sumando la fila.
4. Si la skill crece a un workflow que justifica aislamiento de contexto (web fetches masivos, lecturas profundas que contaminan la sesión principal), considerar promoverla a sub-agent (`.claude/agents/`).

## Anti-patrones

- **No duplicar funcionalidad de skills upstream** (opsx, as-, arch-, design-, web-). Si la tarea es genérica, usar la skill existente.
- **No crear skills "por si acaso"**. Cada skill nueva requiere caso de uso real explicitado.
- **No mezclar implementación con research**. Las skills `/ds:*` que hacen cambios significativos al código deben emitir una propuesta OpenSpec (aaa-NNN) en lugar de aplicar directo.
