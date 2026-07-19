# Delta — playground-app (playground-showcase)

## REMOVED Requirements

### Requirement: Single page sin routing

**Razón**: contrato de la Fase 4 (simplicidad inicial, ADR-005) superado — con 11 entregables la página única no escala. Lo reemplaza el requirement "Showcase navegable por componente".

### Requirement: Demo del Button en la app

**Razón**: la demo del Button en el template raíz era el criterio mínimo de la Fase 4. Las demos por componente ahora viven en las vistas del showcase (requirement nuevo, que exige como mínimo los casos de uso existentes de cada entregable).

## ADDED Requirements

### Requirement: Showcase navegable por componente

El playground SHALL ser un **showcase**: un shell con sidebar de navegación y una vista por entregable del kit, sobre Angular Router con **una ruta lazy por componente** (`/<slug>`). Un registro único tipado (componente → slug → label → import lazy) SHALL alimentar rutas y sidebar (sin divergencia posible). La ruta vacía y las rutas desconocidas SHALL redirigir a un destino válido. Cada vista SHALL mostrar los casos de uso del componente **renderizados y funcionales** (como mínimo los que existían en la página única) y cada caso SHALL exponer su **snippet de código con botón de copiar**. El shell y las vistas SHALL consumir tokens `--ds-*` (sin valores hardcoded) y componentes del DS donde aplique. La página monolítica anterior SHALL NO existir. El modo zoneless SHALL mantenerse.

#### Scenario: sidebar navega sin recarga (CA-011.1)

- **GIVEN** el playground abierto
- **THEN** un sidebar SHALL listar los 11 entregables del kit
- **WHEN** se selecciona uno
- **THEN** SHALL navegarse a su vista vía router (sin recarga completa)

#### Scenario: deep link y ruta desconocida (CA-011.2)

- **WHEN** se abre directamente `/<slug>` de un componente (ej. `/select`)
- **THEN** SHALL renderizarse la vista de ese componente (ruta lazy)
- **WHEN** se abre una ruta desconocida
- **THEN** SHALL redirigirse a un destino válido (sin pantalla rota)

#### Scenario: casos de uso por vista (CA-011.3, CA-011.5)

- **WHEN** se recorre cada una de las vistas del showcase
- **THEN** cada entregable del kit SHALL tener su vista con sus casos de uso renderizados y funcionales (mínimo: los de la página única previa)
- **AND** el template monolítico anterior SHALL NO existir en el código

#### Scenario: snippet copiable (CA-011.4)

- **GIVEN** un caso de uso en una vista
- **THEN** SHALL mostrar su snippet de código
- **WHEN** el usuario activa el botón de copiar
- **THEN** el snippet SHALL quedar en el clipboard (con feedback al usuario)

#### Scenario: el showcase consume el DS (CA-011.6)

- **WHEN** se inspecciona el CSS del shell, del sidebar y del componente de caso de uso
- **THEN** los valores visuales SHALL referenciarse vía `var(--ds-*)`
- **AND** las piezas interactivas SHALL usar componentes del kit donde aplique (ej. botón de copiar, feedback por toast)

#### Scenario: a11y de la navegación (CA-011.7)

- **WHEN** se inspecciona el sidebar
- **THEN** SHALL ser un `<nav>` con nombre accesible
- **AND** SHALL ser operable por teclado con foco visible
- **AND** el item de la vista activa SHALL exponer `aria-current="page"`

#### Scenario: tests de navegación (CA-011.8)

- **WHEN** se ejecuta `pnpm -F playground test`
- **THEN** la suite SHALL cubrir el render de vistas según la ruta y la redirección de rutas desconocidas
- **AND** SHALL retornar exit 0
