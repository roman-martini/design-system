# Tasks — aaa-012 — Export DTCG de tokens para Figma (Tokens Studio)

Cada tarea es ≤2 h y tiene criterio de aceptación binario.

## 1. Spike: mecanismo de transformación a DTCG

- [ ] 1.1 Probar emitir un subconjunto (primitives/color + semantic/color) a DTCG con **Style Dictionary 4 puro** (custom format) y con **`@tokens-studio/sd-transforms`**. Comparar esfuerzo y fidelidad de `$type` en tipos compuestos (`motion` cubic-bezier, `shadow`, `effect.blur`).
- [ ] 1.2 Decidir mecanismo y dejarlo registrado (1 línea en `design.md` § Open Questions o como nota en el PR).

**Criterio**: decisión tomada y justificada; un PoC mínimo emite color primitive + semantic a DTCG con el alias preservado (`"$value": "{color.blue.500}"`).

## 2. Target DTCG en `sd.config.mjs`

- [ ] 2.1 Agregar una platform/target DTCG al build que emita **base** (primitives + semantic + component) con `$value`/`$type` y `outputReferences` (aliases preservados, no resueltos).
- [ ] 2.2 Emitir **un archivo por nivel** según el layout de `design.md` §3: `primitives.json`, `semantic.json`, `component.json`.
- [ ] 2.3 Emitir **un archivo por tema**: `themes/dark.json`, `themes/brand-a.json`, `themes/brand-b.json` (sólo overrides, espejando los builds por tema existentes).
- [ ] 2.4 Escribir a la carpeta **versionada** `packages/tokens/figma/` (design.md §4), no a `dist/`.

**Criterio**: `pnpm -F @romanmartinidev/tokens build` genera los archivos DTCG en `packages/tokens/figma/` con aliases `{…}` preservados; exit 0.

## 3. Validación del artefacto (Vitest)

- [ ] 3.1 Crear `packages/tokens/test/figma-dtcg.spec.ts`:
  - JSON de cada archivo es válido y parseable.
  - Los tokens hoja tienen `$value`; los que aplican, `$type`.
  - **Aliases preservados**: al menos un token de `semantic.json` referencia un primitive vía `{…}`.
  - **Paridad**: la cantidad de tokens hoja del set base DTCG coincide con la cantidad de custom properties de `dist/tokens.css` (descontando los específicos de tema).
- [ ] 3.2 `pnpm -F @romanmartinidev/tokens test` pasa.

**Criterio**: specs nuevos pasan; `pnpm -r test` no rompe.

## 4. Guard de sincronización en CI

- [ ] 4.1 Agregar un check que regenere el DTCG y falle si difiere de lo commiteado en `packages/tokens/figma/` (script `pnpm -F @romanmartinidev/tokens build` + `git diff --exit-code packages/tokens/figma/`).
- [ ] 4.2 Engancharlo en el workflow de PR validation existente (ver `ci-cd-pipeline`).

**Criterio**: con `figma/` desincronizado, el check falla; sincronizado, pasa.

## 5. Documentación

- [ ] 5.1 Sumar sección "Integración con Figma" a `packages/tokens/README.md`:
  - Tokens = Variables, **no** componentes (expectativa explícita).
  - Cómo conectar Tokens Studio al repo (Git sync → `packages/tokens/figma/`).
  - Convención de sets/colecciones (Primitives / Semantic / Component) y orden de resolución.
  - Limitación de modos `theme × brand` (design.md §5).

**Criterio**: sección renderiza en GitHub; links válidos; aclara el alcance (Variables, no componentes).

## 6. Package metadata (si aplica)

- [ ] 6.1 Decidir (open question de design) si el DTCG se publica: si sí, agregar entry en `files` y/o sub-path en `exports`. Si no, dejar `figma/` fuera del tarball.
- [ ] 6.2 Si se agregó `@tokens-studio/sd-transforms`, pinnearlo en `devDependencies`.

**Criterio**: `npm pack --dry-run` desde `packages/tokens/` refleja la decisión (incluye o excluye `figma/` deliberadamente).

## 7. Changeset

- [ ] 7.1 Crear `.changeset/tokens-figma-dtcg.md` con bump **minor** de `@romanmartinidev/tokens`:

  ```
  ---
  '@romanmartinidev/tokens': minor
  ---

  feat: add DTCG (W3C) token export for Figma integration via Tokens Studio (code → Figma, one-way), with aliases preserved as Figma Variable references. Additive output; CSS/JS unchanged.
  ```

**Criterio**: archivo changeset existe con bump correcto.

## 8. Validación de cierre

- [ ] 8.1 `pnpm openspec validate --changes` pasa para `tokens-figma-export`.
- [ ] 8.2 `pnpm lint` pasa.
- [ ] 8.3 `pnpm format:check` pasa (formatear si necesario).
- [ ] 8.4 `pnpm -r build` pasa.
- [ ] 8.5 `pnpm -F @romanmartinidev/tokens test` pasa.
- [ ] 8.6 `pnpm -F @romanmartinidev/components test` y `pnpm -F playground test` siguen verdes (no se toca nada de ellos).
- [ ] 8.7 Validación manual una vez en Figma: conectar Tokens Studio al repo, importar, verificar que un cambio de `blue.500` en `src/` se refleja como cambio de la Variable encadenada. (Opcional para el merge; documentar resultado.)
- [ ] 8.8 Proponer mensaje de commit y esperar OK del usuario.

**Criterio**: los puntos automáticos pasan; aprobación explícita antes del commit.

## 9. Archivar el change

- [ ] 9.1 Mover `openspec/changes/tokens-figma-export/` → `openspec/changes/archive/aaa-012-tokens-figma-export/`.
- [ ] 9.2 Sincronizar la spec base `openspec/specs/design-tokens-package/spec.md` con el Requirement ADDED del delta (output DTCG).
- [ ] 9.3 Promover **ADR-009** de `Propuesto` → `Aceptado`; agregar fila en `docs/architecture/decisions-log.md` y en el "Catálogo de Changes" de `docs/architecture/catalog.md`.
- [ ] 9.4 Actualizar frontmatter del proposal: `status: archived` + `archived: 2026-06-NN`.
- [ ] 9.5 Actualizar `openspec/README.md`: nota de aaa-012 archivado (el "próximo disponible" ya quedó en aaa-013 al crear el change).
- [ ] 9.6 `pnpm openspec validate --all` pasa.
- [ ] 9.7 Proponer mensaje del commit del archive y esperar OK del usuario.

**Criterio**: change archivado, requirement sincronizado, ADR-009 aceptado, openspec valida, commit aprobado.
