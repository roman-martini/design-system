# ci-cd-pipeline — delta de ci-bundle-size-budget

## ADDED Requirements

### Requirement: Presupuesto de tamaño de bundle en cada PR

El repo SHALL declarar un presupuesto de tamaño para **cada entrypoint publicable** de los packages publicables, invocable como `pnpm size` y ejecutable en local con el mismo comando que corre CI.

Cada entrada del presupuesto SHALL declarar el path del artefacto dentro del `dist`, un **límite explícito** y la **unidad de compresión** que se le aplica (gzip). Un entrypoint declarado en el `exports` del package sin entrada en el presupuesto NO satisface este requirement: un entrypoint sin techo es una vía de escape.

Los límites SHALL fijarse a partir del peso **medido** sobre el `dist` construido, con un margen declarado, y NO SHALL fijarse en un valor aspiracional ni inventado. El margen SHALL quedar **por debajo del costo típico de la unidad de crecimiento del package** —para `components`, un componente—, de modo que el gate no pueda absorber un crecimiento entero en silencio.

El límite SHALL comportarse como techo: moverlo SHALL requerir decisión explícita del product owner, con la razón registrada en el PR que lo mueve.

El workflow `pr.yml` SHALL ejecutar el presupuesto como step **bloqueante**, posterior al build recursivo, de modo que mida el `dist` producido por ese mismo PR y no un artefacto previo ni el código fuente. Exceder un límite SHALL terminar el step con exit code distinto de 0; emitir una advertencia sin fallar NO satisface este requirement.

La salida del fallo SHALL identificar **qué entrypoint** excedió, **cuánto pesa** y **cuál es su límite**, sin obligar a reproducir la medición localmente para entender la causa.

La salida del fallo SHALL exponer además **la política para tratar el exceso** — que cuando el peso extra corresponde a algo que se quiso agregar, la acción correcta es subir el techo y registrar cuánto pesó. Dejar como única guía el mensaje genérico de la herramienta, que sugiere reducir el tamaño, NO satisface este requirement: la política quedaría solo en la documentación y no a la vista de quien lee el job en rojo. Ese mensaje NO SHALL emitirse cuando el step que falló es otro.

La medición SHALL fallar cuando el artefacto a medir no existe. Reportar tamaño cero —o pasar en verde— ante un `dist` ausente o un path que no resuelve NO satisface este requirement.

El flujo de alta de un componente SHALL correr la medición **antes de abrir el PR** y ajustar el techo si corresponde, de modo que el caso previsto —un componente nuevo excede el presupuesto— no llegue a CI como sorpresa. Un gate que se pone rojo de forma rutinaria por crecimiento esperado degrada a trámite y deja de señalar el crecimiento accidental, que es lo que este requirement existe para detectar.

La política vigente del presupuesto SHALL estar documentada en `CONTRIBUTING.md`.

#### Scenario: un import que engorda el bundle falla el PR

- **GIVEN** un PR que agrega código al `public-api.ts` de `@romanmartinidev/components` y empuja el entrypoint principal por encima de su límite
- **WHEN** corre el step de presupuesto de tamaño
- **THEN** el step SHALL terminar con exit code distinto de 0
- **AND** la salida SHALL nombrar el entrypoint excedido, su peso medido y su límite
- **AND** el PR NO SHALL poder mergearse

#### Scenario: crecimiento de tokens también queda cubierto

- **GIVEN** un PR que agrega tokens a `@romanmartinidev/tokens` y empuja el CSS emitido por encima de su límite
- **WHEN** corre el step de presupuesto de tamaño
- **THEN** el step SHALL fallar señalando la salida excedida
- **AND** SHALL cubrir tanto la hoja CSS como el módulo JS, que son dos salidas del mismo build

#### Scenario: peso dentro del presupuesto pasa

- **GIVEN** un PR cuyos entrypoints se mantienen todos por debajo de sus límites
- **WHEN** corre el step de presupuesto de tamaño
- **THEN** el step SHALL terminar con exit code 0

#### Scenario: artefacto ausente no da verde falso

- **GIVEN** una configuración de presupuesto cuyo path no resuelve a ningún archivo — porque el `dist` no se construyó o el artefacto se renombró
- **WHEN** corre la medición
- **THEN** SHALL fallar con exit code distinto de 0 informando que no encuentra el archivo
- **AND** NO SHALL reportar tamaño cero ni pasar en verde

#### Scenario: el fallo expone la política, no solo el número

- **GIVEN** un PR cuyo entrypoint excede su techo
- **WHEN** se lee el job en rojo
- **THEN** la salida SHALL indicar que subir el techo es la acción correcta cuando el peso extra es deliberado
- **AND** SHALL distinguir ese caso del crecimiento accidental, que es el que exige investigar
- **AND** ese mensaje NO SHALL aparecer cuando el step que falló es otro

#### Scenario: un componente nuevo no llega a CI en rojo por sorpresa

- **GIVEN** el flujo de alta de un componente al kit
- **WHEN** se inspecciona su validación de cierre
- **THEN** SHALL incluir la medición del presupuesto antes de proponer el commit
- **AND** SHALL instruir a subir el techo al peso medido, no a recortar el componente

#### Scenario: el presupuesto mide el artefacto del propio PR

- **GIVEN** el workflow `pr.yml`
- **WHEN** se inspecciona el orden de sus steps
- **THEN** el step de presupuesto SHALL ubicarse después de `pnpm -r build`
- **AND** el número medido SHALL corresponder al `dist` construido en esa corrida
