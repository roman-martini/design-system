## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Token shadow.focus para accesibilidad

El package SHALL exponer un token `shadow.focus` (primitive) y su uso semántico vía `semantic.shadow.focus`. Este token define el box-shadow que aplica un focus ring visible para cumplir [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html).

El color del focus ring SHALL derivarse de `semantic.color.focus-ring`, de modo que un theme que redefina ese token gobierne el anillo sin redeclarar el box-shadow completo. En consecuencia, un theme de marca que declare su propio `semantic.color.focus-ring` SHALL ver ese color en el anillo de foco, y un theme de marca nuevo SHALL heredar ese comportamiento sin declarar nada más.

#### Scenario: token shadow.focus existe en primitives

- **WHEN** se inspecciona `packages/tokens/src/primitives/shadow.json`
- **THEN** existe una key `focus` con un value de tipo box-shadow CSS válido (ej. `0 0 0 3px {color.blue.500}`)

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
