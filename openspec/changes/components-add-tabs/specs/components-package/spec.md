# Delta — components-package (components-add-tabs)

## ADDED Requirements

### Requirement: Componente DsTabs

El package SHALL exponer `DsTabs` (selector `ds-tabs`), contenedor del patrón tabs de ARIA APG que renderiza el `tablist` a partir de los `DsTab` proyectados (registración padre-hijo, mismo patrón que DsSelect/DsOption). SHALL soportar `value` (model two-way `string | null`), `variant` (`'underline' | 'pills' | 'contained'`, default `'underline'`) y `size` (`'sm' | 'md' | 'lg'`, default `'md'`). La activación SHALL ser **automática** (mover el foco selecciona) con **roving tabindex** (el tablist es un solo tab-stop). Sin `value` que matchee un tab habilitado, el primer tab habilitado SHALL quedar activo.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/tabs/`
- **THEN** existen `tabs.ts`, `tabs.html`, `tabs.css`, `tab.ts`, `tab.html`, `tab.css`, `tabs.spec.ts`, `tabs.stories.ts`, `index.ts`
- **AND** las classes se llaman `DsTabs` y `DsTab` con selectores `ds-tabs` y `ds-tab`

#### Scenario: two-way binding por value (CA-006.1)

- **GIVEN** `<ds-tabs [(value)]="active">` con tabs `'a'`/`'b'`/`'c'` y `active = signal<string | null>(null)`
- **WHEN** se renderiza sin valor inicial
- **THEN** el tab `'a'` SHALL estar activo (primer habilitado) y su panel visible
- **WHEN** el usuario clickea el tab `'b'`
- **THEN** `active()` SHALL ser `'b'` y solo su panel SHALL mostrarse
- **WHEN** el consumidor setea `'c'` programáticamente
- **THEN** el tab `'c'` SHALL quedar activo

#### Scenario: navegación por teclado con activación automática (CA-006.2)

- **GIVEN** el foco en un tab
- **WHEN** el usuario presiona `ArrowRight`/`ArrowLeft`
- **THEN** el foco **y la selección** SHALL moverse al tab habilitado siguiente/anterior, **con wrap** en los extremos y salteando disabled (a diferencia del combobox de DsSelect, que por APG no wrappea)
- **WHEN** presiona `Home`/`End`
- **THEN** el foco y la selección SHALL ir al primer/último tab habilitado

#### Scenario: roving tabindex — un solo tab-stop (CA-006.2)

- **WHEN** se inspecciona el tablist renderizado
- **THEN** solo el tab activo SHALL tener `tabindex="0"`; los demás `tabindex="-1"`
- **AND** cada panel SHALL tener `tabindex="0"` (el siguiente Tab desde el tab activo entra al contenido)

#### Scenario: patrón ARIA tabs (CA-006.3)

- **WHEN** se inspecciona el DOM renderizado
- **THEN** el strip SHALL tener `role="tablist"` y recibir el `aria-label`/`aria-labelledby` del consumidor reenviado desde el host (no queda inerte)
- **AND** cada botón SHALL tener `role="tab"`, `aria-selected` sincronizado y `aria-controls` hacia el id de su panel
- **AND** cada panel SHALL tener `role="tabpanel"` y `aria-labelledby` hacia el id de su tab

#### Scenario: variantes por tokens con contraste verificado (CA-006.5)

- **WHEN** se renderiza cada `variant` (`underline`, `pills`, `contained`)
- **THEN** cada una SHALL consumir exclusivamente sus tokens `component.tabs.*`
- **AND** los pares de contraste de los estados default/hover/activo de las 3 variantes SHALL cumplir AA calculados por script en los 4 themes

#### Scenario: estilos por tokens y reduced motion (CA-006.7)

- **WHEN** se inspecciona `tabs.css` y `tab.css`
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`; los sizes SHALL escalar por `component.tabs.size.*` (alineados a `{dimension.*}` en este change)
- **AND** toda transición SHALL tener su bloque `@media (prefers-reduced-motion: reduce)`

#### Scenario: foco visible (CA-006.8)

- **WHEN** el usuario enfoca un tab por teclado
- **THEN** SHALL mostrarse el indicador tokenizado (`--ds-semantic-shadow-focus`) sin `outline: none` desnudo

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/tabs';`
- **AND** un consumidor SHALL poder hacer `import { DsTabs, DsTab, type DsTabsVariant, type DsTabsSize } from '@romanmartinidev/components'`

### Requirement: Componente DsTab

El package SHALL exponer `DsTab` (selector `ds-tab`), hijo de un `DsTabs` ancestro. SHALL soportar `value` (input requerido string), `label` (input requerido string — el texto del botón del tablist) y `disabled` (input boolean, default false). El componente SHALL hostear su panel: contenido proyectado bajo `role="tabpanel"`, con `hidden` cuando no está activo.

#### Scenario: panel inactivo conserva el estado del DOM (CA-006.4)

- **GIVEN** un tab inactivo cuyo panel contiene un `<input>` con texto tipeado
- **WHEN** el usuario cambia a otro tab y vuelve
- **THEN** el panel SHALL haber permanecido en el DOM con `hidden` (no destruido)
- **AND** el texto tipeado SHALL seguir presente

#### Scenario: tab deshabilitado perceptible (CA-006.6)

- **GIVEN** un `<ds-tab [disabled]="true">`
- **WHEN** el usuario lo clickea o la navegación por teclado lo alcanza
- **THEN** SHALL NO activarse (la navegación lo saltea) y el valor del grupo SHALL NO cambiar
- **AND** su botón SHALL exponer `aria-disabled="true"` sin `disabled` nativo (rama botón de ADR-011: permanece perceptible)

#### Scenario: registración dinámica

- **GIVEN** un `<ds-tabs>` cuyos tabs se renderizan con `@for` sobre datos del consumidor
- **WHEN** se agrega o quita un tab del array
- **THEN** el tablist SHALL reflejarlo (registro/desregistro en OnInit/OnDestroy)
- **AND** si el tab activo desaparece, el activo efectivo SHALL volver al primer habilitado
