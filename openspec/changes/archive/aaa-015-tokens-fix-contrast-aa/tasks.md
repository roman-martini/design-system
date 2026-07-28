# Tasks — aaa-015 — Fix de contraste AA en tokens semantic

Cada tarea es ≤2 h con criterio binario. Valores objetivo y ratios pre-verificados: design.md y auditoría 2026-07-11 (`docs/design/a11y/2026-07-11-audit.md`).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [x] 1.2 Baseline de contraste: correr `check-a11y/scripts/contrast.mjs` con los pares de la auditoría y confirmar las 3 fallas actuales (default 3.68 / brand-a 3.30 / border 2.52).

**Criterio**: baseline reproducida; ningún otro par en falla inesperada.

## 2. Fix en tokens

- [x] 2.1 `packages/tokens/src/semantic/color.json`: `bg.primary` → `{color.blue.600}`, `bg.primary-hover` → `{color.blue.700}`, `bg.primary-active` → `{color.blue.800}`, `border.strong` → `{color.neutral.500}`.
- [x] 2.2 `packages/tokens/src/theme/brand-a.json`: `bg.primary` → `{color.green.700}`, `bg.primary-hover` → `{color.green.800}`, `bg.primary-active` → `{color.green.900}`.
- [x] 2.3 `pnpm -F @romanmartinidev/tokens build` y `pnpm -F @romanmartinidev/tokens test` pasan.

**Criterio**: `dist/tokens.css` y `dist/themes/brand-a.css` emiten las referencias nuevas; tests de tokens verdes.

## 3. Verificación de contraste (scenarios del delta)

- [x] 3.1 Correr el script con los pares del requirement nuevo: `text-inverse`/`bg-primary`, `/bg-primary-hover`, `/bg-primary-active` (≥4.5) y `border-strong`/`bg-surface` (≥3) — **exit 0 en los 4 scopes**.
- [x] 3.2 Re-correr los 19 pares de la auditoría: los 3 altos pasan; ningún par que pasaba cae bajo su umbral (el fail informativo de `modal-border` y el media de `button-secondary-border` quedan como estaban — fuera de alcance).

**Criterio**: cada scenario del delta cumplido con ratio calculado, no estimado.

## 4. Validación de cierre

- [x] 4.1 `pnpm -r build` y `pnpm -r test` pasan (components consume los valores nuevos sin cambio de código).
- [x] 4.2 `pnpm lint` y `pnpm openspec validate tokens-fix-contrast-aa --strict` pasan.
- [x] 4.3 Changeset **patch** de `@romanmartinidev/tokens` describiendo el cambio visual y los ratios.
- [x] 4.4 Proponer mensaje de commit (implementación) y esperar OK del usuario — commit `cd220fa`.

**Criterio**: automáticos verdes; changeset presente; aprobación explícita antes del commit.

## 5. Archive

- [x] 5.1 El reporte de auditoría **no se edita** (snapshot histórico); la resolución queda registrada en este change.
- [x] 5.2 Mover a `archive/aaa-015-tokens-fix-contrast-aa/`; frontmatter `status: archived` + fecha; sincronizar spec base `design-tokens-package` con el delta (scenario MODIFIED + requirement ADDED).
- [x] 5.3 Registros: `openspec/README.md` (próximo ID → `aaa-016`), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (el item sale de Now).
- [x] 5.4 `pnpm openspec validate --all` pasa.
- [ ] 5.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, registros al día.
