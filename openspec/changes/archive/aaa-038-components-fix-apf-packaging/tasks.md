# Tasks — aaa-038 — Release-readiness: APF + packaging

Cada tarea es ≤2 h con criterio binario. Diseño: fix de compilación (design §1), modelo de publicación (§2), licencia (§3), gate (§4), metadata (§5).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [x] 1.2 Registrar el estado defectuoso como línea base: contar `ɵɵdefineComponent` en `dist/fesm2022/*.mjs` y confirmar el `prepublishOnly` en `dist/package.json` (evidencia del antes/después).

**Criterio**: suite verde; línea base documentada.

## 2. Fix de Angular Package Format

- [x] 2.1 `compilationMode: "partial"` en `angularCompilerOptions` de `packages/components/tsconfig.lib.json`.
- [x] 2.2 Rebuild limpio (`dist/` borrado + `pnpm -F @romanmartinidev/components build`) y verificación en el artefacto: 0 `ɵɵdefineComponent`, >0 `ɵɵngDeclareComponent` en **ambos** FESM (principal y `/router`), y `dist/package.json` sin `scripts.prepublishOnly`.
- [x] 2.3 Verificar que el consumo local sigue sano: `pnpm -r test` y build del playground verdes contra el dist en partial mode.

**Criterio**: el artefacto emitido cumple APF; nada del monorepo se rompe.

## 3. Modelo de publicación de components

- [x] 3.1 `packages/components/package.json`: `publishConfig` con `directory: "dist"` y `provenance: true`; quitar `main` y `engines`; reescribir `files` con las rutas del contenido de dist; agregar `"./package.json"` al `exports` raíz **en forma de objeto** (design §2).
- [x] 3.2 Verificar que playground y Storybook siguen resolviendo el package tras el cambio de manifest (build de ambos verde) — es el riesgo principal de sacar campos del raíz.
- [x] 3.3 `npm pack --dry-run` sobre `packages/components/dist/`: confirmar que el tarball trae los FESM y `.d.ts` de ambos entry points, el mini-manifest `router/package.json`, y **no** sale con un único archivo (la falla que provocaría un `files` heredado).

**Criterio**: el tarball armado desde dist es correcto y el monorepo resuelve el package igual que antes.

## 4. Licencia y changelog en los tarballs

- [x] 4.1 Copiar `LICENSE` del root a `packages/components/` y `packages/tokens/` (copia trackeada, design §3).
- [x] 4.2 `packages/components/ng-package.json`: sumar `"LICENSE"` y `"CHANGELOG.md"` a `assets`; verificar que aparecen en `dist/` tras el build.
- [x] 4.3 `packages/tokens/package.json`: `files` pasa a `["dist", "README.md", "LICENSE", "CHANGELOG.md"]`.

**Criterio**: ambos tarballs contienen el texto de la licencia y el changelog.

## 5. Packaging de tokens

- [x] 5.1 `packages/tokens/package.json`: agregar `"./package.json"` al `exports`; quitar `engines`; `publishConfig.provenance: true`.
- [x] 5.2 Script `prepublishOnly` que aborte si `dist/` falta o no contiene los artefactos declarados en `exports` (design §2, guard propio del publish-from-root). Verificar que falla con `dist/` borrado y pasa con el build hecho.

**Criterio**: tokens no puede publicarse sin build; su manifest es resoluble.

## 6. Gate de packaging

- [x] 6.1 `scripts/verify-packaging.mjs` con las cinco verificaciones de design §4 (compilation mode, manifest sin envenenar, contenido del tarball, exports resolubles, LICENSE sin drift). Salida legible: un fallo por línea, exit 1.
- [x] 6.2 Script `verify:packaging` en el `package.json` root; correrlo en verde sobre el estado actual.
- [x] 6.3 Probar que el gate **detecta** la regresión: revertir temporalmente `compilationMode`, rebuild, confirmar exit 1 con el mensaje correcto, restaurar. Un gate no probado contra el fallo no es un gate.
- [x] 6.4 Step `Verify packaging` en `pr.yml`, posterior a `Build (recursive)`.

**Criterio**: el gate pasa en verde y falla ante la regresión real que motivó el change.

## 7. Changelog y procedencia

- [x] 7.1 `@changesets/changelog-github` como devDependency del root + `"changelog": ["@changesets/changelog-github", { "repo": "roman-martini/design-system" }]` en `.changeset/config.json`.
- [x] 7.2 `id-token: write` en los permisos de `.github/workflows/release.yml` (D-018c). No cambia el trigger ni dispara ningún publish.

**Criterio**: config de changelog válida; provenance preparada y latente.

## 8. Validación de cierre

- [x] 8.1 `pnpm -r build`, `pnpm -r test`, `pnpm lint`, `pnpm format:check` y `pnpm verify:packaging` verdes.
- [x] 8.2 `npx --yes openspec validate --changes` verde.
- [x] 8.3 Changesets: **patch** de components y de tokens (lockstep ADR-015), en español (D-018a).
- [x] 8.4 Registrar la decisión de publicación en **ADR-021** y anotar en ADR-017 que su mitigación se materializó acá.
- [x] 8.5 Proponer mensaje de commit y **esperar el OK del PO** antes de commitear. — OK del PO el 2026-07-28, commit `9864412`.

**Criterio**: repo verde, gobernanza registrada, commit a la espera de aprobación.
