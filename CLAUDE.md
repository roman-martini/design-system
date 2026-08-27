# design-system

Monorepo `pnpm` de librerías publicables bajo `@romanmartinidev`: `packages/tokens` (design tokens, Style Dictionary) y `packages/components` (Angular 21, ng-packagr/APF), más `apps/playground` para validarlas. Quickstart: [README.md](README.md).

Todo artefacto del repo (docs, commits, ADRs, specs) se escribe en español; código e identificadores en inglés.

## Prioridades y criterio de recomendación

Toda decisión se justifica contra, en orden: **1) buenas prácticas, 2) arquitectura que escala ordenado, 3) mantenibilidad** ([CONTRIBUTING.md](CONTRIBUTING.md#prioridades-del-repo)). Ante una disyuntiva, ofrecer 2-3 opciones con pros/contras y **recomendar** por (PO, 2026-08-05):

1. Lo que sigue siendo correcto cuando el kit crece en componentes, themes y consumidores.
2. La práctica establecida en design systems maduros (Material, Carbon, Polaris, Radix) — patrones probados antes que invención propia.
3. Lo que deja a los packages sirviendo a más apps consumidoras sin rediseño.

Nunca recomendar por tamaño del diff, velocidad o comodidad. Si la opción profesional cuesta más, se recomienda igual y se explicita el costo.

## Comandos

```sh
pnpm build                                   # todo; un package: pnpm -F @romanmartinidev/tokens build
pnpm test                                    # un solo archivo: pnpm -F @romanmartinidev/components test -- src/lib/button/button.spec.ts
pnpm typecheck && pnpm lint && pnpm format:check   # lo que corre CI en cada PR
pnpm dev                                     # playground (alias: start); pnpm storybook
pnpm openspec validate --all                 # CLI pinneado @fission-ai/openspec — nunca npx openspec
pnpm changeset                               # obligatorio en cada PR que toca una lib publicable
pnpm verify:packaging                        # contrato del artefacto emitido (ADR-021)
```

- **Publicar a npm está prohibido desde acá**: el único camino es `.github/workflows/release.yml`, detrás del environment `npm-publish` con aprobación del PO por versión ([ADR-022](docs/architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)). `.claude/settings.json` deniega `changeset publish`, `pnpm publish` y `git add -A/.`.
- El script se llama `changeset:version`, no `version` (el builtin de pnpm lo pisaría); lo corre solo el PR de release.

## Cómo trabajar acá

1. **Nunca commitear sin OK.** Proponer el mensaje y esperar el OK explícito del PO; stagear solo paths explícitos.
2. **Cambios significativos** (nueva lib, refactor mayor, tooling base) van por OpenSpec: propuesta → review → apply → archive. Lo trivial va por commit directo.
3. **Antes de proponer cambios estructurales**, leer `docs/architecture/ARCHITECTURE.md`, `decisions-log.md` y los ADRs aceptados.
4. **Decisión one-way door o que afecta ≥2 packages → ADR** (MADR, `docs/architecture/adr/`) + fila en `decisions-log.md`. Los ADRs son inmutables: para revertir, ADR nuevo que referencia al anterior.
5. **Marcar malas prácticas** que violen las prioridades y proponer alternativa — nunca continuar en silencio.
6. **No crear `*.md` de planificación o resumen ad-hoc** salvo pedido explícito: las decisiones van a ADRs, los cambios a OpenSpec.
7. **Angular moderno es el estándar** (standalone, signals, control flow nativo, OnPush/zoneless, `inject()`); legacy es hallazgo. Calidad de componentes: agentes `/ng:*` y `.claude/rules/ng-constraints.md`.

## Convenciones no obvias

- **Specs ≠ ADRs ≠ `design.md`.** ¿Se puede convertir en test? → spec. ¿Elección entre alternativas? → ADR. El `design.md` de un change muere al archivarse: sus decisiones one-way door se promueven a ADR al cerrar. Specs nunca fijan framework ni implementación.
- **Changes OpenSpec** llevan ID permanente `aaa-NNN` en el frontmatter del `proposal.md` ([ADR-008](docs/architecture/adr/ADR-008-convencion-ids-openspec.md)); las specs se identifican por carpeta. Próximo ID y frontmatter: `openspec/README.md`. Si cambiás una convención ahí, sincronizá `openspec/config.yaml` y viceversa — el CLI inyecta el config al generar artefactos.
- **Versionado lockstep** tokens + components, pre-1.0 ([ADR-015](docs/architecture/adr/ADR-015-versionado-lockstep.md)). Packages: `@romanmartinidev/<carpeta>` en kebab-case.
- **Commits** Conventional Commits en español; scopes `tokens` · `components` · `playground` · `repo` · `ci` · `docs`.

## Dónde está cada cosa

| Pregunta                                    | Fuente de verdad                                    | Leer cuando                                            |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| ¿Qué debe hacer el sistema?                 | `openspec/specs/<capability>/spec.md`               | Implementás o testeás comportamiento                   |
| ¿Qué cambios están en curso / cerrados?     | `openspec/changes/` · `changes/archive/`            | Arrancás o retomás un change                           |
| ¿Por qué se decidió X? / índice             | `docs/architecture/adr/` · `decisions-log.md`       | Antes de cualquier cambio estructural                  |
| ¿Cómo está organizado el repo?              | `docs/architecture/ARCHITECTURE.md` · `catalog.md`  | Necesitás el mapa o el inventario de changes/specs     |
| ¿Qué valor, para qué actor, por qué ahora?  | `docs/product/` (épicas, HUs, decisiones D-XXX)     | Priorizás o discutís alcance                           |
| ¿Qué está en cola y cuándo se activa?       | `docs/backlog/BACKLOG.md`                           | Elegís qué hacer a continuación (`/ds:auto`)           |
| Ideas aún no comprometidas                  | `docs/product/intake/`                              | Llega un pedido nuevo; se borra al promoverse (D-019)  |
| Evidencia fechada (a11y, research, reviews) | `docs/design/` · `docs/reviews/<fecha>-<nombre>/`   | Auditás; no es normativa una vez ejecutada             |
| Material de referencia                      | `docs/reference/`                                   | Inspiración; nunca fuente de verdad                    |
| Flujo de PR, hooks, CI, release             | `CONTRIBUTING.md`                                   | Dudas de proceso                                       |
