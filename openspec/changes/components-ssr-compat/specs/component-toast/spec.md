## ADDED Requirements

### Requirement: show() es seguro en server

`DsToastService.show()` y sus atajos (`success`/`info`/`warning`/`danger`) SHALL poder invocarse durante el server render sin lanzar excepción y sin tocar el documento. En server la llamada SHALL ser un no-op que devuelve una referencia cuyo `dismiss()` también es inofensivo: un toast es feedback transitorio de una interacción, y en server todavía no hay usuario interactuando — no se serializa al HTML. El comportamiento en navegador (stack, anuncio, auto-dismiss) no cambia.

#### Scenario: show() durante el server render

- **GIVEN** una app SSR que inyecta `DsToastService` y llama `show({ message: 'Hola', variant: 'info' })` mientras se renderiza en server
- **WHEN** se ejecuta el server render
- **THEN** el render SHALL completar sin excepción
- **AND** la llamada SHALL devolver una referencia con `dismiss()` invocable sin efecto
- **AND** el HTML serializado NO SHALL contener el toast ni su contenedor

#### Scenario: la misma app anuncia toasts con normalidad en el cliente

- **GIVEN** la app del escenario anterior ya hidratada en un navegador
- **WHEN** el usuario dispara un toast
- **THEN** el toast SHALL aparecer en el stack y anunciarse según su variante, exactamente como en una app client-side
