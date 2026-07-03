## ADDED Requirements

### Requirement: Estado disabled accesible del ds-button

El `ds-button` (botón de acción) SHALL implementar su estado deshabilitado con **`aria-disabled`** en lugar del atributo `disabled` nativo, de modo que el control **permanezca en el tab order y sea anunciado** por lectores de pantalla como no disponible (en vez de desaparecer silenciosamente). La activación SHALL bloquearse por una guarda en el manejador de click. El componente SHALL exponer un input `disabledReason` (string, default vacío) que, cuando el botón está deshabilitado, comunica **por qué** vía un texto visible asociado con `aria-describedby`.

Los form controls (`ds-checkbox`, `ds-radio`) mantienen su `disabled` nativo — semánticamente correcto en un `<input>` y anunciado en el contexto del formulario. La justificación del patrón diferenciado (acción vs. form control) vive en el ADR de este change.

#### Scenario: el botón deshabilitado permanece focuseable

- **WHEN** se renderiza `<ds-button [disabled]="true">`
- **THEN** el `<button>` SHALL NO tener el atributo `disabled` nativo
- **AND** SHALL NO tener `tabindex="-1"`
- **AND** SHALL poder recibir foco por teclado (no sale del tab order)

#### Scenario: expone aria-disabled según el estado

- **GIVEN** `<ds-button [disabled]="true">`
- **THEN** el `<button>` SHALL tener `aria-disabled="true"`
- **WHEN** el input `disabled` es `false`
- **THEN** el `<button>` SHALL NO tener el atributo `aria-disabled`

#### Scenario: no activa la acción cuando está deshabilitado

- **GIVEN** `<ds-button [disabled]="true" (clicked)="handle()">`
- **WHEN** el usuario hace click (o presiona Enter/Space, que en un `<button>` disparan un click)
- **THEN** el output `clicked` SHALL NO emitir (guarda en el manejador de click)

#### Scenario: activa la acción cuando está habilitado

- **GIVEN** `<ds-button (clicked)="handle()">` sin `disabled`
- **WHEN** el usuario hace click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

#### Scenario: disabledReason se anuncia y es visible

- **GIVEN** `<ds-button [disabled]="true" disabledReason="Completá los campos requeridos">`
- **WHEN** se renderiza
- **THEN** SHALL existir un elemento que muestra el texto "Completá los campos requeridos"
- **AND** el `<button>` SHALL referenciar ese elemento vía `aria-describedby`
- **AND** el texto SHALL ser visible (no oculto solo para lectores de pantalla) — el usuario vidente con teclado también recibe el motivo

#### Scenario: sin motivo o habilitado no hay describedby

- **WHEN** el botón está deshabilitado pero `disabledReason` está vacío
- **THEN** el `<button>` SHALL NO tener `aria-describedby` apuntando a un motivo
- **AND** NO SHALL renderizarse el elemento del motivo
- **WHEN** el botón está habilitado aunque tenga `disabledReason`
- **THEN** tampoco SHALL renderizarse el motivo ni el `aria-describedby`

#### Scenario: los estilos de disabled se aplican vía atributo aria

- **WHEN** el botón está deshabilitado
- **THEN** los estilos del estado (opacity atenuada, `cursor: not-allowed`) SHALL aplicarse mediante el selector `[aria-disabled="true"]`
- **AND** los estados hover/active SHALL excluirse con `:not([aria-disabled="true"])` en vez de `:not(:disabled)`
