# Tasks — aaa-020 — Versionado lockstep + preparación del primer release

Cada tarea con criterio binario. Decisiones en ADR-015; el change deja el repo listo — la publicación es del pipeline (aaa-005) con pasos del PO.

## 1. Lockstep en el repo

- [x] 1.1 `.changeset/config.json`: `"fixed": [[tokens, components]]` **+ flag experimental `onlyUpdatePeerDependentsWhenOutOfRange: true`** (sin el flag, todo bump del peer fuerza major al dependent).
- [x] 1.2 `packages/components/package.json`: peer `@romanmartinidev/tokens` → **rango plano `>=0.1.0 <1.0.0`**. Nota de la matriz de dry-runs: `workspace:^` y `workspace:*` descartados (el chequeo de peers de Changesets no parsea el protocol; el caret 0.x deja los minors legítimamente fuera de rango).
- [x] 1.3 **Dry-run verificado** (matriz A–D + combinación final en ramas descartables): la combinación produce **tokens 0.2.0 y components 0.2.0** con el rango del peer intacto; las alternativas producen 1.0.0.
- [x] 1.4 ADR-015 aceptado (con la evidencia de la matriz) + fila en `decisions-log.md`; D-010 registrada en `docs/product/decisiones.md` (aprobación del release + política lockstep).

**Criterio**: dry-run verificado en 0.2.0/0.2.0; decisión formalizada.

## 2. Validación y registros

- [x] 2.1 `pnpm openspec validate repo-release-lockstep --strict`, `pnpm lint`, `pnpm format:check`, `pnpm -r build`, `pnpm -r test` pasan (el cambio no toca runtime — la suite confirma).
- [x] 2.2 Registros: `openspec/README.md` (ID `aaa-020` consumido; Toast pasa a `aaa-021`), BACKLOG (item release → Now/en ejecución con este change), HU-002 activada (D-010).
- [ ] 2.3 Proponer mensaje de commit y esperar OK del usuario. **Sin changeset propio**: este change no altera el contenido publicable (config de tooling + metadata de peer que el publish reescribe).

**Criterio**: automáticos verdes; commit aprobado.

## 3. Ejecución del release (pipeline aaa-005 — pasos del PO + asistidos)

- [ ] 3.1 **PO**: crear el repo GitHub `romanmartinidev/design-system` (público — coincide con los campos `repository` de los package.json).
- [ ] 3.2 **PO**: crear un token npm (Automation) con permiso de publish sobre el scope `@romanmartinidev` y cargarlo como secret **`NPM_TOKEN`** del repo.
- [ ] 3.3 Configurar remote y push de `main` (asistido, con OK del PO): `git remote add origin <url>` + `git push -u origin main`. El workflow `release.yml` corre y **abre el PR "chore(repo): version packages"** (tokens+components → 0.2.0).
- [ ] 3.4 **PO**: revisar y mergear el PR de versionado → el workflow publica ambos packages en npm (`access: public`).
- [ ] 3.5 Verificación post-publicación (CA-002.2): `npm view @romanmartinidev/components@0.2.0 peerDependencies` muestra `@romanmartinidev/tokens: ^0.2.0` (rango, no pin ni workspace).
- [ ] 3.6 Verificación de consumo (CA-002.3): proyecto Angular limpio fuera del monorepo + quickstart de los READMEs → `ds-button` con tokens renderiza sin pasos no documentados. Registrar cualquier gap del quickstart como fix directo.
- [ ] 3.7 Cierre: HU-002 → Hecha con CAs tildados; archive de este change (`archive/aaa-020-repo-release-lockstep/`), sincronizar spec base, registros y grooming; proponer commit del archive y esperar OK.

**Criterio**: packages en npm en 0.2.0, rango `^0.2.0` verificado, consumo real validado, repo consistente (CA-002.4).
