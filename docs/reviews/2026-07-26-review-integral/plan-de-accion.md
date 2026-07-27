# Plan de acción — Review integral del repo (2026-07-26)

> Plan ejecutable derivado de la review integral pedida por el PO (TASK.md §3, pedido explícito).
> La evidencia completa de cada hallazgo citado acá (`<dimensión>-NN`) vive en [hallazgos.md](hallazgos.md).
> **Este plan no modifica código**: registra qué ejecutar, en qué orden, por qué vía y con qué effort — la ejecución posterior sigue el flujo del repo (OpenSpec para lo significativo, commit directo para docs/tooling menor, D-XXX para decisiones).

## Cómo usar este plan

1. **Se ejecuta por partes** (A–N), idealmente una parte por sesión. Cada parte declara su **effort recomendado** (low / medium / high / ultra) para setear el nivel de razonamiento del modelo en esa sesión.
2. **El orden recomendado no es estricto**: la columna "Depende de" marca las dependencias reales; lo demás es paralelizable.
3. **Regla de revalidación**: los hallazgos marcados "sin verificación adversarial" en hallazgos.md se re-verifican contra el repo al inicio de la parte que los ejecuta (los 28 de severidad alta ya están todos confirmados).
4. **Veto vigente**: nada de este plan publica a npm. Los ítems de packaging/release preparan el terreno y surten efecto cuando el PO levante el veto.
5. Al ejecutar cada parte: los changes OpenSpec arrancan con `/opsx:propose <slug>`; los ítems de docs van por commit directo; toda decisión del PO se registra como D-XXX en `docs/product/decisiones.md`.

### Modelo por parte

Cada parte declara su **modelo recomendado** (columna "Modelo" del mapa y encabezado de cada parte):

- **Opus 5 es el default** ($5/$25 por MTok): el grueso del plan es ejecución bien especificada — coding agéntico, CI, tooling, docs — que es exactamente su zona fuerte, a mitad de costo que Fable.
- **Fable 5 se reserva** ($10/$50 por MTok, consume el límite de sesión al doble) para donde la decisión es cara de revertir y el razonamiento es el cuello de botella: la **Parte I** (patrón SSR transversal + ADR) y los **ADRs de la Parte N** (DTCG, taxonomía de naming — one-way doors pre-1.0). La ejecución mecánica de N vuelve a Opus.
- **Equivalencia del effort del plan → setting real**: low→`low`, medium→`medium`, high→`high` (o `xhigh` si la parte pelea), ultra→`xhigh`/`max` en Opus 5, o `high` en Fable 5 (Fable rinde a effort menor que el equivalente de Opus).
- **No alternar modelos dentro de una sesión**: el cambio de modelo invalida el prompt cache y mezcla estilos de trabajo — el cambio de modelo es siempre un corte de sesión.

### Cuándo cortar sesión

Antes de cada corte: `/ds:handoff` (guarda el estado en `.claude/session-handoff.md`); al retomar: `/ds:resume`.

1. **Al terminar una parte** — regla base: una parte por sesión. Cada parte es autocontenida (referencia hallazgos.md por ID); el contexto de la parte anterior no aporta y solo consume ventana de contexto y límite de uso.
2. **Al cambiar de modelo o de effort** entre partes (p.ej. de C en low a D en high) — siempre sesión nueva.
3. **Entre changes OpenSpec independientes** dentro de una misma parte (los 6 changes de G, los sub-changes de N): cada change completa su ciclo propose → apply → verify → archive y ahí se corta.
4. **Nunca cortar a mitad de un change** si se puede evitar. Si un límite de sesión obliga, `/ds:handoff` primero y retomar el mismo change con `/ds:resume` en la sesión nueva.
5. **Combinaciones válidas en una sesión** (mismo modelo, effort parejo, temática continua): A+B, C+M, y 2–3 changes chicos de G.

## Diagnóstico general

La base del repo es **muy sólida**: gobernanza OpenSpec+ADR ejemplar, Angular moderno consistente, a11y trabajada con criterio APG, tests unitarios profundos, packaging con lockstep bien implementado. Los 140 hallazgos (28 alta / 74 media / 38 baja, 0 refutados) se concentran en cuatro frentes:

1. **Release-readiness**: el bundle publicado viola Angular Package Format (full compilation mode) y el guard que lo impediría está bypasseado — el defecto más grave del repo.
2. **Gates automáticos ausentes**: los contratos que las specs declaran verificables (contraste AA, jerarquía de tokens, coverage, a11y) hoy dependen de disciplina manual.
3. **Drift documental**: los docs de síntesis (architecture/README, PLAYBOOK, README root, CLAUDE.md, README de producto) quedaron congelados varias entregas atrás.
4. **Trabajo real fuera de gobernanza**: TASK.md (gitignored) sostiene decisiones e iniciativas que artefactos versionados citan.

### Top 6 críticos

| #   | Hallazgo                                                       | Por qué                                                                                  |
| --- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | [release-npm-01] Full compilation mode viola APF               | El 0.2.0 publicado puede romper en runtime para consumidores; en Angular 22 rompe seguro |
| 2   | [ci-cd-01] Changeset enforcement rompe el PR de release        | El flujo de release está bloqueado por su propio gate                                    |
| 3   | [components-01] Cero compatibilidad SSR                        | Lib publicada que explota en server-side rendering                                       |
| 4   | [testing-01/tokens-04] Contraste AA "normativo" sin gate en CI | Contrato de spec sin enforcement — papel mojado                                          |
| 5   | [backlog-01/02/03] TASK.md como fuente de verdad fantasma      | Trabajo y decisiones reales fuera de la gobernanza que el repo construyó                 |
| 6   | [tokens-01] Focus ring azul en brand-a/brand-b                 | Bug visual real en themes publicados                                                     |

## Mapa de partes

| Orden | Parte                                       | Contenido                                               | Vía                     | Modelo                                  | Effort         | Depende de       |
| ----- | ------------------------------------------- | ------------------------------------------------------- | ----------------------- | --------------------------------------- | -------------- | ---------------- |
| 1     | **A** — Decisiones del PO                   | 21 decisiones agrupadas en 5 bloques                    | Sesión + D-XXX          | Opus 5                                  | **medium**     | —                |
| 2     | **B** — Registro en producto y backlog      | HUs nuevas/refinadas + items backlog                    | Commit directo (docs)   | Opus 5                                  | **medium**     | A                |
| 3     | **C** — Sincronización documental           | ~28 fixes de drift en docs                              | Commit directo (docs)   | Opus 5                                  | **low**        | A (solo un ítem) |
| 4     | **D** — Release-readiness (APF + packaging) | Fix crítico de compilación + tarballs                   | OpenSpec change         | Opus 5                                  | **high**       | —                |
| 5     | **E** — CI: correctness + hardening         | Enforcement, pinning, permisos, dependabot              | OpenSpec change         | Opus 5                                  | **high**       | A (gate publish) |
| 6     | **F** — Gates de calidad automáticos        | Coverage, contraste, jerarquía, typecheck, axe f1       | OpenSpec change(s)      | Opus 5                                  | **high**       | A (a11y CI)      |
| 7     | **G** — Fixes de componentes                | menu, select, toast, modal, button, avatar              | OpenSpec por componente | Opus 5                                  | **medium** c/u | B                |
| 8     | **H** — Tokens: fixes y consistencia        | Focus ring brands + 5 limpiezas                         | OpenSpec change         | Opus 5                                  | **medium**     | A (parcial)      |
| 9     | **K** — Playground como QA visual           | Theme switcher, compodoc, viewport, limpiezas           | OpenSpec + commits      | Opus 5                                  | **medium**     | A                |
| 10    | **M** — Ecosistema `.claude/`               | Guardrails, drift, allowlist                            | Commit directo          | Opus 5                                  | **low**        | A (parcial)      |
| 11    | **I** — Compatibilidad SSR                  | DOCUMENT + guardas + ADR de patrón                      | OpenSpec change         | **Fable 5**                             | **ultra**      | —                |
| 12    | **J** — Refactors internos compartidos      | Overlay scaffold, typeahead, uid, readCssNumber         | OpenSpec change         | Opus 5                                  | **high**       | G                |
| 13    | **L** — Storybook avanzado y docs públicas  | Interaction tests, MDX tokens, deploy, visual reg.      | OpenSpec (HUs de B)     | Opus 5                                  | **high**       | A, B, F          |
| 14    | **N** — Estratégico pre-1.0                 | angular-eslint, strictness TS, pnpm 10, DTCG, taxonomía | OpenSpec, un change c/u | **Fable 5** (ADRs) / Opus 5 (ejecución) | **ultra**      | A                |

---

## Parte A — Sesión de decisiones del PO

**Modelo: Opus 5 · Effort: medium** · Vía: conversación + registro D-XXX en `decisiones.md` (próxima libre: D-018) · Sin tocar código.

Todas las decisiones vienen con recomendación para resolverlas en una sola sesión. Bloques:

**A-1. Release y npm**

| ID  | Decisión                                                                                                     | Recomendación                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| A1  | Idioma canónico de changesets/CHANGELOG [release-npm-08]                                                     | Español (coherente con el repo); histórico 0.2.0 en inglés se acepta; documentar en CONTRIBUTING |
| A2  | Gate duro del publish: environment `npm-publish` con required reviewer [ci-cd-02]                            | Sí — materializa el veto en un control técnico                                                   |
| A3  | npm provenance / trusted publishing [ci-cd-11, release-npm-05]                                               | Dejar preparado ahora (no publica nada)                                                          |
| A4  | Namespace JS de tokens: `DsColorBlue500` (renombrar exports) vs `ColorBlue500` (corregir README) [tokens-02] | Alinear exports al prefijo `Ds` — pre-1.0 es la última ventana barata                            |

**A-2. Producto y proceso**

| ID  | Decisión                                                                                    | Recomendación                                                                                                    |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A5  | Rol de TASK.md [backlog-01]                                                                 | Formalizarlo como "inbox del PO" con regla de triaje al grooming; prohibido citarlo desde artefactos versionados |
| A6  | Template-lume: crear EP-007 + decisión sobre rename `brand-a`→`modern-minimal` [backlog-03] | EP-007 sí; el rename con alias/deprecación (brand-a ya está publicado en npm)                                    |
| A7  | Item 1.3 — visibilidad de HUs hechas [backlog-05]                                           | Tabla global de HUs en product/README (opción ya recomendada en el análisis de 2026-07-20)                       |
| A8  | EP-005: ampliar alcance y darle HUs propias [producto-hus-04]                               | Sí — este plan la llena (ver Parte B)                                                                            |
| A9  | Mecanismo de verificación del hito H1 [producto-hus-06]                                     | Prototipo moder-minimal en playground al cerrar HU-025; registrar D-XXX                                          |
| A10 | Gate visual del PO pre-archive como regla permanente [claude-ecosystem-03]                  | Sí — registrar D-XXX y agregar a límites de `backlog-auto`                                                       |
| A11 | plantilla-requerimiento/flujo intake: adoptar o eliminar [producto-hus-07]                  | Eliminar — la Cantera ya cumple ese rol                                                                          |

**A-3. Calidad (promociones de Cantera → requieren tu OK por D-015)**

| ID  | Decisión                                                                      | Recomendación                                                                  |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| A12 | Activar `/ds:audit-tokens` [producto-hus-05, backlog-04, claude-ecosystem-06] | Activar — el disparador está cumplido hace 15 días y hay 754 custom properties |
| A13 | A11y automatizada en CI [ci-cd-10, testing-03]                                | Sí — fase 1 vitest-axe (barata), fase 2 Storybook test-runner                  |
| A14 | Bundle size budget [ci-cd-13/14]                                              | Sí — size-limit sobre dist de ambos packages                                   |
| A15 | Storybook deploy [ci-cd-09, playground-08]                                    | GH Pages ya (costo casi nulo); Chromatic/visual regression evaluar aparte      |

**A-4. Tokens pre-1.0 (ventana que se cierra)**

| ID  | Decisión                                                                                         | Recomendación                                                           |
| --- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| A16 | Migrar la fuente a formato DTCG (`$value`/`$type`) [tokens-05]                                   | Sí, antes o junto con aaa-012 — nuevo ADR que matiza ADR-003            |
| A17 | Taxonomía de naming CSS (primitives sin namespace; `font.size.button-*` en semantic) [tokens-06] | Resolver por ADR antes de 1.0                                           |
| A18 | Estrategia de sombras de elevación en dark [tokens-07]                                           | Decisión de diseño: sombras más opacas vs borde en superficies elevadas |
| A19 | Naming canónico `closeLabel` vs `dismissLabel` [components-15]                                   | `closeLabel`                                                            |

**A-5. Housekeeping**

| ID  | Decisión                                                                   | Recomendación                                                                            |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A20 | Destino de ADR-009/aaa-012 (7 semanas en Propuesto) [docs-arquitectura-10] | Mover a Later con disparador explícito + anotar la pausa en openspec (coordinar con A16) |
| A21 | `docs/reference`: estado mixto trackeado/ignorado [tooling-repo-07]        | Quitar la entrada del .gitignore (CLAUDE.md lo declara material del repo)                |

**Salida esperada**: D-018..D-0NN registradas; backlog actualizado con lo aprobado; lo rechazado queda documentado como decisión.

---

## Parte B — Registro en producto y backlog

**Modelo: Opus 5 · Effort: medium** · Vía: commit directo (solo docs de producto/backlog) · Depende de: A. Misma sesión que A si el contexto lo permite.

Materializa la regla del PO: _"dejar todo registrado en las HUs para luego ejecutar en OpenSpec"_.

- **HUs nuevas en EP-005** (si A8 aprueba; una HU por gate, con CAs binarios):
  - `HU-026` (o siguiente libre) — Coverage con thresholds + typecheck en CI [testing-02, tooling-repo-06]
  - Gate de contraste AA en CI [testing-01, tokens-04]
  - A11y automatizada (axe) fase 1 y 2 [testing-03] (si A13)
  - angular-eslint con reglas de template y a11y [tooling-repo-01]
  - Bundle size budget [ci-cd-14] (si A14)
  - Storybook deploy + visual regression [ci-cd-09] (si A15)
- **HUs del kit** (EP-002):
  - Ajuste dimensional a la referencia moder-minimal (TASK.md 1.11, citado por D-014) [backlog-02]
  - Estética del Spinner según captura (TASK.md 1.12) — refinamiento de HU-009 o HU nueva [backlog-02]
  - **Fix Button: texto no centrado verticalmente** (reporte del PO en `docs/backlog/fixs/button/fix-button.md` + captura) — registrar como fix de `component-button`; se ejecuta en Parte G
- **EP-007 template-lume** (si A6 aprueba): épica + HUs iniciales (research del sitio con `/ds:research-design-system`, inventario de componentes faltantes, web-page en playground, theme modern-minimal)
- **HUs de playground** (EP-006/EP-005): interaction tests [playground-05], docs de tokens en Storybook [playground-07]
- **Backlog**: item 1.3 → resuelto o movido a Next según A7; entradas nuevas con disparador "parte X de este plan aprobada"; triaje completo de TASK.md según A5.

**Salida esperada**: cero trabajo real viviendo solo en TASK.md; cada parte de este plan con su HU/ítem trazable.

---

## Parte C — Sincronización documental

**Modelo: Opus 5 · Effort: low** (mecánico, checklist cerrada) · Vía: commit directo · Independiente (solo docs-arquitectura-10 espera a A20). Combinable con M en una sesión.

Checklist (detalle y evidencia en hallazgos.md):

- `CLAUDE.md`: quitar `pnpm -r publish` (nota: publish solo vía release.yml + veto) [docs-arquitectura-01]; `/ng:component` → `/ng:create` [claude-ecosystem-01]; residuos de fases bootstrap y Compodoc [docs-arquitectura-11]; agregar `docs/design/`, `docs/reviews/` y `scripts/` al árbol y a la tabla de fuentes de verdad [docs-arquitectura-13]
- `docs/architecture/README.md`: playground con router/showcase [docs-arquitectura-02]; completar catálogo de ADRs 009..020 o linkear a decisions-log [docs-arquitectura-03]; árbol con product/backlog/design/scripts/.github [docs-arquitectura-12]
- `docs/architecture/PLAYBOOK.md`: naming `Ds<Name>`/`<name>.ts` (ADR-007/010) [docs-arquitectura-04]; Fase 5 con el CI real [docs-arquitectura-07]
- `README.md` root: URL de clone correcta [docs-arquitectura-05]; quitar "(a crear en Fase N)" + completar scripts [docs-arquitectura-06]; **agregar matriz de soporte (Angular/Node/browsers) y target a11y WCAG AA** (gap propio, ver § Gaps)
- `ADR-007`: nota de supersede parcial por ADR-010 [docs-arquitectura-08]
- `CONTRIBUTING.md`: consolidar secciones duplicadas de changesets + nota lockstep ADR-015 [docs-arquitectura-14]
- `packages/components/README.md`: tabla con los 22 componentes + entry point `/router` + `@angular/forms` en instalación [release-npm-02]
- OpenSpec: borrar huérfano `changes/components-decide-icon-library/` [openspec-02, docs-arquitectura-09, backlog-06]; Purpose sin `rmd-` [openspec-03]; anotar pausa de aaa-012 [openspec-04]; `related-decisions` al template [openspec-05]; decidir rol de `.openspec.yaml` [openspec-06]; comandos `pnpm openspec` alineados con la realidad [parte doc de openspec-01]
- Producto: README de producto al día (Foto táctica, Última entrega, índice) [producto-hus-01]; **ampliar el checklist de archive** para cubrir README de producto y doc de épica [producto-hus-02]; EP-002 a 6/7 + Valor entregado completo [producto-hus-03]; backfill `adrs:` en HU-001..016 [producto-hus-08]; EP-001/HU-018 cierre parcial [producto-hus-09]; plantilla HU caso-de-error matizado [producto-hus-11]
- Backlog: fila Slider duplicada [producto-hus-10, backlog-05/06]; nota del veto sin lista nominal [backlog-08]; redacción del disparador de theme-switcher [backlog-09]

---

## Parte D — Release-readiness: APF + packaging

**Modelo: Opus 5 · Effort: high** · Vía: OpenSpec change (sugerido: `components-fix-apf-packaging`; modifica `components-package` y toca ambos packages) · Independiente. Sesión dedicada completa.

1. **`compilationMode: "partial"`** en `tsconfig.lib.json` + rebuild + verificación de `ɵɵngDeclareComponent` en el FESM [release-npm-01] — _confirmado inline: hoy 35 `ɵɵdefineComponent`, 0 declare, y el `prepublishOnly` de error de ng-packagr presente en dist_
2. **Gate CI anti full-mode**: step que falle si el FESM trae `ɵɵdefineComponent` o dist/package.json trae el prepublishOnly de error [release-npm-01]
3. **Estrategia de publish**: `publishConfig.directory: "dist"` vs publish-from-root con guards propios — decidir en design.md del change [release-npm-07]
4. `"./package.json"` en exports de ambos packages [release-npm-03]
5. LICENSE + CHANGELOG.md en los tarballs de ambos packages [release-npm-04, tokens-12, tooling-repo-03]
6. **Gate `npm pack --dry-run`** prometido por ADR-017 [release-npm-06]
7. `engines` realista en packages publicables (sin pnpm; Node con techo o sin bloque) [release-npm-10, tooling-repo-14]
8. `@changesets/changelog-github` [release-npm-09]
9. Provenance preparado si A3 aprueba [release-npm-05]
10. Si el PO lo pide: evaluar 0.2.1 correctivo (requiere levantar veto — decisión aparte)

---

## Parte E — CI: correctness + hardening

**Modelo: Opus 5 · Effort: high** · Vía: OpenSpec change (modifica spec `ci-cd-pipeline`) · Depende de: A2 para el gate de publish. Sesión dedicada (el rewrite del enforcement es delicado).

1. **Reescribir el changeset enforcement** basado en archivos (`git diff --name-only`) + excepción para el PR `changeset-release/main` [ci-cd-01] — el ítem más delicado
2. Environment `npm-publish` con required reviewer (si A2) [ci-cd-02]
3. `permissions: contents: read` + `timeout-minutes` [ci-cd-03]
4. Pinning de las 4 actions por SHA [ci-cd-04]
5. `openspec` como devDependency pinneada + `pnpm exec` en CI [ci-cd-05, openspec-01]
6. commitlint en CI (`--from origin/main`) [ci-cd-06]
7. `.github/dependabot.yml` (npm + github-actions, con groups) [ci-cd-07, tooling-repo-02]
8. Alinear spec/CONTRIBUTING con el publish real (`changeset publish`) [ci-cd-12]
9. actionlint como step [ci-cd-13]
10. Renombrar script `version` → `changeset:version` (colisión con builtin pnpm) [tooling-repo-12]

---

## Parte F — Gates de calidad automáticos

**Modelo: Opus 5 · Effort: high** · Vía: OpenSpec change(s) — puede partirse en F1 (tokens+coverage) y F2 (a11y+playground), una sesión cada una · Depende de: A12/A13 para los ítems de Cantera.

1. Coverage v8 + thresholds + reporters en los tres vitest.config + step CI [testing-02, ci-cd-08]
2. **Portar el gate de contraste AA a `packages/tokens/test/contrast.spec.ts`** (pares versionados; el skill sigue consumiendo la misma lógica) [testing-01, tokens-04]
3. Spec estructural de jerarquía de tokens (primitives↛semantic, component↛theme, theme solo overridea semantic, sin ciclos) [tokens-03]
4. `build.spec.ts` de tokens: prefijo `--ds-` universal, cero referencias sin resolver, paridad de claves entre themes [testing-09]
5. Scenarios sin test: select (size/tokens/public-api), modal (tokens/public-api), button CA-017.7 [testing-05]
6. `"test": "vitest run"` + `test:watch` unificados [testing-06]
7. Test-setup zoneless en playground (y evaluar components) [testing-07, playground-04]
8. `it.each` sobre las 23 rutas del showcase [testing-08]
9. vitest-axe fase 1 en specs jsdom (si A13) [testing-03]
10. Script `typecheck` por package (specs + stories) + step CI [tooling-repo-06]
11. `build-storybook` (o tsc del tsconfig de .storybook) como smoke en CI [playground-02]

---

## Parte G — Fixes de componentes

**Modelo: Opus 5 · Effort: medium por change** · Vía: OpenSpec change por componente (convención del repo), cada uno con delta a su spec `component-<name>` · Depende de: B (HUs registradas). Corte de sesión cada 2–3 changes.

Orden sugerido por severidad:

| Change                  | Ítems                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `components-fix-menu`   | Hover-timer sin cancelación en mouseleave/close (bug real) [components-02]; named exports en index [components-14]                   |
| `components-fix-select` | `onTouched` en blur [components-03]; typeahead APG [components-07]; gap 4px tokenizado [components-13]                               |
| `components-fix-toast`  | Live region eager (primer toast no se anuncia) [components-04]                                                                       |
| `components-fix-modal`  | Alias `aria-label`/`aria-labelledby` (dialog sin nombre accesible) [components-08]; border tokenizado [components-12]                |
| `components-fix-button` | **Fix del PO: texto no centrado** (fix-button.md); `type` input para submit/reset [components-06]; border tokenizado [components-12] |
| `components-fix-avatar` | `moreLabel` overridable (i18n) [components-09]                                                                                       |

---

## Parte H — Tokens: fixes y consistencia

**Modelo: Opus 5 · Effort: medium** · Vía: OpenSpec change (modifica `design-tokens-package`) · Depende de: A18/A19 para dos ítems.

1. **Focus ring en brands** (bug visual): override de `semantic.shadow.focus` en brand-a/b + recomposición del composite desde `semantic.color.focus-ring` [tokens-01]
2. Tipografía de component vía semantic (alert/tooltip/input) [tokens-08]
3. `semantic/motion` compuesto por referencias, no strings duplicados [tokens-09]
4. Delta de spec: autorizar referencias intra-nivel no circulares (space.negative ya publicado) [tokens-10]
5. `bg.inverse`/`text.on-inverse` + repunte de tooltip [tokens-11]
6. Separar `sd.config.mjs` (definición) de `build.mjs` (ejecución) [tokens-13]
7. Sombras dark si A18 decide [tokens-07]

---

## Parte K — Playground como herramienta de QA visual

**Modelo: Opus 5 · Effort: medium** · Vía: OpenSpec change (`playground-theme-switcher` ampliado, ya en Next) + commits directos · Depende de: A15 para deploy.

1. **Theme switcher** en playground + carga de themes y globalTypes/decorator en Storybook [playground-01]
2. Delta de spec playground-app (tokens vía styles del target, conteo parametrizado, stories para todo componente público) [playground-03]
3. Compodoc para prop tables de autodocs [playground-06]
4. Asset local para la story de Avatar (sin pravatar.cc) [playground-09]
5. Split de styles.css (entry tokens-only para Storybook; utilidades por-demo a su vista) [playground-10]
6. Presets de viewport [playground-11]
7. Eliminar target `test` divergente de angular.json [playground-12]
8. Signal en MenuShowcase + barrida del patrón [playground-13]

---

## Parte M — Ecosistema `.claude/`

**Modelo: Opus 5 · Effort: low** (medium si A12 activa la skill nueva) · Vía: commit directo · Depende de: A10/A12 para dos ítems. Combinable con C en una sesión.

1. `deny` para `npm/pnpm/changeset publish` en settings.json (materializa el veto) [claude-ecosystem-04]
2. `deny` para `git add -A/.` (contradice reglas de las skills) [claude-ecosystem-05]
3. ng-stack-profile: 6 archivos por componente + ADR-020/DsFieldBase [claude-ecosystem-02]
4. Skill `/ds:audit-tokens` (si A12): huérfanos, hardcodes, bypass de jerarquía [claude-ecosystem-06]
5. Blueprint ng-components versionado (create.md, nota §9, lock) [claude-ecosystem-07]
6. Depurar allowlist (one-shots muertos, path inexistente) [claude-ecosystem-08]
7. Default de ng-review fuera del package publicable [claude-ecosystem-09]
8. Fallback de knowledge de ng-router alineado al grupo [claude-ecosystem-10]
9. check-a11y scopes dinámicos [claude-ecosystem-11]; research-design-system → scratchpad [claude-ecosystem-12]
10. Gate visual pre-archive en límites de backlog-auto (si A10) [claude-ecosystem-03]

---

## Parte I — Compatibilidad SSR

**Modelo: Fable 5 · Effort: ultra** (en Fable: `high` alcanza) · Vía: OpenSpec change transversal + **ADR nuevo** (patrón SSR del kit) · Independiente (conviene después de G para no pisarse). Sesión dedicada completa — decisión one-way door con razonamiento como cuello de botella.

- Inyección de `DOCUMENT`, guardas `isPlatformBrowser`/`afterNextRender` en las rutas no event-driven (effect del modal, `ensureContainer` del toast, tooltip/select/menu) [components-01] — _confirmado inline: 0 guardas hoy; `document.body` directo en modal/toast/tooltip_
- Declarar soporte SSR en las specs de los componentes afectados
- Definir la estrategia de verificación (unit con platform server o smoke SSR en playground)

## Parte J — Refactors internos compartidos

**Modelo: Opus 5 · Effort: high** · Vía: OpenSpec change · Depende de: G (para no refactorizar código que G está tocando).

- `DsOverlayScaffold` interno (el umbral del "tercer caso" de ADR-016 ya se alcanzó) [components-05]
- Helper de typeahead compartido select/menu [components-07]
- `createDsId(prefix)` con APP_ID (colisión multi-app) [components-10]
- `readCssNumber/readCssDuration` única con tests [components-11]

## Parte L — Storybook avanzado y docs públicas

**Modelo: Opus 5 · Effort: high** · Vía: OpenSpec changes sobre las HUs creadas en B · Depende de: A13/A15, B, F. Una sesión por change.

- Interaction tests (play functions) para overlays + CI [playground-05]
- Páginas de foundations/tokens en Storybook generadas desde el output de Style Dictionary [playground-07]
- Storybook deploy (GH Pages) + evaluación de visual regression [playground-08, ci-cd-09]
- Vitest Browser Mode para comportamiento de plataforma (focus trap, top layer) [testing-04]

## Parte N — Estratégico pre-1.0

**Modelo: Fable 5 para los ADRs (DTCG, taxonomía — one-way doors pre-1.0); Opus 5 en `xhigh` para la ejecución (angular-eslint + fixes, strictness, pnpm 10) · Effort: ultra** (cada ítem es su propio change; no mezclar; una sesión por change) · Vía: OpenSpec + ADRs · Depende de: A16/A17.

1. **angular-eslint** (template + a11y rules) + corrección de hallazgos en los 23 componentes [tooling-repo-01]
2. Strictness TS: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, quitar `emitDecoratorMetadata` [tooling-repo-05]
3. pnpm 10 + catalogs + `onlyBuiltDependencies` [tooling-repo-08]; `auto-install-peers=false` [tooling-repo-11]
4. Migración DTCG de la fuente de tokens (si A16) — coordinar con aaa-012 [tokens-05]
5. Taxonomía de naming CSS (si A17) [tokens-06]
6. Limpiezas menores: prettierignore de tokens [tooling-repo-09], playwright sin uso [tooling-repo-10], gobernanza pública SECURITY/CODEOWNERS/templates [tooling-repo-04] _(este último puede adelantarse a C/E si se prefiere)_

---

## Gaps adicionales (análisis propio; el crítico de completitud del workflow no llegó a correr)

| Gap                                                                                    | Disposición                                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Matriz de soporte documentada (versiones Angular/Node/browsers) en READMEs de packages | Sumado a Parte C/D                                                                    |
| Declaración pública de conformidad a11y (target WCAG AA)                               | Sumado a Parte C (README)                                                             |
| Política de deprecación y camino a 1.0 (D-004 sigue pendiente)                         | Decisión del PO — puede sumarse al bloque A-1 o diferirse al primer release post-veto |
| Atribución de licencias de terceros (Lucide, ISC) en artefactos publicados             | Verificar en Parte D (gate de pack)                                                   |
| `ng add`/schematics para DX de instalación                                             | Cantera                                                                               |
| RTL / propiedades lógicas CSS                                                          | Cantera (auditoría dedicada cuando haya demanda)                                      |

## Estado de verificación de los hallazgos

- **71 verificados**: 53 por verificador adversarial (testing, ci-cd, openspec, producto-hus, playground) + 18 alta confirmados inline en sesión (release-npm, tokens, components, docs-arquitectura, backlog, claude-ecosystem, tooling-repo).
- **69 media/baja sin pasada adversarial** (por los cortes de sesión durante la review): se revalidan al ejecutar su parte (regla §Cómo usar). Opcional: pedir una pasada de verificación adversarial de esas 6 dimensiones antes de ejecutar (workflow reanudable, bajo costo).
- **0 refutados** en todas las pasadas completadas.

## Sugerencia de agenda

Cada fila = **una sesión nueva** (con `/ds:handoff` + `/clear` + `/ds:resume` entre filas). Dentro de una fila no se cambia ni de modelo ni de effort.

| Sesión | Partes                                                                    | Modelo      | Effort real |
| ------ | ------------------------------------------------------------------------- | ----------- | ----------- |
| 1      | A + B                                                                     | Opus 5      | medium      |
| 2      | C + M                                                                     | Opus 5      | low         |
| 3      | D                                                                         | Opus 5      | high        |
| 4      | E                                                                         | Opus 5      | high        |
| 5      | F1 (tokens + coverage)                                                    | Opus 5      | high        |
| 6      | F2 (a11y + typecheck + storybook CI)                                      | Opus 5      | high        |
| 7–9    | G (2–3 changes por sesión) + H                                            | Opus 5      | medium      |
| 10     | K                                                                         | Opus 5      | medium      |
| 11     | I                                                                         | **Fable 5** | high        |
| 12     | J                                                                         | Opus 5      | high        |
| 13     | L (un change por sesión si crece)                                         | Opus 5      | high        |
| 14     | N — ADRs de DTCG y taxonomía                                              | **Fable 5** | high        |
| 15+    | N — ejecución (angular-eslint, strictness, pnpm 10; un change por sesión) | Opus 5      | xhigh       |
