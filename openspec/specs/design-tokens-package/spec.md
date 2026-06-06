---
name: design-tokens-package
type: spec
status: active
created: 2026-05-31
---

# design-tokens-package

## Purpose

Define los requisitos del package `@romanmartinidev/tokens` como artefacto publicable: identidad y metadata de publicación, surface de `exports`, política de tree-shaking, contenido del tarball, jerarquía interna de tokens (primitives → semantic → component → theme), modelo de theming con CSS variables y atributos HTML, contrato del prefix `--ds-*`, y reglas de auditoría que sostienen jerarquías visuales (border) y accesibilidad (focus rings).

## Requirements

### Requirement: Identidad del package publicable

El package SHALL llamarse `@romanmartinidev/tokens`. Su `package.json` SHALL declarar `name`, `version`, `description`, `author`, `license` (MIT), `keywords`, `repository` (con `type`, `url` y `directory` apuntando a `packages/tokens`), `homepage`, `bugs`, `engines` (alineado con el root) y `publishConfig: { "access": "public" }`.

#### Scenario: package.json contiene metadata de publicación completa

- **WHEN** se inspecciona `packages/tokens/package.json`
- **THEN** los campos `name`, `version`, `description`, `author`, `license`, `repository.directory`, `engines.node`, `publishConfig.access` SHALL estar presentes y no vacíos

#### Scenario: pnpm publish dry-run identifica al package correctamente

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens publish --dry-run`
- **THEN** el output SHALL identificar al package como `@romanmartinidev/tokens` con `access: public` y SHALL NO incluir errores de metadata faltante

### Requirement: Surface de exports granular

El `package.json` SHALL declarar el campo `exports` con sub-paths separados para JS, CSS base y cada theme. El sub-path raíz (`"."`) SHALL exponer el JS y los types. El sub-path `"./css"` SHALL exponer el CSS base. Cada theme SHALL exponerse bajo `"./themes/<nombre>"`.

#### Scenario: consumidor importa solo el CSS base

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/css';`
- **THEN** el bundler SHALL resolver a `dist/tokens.css`

#### Scenario: consumidor importa un theme específico

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/themes/dark';`
- **THEN** el bundler SHALL resolver a `dist/themes/dark.css`

#### Scenario: consumidor importa tokens JS

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/tokens';`
- **THEN** el bundler SHALL resolver a `dist/tokens.js` con tipos desde `dist/tokens.d.ts`

#### Scenario: import a sub-path no declarado falla

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/internal';`
- **THEN** el bundler SHALL fallar con error de export no encontrado (Node resolution con `exports` cerrado)

### Requirement: Tree-shaking y sideEffects declarados

El `package.json` SHALL declarar `sideEffects` para que los bundlers traten los CSS como side-effect (no eliminables aunque no se importen explícitamente) y el JS como puro (eliminable si no se usa). El valor SHALL ser `["./dist/*.css", "./dist/themes/*.css"]`.

#### Scenario: bundler elimina JS no usado

- **GIVEN** un consumidor que solo usa `import '@romanmartinidev/tokens/css'`
- **WHEN** se buildea con tree-shaking
- **THEN** el JS de tokens (`dist/tokens.js`) SHALL ser eliminado del bundle final

#### Scenario: bundler preserva CSS importado

- **GIVEN** un consumidor que importa `'@romanmartinidev/tokens/css'` sin referenciar variables explícitamente
- **WHEN** se buildea con tree-shaking
- **THEN** el CSS SHALL permanecer en el bundle final (no eliminado por tree-shaking)

### Requirement: Contenido publicable limitado a dist/

El `package.json` SHALL declarar el campo `files` con al menos `dist/` y `README.md`. El `node_modules/`, sources (`src/`), configs de build (`sd.config.mjs`) y archivos de desarrollo NO SHALL incluirse en el tarball publicado.

#### Scenario: pnpm pack incluye solo lo declarado

- **WHEN** se ejecuta `npm pack --dry-run` desde el directorio del package
- **THEN** el listado de archivos SHALL contener `dist/`, `package.json`, `README.md` y `LICENSE` (si existe)
- **AND** SHALL NO contener `src/`, `sd.config.mjs`, ni archivos `.json` de tokens

### Requirement: Jerarquía interna primitives → semantic → component → theme

Los tokens SHALL organizarse en cuatro niveles jerárquicos en `packages/tokens/src/`:

1. `primitives/` — valores crudos sin semántica de uso (escalas de color, dimensión, opacidad, tipografía, motion, shadow).
2. `semantic/` — tokens con intención de uso que referencian primitives (ej. `text.primary`, `bg.surface`, `border.default`, `space.md`, `radius.lg`).
3. `component/` — tokens específicos de un componente que referencian semantic o primitives.
4. `theme/` — overrides de tokens semánticos para distintos contextos (ej. `dark`, `brand-a`).

Las **reglas de referencia** SHALL ser:

- `semantic` puede referenciar `primitives` (no al revés).
- `component` puede referenciar `semantic` o `primitives` (no `theme`).
- `theme` solo redefine tokens existentes en `semantic` (no introduce tokens nuevos).
- Ningún nivel SHALL referenciar a sí mismo en forma circular.

#### Scenario: token semantic referencia primitive correctamente

- **GIVEN** `semantic/color.json` define `bg.primary` como `{color.blue.500}`
- **WHEN** Style Dictionary buildea
- **THEN** SHALL resolver la referencia y emitir `--ds-semantic-color-bg-primary: var(--ds-color-blue-500)` en CSS

#### Scenario: primitive referenciando semantic es rechazado

- **WHEN** alguien escribe `primitives/color.json` con `neutral.500` apuntando a `{semantic.color.bg.surface}`
- **THEN** el build SHALL fallar o el revisor SHALL rechazarlo (los primitives no dependen de semantics)

#### Scenario: theme no introduce tokens nuevos

- **WHEN** alguien agrega `theme/dark.json` con un token nuevo `semantic.color.brand-special` que no existe en `semantic/`
- **THEN** SHALL ser rechazado por revisión (el theme solo redefine, no crea)

### Requirement: Modelo de theming via CSS variables y atributos HTML

El theming SHALL funcionar por cascada de variables CSS: la spec base define los semantics en `:root`; cada theme override en un selector de atributo (`[data-theme="dark"]`, `[data-brand="a"]`, etc.). El consumo SHALL ser independiente del componente que renderiza: cualquier elemento bajo el atributo recibe los overrides automáticamente.

#### Scenario: activar dark theme afecta toda la cascada

- **GIVEN** `<html data-theme="dark">` y `import '@romanmartinidev/tokens/css'` + `import '@romanmartinidev/tokens/themes/dark'`
- **WHEN** el browser pinta cualquier elemento que use `var(--ds-semantic-color-bg-base)`
- **THEN** SHALL resolver al valor de `dark` (`{color.neutral.950}`), no al default de `:root`

#### Scenario: combinar theme + brand sin código adicional

- **GIVEN** `<html data-theme="dark" data-brand="a">` con los tres CSS importados (base + dark + brand-a)
- **WHEN** el browser pinta un elemento que usa `var(--ds-semantic-color-bg-primary)`
- **THEN** el override de `brand-a` SHALL aplicar sobre el override de `dark` (cascada CSS estándar)

### Requirement: Prefix de variables CSS fijo

El prefix de todas las variables CSS emitidas SHALL ser `--ds-`. Este prefix queda parte del contrato API público y cambiarlo es una operación **BREAKING** que requiere un ADR nuevo que reemplace al ADR-003.

#### Scenario: build emite variables con prefix --ds-

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** `dist/tokens.css` SHALL contener exclusivamente variables que empiecen con `--ds-`

#### Scenario: cambio de prefix requiere ADR

- **WHEN** alguien propone cambiar el prefix a `--rmd-` u otro
- **THEN** SHALL crearse un ADR nuevo que referencia y reemplaza ADR-003, marcar el package como BREAKING en el changeset, y bumpear major version

### Requirement: Jerarquía semantic.border respetada

Los tokens `semantic.color.border.subtle`, `semantic.color.border.default` y `semantic.color.border.strong` SHALL mantener jerarquía visual creciente: `subtle < default < strong` tanto en light como en dark theme.

#### Scenario: contraste subtle < default

- **GIVEN** light theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-subtle` y `--ds-semantic-color-border-default` contra `--ds-semantic-color-bg-surface`
- **THEN** `subtle` SHALL tener menor contraste que `default`

#### Scenario: contraste default < strong

- **GIVEN** light o dark theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-default` y `--ds-semantic-color-border-strong` contra `--ds-semantic-color-bg-surface`
- **THEN** `default` SHALL tener menor contraste que `strong`

### Requirement: Token shadow.focus para accesibilidad

El package SHALL exponer un token `shadow.focus` (primitive) y su uso semántico vía `semantic.shadow.focus`. Este token define el box-shadow que aplica un focus ring visible para cumplir [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html).

#### Scenario: token shadow.focus existe en primitives

- **WHEN** se inspecciona `packages/tokens/src/primitives/shadow.json`
- **THEN** existe una key `focus` con un value de tipo box-shadow CSS válido (ej. `0 0 0 3px {color.blue.500}`)

#### Scenario: build emite la variable

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** `dist/tokens.css` SHALL contener `--ds-shadow-focus` y `--ds-semantic-shadow-focus` con valores de box-shadow no vacíos

### Requirement: Build reproducible con Style Dictionary 4

El build SHALL invocarse con `pnpm -F @romanmartinidev/tokens build`. La build SHALL leer las fuentes en `src/` y producir `dist/tokens.{css,js,d.ts}` + `dist/themes/<theme>.css` por cada theme declarado en `sd.config.mjs`. La build SHALL ser idempotente (mismo input → mismo output byte-a-byte) y SHALL NO requerir variables de entorno ni red.

#### Scenario: build fresco produce artefactos esperados

- **GIVEN** `packages/tokens/dist/` borrado
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** se crean `dist/tokens.css`, `dist/tokens.js`, `dist/tokens.d.ts` y un archivo por cada theme en `dist/themes/`
- **AND** el comando SHALL retornar exit 0

#### Scenario: build idempotente

- **GIVEN** un build ya ejecutado
- **WHEN** se vuelve a ejecutar `pnpm -F @romanmartinidev/tokens build` sin cambios en `src/`
- **THEN** los archivos en `dist/` SHALL ser byte-idénticos al build anterior
