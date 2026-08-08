---
name: component-button
type: spec
status: active
created: 2026-07-20
---

# component-button

## Purpose

Contrato de `DsButton`: tests con Vitest (creación, render, `clicked` con/sin `disabled`), el estado `loading` y las variantes de estilo propias del componente. El resto del contrato del botón (disabled accesible, iconografía) es transversal y vive en `components-package`.

## Requirements

### Requirement: Estado loading de DsButton

`DsButton` SHALL exponer un input `loading` (boolean, default `false`) y un input opcional `loadingText` (string). Con `loading` en `true`, el botón SHALL embeber un `ds-spinner` (`size xs`, `currentColor`) por composición, SHALL bloquear la emisión de `clicked` manteniéndose focuseable y anunciado (sin `disabled` nativo), y SHALL exponer `aria-busy="true"`. El contenido durante la carga SHALL ser configurable: sin `loadingText`, el spinner reemplaza el contenido conservando el ancho del botón (sin layout shift); con `loadingText`, el botón muestra spinner + ese texto. Cuando `loading` y `disabled` coincidan, `loading` SHALL tener precedencia.

#### Scenario: input loading embebe el spinner (CA-017.1)

- **GIVEN** un `<ds-button [loading]="true">` (standalone, OnPush)
- **WHEN** se renderiza
- **THEN** SHALL embeber un `ds-spinner` con `size` `xs` que hereda `currentColor` del botón, sin que el consumidor lo componga a mano

#### Scenario: bloqueo accesible sin disabled nativo (CA-017.2)

- **GIVEN** un botón con `loading=true`
- **WHEN** el usuario hace click o presiona Enter/Space
- **THEN** el output `clicked` SHALL NO emitir
- **AND** el botón SHALL permanecer focuseable y anunciado (NO SHALL usar el atributo `disabled` nativo)

#### Scenario: anuncio con aria-busy (CA-017.3)

- **GIVEN** un botón con `loading=true`
- **WHEN** se renderiza
- **THEN** el `<button>` SHALL exponer `aria-busy="true"` y el spinner embebido SHALL ser decorativo (`aria-hidden`, `label=""`)
- **GIVEN** el mismo botón con `loading=false`
- **THEN** `aria-busy` SHALL NO estar presente

#### Scenario: modo default reemplaza contenido con ancho estable (CA-017.4)

- **GIVEN** un botón con `loading=true` y sin `loadingText`
- **WHEN** se alterna `loading` en el ciclo `false → true → false`
- **THEN** el spinner SHALL reemplazar el contenido y el ancho del botón SHALL mantenerse estable (sin layout shift)
- **AND** el label original SHALL persistir como nombre accesible

#### Scenario: modo loadingText muestra spinner y texto (CA-017.5)

- **GIVEN** un botón con `loading=true` y `loadingText` (ej. "Guardando…")
- **WHEN** se renderiza
- **THEN** SHALL mostrar el spinner junto al texto de `loadingText`
- **AND** `loadingText` SHALL ser el nombre accesible del botón durante la carga

#### Scenario: precedencia de loading sobre disabled (CA-017.6)

- **GIVEN** un botón con `loading=true` y `disabled=true`/`disabledReason` simultáneos
- **WHEN** se renderiza
- **THEN** `loading` SHALL ganar: la acción SHALL estar bloqueada y el `disabledReason` NO SHALL mostrarse
- **AND** al pasar `loading` a `false`, el estado `disabled` y su motivo SHALL restablecerse

#### Scenario: estilos por tokens sin pares de contraste nuevos (CA-017.7)

- **WHEN** se inspecciona el CSS del estado loading
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (`component.spinner.*` + tokens de `button`)
- **AND** al heredar `currentColor` NO SHALL introducir pares de contraste propios

#### Scenario: tests del comportamiento loading con Vitest (CA-017.1–017.6)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: bloqueo de `clicked` con `loading`, presencia/ausencia de `aria-busy`, spinner decorativo embebido, modo default vs. `loadingText` y precedencia sobre `disabled`

### Requirement: Variantes outline y danger de DsButton

`DsButton` SHALL exponer `DsButtonVariant` con `primary`, `secondary`, `ghost`, `outline`, `danger`, `danger-outline` y `danger-ghost`, manteniendo intactas las variantes y la API previas. `outline` SHALL renderizar fondo transparente, borde `border.default` y texto primario con interacción tokenizada. Las variantes danger SHALL usar los tokens `component.button.danger*` (sólida con texto inverso; outline/ghost con texto danger y hover `danger-subtle`), y sus pares de contraste SHALL cumplir WCAG AA verificados por el gate por script. El disabled accesible (ADR-011) y el estado `loading` SHALL funcionar idénticos en todas las variantes.

#### Scenario: variante outline (CA-020.1)

- **GIVEN** un `<ds-button variant="outline">`
- **WHEN** se renderiza
- **THEN** el fondo SHALL ser transparente, el borde `component.button.outline.border` (→ `border.default`) y el texto `text.primary`
- **AND** hover/active SHALL usar los fondos tokenizados de interacción (mismos que ghost)

#### Scenario: variante danger sólida con AA (CA-020.2)

- **GIVEN** un `<ds-button variant="danger">`
- **WHEN** se renderiza
- **THEN** SHALL usar `component.button.danger.*` (bg/hover/active + texto inverso)
- **AND** el par texto/fondo SHALL cumplir ≥4.5:1 en los 4 themes (gate por script)

#### Scenario: variantes danger-outline y danger-ghost (CA-020.3)

- **GIVEN** un `<ds-button variant="danger-outline">` o `variant="danger-ghost"`
- **WHEN** se renderiza
- **THEN** el texto SHALL usar `text.danger` (y el borde en outline), con fondo transparente
- **AND** hover/active SHALL usar `bg.danger-subtle`
- **AND** los pares de texto SHALL cumplir AA (pares verificados de D-012)

#### Scenario: cadena semantic danger (D-016, CA-020.4)

- **WHEN** se inspecciona el build de tokens
- **THEN** el default `bg.danger`/`danger-hover`/`danger-active` SHALL referenciar `red.600/700/800`
- **AND** la cadena dark SHALL referenciar `red.500/400/300` (aclara un paso, manteniendo AA con su `text.inverse`)
- **AND** el gate de contraste SHALL pasar sin regresión en pares existentes

#### Scenario: compatibilidad con disabled y loading (CA-020.5)

- **GIVEN** cualquier variante nueva con `disabled=true` + `disabledReason` o con `loading=true`
- **WHEN** se interactúa
- **THEN** el comportamiento SHALL ser idéntico al de las variantes previas (guarda, `aria-disabled`/`aria-busy`, sin hover)

#### Scenario: tests de variantes con Vitest (CA-020.1–020.5)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: reflejo de cada variante nueva en `data-variant`, tokens por variante en el CSS fuente, y disabled/loading operativos en una variante danger

### Requirement: Dimensionamiento tokenizado de DsButton

`DsButton` SHALL dimensionarse con los tokens `component.button.*` que le corresponden —altura por size, padding horizontal, tamaño de fuente, gap y radius— y NO SHALL derivar su tamaño de tokens `semantic.*` genéricos ni de primitives sueltos, según la jerarquía de ADR-003 que exige `design-tokens-package`. La altura SHALL declararse explícitamente, de modo que el alto del control no dependa del padding vertical ni de la métrica de la fuente. El texto SHALL quedar centrado verticalmente dentro del control, con el mismo espacio libre arriba y abajo.

#### Scenario: la altura del botón es la que declara su token

- **WHEN** se renderiza `<ds-button size="sm|md|lg">`
- **THEN** el alto del control SHALL corresponder a `component.button.height.<size>`
- **AND** un botón `md` SHALL tener el mismo alto que un `ds-select` y un campo de texto `md`, de modo que alineen al ponerse en una misma fila

#### Scenario: el texto queda centrado verticalmente

- **GIVEN** un botón renderizado con su texto
- **WHEN** se mide la caja del texto contra la caja del control
- **THEN** el espacio libre por encima y por debajo del texto SHALL ser el mismo
- **AND** la caja de línea del texto SHALL contenerlo por completo, sin recortarlo por debajo de su alto natural

#### Scenario: estilos exclusivamente por tokens de componente

- **WHEN** se inspecciona `button.css`
- **THEN** alto, padding, tamaño de fuente, gap, radius y ancho de borde SHALL referenciarse vía `var(--ds-component-button-*)` o primitives dimensionales explícitos
- **AND** SHALL NO existir px hardcodeados (excepto `0`) ni hex codes

### Requirement: Tipo de botón y nombre accesible de DsButton

`DsButton` SHALL exponer un input `type` (`'button' | 'submit' | 'reset'`, default `'button'`) que se refleja en el `<button>` interno, de modo que el kit cubra el botón de envío de un formulario. Cuando el botón esté bloqueado por `disabled` o por `loading`, la guarda SHALL impedir además el envío nativo del formulario, no solo la emisión de `clicked`. SHALL aceptar los alias `aria-label` y `aria-labelledby`, reenviados al `<button>` interno —el elemento con rol— y no declarados sobre el host, de modo que un botón cuyo único contenido es un icono pueda tener nombre accesible.

#### Scenario: type submit envía el formulario

- **GIVEN** un `<ds-button type="submit">` dentro de un `<form>`
- **WHEN** el usuario lo activa
- **THEN** el formulario SHALL enviarse
- **GIVEN** el mismo botón con `disabled` o `loading` activos
- **WHEN** el usuario lo activa
- **THEN** el formulario NO SHALL enviarse y `clicked` NO SHALL emitir

#### Scenario: el botón ícono-only tiene nombre accesible

- **GIVEN** un `<ds-button aria-label="Cerrar">` cuyo único contenido proyectado es un icono decorativo
- **WHEN** se inspecciona el DOM
- **THEN** el `<button>` interno SHALL exponer ese `aria-label`
- **AND** el host `<ds-button>` NO SHALL conservar el atributo, donde sería inerte y además una violación por atributo ARIA no permitido
- **AND** el motor de accesibilidad SHALL reportar el botón con nombre, sin violaciones de `button-name`

### Requirement: Tests del Button con Vitest

El package SHALL incluir tests para Button con Vitest + `@analogjs/vitest-angular`. Los tests SHALL cubrir: creación del componente, renderizado del `<button>`, comportamiento del output `clicked` con y sin `disabled`.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL ejecutar `button.spec.ts` y SHALL retornar exit 0 con todos los tests passing

#### Scenario: test del comportamiento disabled

- **GIVEN** un Button renderizado con `disabled` set a `true`
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL NO emitir

#### Scenario: test del comportamiento enabled

- **GIVEN** un Button renderizado sin disabled (default false)
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

### Requirement: Colores de variante y peso tipográfico por la capa component

Los colores de cada variante de `DsButton` SHALL salir de sus tokens `component.button.<variant>.*` (que referencian la capa semantic), y el peso tipográfico del texto SHALL salir de `component.button.font-weight`, cuya cadena (`{semantic.font.weight.button}` → `{font.weight.semibold}`) declara **semibold (600)**. El CSS NO SHALL consumir `semantic.*` directamente para valores que la capa component ya declara, según la jerarquía de ADR-003 — el mismo contrato que checkbox, radio y switch ya cumplen. Los tokens SHALL describir el diseño que el botón renderiza: un token cuyo valor contradiga lo que se ve NO satisface este requirement.

#### Scenario: cada variante consume su capa component

- **WHEN** se inspecciona `button.css`
- **THEN** los colores de `primary`, `secondary`, `ghost`, `danger` y `danger-ghost` SHALL referenciarse vía `var(--ds-component-button-<variant>-*)`
- **AND** SHALL NO consumirse `--ds-semantic-color-*` directamente para colores que `component/button.json` declara
- **AND** el theming por atributo (`data-theme`, `data-brand`) SHALL seguir cascadeando a través de la capa component (referencias emitidas con `outputReferences`)

#### Scenario: el peso del texto es el que declara el token

- **WHEN** se renderiza un `ds-button` de cualquier variante y size
- **THEN** el peso computado del texto SHALL ser el que resuelve `component.button.font-weight` (semibold, 600)
- **AND** `button.css` SHALL referenciarlo vía `var(--ds-component-button-font-weight)`

#### Scenario: la capa component del botón no tiene tokens muertos

- **WHEN** se comparan los tokens de `component/button.json` contra los consumos de `button.css`
- **THEN** todo token que describa un estado que el botón renderiza SHALL tener consumidor en el CSS
