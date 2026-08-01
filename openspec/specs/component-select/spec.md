---
name: component-select
type: spec
status: active
created: 2026-07-20
---

# component-select

## Purpose

Contrato de `DsSelect` + `DsOption`: overlay anclado (Popover API), navegación por teclado, ControlValueAccessor y accesibilidad de listbox.

## Requirements

### Requirement: Componente DsSelect

El package SHALL exponer `DsSelect` (selector `ds-select`), combobox de selección única sobre opciones `DsOption` proyectadas, siguiendo ADR-004/007/010 (arquitectura y naming), ADR-012 (iconografía) y el patrón ARIA APG combobox. SHALL implementar `ControlValueAccessor` para Angular Forms (reactivos y template-driven). SHALL soportar `value` (model two-way, genérico), `placeholder` (input string), `disabled` (model two-way; CVA puede mutarlo), `size` (`'sm' | 'md' | 'lg'`, default `'md'`). El listado SHALL renderizarse en el **top layer** vía Popover API nativa; el posicionamiento respecto del trigger SHALL resolverse según [ADR-014](../../../docs/architecture/adr/ADR-014-overlays-anclados-popover-api.md) (fallback JS propio hasta que anchor positioning cubra el target), nunca recortado por contenedores con overflow.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/select/`
- **THEN** existen `select.ts`, `select.html`, `select.css`, `select.spec.ts`, `select.stories.ts`, `option.ts`, `option.html`, `option.css`, `index.ts`
- **AND** las classes se llaman `DsSelect` y `DsOption` con selectores `ds-select` y `ds-option`

#### Scenario: two-way binding e integración CVA

- **GIVEN** `<ds-select [formControl]="ctrl">` con opciones `'a'`, `'b'`, `'c'` y `ctrl = new FormControl('a')`
- **WHEN** el usuario abre el listado y elige `'b'`
- **THEN** `ctrl.value` SHALL ser `'b'`
- **WHEN** el consumidor ejecuta `ctrl.setValue('c')`
- **THEN** el trigger SHALL mostrar el label de la opción `'c'` y esa opción SHALL exponerse como seleccionada

#### Scenario: el control pasa a touched al perder el foco sin abrirse

- **GIVEN** `<ds-select [formControl]="ctrl">` con foco en el trigger y el listado cerrado
- **WHEN** el foco abandona el trigger sin que el listado se haya abierto
- **THEN** `ctrl.touched` SHALL ser `true` — el patrón `invalid && touched` del consumidor SHALL visibilizar la validación de un select requerido no tocado
- **AND** cerrar el listado (selección, Esc o light-dismiss) SHALL seguir marcando touched

#### Scenario: apertura por teclado

- **GIVEN** el select cerrado con foco en el trigger
- **WHEN** el usuario presiona `ArrowDown`, `Enter` o `Space`
- **THEN** el listado SHALL abrirse y `aria-expanded` SHALL pasar a `"true"`

#### Scenario: navegación y selección por teclado

- **GIVEN** el listado abierto
- **WHEN** el usuario presiona `ArrowDown`/`ArrowUp`
- **THEN** la opción activa SHALL moverse a la siguiente/anterior habilitada (saltando disabled)
- **WHEN** presiona `Home`/`End`
- **THEN** la opción activa SHALL ir a la primera/última habilitada
- **WHEN** presiona `Enter`
- **THEN** la opción activa SHALL quedar seleccionada, el listado SHALL cerrarse y el model SHALL actualizarse

#### Scenario: typeahead por caracteres imprimibles

- **GIVEN** el listado abierto
- **WHEN** el usuario tipea un carácter imprimible
- **THEN** la opción activa SHALL saltar a la siguiente habilitada cuyo label empiece con el buffer tipeado (case-insensitive), sin cambiar el valor hasta confirmar
- **AND** repetir la misma letra antes del reset del buffer SHALL ciclar entre las opciones con esa inicial; un buffer de varios caracteres SHALL refinar la búsqueda incluyendo la opción activa
- **GIVEN** el listado cerrado con foco en el trigger
- **WHEN** el usuario tipea un carácter imprimible
- **THEN** el listado SHALL abrirse con la opción activa en la primera coincidencia, sin cambiar el valor

#### Scenario: ESC cierra sin cambiar la selección

- **GIVEN** el listado abierto con valor previo `'a'` y opción activa `'b'`
- **WHEN** el usuario presiona `Escape`
- **THEN** el listado SHALL cerrarse
- **AND** el valor SHALL seguir siendo `'a'`

#### Scenario: patrón ARIA combobox

- **WHEN** se inspecciona el DOM renderizado
- **THEN** el trigger SHALL ser un `<button>` con `role="combobox"`, `aria-expanded` sincronizado y `aria-controls` apuntando al listado
- **AND** el listado SHALL tener `role="listbox"` y cada opción `role="option"` con `aria-selected`
- **AND** la opción activa SHALL exponerse vía `aria-activedescendant` en el trigger (el foco DOM permanece en el trigger)
- **AND** el nombre accesible provisto por el consumidor (`aria-label`/`aria-labelledby` sobre `<ds-select>`) SHALL reenviarse al trigger (el combobox real) — no queda inerte en el host

#### Scenario: chevron según convención de iconografía

- **WHEN** se inspecciona el trigger
- **THEN** SHALL renderizar `LucideChevronDown` con `size="16"` y `strokeWidth="1.5"`, color por `currentColor`
- **AND** el `<svg>` SHALL tener `aria-hidden="true"`

#### Scenario: estilos exclusivamente por tokens

- **WHEN** se inspecciona `select.css` y `option.css`
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (tokens `component.select.*`, semantic o primitives)
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales

#### Scenario: disabled perceptible vía forms API

- **GIVEN** `<ds-select [formControl]="ctrl">` y `ctrl.disable()`
- **WHEN** se inspecciona el trigger
- **THEN** SHALL tener `aria-disabled="true"` sin `disabled` nativo ni `tabindex="-1"` (permanece focuseable y anunciado — ADR-011 extendido por ADR-014 §5)
- **AND** interacciones de mouse y teclado SHALL NO abrir el listado ni cambiar el valor

#### Scenario: listado en top layer sin clipping y cierre por click fuera

- **GIVEN** un `ds-select` dentro de un contenedor con `overflow: hidden`
- **WHEN** el listado se abre
- **THEN** SHALL renderizarse en el top layer (popover), sin quedar recortado por el contenedor
- **AND** la separación entre el trigger y el listado SHALL salir del token `component.select.listbox.offset` (con fallback documentado para entornos que no resuelven CSS vars)
- **WHEN** el usuario clickea fuera del select
- **THEN** el listado SHALL cerrarse sin cambiar la selección (light-dismiss)

#### Scenario: el ancho del control no depende de la opción seleccionada

- **GIVEN** un `ds-select` sin ancho declarado por el consumidor, con opciones de labels de distinta longitud
- **WHEN** el usuario selecciona una opción cuyo label es más corto que el placeholder
- **THEN** el ancho del control SHALL mantenerse — el trigger SHALL respetar el piso `component.select.trigger.min-width`
- **WHEN** el listado se abre
- **THEN** el listado SHALL ser al menos tan ancho como el trigger y SHALL mostrar cada label en una sola línea, creciendo hasta el ancho disponible del viewport si alguna opción lo excede
- **AND** el listado SHALL permanecer dentro del viewport, corriéndose horizontalmente antes que desbordar por su borde

#### Scenario: el listbox cerrado no genera caja

- **GIVEN** un `ds-select` renderizado con el listado cerrado
- **WHEN** se inspecciona `select.css`
- **THEN** el `display` de autor del listbox SHALL declararse únicamente para el estado `:popover-open`, conservando en el estado cerrado la ocultación del UA (`display: none`) — el listbox cerrado SHALL NO participar del layout

#### Scenario: animación con tokens y reduced motion

- **WHEN** se inspecciona `select.css`
- **THEN** toda transición de apertura/cierre SHALL usar los tokens de motion de overlay (`--ds-semantic-motion-transition-overlay-*`)
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que las desactiva

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/select';`
- **AND** un consumidor SHALL poder hacer `import { DsSelect, DsOption, type DsSelectSize } from '@romanmartinidev/components'`

### Requirement: Componente DsOption

El package SHALL exponer `DsOption` (selector `ds-option`), opción proyectada dentro de un `DsSelect` ancestro, registrada en el padre mediante una interfaz mínima (sin dependencia circular, mismo patrón que DsRadio/DsRadioGroup). SHALL soportar `value` (input requerido, genérico), `disabled` (input boolean, default false), `label` (input string fallback) y contenido proyectado con precedencia sobre `label`.

#### Scenario: registración y selección

- **GIVEN** un `<ds-select>` con tres `<ds-option>` de values `'a'`, `'b'`, `'c'`
- **WHEN** el usuario abre el listado y clickea la opción `'b'`
- **THEN** el select SHALL actualizar su valor a `'b'` y cerrar el listado
- **AND** la opción `'b'` SHALL exponer `aria-selected="true"` y las demás `"false"`

#### Scenario: label fallback y contenido proyectado

- **GIVEN** `<ds-option value="a" label="Opción A" />` sin contenido proyectado
- **THEN** SHALL mostrar "Opción A"
- **GIVEN** `<ds-option value="b" label="ignorado">Contenido <b>rico</b></ds-option>`
- **THEN** SHALL mostrar el contenido proyectado e ignorar el input `label`
- **AND** el label efectivo de la opción seleccionada SHALL reflejarse en el trigger del select

#### Scenario: opción deshabilitada

- **GIVEN** un `<ds-option [disabled]="true">` dentro del listado abierto
- **WHEN** el usuario la clickea o la navegación por teclado la alcanza
- **THEN** SHALL NO ser seleccionable y la navegación SHALL saltearla
- **AND** SHALL exponer `aria-disabled="true"` con apariencia atenuada vía token
