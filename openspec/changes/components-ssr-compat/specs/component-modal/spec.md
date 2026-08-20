## ADDED Requirements

### Requirement: Render del modal en server

`DsModal` SHALL renderizar en la plataforma server sin lanzar excepción, cualquiera sea el valor de `open`. Durante el server render el modal NO SHALL invocar las APIs imperativas del `<dialog>` (`showModal()`/`close()`) ni modificar el scroll del documento: esas son responsabilidades del navegador. Un modal con `open=true` serializado en server SHALL abrirse como diálogo modal (top layer, focus trap, scroll lock) en el cliente, cuando la hidratación ejecute su sincronización.

#### Scenario: modal abierto durante server render

- **GIVEN** una app SSR que renderiza `<ds-modal [open]="true">` en su página inicial
- **WHEN** se ejecuta el server render
- **THEN** el render SHALL completar sin excepción y el HTML SHALL contener el contenido del modal
- **AND** el server render NO SHALL dejar rastro de scroll lock en el HTML serializado (el `style` del `<body>` queda intacto)

#### Scenario: el modal abierto se materializa al hidratar

- **GIVEN** el HTML serializado del escenario anterior hidratándose en un navegador
- **WHEN** la app cliente arranca con `open=true`
- **THEN** el modal SHALL mostrarse como diálogo modal (`showModal()`) con el scroll del body lockeado
- **AND** el comportamiento posterior (ESC, backdrop, cierre por model) SHALL ser idéntico al de una app client-side
