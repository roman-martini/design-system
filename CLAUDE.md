# design-system

Monorepo `pnpm` con librerías de **arquitectura frontend** publicables bajo el scope `@romanmartinidev` — `packages/tokens` (design tokens, Style Dictionary 4) y `packages/components` (componentes Angular 21, ng-packagr/APF) — más `apps/playground` para validarlas en condiciones reales. Stack: TypeScript 5.9, Vitest 4, Storybook 10, Changesets, ESLint + Prettier, Husky + commitlint.

Todo artefacto del repo (docs, commits, ADRs, specs) se escribe en español; código e identificadores en inglés.

## Prioridades estrictas (en orden)

1. **Aplicar buenas prácticas.**
2. **Diseños/arquitecturas que escalen ordenado.**
3. **Mantenibilidad** vía estándares y convenciones claras.

Toda decisión arquitectónica o de proceso debe poder justificarse contra estas prioridades. Frente a una disyuntiva, no elegir por velocidad; ofrecer 2-3 opciones evaluadas con pros/contras y recomendación.

### Criterio de recomendación (PO, 2026-08-05)

Seguir ofreciendo opciones ante toda pregunta abierta — pero la **recomendación** se fundamenta siempre en estos criterios, no en la conveniencia del momento:

1. **Lo que mejor escala**: la opción que sigue siendo correcta cuando el kit crece en componentes, themes y consumidores — no la que solo funciona con el tamaño de hoy.
2. **La práctica profesional establecida**: lo que aplican los design systems maduros (Material, Carbon, Polaris, Radix) y la ingeniería a gran escala. Patrones probados por la industria antes que invención propia.
3. **La adaptabilidad de las libs**: la opción que deja a los packages sirviendo a la mayor variedad de requerimientos de apps consumidoras sin rediseño.

Nunca recomendar por tamaño del diff, velocidad de implementación o comodidad. Si la opción profesional es más trabajo, se recomienda igual y se explicita el costo.

## Fuentes de verdad

Cada artefacto del repo responde una pregunta distinta. **No mezclarlos**. Si tenés una duda, mirá la tabla:

| Pregunta                                                                     | Fuente de verdad                      | Naturaleza                                                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| ¿Qué debe hacer el sistema?                                                  | `openspec/specs/<capability>/spec.md` | Contratos testables (Given/When/Then)                                                        |
| ¿Qué cambios significativos están en curso?                                  | `openspec/changes/<change-name>/`     | Propuesta activa (`proposal.md` + `design.md` + `tasks.md` + spec deltas)                    |
| ¿Cuál es el historial de cambios cerrados?                                   | `openspec/changes/archive/`           | Auditoría de cambios pasados                                                                 |
| ¿Por qué se decidió X?                                                       | `docs/architecture/adr/ADR-NNN-*.md`  | Decisión inmutable + opciones evaluadas                                                      |
| ¿Hay un índice de todas las decisiones?                                      | `docs/architecture/decisions-log.md`  | Tabla cronológica                                                                            |
| ¿Cómo está organizado el repo (visión general, principios)?                  | `docs/architecture/ARCHITECTURE.md`   | Mapa mental                                                                                  |
| ¿Qué changes y specs existen o existieron?                                   | `docs/architecture/catalog.md`        | Catálogo histórico                                                                           |
| ¿Cómo trabajo como dev en este repo?                                         | `CONTRIBUTING.md`                     | Flujo de PR, commits, changesets                                                             |
| ¿Cómo arranco como dev nuevo?                                                | `README.md` (root)                    | Quickstart                                                                                   |
| ¿Cómo debe trabajar Claude acá?                                              | `CLAUDE.md` (este archivo)            | Contrato Claude ↔ repo                                                                       |
| ¿Qué valor, para qué actor, por qué ahora? (producto)                        | `docs/product/`                       | Épicas + HUs + decisiones de producto (D-XXX)                                                |
| ¿Qué está en cola y cuándo se activa? (backlog operativo)                    | `docs/backlog/BACKLOG.md`             | Cola Now/Next/Later con disparadores                                                         |
| Ideas en exploración, aún no comprometidas                                   | `docs/product/intake/`                | Un documento por idea; se borra al promoverse a épica/HU (D-019)                             |
| ¿Qué arrojó la última auditoría de a11y o el research de un sistema externo? | `docs/design/` (`a11y/`, `research/`) | Evidencia fechada, no normativa; la producen `/ds:check-a11y` y `/ds:research-design-system` |
| ¿Qué encontró la última review integral del repo?                            | `docs/reviews/<fecha>-<nombre>/`      | Hallazgos + plan de acción fechados; no normativo una vez ejecutado                          |
| Material de investigación de referencia (no normativo)                       | `docs/reference/`                     | Histórico/inspiración                                                                        |

### Reglas para no mezclar

1. **Specs ≠ ADRs.** Specs describen comportamiento testable (qué). ADRs justifican decisiones tecnológicas (por qué). Si dudás: ¿se puede convertir en un test? → spec. ¿Documenta una elección entre alternativas? → ADR.
2. **`design.md` de un change ≠ ADR.** El `design.md` muere cuando el change se archiva. El ADR queda eterno. Decisiones one-way door del change se promueven a ADR al cerrarse.
3. **`docs/architecture/ARCHITECTURE.md` no duplica specs.** Da contexto (diagramas, principios, mapa). Las reglas testables linkean al spec correspondiente.
4. **OpenSpec excluye explícitamente** elecciones de framework/librería y detalles de implementación. Eso va a `design.md` o ADRs, no a specs.

## Convenciones

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) validados por commitlint. Scopes habituales: `tokens`, `components`, `playground`, `repo`, `ci`, `docs`. Mensajes en español.

### ADRs

Toda decisión one-way door o que afecta ≥2 packages genera un ADR en formato MADR en `docs/architecture/adr/`. Los ADRs son **inmutables**: para revertir, crear un nuevo ADR que referencia al anterior. Formato: `docs/architecture/adr/README.md`.

### OpenSpec

Todo cambio significativo (nueva lib, refactor mayor, cambio de tooling base) arranca como propuesta en `openspec/changes/`; los cambios triviales o de implementación local van por commit directo. Los changes llevan un ID **permanente** `aaa-NNN` en el frontmatter del `proposal.md` ([ADR-008](docs/architecture/adr/ADR-008-convencion-ids-openspec.md)); las specs se identifican por carpeta, sin ID. Convención operativa completa (frontmatter, paths, **próximo ID disponible**): [`openspec/README.md`](openspec/README.md). Las convenciones que el CLI inyecta al generar artefactos viven en `openspec/config.yaml` — si cambiás una en el README, sincronizá el config y viceversa.

### Versionado y naming de packages

- Cada PR que afecta una lib publicable agrega un changeset (`pnpm changeset`). Pre-1.0: semver con superficie API aún móvil; versionado lockstep entre packages ([ADR-015](docs/architecture/adr/ADR-015-versionado-lockstep.md)).
- Packages: scope `@romanmartinidev/`, nombre kebab-case corto, igual a la carpeta en `packages/`.

## Comandos esenciales

```bash
pnpm install
pnpm build            # pnpm -r build; un package: pnpm -F @romanmartinidev/tokens build
pnpm dev              # levantar playground (alias: pnpm start)
pnpm storybook        # storybook:build para el build estático
pnpm test             # pnpm -r test
pnpm lint
pnpm format           # pnpm format:check en CI
pnpm openspec validate --all   # CLI pinneado: @fission-ai/openspec (nunca npx openspec)
pnpm changeset
pnpm changeset:version   # solo lo ejecuta el PR de release; NO se llama `version` (el builtin de pnpm lo pisaría)
```

> **La publicación a npm no se ejecuta manualmente.** El único camino es `.github/workflows/release.yml`, cuyo job `publish` corre `pnpm changeset publish` según [ADR-006](docs/architecture/adr/ADR-006-estrategia-ci-cd.md) y el lockstep de [ADR-015](docs/architecture/adr/ADR-015-versionado-lockstep.md). No existe un script `release` en el root: fue eliminado a propósito para que no haya un publish manual de un comando. El veto de publicación fue **levantado el 2026-07-28** ([D-028](docs/product/decisiones.md)), pero eso **no habilita publicar desde acá**: no correr `changeset publish` ni `pnpm -r publish` bajo ninguna circunstancia — el release corre por CI y queda detrás del environment `npm-publish` con aprobación explícita del PO por versión ([ADR-022](docs/architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)). Cómo se empaqueta cada package lo gobierna [ADR-021](docs/architecture/adr/ADR-021-estrategia-publicacion-packages.md); `pnpm verify:packaging` verifica el contrato sobre el artefacto emitido.

## Cómo trabajar en este repo (para Claude)

1. **Leer siempre primero** `docs/architecture/ARCHITECTURE.md`, `docs/architecture/decisions-log.md` y los ADRs aceptados antes de proponer cambios estructurales.
2. **Nunca commitear sin OK.** Proponer el mensaje de commit y esperar el OK explícito del PO. Staging solo con paths explícitos (nunca `git add -A`).
3. **Detectar y marcar malas prácticas.** Si el código viola las prioridades de arriba, mencionarlo y proponer alternativa fundamentada — no continuar en silencio.
4. **Cambios significativos siguen el flujo de OpenSpec** — propuesta → review → apply → archive. Ver `openspec/README.md` para la convención y `docs/architecture/catalog.md` para el inventario.
5. **No modificar ADRs aceptados.** Para cambiar una decisión, crear un nuevo ADR.
6. **Documentar decisiones nuevas.** Toda decisión arquitectónica significativa actualiza `decisions-log.md` y genera ADR si corresponde.
7. **No crear archivos `*.md` de planificación o resumen ad-hoc** salvo que se pidan explícitamente. Las decisiones van a ADRs; los cambios significativos van a OpenSpec.

## Componentes Angular (familia `ng-`)

Grupo de agentes para la calidad de componentes Angular: `/ng:ask` (router), `/ng:create` (genera componente moderno), `/ng:review` (audita con hallazgos `archivo:línea` + severidad), `/ng:change` (convierte un review grande en un Markdown autocontenido), `/ng:sync` (actualiza el knowledge desde angular.dev — única pieza del grupo con acceso web).

- Las buenas prácticas viven en `.claude/knowledge/ng-best-practices.md`; **solo `ng-sync` lo modifica**.
- El perfil del stack vive en `.claude/knowledge/ng-stack-profile.md`; sin perfil completo, `/ng:create` y `/ng:review` **paran y lo piden** (fail fast).
- Angular moderno es el estándar (standalone, signals-first, control flow nativo, OnPush/zoneless); legacy es hallazgo.
- Restricciones completas del grupo: `.claude/rules/ng-constraints.md`.
