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

El `package.json` SHALL declarar el campo `exports` con sub-paths separados para JS, CSS base y cada theme. El sub-path raíz (`"."`) SHALL exponer el JS y los types. El sub-path `"./css"` SHALL exponer el CSS base. Cada theme SHALL exponerse bajo `"./themes/<nombre>"`. El `exports` SHALL declarar además `"./package.json"`: con `exports` cerrado, todo sub-path no listado queda encapsulado, y el tooling que resuelve el manifest del package (schematics, bundlers, analizadores de versión) falla con `ERR_PACKAGE_PATH_NOT_EXPORTED`.

#### Scenario: consumidor importa solo el CSS base

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/css';`
- **THEN** el bundler SHALL resolver a `dist/tokens.css`

#### Scenario: consumidor importa un theme específico

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/themes/dark';`
- **THEN** el bundler SHALL resolver a `dist/themes/dark.css`

#### Scenario: consumidor importa tokens JS

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/tokens';`
- **THEN** el bundler SHALL resolver a `dist/tokens.js` con tipos desde `dist/tokens.d.ts`

#### Scenario: el manifest del package es resoluble

- **WHEN** una herramienta resuelve `@romanmartinidev/tokens/package.json`
- **THEN** SHALL resolver al `package.json` del package sin error de export

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

El package SHALL publicarse **desde el root del package** (a diferencia de `@romanmartinidev/components`, que publica su `dist/` — ver [ADR-021](../../../docs/architecture/adr/ADR-021-estrategia-publicacion-packages.md)): Style Dictionary no genera un `package.json`, y el manifest escrito a mano es el contrato publicado.

El `package.json` SHALL declarar `files` con `dist/`, `README.md`, `LICENSE` y `CHANGELOG.md`. El `node_modules/`, sources (`src/`), tests (`test/`), configs de build (`sd.config.mjs`, `vitest.config.ts`) y archivos de desarrollo NO SHALL incluirse en el tarball publicado.

El package SHALL incluir un `LICENSE` propio en su directorio, byte a byte idéntico al del root del monorepo: npm solo auto-incluye el `LICENSE` que vive en el directorio del package, y publicar `"license": "MIT"` sin el texto ni el copyright notice incumple la condición de atribución de la licencia.

El manifest **NO SHALL** declarar `engines`: los requisitos de Node y pnpm son del monorepo, no del consumidor de un package de CSS y constantes JS.

El package SHALL declarar un script `prepublishOnly` que aborte la publicación si `dist/` no existe o no contiene los artefactos declarados en `exports`, dado que publicar desde el root no ofrece garantía estructural de que el build haya corrido.

#### Scenario: pnpm pack incluye solo lo declarado

- **WHEN** se ejecuta `npm pack --dry-run` desde el directorio del package
- **THEN** el listado de archivos SHALL contener `dist/`, `package.json`, `README.md`, `LICENSE` y `CHANGELOG.md`
- **AND** SHALL NO contener `src/`, `test/`, `sd.config.mjs`, `vitest.config.ts` ni archivos `.json` de tokens

#### Scenario: el tarball incluye el texto de la licencia

- **WHEN** se inspecciona el tarball publicable
- **THEN** SHALL contener un `LICENSE` byte a byte idéntico al `LICENSE` del root del monorepo

#### Scenario: publicar sin build previo aborta

- **GIVEN** `packages/tokens/dist/` inexistente o incompleto
- **WHEN** se intenta publicar el package
- **THEN** el script `prepublishOnly` SHALL fallar con exit code distinto de 0 y mensaje explicando que falta el build

#### Scenario: cada path del exports existe en el tarball

- **WHEN** se resuelve cada path declarado en `exports` contra el contenido del tarball
- **THEN** todos SHALL existir

### Requirement: Jerarquía interna primitives → semantic → component → theme

Los tokens SHALL organizarse en cuatro niveles jerárquicos en `packages/tokens/src/`:

1. `primitives/` — valores crudos sin semántica de uso (escalas de color, dimensión, opacidad, tipografía, motion, shadow).
2. `semantic/` — tokens con intención de uso que referencian primitives (ej. `text.primary`, `bg.surface`, `border.default`, `space.md`, `radius.lg`).
3. `component/` — tokens específicos de un componente que referencian semantic o primitives.
4. `theme/` — overrides de tokens semánticos para distintos contextos (ej. `dark`, `brand-a`).

Las **reglas de referencia** SHALL ser:

- `semantic` puede referenciar `primitives` (no al revés). Se admiten aliases intra-`semantic` no circulares.
- `component` puede referenciar `semantic` o `primitives` (no `theme`). Cuando un valor ya existe como token semantic, el token component SHALL **referenciarlo** en vez de duplicar el valor crudo. Para la **tipografía**, el estado objetivo es que component consuma los roles semantic (`semantic.font.*`) y no primitivas `font.*` sueltas; la transición SHALL sostenerse por **trinquete**: las referencias component→`font.*` existentes al momento de `aaa-052` quedan listadas como legado documentado en el test de jerarquía, toda referencia **nueva** SHALL fallar, y la lista de legado solo puede achicarse (una entrada saldada SHALL borrarse). El burn-down del legado es trabajo con juicio por componente — mapear por rol, no por valor — y puede terminar en excepción documentada cuando la referencia es escala dimensional sin rol (las iniciales del avatar).
- `theme` solo redefine tokens existentes en `semantic` (no introduce tokens nuevos).
- Ningún nivel SHALL referenciar a sí mismo en forma circular.

Las cuatro reglas SHALL verificarse por un test automático de la suite del package (`packages/tokens/test/hierarchy.spec.ts`) que parsea los JSON fuente de los cuatro niveles y falla ante cualquier violación. La verificación NO SHALL depender de revisión humana ni de la herramienta de build.

#### Scenario: token semantic referencia primitive correctamente

- **GIVEN** `semantic/color.json` define `bg.primary` como `{color.blue.600}`
- **WHEN** Style Dictionary buildea
- **THEN** SHALL resolver la referencia y emitir `--ds-semantic-color-bg-primary: var(--ds-color-blue-600)` en CSS

#### Scenario: primitive referenciando semantic falla el test de jerarquía

- **WHEN** alguien escribe `primitives/color.json` con `neutral.500` apuntando a `{semantic.color.bg.surface}`
- **THEN** el test de jerarquía SHALL fallar identificando el archivo, el token y el nivel destino inválido (los primitives no dependen de semantics)

#### Scenario: component referenciando theme falla el test de jerarquía

- **WHEN** un token de `component/` apunta a una clave que solo existe en `theme/`
- **THEN** el test de jerarquía SHALL fallar identificando el token y el nivel destino inválido

#### Scenario: theme que introduce un token nuevo falla el test de jerarquía

- **WHEN** alguien agrega `theme/dark.json` con un token nuevo `semantic.color.brand-special` que no existe en `semantic/`
- **THEN** el test de jerarquía SHALL fallar listando las claves de theme ausentes en `semantic` (el theme solo redefine, no crea)

#### Scenario: una referencia circular falla el test de jerarquía

- **WHEN** dos tokens se referencian mutuamente, directa o transitivamente
- **THEN** el test de jerarquía SHALL fallar informando la cadena del ciclo

#### Scenario: una referencia a un token inexistente falla el test de jerarquía

- **WHEN** un token referencia `{una.clave.que.no.existe}`
- **THEN** el test de jerarquía SHALL fallar identificando el origen y la referencia no resuelta

#### Scenario: component no duplica valores que ya existen en semantic

- **GIVEN** `semantic.color.bg.overlay` definido en `semantic/color.json`
- **WHEN** se inspecciona `component/modal.json` → `modal.overlay-bg`
- **THEN** su value SHALL ser la referencia `{semantic.color.bg.overlay}`, no el valor crudo duplicado
- **AND** el CSS SHALL emitir `--ds-component-modal-overlay-bg: var(--ds-semantic-color-bg-overlay)`

#### Scenario: una referencia tipográfica nueva de component a primitivas falla

- **GIVEN** el baseline de referencias component→`font.*` congelado en el test de jerarquía
- **WHEN** un token de `component/` fuera de ese baseline referencia `{font.size.*}`, `{font.weight.*}` o `{font.line-height.*}`
- **THEN** el test SHALL fallar indicando el token y que la tipografía nueva referencia su rol semantic

#### Scenario: el legado tipográfico solo se achica

- **GIVEN** una entrada del baseline cuyo token fue remapeado a su rol semantic o retirado
- **WHEN** corre el test de jerarquía sin que la entrada se haya borrado del baseline
- **THEN** el test SHALL fallar exigiendo borrarla (el trinquete no admite entradas muertas)

#### Scenario: los repuntes de tooltip e input quedan fijados por testigo

- **WHEN** se inspeccionan `component.tooltip.font-size`, `component.input.font-size.sm/md/lg` y `component.input.helper.font-size`
- **THEN** SHALL referenciar `{semantic.font.size.body-xs}`, `{semantic.font.size.body-sm/md/lg}` y `{semantic.font.size.label-sm}` respectivamente

#### Scenario: referenciar una primitiva no tipográfica sigue siendo válido

- **GIVEN** un token de `component/` que referencia `{dimension.4}`, primitiva que varios tokens `semantic.space.*` aliasean a la vez
- **WHEN** corre el test de jerarquía
- **THEN** SHALL pasar (fuera de la tipografía, la regla no fuerza una elección arbitraria entre semantic equivalentes)

### Requirement: Modelo de theming via CSS variables y atributos HTML

El theming SHALL funcionar por cascada de variables CSS: la spec base define los semantics en `:root`; cada theme override en un selector de atributo (`[data-theme="dark"]`, `[data-brand="a"]`, etc.). El consumo SHALL ser independiente del componente que renderiza: cualquier elemento bajo el atributo recibe los overrides automáticamente.

El theme dark SHALL redefinir también la **elevación**: los tokens `semantic.shadow.*` de superficies elevadas (card, dropdown, modal, toast) SHALL declarar en dark una opacidad mayor que en el scope default, de modo que la sombra siga siendo un canal de separación visible sobre fondo oscuro (D-025). La geometría de la sombra (offsets, blur, spread) SHALL permanecer igual entre scopes: el theme ajusta opacidad, no forma.

#### Scenario: activar dark theme afecta toda la cascada

- **GIVEN** `<html data-theme="dark">` y `import '@romanmartinidev/tokens/css'` + `import '@romanmartinidev/tokens/themes/dark'`
- **WHEN** el browser pinta cualquier elemento que use `var(--ds-semantic-color-bg-base)`
- **THEN** SHALL resolver al valor de `dark` (`{color.neutral.950}`), no al default de `:root`

#### Scenario: combinar theme + brand sin código adicional

- **GIVEN** `<html data-theme="dark" data-brand="a">` con los tres CSS importados (base + dark + brand-a)
- **WHEN** el browser pinta un elemento que usa `var(--ds-semantic-color-bg-primary)`
- **THEN** el override de `brand-a` SHALL aplicar sobre el override de `dark` (cascada CSS estándar)

#### Scenario: la elevación en dark es más opaca que en el default

- **GIVEN** el build de tokens con su theme dark
- **WHEN** se comparan las opacidades de `semantic.shadow.card`, `dropdown`, `modal` y `toast` entre el scope default y `[data-theme="dark"]`
- **THEN** cada una SHALL ser estrictamente mayor en dark
- **AND** una igualdad o inversión SHALL fallar el test

#### Scenario: el theme dark no cambia la geometría de la sombra

- **WHEN** se comparan los offsets, blur y spread de cada `semantic.shadow.*` entre el scope default y `[data-theme="dark"]`
- **THEN** SHALL coincidir; solo la componente de opacidad SHALL diferir

### Requirement: Matriz brand × scheme

El theming SHALL sostener la combinación de marca y color scheme como una matriz modelada, no como un accidente de la cascada. Toda marca que overridee un token **lightness-dependent** (fondos subtle, colores de texto/ícono, focus ring, la escala hover/active del primary) SHALL entregar además un **overlay dark** (`src/theme/<brand>-dark.json`) emitido bajo el selector combinado `[data-theme="dark"][data-brand="<x>"]`, siguiendo la dirección tonal del theme dark (texto/íconos/focus más claros, hover que aclara, subtle profundo). Un token de marca sin dependencia de lightness no necesita entrada en el overlay.

El gate de contraste SHALL evaluar cada par declarado también en los **scopes combinados** (`dark+<brand>`), componiendo la cascada completa (base → dark → marca → overlay) igual que el browser.

#### Scenario: la combinación dark + marca emite el overlay

- **GIVEN** `<html data-theme="dark" data-brand="a">` con base, dark, brand-a y su overlay importados
- **WHEN** se resuelve `var(--ds-semantic-color-bg-primary-subtle)`
- **THEN** SHALL resolver a un tono profundo de la paleta de la marca (no al subtle claro del scope light de la marca)
- **AND** `var(--ds-semantic-color-text-primary)` sobre esa superficie SHALL mantenerse legible

#### Scenario: los overlays existen para cada marca publicada

- **WHEN** se inspecciona `packages/tokens/src/theme/`
- **THEN** por cada `brand-<x>.json` que overridee tokens lightness-dependent SHALL existir `brand-<x>-dark.json`
- **AND** el build SHALL emitir `dist/themes/brand-<x>-dark.css` bajo el selector `[data-theme="dark"][data-brand="<x>"]`, exportado por el package

#### Scenario: el gate de contraste corre los scopes combinados

- **WHEN** corre la suite de contraste del package
- **THEN** cada par SHALL evaluarse además en `dark+brand-<x>` por cada marca, con la cascada base → dark → marca → overlay
- **AND** un par que falle solo en una combinación SHALL fallar la suite (el escenario exacto del bug del 2026-08-05)

#### Scenario: texto primario legible sobre el subtle de marca

- **WHEN** se evalúa el par `text.primary` sobre `bg.primary-subtle`
- **THEN** SHALL alcanzar 4.5:1 en el scope default, en cada theme y en cada scope combinado

### Requirement: Prefix de variables CSS fijo

El prefix de todas las variables CSS emitidas SHALL ser `--ds-`. Este prefix queda parte del contrato API público y cambiarlo es una operación **BREAKING** que requiere un ADR nuevo que reemplace al ADR-003.

#### Scenario: build emite variables con prefix --ds-

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** `dist/tokens.css` SHALL contener exclusivamente variables que empiecen con `--ds-`

#### Scenario: cambio de prefix requiere ADR

- **WHEN** alguien propone cambiar el prefix a `--rmd-` u otro
- **THEN** SHALL crearse un ADR nuevo que referencia y reemplaza ADR-003, marcar el package como BREAKING en el changeset, y bumpear major version

### Requirement: Jerarquía semantic.border respetada

Los tokens `semantic.color.border.subtle`, `semantic.color.border.default` y `semantic.color.border.strong` SHALL mantener jerarquía visual creciente: `subtle < default < strong` tanto en light como en dark theme. La jerarquía SHALL verificarse por cálculo de contraste en la suite del package, con la misma lógica que el gate de contraste AA, y no por inspección visual.

#### Scenario: contraste subtle < default

- **GIVEN** light theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-subtle` y `--ds-semantic-color-border-default` contra `--ds-semantic-color-bg-surface`
- **THEN** `subtle` SHALL tener menor contraste que `default`

#### Scenario: contraste default < strong

- **GIVEN** light o dark theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-default` y `--ds-semantic-color-border-strong` contra `--ds-semantic-color-bg-surface`
- **THEN** `default` SHALL tener menor contraste que `strong`

#### Scenario: la jerarquía se verifica en todos los scopes

- **GIVEN** el build de tokens con sus themes
- **WHEN** corre la suite del package
- **THEN** el orden `subtle < default < strong` SHALL comprobarse en el scope default y en cada theme
- **AND** una inversión del orden en cualquier scope SHALL fallar el test

### Requirement: Token shadow.focus para accesibilidad

El package SHALL exponer un token `shadow.focus` (primitive) y su uso semántico vía `semantic.shadow.focus`. Este token define el box-shadow que aplica un focus ring visible para cumplir [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html).

El color del focus ring SHALL derivarse de `semantic.color.focus-ring`, de modo que un theme que redefina ese token gobierne el anillo sin redeclarar el box-shadow completo. En consecuencia, un theme de marca que declare su propio `semantic.color.focus-ring` SHALL ver ese color en el anillo de foco, y un theme de marca nuevo SHALL heredar ese comportamiento sin declarar nada más.

#### Scenario: token shadow.focus existe en primitives

- **WHEN** se inspecciona `packages/tokens/src/primitives/shadow.json`
- **THEN** existe una key `focus` con un value de tipo box-shadow CSS válido (ej. `0 0 0 2px {color.blue.500}`)

#### Scenario: build emite la variable

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** `dist/tokens.css` SHALL contener `--ds-shadow-focus` y `--ds-semantic-shadow-focus` con valores de box-shadow no vacíos

#### Scenario: el focus ring sigue al theme de marca activo

- **GIVEN** `<html data-brand="a">` con el CSS base y el de `brand-a` importados, donde `brand-a` redefine `semantic.color.focus-ring`
- **WHEN** un elemento enfocado resuelve `var(--ds-semantic-shadow-focus)`
- **THEN** el color del anillo SHALL ser el declarado por `brand-a`, no el del scope default

#### Scenario: el focus ring compone marca sobre color scheme

- **GIVEN** `<html data-theme="dark" data-brand="b">` con los tres CSS importados
- **WHEN** un elemento enfocado resuelve `var(--ds-semantic-shadow-focus)`
- **THEN** el color del anillo SHALL ser el de `brand-b` (cascada CSS estándar: el override de marca aplica sobre el de theme)

#### Scenario: el gate de contraste cubre el focus ring en cada scope

- **WHEN** corre la suite del package
- **THEN** el contraste del focus ring contra la superficie que lo rodea SHALL verificarse en el scope default y en cada theme declarado
- **AND** un theme cuyo focus ring no alcance el umbral `ui` (3:1) SHALL fallar el test

### Requirement: Superficie semantic invertida

El package SHALL exponer `semantic.color.bg.inverse` como la superficie que invierte el contraste del theme activo (tooltips, toasts de énfasis, badges sólidos neutros). El token SHALL declararse en `packages/tokens/src/semantic/color.json` y SHALL redefinirse en `packages/tokens/src/theme/dark.json`, de modo que la superficie invertida siga siendo el complemento de la superficie base en cada color scheme. Su par de texto SHALL ser el `semantic.color.text.inverse` ya existente.

Un token de component que necesite una superficie invertida SHALL referenciar `bg.inverse` y `text.inverse`, en vez de referenciar un token de texto para pintar un fondo o uno de fondo para pintar un texto.

#### Scenario: el token existe en semantic y se emite a CSS

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** `dist/tokens.css` SHALL contener `--ds-semantic-color-bg-inverse` con un valor de color no vacío

#### Scenario: la superficie se invierte con el theme

- **GIVEN** `<html data-theme="dark">` con el CSS base y el de dark importados
- **WHEN** se resuelve `var(--ds-semantic-color-bg-inverse)`
- **THEN** SHALL resolver a un color claro, complementario del `bg.base` oscuro del theme dark
- **AND** en el scope default (light) SHALL resolver a un color oscuro, complementario del `bg.base` claro

#### Scenario: el par cumple contraste AA

- **WHEN** corre el gate de contraste de la suite del package
- **THEN** el par `text.inverse` sobre `bg.inverse` SHALL alcanzar al menos 4.5:1 en el scope default y en cada theme

#### Scenario: el tooltip consume el par en vez de cruzar roles

- **WHEN** se inspeccionan `component.tooltip.bg` y `component.tooltip.text` en `packages/tokens/src/component/tooltip.json`
- **THEN** SHALL referenciar `{semantic.color.bg.inverse}` y `{semantic.color.text.inverse}` respectivamente

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

### Requirement: Tokens semantic de z-index

El package SHALL exponer una jerarquía completa de tokens `semantic.z-index` que cubra todos los casos típicos de layering visual de una UI moderna. Los tokens SHALL declararse en `packages/tokens/src/semantic/z-index.json` y emitirse al output CSS bajo el prefijo `--ds-semantic-z-index-*` (Style Dictionary serializa la ruta completa del token). La jerarquía SHALL sustentar overlays de dropdowns, modales, popovers, toasts y tooltips sin requerir que componentes hardcodeen valores numéricos.

#### Scenario: el archivo z-index.json declara los 13 niveles esperados

- **WHEN** se inspeccionan las keys de `semantic.z-index` en `packages/tokens/src/semantic/z-index.json`
- **THEN** SHALL existir exactamente estos 13 niveles, en orden: `hide`, `auto`, `base`, `docked`, `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip`

#### Scenario: el orden numérico respeta la jerarquía visual

- **GIVEN** los niveles `base`, `docked`, `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip` (excluyendo `hide` y `auto`)
- **WHEN** se ordena por valor numérico ascendente
- **THEN** ese orden SHALL coincidir con el orden de la jerarquía visual (base más bajo, tooltip más alto)

#### Scenario: hide y base ocupan extremos opuestos

- **WHEN** se lee el valor de `hide`
- **THEN** SHALL ser un entero negativo (típicamente `-1`) que pone el elemento detrás del flujo normal
- **AND** el valor de `base` SHALL ser `0`

#### Scenario: auto preserva el comportamiento default del browser

- **WHEN** se lee el valor de `auto`
- **THEN** SHALL ser exactamente `"auto"` (string), no un número
- **AND** SHALL servir para resetear stacking context cuando un componente necesita devolver al default

#### Scenario: la escala de overlays usa miles para dejar margen entre capas

- **WHEN** se inspeccionan los niveles `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip`
- **THEN** todos SHALL tener valores ≥ 1000
- **AND** la diferencia entre niveles consecutivos SHALL ser de al menos 10 unidades (compat. Bootstrap, deja margen para intercalar capas nuevas sin colisión)

#### Scenario: los tokens están disponibles como CSS custom properties

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona el CSS de `:root`
- **THEN** SHALL existir un custom property por cada nivel (ej. `--ds-semantic-z-index-hide`, `--ds-semantic-z-index-base`, …, `--ds-semantic-z-index-tooltip`)
- **AND** los valores SHALL coincidir 1:1 con los declarados en `z-index.json`

### Requirement: Tokens semantic de motion para overlays

El package SHALL exponer 2 tokens `semantic.motion.transition` específicos para componentes overlay (Modal, Drawer, Toast, Popover, Tooltip) que componen duration + easing en un único string CSS-shorthand. Los componentes overlay SHALL consumir estos tokens en lugar de hardcodear duration/easing para mantener consistencia visual entre overlays del sistema.

Todos los tokens `semantic.motion.transition.*` SHALL declararse por **composición de primitivas** (`{motion.duration.*} {motion.easing.*}`) y no como string literal que duplique valores ya presentes en `primitives/motion.json`. Cuando una composición requiera una duración o un easing que la escala primitiva no ofrece, la primitiva faltante SHALL agregarse a la escala antes de componer, de modo que ningún preset semántico quede como literal.

#### Scenario: existen los 2 tokens de transition para overlays

- **WHEN** se inspecciona `semantic.motion.transition` en `packages/tokens/src/semantic/motion.json`
- **THEN** SHALL existir las keys `overlay-enter` y `overlay-exit`

#### Scenario: enter es deliberadamente más lento que exit

- **GIVEN** el valor resuelto del token `overlay-enter` con formato `<duration>ms <easing>`
- **WHEN** se compara la duración con la del token `overlay-exit`
- **THEN** el enter SHALL tener duración ≥ exit (convención UX: salidas más rápidas que entradas)

#### Scenario: los tokens resuelven a duration + easing en sintaxis CSS shorthand

- **WHEN** se resuelve el valor de `overlay-enter` o `overlay-exit` siguiendo sus referencias hasta las primitivas
- **THEN** SHALL ser un string con formato `<duration>ms cubic-bezier(<a>, <b>, <c>, <d>)`
- **AND** SHALL NO incluir property (el consumidor decide qué propiedad anima)

#### Scenario: ningún preset de transition es un literal duplicado

- **WHEN** se inspecciona el value declarado de cada token bajo `semantic.motion.transition`
- **THEN** cada uno SHALL estar compuesto exclusivamente por referencias a `{motion.duration.*}` y `{motion.easing.*}`
- **AND** un value literal cuyos componentes existan en `primitives/motion.json` SHALL fallar el test

#### Scenario: disponibles como CSS custom properties

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona `:root`
- **THEN** SHALL existir `--ds-semantic-motion-transition-overlay-enter` y `--ds-semantic-motion-transition-overlay-exit`

### Requirement: Tokens semantic de effect

El package SHALL exponer una categoría `semantic.effect` para tokens de efectos visuales (blur, saturate, etc.) en un archivo dedicado `packages/tokens/src/semantic/effect.json`. La categoría empieza con `effect.blur.overlay` para soportar `backdrop-filter` de modales y drawers.

#### Scenario: existe el archivo y la categoría

- **WHEN** se inspecciona `packages/tokens/src/semantic/effect.json`
- **THEN** el archivo SHALL existir
- **AND** SHALL contener la estructura `semantic.effect.blur.overlay`

#### Scenario: blur.overlay tiene valor en píxeles

- **WHEN** se lee el valor de `effect.blur.overlay`
- **THEN** SHALL ser un string con formato `<n>px` (típicamente `8px`)
- **AND** SHALL NO ser hardcoded en CSS de componentes — siempre via `var(--ds-semantic-effect-blur-overlay)`

#### Scenario: disponible como CSS custom property

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona `:root`
- **THEN** SHALL existir `--ds-semantic-effect-blur-overlay`

### Requirement: Contraste WCAG AA de tokens interactivos

Los pares de tokens que pintan los controles interactivos del kit SHALL cumplir WCAG 2.2 AA en **todos los themes** (default y cada override en `theme/`): `semantic.color.text.inverse` sobre `semantic.color.bg.primary` SHALL alcanzar ≥ 4.5:1 (SC 1.4.3, texto normal); `semantic.color.border.strong` sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11, indicador no textual); y los borders de status `semantic.color.border.success/warning/info` (junto al ya corregido `border.danger`) sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11 — canal de variante de componentes de status como el toast).

La verificación SHALL ser por cálculo determinístico, no por estimación visual, y SHALL ejecutarse como parte de la suite de tests del package — no como script invocable a demanda. Los pares SHALL declararse en un artefacto de datos versionado (`packages/tokens/test/contrast-pairs.json`), de modo que sumar un componente al kit sea sumar pares sin modificar la lógica de cálculo. Cada par SHALL declarar su umbral por nivel (`text` 4.5:1, `large-text` 3:1, `ui` 3:1) y la spec cuyo requirement respalda.

La lógica de cálculo SHALL tener una única implementación en el repo productivo (`packages/tokens/scripts/contrast.mjs`), consumida tanto por el gate como por cualquier herramienta de auditoría. NO SHALL existir una segunda implementación del cálculo de ratio.

El alcance del gate SHALL cubrir los pares de tokens `component.*` de los componentes cuyas specs declaran un requirement de contraste verificado por gate, no solo los pares de nivel `semantic`.

#### Scenario: texto inverso sobre bg.primary cumple 4.5:1 en todos los themes

- **GIVEN** el build de tokens (`dist/tokens.css` + `dist/themes/*.css`)
- **WHEN** se calcula el ratio de contraste de `--ds-semantic-color-text-inverse` sobre `--ds-semantic-color-bg-primary` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 4.5:1

#### Scenario: border.strong sobre bg.surface cumple 3:1 en todos los themes

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de contraste de `--ds-semantic-color-border-strong` sobre `--ds-semantic-color-bg-surface` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1

#### Scenario: la cadena hover/active del primario no cae bajo el umbral

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-semantic-color-text-inverse` sobre `--ds-semantic-color-bg-primary-hover` y `--ds-semantic-color-bg-primary-active` en cada theme
- **THEN** cada ratio SHALL ser ≥ 4.5:1 (los estados interactivos no pueden ser menos legibles que el reposo)

#### Scenario: borders de status cumplen 3:1 en todos los themes

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-semantic-color-border-success`, `--ds-semantic-color-border-warning`, `--ds-semantic-color-border-info` y `--ds-semantic-color-border-danger` sobre `--ds-semantic-color-bg-surface` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1

#### Scenario: el gate corre en cada PR sin step dedicado

- **GIVEN** el spec de contraste ubicado en `packages/tokens/test/`
- **WHEN** el pipeline ejecuta la suite de tests del monorepo
- **THEN** el gate de contraste SHALL ejecutarse como parte de ella
- **AND** NO SHALL requerir un step propio en el workflow ni la invocación manual de una herramienta externa

#### Scenario: un par bajo umbral falla el build informando el par, el theme y el ratio

- **GIVEN** un token de color modificado que deja un par declarado por debajo de su umbral en al menos un scope
- **WHEN** corre la suite del package
- **THEN** el gate SHALL fallar con exit code distinto de 0
- **AND** el mensaje SHALL identificar el par, el theme afectado, el ratio obtenido y el umbral requerido

#### Scenario: un par que no resuelve a color plano falla en vez de omitirse

- **GIVEN** un par cuyo `fg` o `bg` no existe, forma un ciclo de `var()` o resuelve a un valor no cromático
- **WHEN** corre el gate
- **THEN** SHALL fallar reportando el par no resoluble
- **AND** NO SHALL contarlo como aprobado ni saltearlo en silencio

#### Scenario: los tokens de componente están cubiertos

- **GIVEN** las specs de componente que declaran un requirement de contraste verificado por gate
- **WHEN** se inspecciona el artefacto de pares versionado
- **THEN** cada una de esas specs SHALL tener al menos un par que la referencia
- **AND** las specs sin par cubierto SHALL estar declaradas explícitamente en el gate con su justificación

#### Scenario: los pares del control desmarcado de checkbox y radio cumplen 3:1

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-component-checkbox-border-off` y `--ds-component-radio-border-off` contra `--ds-semantic-color-bg-surface` y contra su propio `bg-off`, en el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1 (el borde es el único indicador visual de un control sin texto propio)

### Requirement: Validación automática del artefacto emitido

El package SHALL verificar en su suite de tests que el artefacto de `dist/` —lo que efectivamente consume el usuario del package— cumple el contrato público, mediante un spec (`packages/tokens/test/build.spec.ts`) que parsea `dist/tokens.css` y `dist/themes/*.css`.

Las aserciones SHALL cubrir: prefijo `--ds-` en toda custom property emitida; ausencia de referencias de Style Dictionary sin resolver (`{…}` literales en el output); ausencia de `var()` apuntando a custom properties no declaradas; y **contención** de cada theme en el scope default — toda clave de un theme SHALL existir en el default.

La contención, y NO la igualdad de sets, es la propiedad verificable: los archivos de theme se emiten como deltas por diseño (`sd.config.mjs` filtra el output a los tokens de `src/theme/`), de modo que exigir el mismo set de propiedades que el default sería un gate imposible de satisfacer. Lo que la contención más la ausencia de `var()` colgantes detecta es el fallback silencioso: una variable que un theme referencia y que nadie declara.

El spec SHALL asumir `dist/` ya construido —el pipeline buildea antes de testear— y, si falta, SHALL fallar con un mensaje que nombre el comando de build, en vez de con aserciones sobre archivos ausentes.

#### Scenario: toda custom property emitida lleva el prefijo --ds-

- **GIVEN** `dist/tokens.css` construido
- **WHEN** se parsean todas sus custom properties
- **THEN** todas SHALL empezar con `--ds-`

#### Scenario: cero referencias de Style Dictionary sin resolver

- **GIVEN** el build de tokens
- **WHEN** se inspeccionan los valores emitidos en `dist/tokens.css` y `dist/themes/*.css`
- **THEN** ninguno SHALL contener una referencia literal con la forma `{algo.asi}`

#### Scenario: cero var() a custom properties inexistentes

- **GIVEN** el build de tokens
- **WHEN** se resuelve cada `var(--x)` emitido contra las propiedades declaradas en el scope default y en el propio theme
- **THEN** todas SHALL resolver a una propiedad declarada

#### Scenario: un theme no declara propiedades ausentes del default

- **GIVEN** `dist/themes/dark.css`, `brand-a.css` y `brand-b.css`
- **WHEN** se comparan sus claves contra las de `dist/tokens.css`
- **THEN** cada clave del theme SHALL existir en el default
- **AND** un theme que introduzca una custom property nueva SHALL fallar el test

#### Scenario: los artefactos declarados en exports existen

- **GIVEN** el build de tokens
- **WHEN** se resuelve cada path de `exports` del `package.json` contra `dist/`
- **THEN** todos SHALL existir

#### Scenario: la suite avisa si falta el build en vez de fallar en cascada

- **GIVEN** un working tree sin `dist/` construido
- **WHEN** corre la suite del package
- **THEN** el spec SHALL fallar con un mensaje que nombre el comando de build a ejecutar
