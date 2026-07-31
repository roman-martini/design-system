# component-modal — delta de a11y-testing-gates

## MODIFIED Requirements

### Requirement: Componente DsModal

El package SHALL exponer `DsModal` (selector `ds-modal`), el primer componente overlay del kit, implementado sobre el elemento `<dialog>` nativo con `showModal()` (top layer, focus trap, fondo inerte y restauración de foco provistos por la plataforma — ADR-013). Sigue ADR-004/ADR-007/ADR-010 (arquitectura y naming), ADR-012 (iconografía del botón de cierre) y el patrón de overlay de tokens de aaa-009. SHALL soportar `open` (model two-way boolean), `size` (`'sm' | 'md' | 'lg' | 'xl'`, default `'md'`), `heading` (input string para el título accesible), `closeLabel` (input string, default "Cerrar"), `closeOnEscape` (input boolean, default `true`), `closeOnOverlay` (input boolean, default `true`), slot default para el cuerpo y slot `[ds-modal-footer]` para acciones.

#### Scenario: backdrop con tokens de overlay

- **WHEN** se inspecciona el estilo del `::backdrop`
- **THEN** el fondo SHALL ser `var(--ds-component-modal-overlay-bg)`, que resuelve a `{semantic.color.bg.overlay}`
- **AND** SHALL aplicar `backdrop-filter: blur(var(--ds-semantic-effect-blur-overlay))`

> **Corregido en `aaa-042`**: el scenario decía que el fondo SHALL ser `var(--ds-semantic-color-bg-overlay)` **directamente**. La implementación usa el token de componente `--ds-component-modal-overlay-bg`, que resuelve a ese semantic — y hacerlo así es lo que exige la jerarquía de `design-tokens-package` (un componente consume tokens `component.*`; saltar al nivel `semantic` sería el bypass que el gate de jerarquía de `aaa-041` marca como violación). El drift se descubrió al escribir el test que este scenario nunca tuvo (`testing-05`): la implementación estaba bien y la spec la describía mal.
