# Tasks — Bootstrap Fase 2 — Migrar y publicar @romanmartinidev/tokens

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Marcar `[x]` al cerrar.

## 1. Metadata del package

- [x] 1.1 Renombrar `name`: `@ds/tokens` → `@romanmartinidev/tokens` en `packages/tokens/package.json`
- [x] 1.2 Agregar `description`: "Design tokens del sistema de diseño romanmartinidev (CSS variables + JS via Style Dictionary)"
- [x] 1.3 Agregar `author`: "Roman Martini <roman.martini.dev@gmail.com>"
- [x] 1.4 Agregar `license`: "MIT"
- [x] 1.5 Agregar `keywords`: `["design-tokens","design-system","style-dictionary","css-variables","theming","romanmartinidev"]`
- [x] 1.6 Agregar `repository`: `{ "type": "git", "url": "https://github.com/romanmartinidev/agent-design-sistem.git", "directory": "packages/tokens" }`
- [x] 1.7 Agregar `homepage`: "https://github.com/romanmartinidev/agent-design-sistem/tree/main/packages/tokens#readme"
- [x] 1.8 Agregar `bugs`: `{ "url": "https://github.com/romanmartinidev/agent-design-sistem/issues" }`
- [x] 1.9 Agregar `engines`: `{ "node": ">=22.12.0", "pnpm": ">=9.0.0" }`
- [x] 1.10 Agregar `publishConfig`: `{ "access": "public" }`

**Criterio**: `cat packages/tokens/package.json | node -e "const p=JSON.parse(require('fs').readFileSync(0)); ['name','description','author','license','keywords','repository.directory','engines.node','publishConfig.access'].every(k => k.split('.').reduce((o,x)=>o?.[x],p))"` retorna `true`. El name es exactamente `@romanmartinidev/tokens`.

## 2. Surface de exports + tree-shaking

- [x] 2.1 Reemplazar `exports` por estructura granular: `"."` (JS+types), `"./css"`, `"./themes/dark"`, `"./themes/brand-a"`, `"./themes/brand-b"`
- [x] 2.2 Agregar `sideEffects`: `["./dist/*.css", "./dist/themes/*.css"]`
- [x] 2.3 Agregar `files`: `["dist", "README.md"]`
- [x] 2.4 Verificar `type: "module"` ya presente (sí, está)

**Criterio**:

- `node --input-type=module -e "import('@romanmartinidev/tokens/css').then(()=>console.log('ok'))"` desde root resuelve OK (después del build).
- `node --input-type=module -e "import('@romanmartinidev/tokens/internal').catch(e=>console.log('blocked'))"` reporta `blocked`.

## 3. Auditoría — fixes severidad alta

### 3a. Fix jerarquía `border` en light theme

- [x] 3.1 En `packages/tokens/src/semantic/color.json`, cambiar `border.subtle` de `{color.neutral.100}` a `{color.neutral.100}` (queda igual), `border.default` de `{color.neutral.100}` a `{color.neutral.300}`, mantener `border.strong: {color.neutral.400}`
- [x] 3.2 Verificar que `theme/dark.json` mantiene jerarquía coherente (`subtle: 800 < default: 700 < strong: 500` — sí, OK como está)

**Criterio**: en `packages/tokens/dist/tokens.css` (post-build), los valores resueltos de `--ds-semantic-color-border-{subtle,default,strong}` son tres colores **distintos** y monótonamente crecientes en contraste contra `--ds-semantic-color-bg-surface`.

### 3b. Agregar `shadow.focus`

- [x] 3.3 En `packages/tokens/src/primitives/shadow.json`, agregar `focus: { "value": "0 0 0 3px {color.blue.500}" }` (ring de 3px usando blue.500 como halo accesible)
- [x] 3.4 En `packages/tokens/src/theme/dark.json`, agregar override de `semantic.shadow.focus` para dark (`0 0 0 3px {color.blue.400}` — más claro para contraste con bg oscuro)
- [x] 3.5 Verificar que el token referencia primitives correctamente (no hace forward reference a semantic) — `semantic.shadow.focus → {shadow.focus}` (primitive), OK

**Criterio**: `dist/tokens.css` post-build contiene `--ds-shadow-focus` con un valor de box-shadow no vacío y resolvable (sin `{...}` literal).

## 4. README del package

- [x] 4.1 Crear `packages/tokens/README.md` con secciones:
  - Título + tagline corta
  - Instalación (`pnpm add @romanmartinidev/tokens`)
  - Uso básico CSS (import + `--ds-*` variables)
  - Uso básico JS (import + types)
  - Themes disponibles (cómo importar y activar via `data-theme`/`data-brand`)
  - Lista de exports
  - Política de versionado pre-1.0 (link a CONTRIBUTING)
  - Link a ADR-003

**Criterio**: el README cubre las 8 secciones, incluye al menos 2 snippets de código (CSS + JS), y linkea a `docs/architecture/adr/ADR-003-arquitectura-design-tokens.md`.

## 5. ADR-003 — Arquitectura de design tokens

- [x] 5.1 Crear `docs/architecture/adr/ADR-003-arquitectura-design-tokens.md` (formato MADR) que cubre:
  - **Contexto**: jerarquía primitives → semantic → component → theme; theming por CSS variables + data attributes; build con Style Dictionary 4
  - **Opciones evaluadas** (≥2 con pros/contras): mínimo Style Dictionary 4 vs Terrazzo (W3C draft) vs script custom
  - **Decisión**: Style Dictionary 4 + jerarquía declarada + prefix `--ds-*` + theming por `[data-theme]`/`[data-brand]`
  - **Consecuencias positivas**: tree-shaking de themes, combinaciones theme+brand sin código, build estándar de industria
  - **Consecuencias negativas / trade-offs**: lock-in moderado en Style Dictionary, prefix queda BREAKING si se cambia, agregar theme requiere actualizar `exports` y `sd.config.mjs`
- [x] 5.2 Actualizar `docs/architecture/decisions-log.md` agregando fila para ADR-003

**Criterio**: ADR sigue formato MADR documentado en `docs/architecture/adr/README.md`; `decisions-log.md` tiene la nueva fila con link funcional.

## 6. Build y verificación

- [x] 6.1 Correr `pnpm install` desde root (re-link workspace name)
- [x] 6.2 Correr `pnpm -F @romanmartinidev/tokens build` — exit 0 (warnings de SD sobre filter-out de tokens en themes son esperados)
- [x] 6.3 Verificar `dist/tokens.css` (29.4 KB), `dist/tokens.js` (26 KB), `dist/tokens.d.ts` (23.2 KB) — no vacíos
- [x] 6.4 Verificar `dist/themes/{dark,brand-a,brand-b}.css` — existen
- [x] 6.5 Verificar `dist/tokens.css`: `--ds-shadow-focus: 0 0 0 3px var(--ds-color-blue-500)` ✓; `--ds-semantic-color-border-{subtle:100, default:300, strong:400}` ✓; `dist/themes/dark.css`: `--ds-semantic-shadow-focus: 0 0 0 3px var(--ds-color-blue-400)` ✓
- [x] 6.6 `npm pack --dry-run` desde el dir del package: tarball contiene 8 archivos (README + dist + package.json), sin src/ sd.config.mjs ni JSONs (12.6 KB)

**Criterio**: todos los puntos 6.1-6.6 pasan; el tarball del dry-run no contiene `src/`, `sd.config.mjs`, ni JSONs de tokens.

## 7. Validación de cierre

- [x] 7.1 `openspec validate --changes` pasa
- [x] 7.2 `pnpm lint` pasa
- [x] 7.3 `pnpm format:check` pasa (auto-formateados 6 archivos del bootstrap)
- [x] 7.4 Marcar Fase 2 ✅ en `docs/bootstrap-plan.md`
- [x] 7.5 Proponer mensaje de commit y esperar OK de Roman → aprobado y commiteado en `af8bcc6`

**Criterio**: los 5 puntos pasan; Roman aprueba el mensaje del commit antes de ejecutarlo.

## 8. Archivar este change

> Estas tareas se ejecutan vía `/opsx:archive bootstrap-fase-2-tokens` (no manualmente).

- [x] 8.1 Verificar que `openspec/changes/bootstrap-fase-2-tokens/` queda en `openspec/changes/archive/2026-05-31-bootstrap-fase-2-tokens/`
- [x] 8.2 Verificar que los deltas `ADDED Requirements` de `design-tokens-package` quedan promovidos a `openspec/specs/design-tokens-package/spec.md` (con header `## Purpose` agregado) — `openspec validate --all` pasa para los 2 specs
- [x] 8.3 Proponer mensaje de commit del archive y esperar OK de Roman → aprobado y commiteado en `ed1c68c`

**Criterio**: change en archive, spec base creada y validada (`openspec validate --all` pasa).
