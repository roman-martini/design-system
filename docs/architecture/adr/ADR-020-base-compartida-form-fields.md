# ADR-020 — Base compartida `DsFieldBase` para form fields

- **Fecha**: 2026-07-26
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-004](ADR-004-arquitectura-components.md) (arquitectura de components), [ADR-011](ADR-011-estado-disabled-accesible.md) (disabled nativo en form controls)
- **Decisiones de producto**: [D-017](../../product/decisiones.md) (kit grado profesional, cero medias tintas)

## Contexto

`DsInput` (aaa-017) nació como un _field_ completo: label, hint, error con estado automático (`invalid + touched`), `ControlValueAccessor`, IDs de a11y y `aria-describedby`. Al sumar `DsTextarea` (HU-024, aaa-036) apareció el primer segundo miembro de la familia: un `<textarea>` comparte **todo** ese wrapper y solo cambia el control nativo. Vienen más (`DsSelect` field-style, date/number inputs, etc.). Duplicar la lógica de field en cada uno viola D-017 (dos puntos de mantenimiento y de deriva); la pregunta es **cómo** compartirla.

## Opciones consideradas

### Opción A — `multiline` en `DsInput`

Un input booleano que renderiza `<textarea>` en vez de `<input>` dentro del mismo componente.

- **Pros**: máximo DRY (un solo componente); sin refactor.
- **Contras**: API semánticamente confusa (`<ds-input multiline>` — un textarea no es un input); sobrecarga la identidad del componente; cada nuevo field agrandaría el condicional. No escala a la familia.

### Opción B — `DsTextarea` autónomo (duplicación)

Copiar el wrapper (label/hint/error/CVA/IDs) en cada nuevo field.

- **Pros**: componentes independientes, sin acoplamiento; cero riesgo de regresión en Input.
- **Contras**: viola D-017 — N copias de la misma lógica de a11y y validación que derivan con el tiempo; cada fix de field hay que replicarlo a mano.

### Opción C — Base compartida `DsFieldBase` por herencia (elegida)

`@Directive()` **abstracto y sin selector** con toda la lógica de field; `DsInput` y `DsTextarea` lo extienden y solo aportan su control nativo y sus inputs específicos.

- **Pros**: cero duplicación; API pública limpia por componente (`<ds-input>`, `<ds-textarea>`); patrón listo para futuros fields; Angular hereda `input()`/`model()`/host de una base decorada.
- **Contras**: refactor interno de `DsInput` publicado (mitigado: API intacta, su suite queda como red de no-regresión); herencia en vez de composición (ver abajo).

#### Sub-decisión: herencia vs `hostDirectives`

Se evaluó compartir por **composición** (`hostDirectives`) y se **descartó** para este caso: los `input()`/`model()` deben declararse en la clase cuyo template los usa, y las plantillas de `DsInput`/`DsTextarea` llaman directo a métodos `protected` de la base (`isInvalid()`, `describedBy()`, `onInput()`); con `hostDirectives` habría que reinyectar la directiva y reenviar cada input y método — más ceremonia sin beneficio. La herencia de una base `@Directive()` abstracta es el patrón soportado por Angular exactamente para esto. La excepción al default "composición sobre herencia" queda registrada acá para que el próximo field no reabra la pregunta.

## Decisión

Se adopta la **Opción C**. Reglas para la familia de form fields:

1. **Todo form field del kit extiende `DsFieldBase`** (`packages/components/src/lib/field/field-base.ts`): models `value`/`disabled`, inputs `label`/`hint`/`error`/`placeholder`/`invalid`/`size` (`DsFieldSize`), aliases `aria-label`/`aria-labelledby`, IDs `fieldId`/`hintId`/`errorId`, `isInvalid`/`showError`/`describedBy`, `onInput`/`onBlur`.
2. **CVA por auto-registración**: la base inyecta `NgControl` `{ optional, self }` y se asigna `valueAccessor` en el constructor (evita el ciclo de DI de `NG_VALUE_ACCESSOR`); `self` corre en el injector del componente derivado, así que funciona para cualquier heredero sin duplicar.
3. **Reactividad de estado del control vía `AbstractControl.events`**: `touched`/`invalid` del `NgControl` no son signals; bajo OnPush un cambio externo (p. ej. `form.markAllAsTouched()` en un submit) dejaría la vista stale. La base se suscribe en `ngOnInit` a `control.events` (Angular 18+) con `takeUntilDestroyed` y hace `markForCheck`. Esto **resuelve** el trade-off que aaa-017 había aceptado como diferido, y lo resuelve una sola vez para toda la familia. Cubierto por test (`textarea.spec.ts` › "markAsTouched externo…").
4. **CSS compartido** en `lib/field/field.css` (clases `.ds-field__*`), consumido por cada field vía `styleUrls: ['../field/field.css', './<control>.css']`; el stylesheet propio aporta solo lo específico del control (Input: `height` por size; Textarea: `min-height`/`padding-y`/`resize`).
5. **Tokens del wrapper = `component.input.*`** — deuda de naming **declarada**: renombrarlos a `component.field.*` sería breaking para consumidores de CSS vars y se difiere a una major; los tokens específicos de cada control viven en `component.<name>.*`.
6. **`DsFieldBase` es interna**: no se exporta en `public-api.ts` ni tiene spec propia — el contrato público son los componentes; la base es infraestructura. Cada heredero re-expone su alias de size (`DsInputSize`, `DsTextareaSize`) para paridad de API.

Criterios contra las prioridades del repo: (1) **buenas prácticas** — patrón de base decorada soportado por Angular, CVA sin ciclos, reactividad correcta bajo OnPush; (2) **escalar ordenado** — sumar un field = extender la base + control nativo + tokens propios; (3) **mantenibilidad** — un solo punto de verdad para a11y/validación de fields.

## Consecuencias

### Positivas

- Cero duplicación de la lógica de field; los fixes de a11y/CVA se hacen una vez y valen para toda la familia.
- El fix de staleness OnPush (regla 3) aplica retroactivamente a `DsInput` y automáticamente a todo field futuro.
- Camino claro para `DsSelect` field-style, date/number inputs: extender la base sin rediscutir el patrón.

### Negativas / trade-offs aceptados

- **Acoplamiento por herencia**: un cambio en la base impacta a todos los herederos — mitigado porque la base es interna (refactorizable sin breaking) y cada heredero conserva su suite como red de no-regresión.
- **Tokens del wrapper bajo el nombre `input`** (regla 5): deuda de naming declarada, se paga en una major futura si se justifica.
- Las clases internas `.ds-input__*` pasaron a `.ds-field__*` — sin contrato público (pre-1.0), pero los tests que consultaban por clase actualizaron sus selectores (cero aserciones tocadas).

### Acciones de seguimiento

- `DsTextarea` (aaa-036) es la primera implementación de referencia del patrón junto al refactor de `DsInput`.
- Todo form field futuro cita este ADR en su change y extiende `DsFieldBase`; si un field no puede usar la base (caso genuinamente distinto), lo justifica en su `design.md`.
