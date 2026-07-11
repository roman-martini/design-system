# Delta — components-package (components-add-select)

## ADDED Requirements

### Requirement: Componente DsSelect

El package SHALL exponer `DsSelect` (selector `ds-select`), combobox de selección única sobre opciones `DsOption` proyectadas, siguiendo ADR-004/007/010 (arquitectura y naming), ADR-012 (iconografía) y el patrón ARIA APG combobox. SHALL implementar `ControlValueAccessor` para Angular Forms (reactivos y template-driven). SHALL soportar `value` (model two-way, genérico), `placeholder` (input string), `disabled` (model two-way; CVA puede mutarlo), `size` (`'sm' | 'md' | 'lg'`, default `'md'`). El listado SHALL renderizarse en el **top layer** vía Popover API nativa; el posicionamiento respecto del trigger SHALL resolverse por CSS anchor positioning o el fallback JS propio (design.md §2), nunca recortado por contenedores con overflow.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/select/`
- **THEN** existen `select.ts`, `select.html`, `select.css`, `select.spec.ts`, `select.stories.ts`, `option.ts`, `option.html`, `option.css`, `index.ts`
- **AND** las classes se llaman `DsSelect` y `DsOption` con selectores `ds-select` y `ds-option`

#### Scenario: two-way binding e integración CVA (CA-003.1)

- **GIVEN** `<ds-select [formControl]="ctrl">` con opciones `'a'`, `'b'`, `'c'` y `ctrl = new FormControl('a')`
- **WHEN** el usuario abre el listado y elige `'b'`
- **THEN** `ctrl.value` SHALL ser `'b'`
- **WHEN** el consumidor ejecuta `ctrl.setValue('c')`
- **THEN** el trigger SHALL mostrar el label de la opción `'c'` y esa opción SHALL exponerse como seleccionada

#### Scenario: apertura por teclado (CA-003.2)

- **GIVEN** el select cerrado con foco en el trigger
- **WHEN** el usuario presiona `ArrowDown`, `Enter` o `Space`
- **THEN** el listado SHALL abrirse y `aria-expanded` SHALL pasar a `"true"`

#### Scenario: navegación y selección por teclado (CA-003.2)

- **GIVEN** el listado abierto
- **WHEN** el usuario presiona `ArrowDown`/`ArrowUp`
- **THEN** la opción activa SHALL moverse a la siguiente/anterior habilitada (saltando disabled)
- **WHEN** presiona `Home`/`End`
- **THEN** la opción activa SHALL ir a la primera/última habilitada
- **WHEN** presiona `Enter`
- **THEN** la opción activa SHALL quedar seleccionada, el listado SHALL cerrarse y el model SHALL actualizarse

#### Scenario: ESC cierra sin cambiar la selección (CA-003.2)

- **GIVEN** el listado abierto con valor previo `'a'` y opción activa `'b'`
- **WHEN** el usuario presiona `Escape`
- **THEN** el listado SHALL cerrarse
- **AND** el valor SHALL seguir siendo `'a'`

#### Scenario: patrón ARIA combobox (CA-003.3)

- **WHEN** se inspecciona el DOM renderizado
- **THEN** el trigger SHALL ser un `<button>` con `role="combobox"`, `aria-expanded` sincronizado y `aria-controls` apuntando al listado
- **AND** el listado SHALL tener `role="listbox"` y cada opción `role="option"` con `aria-selected`
- **AND** la opción activa SHALL exponerse vía `aria-activedescendant` en el trigger (el foco DOM permanece en el trigger)
- **AND** el trigger SHALL poder recibir su nombre accesible vía `aria-label`/`aria-labelledby` del consumidor

#### Scenario: chevron según convención de iconografía (CA-003.4)

- **WHEN** se inspecciona el trigger
- **THEN** SHALL renderizar `LucideChevronDown` con `size="16"` y `strokeWidth="1.5"`, color por `currentColor`
- **AND** el `<svg>` SHALL tener `aria-hidden="true"`

#### Scenario: estilos exclusivamente por tokens (CA-003.5)

- **WHEN** se inspecciona `select.css` y `option.css`
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (tokens `component.select.*`, semantic o primitives)
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales

#### Scenario: disabled perceptible vía forms API (CA-003.6)

- **GIVEN** `<ds-select [formControl]="ctrl">` y `ctrl.disable()`
- **WHEN** se inspecciona el trigger
- **THEN** SHALL tener `aria-disabled="true"` sin `disabled` nativo ni `tabindex="-1"` (permanece focuseable y anunciado — ADR-011, rama botón)
- **AND** interacciones de mouse y teclado SHALL NO abrir el listado ni cambiar el valor

#### Scenario: listado en top layer sin clipping y cierre por click fuera (CA-003.7)

- **GIVEN** un `ds-select` dentro de un contenedor con `overflow: hidden`
- **WHEN** el listado se abre
- **THEN** SHALL renderizarse en el top layer (popover), sin quedar recortado por el contenedor
- **WHEN** el usuario clickea fuera del select
- **THEN** el listado SHALL cerrarse sin cambiar la selección (light-dismiss)

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
