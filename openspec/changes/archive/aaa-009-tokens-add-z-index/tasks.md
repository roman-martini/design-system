# Tasks — aaa-009 — Formalize z-index + add overlay motion + effect.blur

Cada tarea es ≤2 h y tiene criterio de aceptación binario.

## 1. Pre-flight: verificar setup de tokens

- [ ] 1.1 Confirmar que `packages/tokens/src/semantic/z-index.json` existe con 13 keys (`hide`, `auto`, `base`, `docked`, `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip`).
- [ ] 1.2 Confirmar que `packages/tokens/src/semantic/motion.json` existe con keys `transition.fast/normal/slow/spring`.
- [ ] 1.3 Confirmar que `packages/tokens/src/semantic/color.json` ya tiene `bg.overlay` (`rgba(0, 0, 0, 0.5)`) — NO se toca.
- [ ] 1.4 Verificar si `packages/tokens/` tiene Vitest config. Si no, planificar agregarlo en sección 4.

**Criterio**: cuatro confirmaciones documentadas; no se modifica nada todavía.

## 2. Sumar tokens semantic de motion para overlays

- [ ] 2.1 Editar `packages/tokens/src/semantic/motion.json` agregando bajo `semantic.motion.transition`:
  - `"overlay-enter": { "value": "250ms cubic-bezier(0, 0, 0.2, 1)" }`
  - `"overlay-exit":  { "value": "150ms cubic-bezier(0.4, 0, 1, 1)" }`
- [ ] 2.2 Ejecutar `pnpm -F @romanmartinidev/tokens build` y verificar que el output CSS contiene `--ds-motion-transition-overlay-enter` y `--ds-motion-transition-overlay-exit`.

**Criterio**: build pasa; los 2 nuevos CSS custom properties aparecen en `dist/tokens.css`.

## 3. Crear `semantic/effect.json`

- [ ] 3.1 Crear `packages/tokens/src/semantic/effect.json` con:
  ```json
  {
    "semantic": {
      "effect": {
        "blur": {
          "overlay": { "value": "8px" }
        }
      }
    }
  }
  ```
- [ ] 3.2 Ejecutar `pnpm -F @romanmartinidev/tokens build`. Verificar que el output CSS contiene `--ds-effect-blur-overlay`.
- [ ] 3.3 Si Style Dictionary no detecta el archivo nuevo automáticamente, revisar `packages/tokens/sd.config.mjs` o equivalente. Sumar el path al glob de inputs si hace falta.

**Criterio**: `dist/tokens.css` contiene `--ds-effect-blur-overlay: 8px;`.

## 4. Tests Vitest en `packages/tokens`

- [ ] 4.1 Verificar si `packages/tokens` ya tiene `vitest.config.ts` y script `test`. Si no:
  - Sumar `vitest.config.ts` mínimo (sin Angular setup — es tokens puro).
  - Sumar `"test": "vitest"` al `package.json`.
  - Sumar `vitest` como devDep (root o package — verificar dónde está la convención).
- [ ] 4.2 Crear `packages/tokens/test/z-index.spec.ts` con:
  - Test: declara los 13 niveles en el orden esperado.
  - Test: `dropdown` → `tooltip` están en orden ascendente estricto (numéricamente).
  - Test: `hide` es `-1`, `base` es `0`, `auto` es string `"auto"`.
  - Test: todos los niveles de overlays (`dropdown` en adelante) son ≥ 1000.
  - Test: la diferencia entre niveles consecutivos de overlay es exactamente 10.
- [ ] 4.3 Crear `packages/tokens/test/overlay-motion.spec.ts` (o agregar al spec de motion existente) con:
  - Test: existen `overlay-enter` y `overlay-exit` en `semantic.motion.transition`.
  - Test: `overlay-enter` tiene formato `<n>ms cubic-bezier(...)`.
  - Test: duración de `overlay-enter` ≥ duración de `overlay-exit`.
- [ ] 4.4 Crear `packages/tokens/test/effect.spec.ts` con:
  - Test: existe `semantic.effect.blur.overlay`.
  - Test: el valor termina en `px`.
- [ ] 4.5 Ejecutar `pnpm -F @romanmartinidev/tokens test`. Todos los specs deben pasar.

**Criterio**: tests pasan; `pnpm -r test` no rompe.

## 5. Actualizar `docs/architecture/README.md`

- [ ] 5.1 Sumar sección "Jerarquía de z-index" después de "Arquitectura de tokens (`@romanmartinidev/tokens`)" pero antes de "Arquitectura de components". Incluir:
  - Tabla de los 13 niveles con valor y caso de uso típico.
  - Convención: NO hardcodear z-index en CSS, siempre `var(--ds-z-index-*)`.
  - Link al spec `design-tokens-package` como contrato testable.
  - Link al archivo fuente `packages/tokens/src/semantic/z-index.json`.

**Criterio**: sección renderiza correctamente en GitHub markdown; tabla con 13 filas; links funcionan.

## 6. Changeset

- [ ] 6.1 Crear `.changeset/z-index-formalize.md` con bump **minor** de `@romanmartinidev/tokens`:

  ```
  ---
  '@romanmartinidev/tokens': minor
  ---

  feat: formalize z-index hierarchy in design-tokens-package spec + add semantic motion tokens for overlays (transition.overlay-enter/exit) + add semantic effect tokens (effect.blur.overlay) preparing the system for Modal/Toast/Tooltip components.
  ```

**Criterio**: archivo changeset existe con bump correcto.

## 7. Validación de cierre

- [ ] 7.1 `pnpm openspec validate --changes` pasa para `tokens-add-z-index`.
- [ ] 7.2 `pnpm lint` pasa.
- [ ] 7.3 `pnpm format:check` pasa (formatear si necesario).
- [ ] 7.4 `pnpm -r build` pasa.
- [ ] 7.5 `pnpm -F @romanmartinidev/tokens test` pasa (todos los specs).
- [ ] 7.6 `pnpm -F @romanmartinidev/components test` sigue passing 45/45 (no se debería romper nada).
- [ ] 7.7 `pnpm -F playground test` sigue passing 4/4.
- [ ] 7.8 `npm pack --dry-run` desde `packages/tokens/` — el tarball SHALL incluir `effect.json` y `motion.json` updated (verificar listado).
- [ ] 7.9 `grep -r "z-index:.*[0-9]" packages/components/src/ apps/playground/src/` devuelve vacío (sin z-index hardcoded — solo via vars).
- [ ] 7.10 Proponer mensaje de commit y esperar OK del usuario.

**Criterio**: los 10 puntos pasan; aprobación explícita antes del commit.

## 8. Archivar el change

- [ ] 8.1 Mover `openspec/changes/tokens-add-z-index/` → `openspec/changes/archive/aaa-009-tokens-add-z-index/`.
- [ ] 8.2 Sincronizar la spec base `openspec/specs/design-tokens-package/spec.md` con los 3 `ADDED Requirements` del delta:
  - Tokens semantic de z-index (6 scenarios).
  - Tokens semantic de motion para overlays (4 scenarios).
  - Tokens semantic de effect (3 scenarios).
- [ ] 8.3 Actualizar frontmatter del proposal archivado: `status: archived` + `archived: 2026-06-NN`.
- [ ] 8.4 Actualizar `openspec/IDS.md`: fila aaa-009 con status `archived` y fecha; próximo disponible `aaa-010`.
- [ ] 8.5 `pnpm openspec validate --all` pasa para los 5 specs base.
- [ ] 8.6 Proponer mensaje del commit del archive y esperar OK del usuario.

**Criterio**: change archivado, requirements sincronizados con `design-tokens-package`, openspec valida, commit aprobado.
