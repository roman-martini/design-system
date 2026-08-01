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
| `/ds:handoff` | `session-handoff` (modo `save`) | Activa | Sintetizar el estado de la sesión (repo verificable + decisiones conversacionales) en `.claude/session-handoff.md` (gitignored) antes de un `/clear`. |
| `/ds:resume` | `session-handoff` (modo `resume`) | Activa | Leer el handoff después del `/clear`, verificar que el repo no avanzó por fuera y retomar por el "EMPEZÁ POR". |
| `/ds:check-a11y` | `check-a11y` | Activa | Auditar los componentes contra WCAG AA y los ADRs de a11y (011/012/013): ARIA, teclado, foco, reduced-motion y contraste calculado con script determinístico (`scripts/contrast.mjs`). Reporte en `docs/design/a11y/<fecha>-audit.md`. Materializa D-007. |
| `/ds:add-component` | `add-component` | Activa | Workflow guiado para sumar un componente al kit: relevamiento → clasificación contra ADR-004/007/010/011/012/013/014/019/020 → change OpenSpec (proposal + spec delta + tasks del patrón consolidado, referencia el último change de componente archivado) → implementación con OK del usuario. |
| `/ds:auto` | `backlog-auto` | Activa | Ejecutar en automático los items **Now** de `docs/backlog/BACKLOG.md` (OpenSpec o commit directo según tipo), sin decidir nada que sea del PO. Args: `commit=ask\|auto\|none`, `decisiones=defer\|inline`. |
| `/ds:audit-tokens` | `audit-tokens` | Activa | Auditar la consistencia de los tokens con script determinístico (`scripts/audit-tokens.mjs`): hardcodes en el CSS de componentes, violaciones del contrato de jerarquía, advertencias de bypass permitidas por ADR-003 y tokens huérfanos. Reporte en `docs/design/tokens/<fecha>-audit.md`. Materializa HU-032 (D-021). |

## Backlog

Cada skill se crea **cuando aparezca la primera necesidad concreta**, no antes (anti-pattern del repo: skills sin uso real).

_Sin commands planificados._ El último pendiente, `/ds:audit-tokens`, se activó el 2026-07-27: su disparador declarado ("más de 100 tokens **o** el primer drift en code review") estaba cumplido por partida doble —754 declaraciones `--ds-` y el hardcode de `white` detectado el 2026-07-11 en la auditoría de a11y— y [D-021](../../../docs/product/decisiones.md) aprobó la promoción.

## Cómo agregar un command nuevo `/ds:*`

1. Crear `.claude/skills/<name>/SKILL.md` con frontmatter (`name`, `description`, `metadata`) y el workflow completo. Esta es la fuente de verdad.
2. Crear `.claude/commands/ds/<name>.md` como **wrapper thin** (≤15 líneas) que invoca la skill via tool `Skill` con `$ARGUMENTS`. Ver `research-design-system.md` como ejemplo.
3. Actualizar la tabla "Existentes" de este README sumando la fila.
4. Si la skill crece a un workflow que justifica aislamiento de contexto (web fetches masivos, lecturas profundas que contaminan la sesión principal), considerar promoverla a sub-agent (`.claude/agents/`).

## Anti-patrones

- **No duplicar funcionalidad de skills upstream** (opsx, as-, arch-, design-, web-). Si la tarea es genérica, usar la skill existente.
- **No crear skills "por si acaso"**. Cada skill nueva requiere caso de uso real explicitado.
- **No mezclar implementación con research**. Las skills `/ds:*` que hacen cambios significativos al código deben emitir una propuesta OpenSpec (aaa-NNN) en lugar de aplicar directo.
