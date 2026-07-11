# Design — components-add-input

## Context

Séptimo componente del kit, segundo de la tanda 1 (D-009). A diferencia de Select (`aaa-016`), no hay overlay: la complejidad está en la **anatomía accesible del field** (asociaciones label/hint/error) y en derivar el estado invalid del NgControl sin ciclos de DI. Las decisiones de producto ya están tomadas en el refinamiento de HU-005 (2026-07-11); acá solo lo técnico.

## Goals / Non-Goals

**Goals:**

- Cumplir los 8 CAs de HU-005 como scenarios testables.
- Field completo con asociaciones accesibles garantizadas por construcción (el consumidor no puede romperlas).
- Cero dependencias nuevas.

**Non-Goals:**

- Textarea, máscaras, autocomplete, NumberField, sufijos interactivos (fuera de alcance de la HU).
- Extraer un `ds-field` compartido: abstracción prematura con un solo consumidor (mismo criterio que ADR-011 con la directiva de disabled).

## Decisions

### 1. Lectura del NgControl para el invalid automático: **`inject(NgControl, { optional: true, self: true })` sin proveer `NG_VALUE_ACCESSOR`**

El patrón usado hasta ahora (provider `NG_VALUE_ACCESSOR` + forwardRef) crea ciclo si el componente además inyecta `NgControl` (NgControl inyecta el CVA → el CVA inyecta NgControl). Solución estándar (la de Material): no proveer el token; inyectar `NgControl` opcional/self en el constructor y auto-asignarse — `this.ngControl.valueAccessor = this`. El estado invalid se lee de `ngControl.control` (`invalid && touched`) en un `computed`/getter que el template consulta; `[invalid]` del consumidor hace override cuando está seteado.

- Alternativa descartada — doble vía (proveer el token **y** inyectar con `@Optional`): funciona en casos simples pero deja dos mecanismos de registración y es la causa clásica de bugs con `formControlName` anidados.
- Consecuencia: `DsInput` sin forms sigue funcionando (`ngControl` es null; two-way `[(value)]` opera igual).

### 2. Asociaciones del field por ids generados

`inputId`, `hintId`, `errorId` con contador de módulo (mismo patrón que `headingId` de Modal y `optionId` de Select). `<label [for]="inputId">`; `aria-describedby` del input compone hint y/o error según qué esté visible (error presente → reemplaza al hint, CA-005.4); `aria-invalid` sincronizado. Si el consumidor no pasa `label`, acepta `aria-label` reenviado al `<input>` nativo (inputs con alias, mismo mecanismo que Select — lección del gate de `aaa-016`).

### 3. Slots pasivos sin lógica

`<ng-content select="[ds-input-prefix]" />` y `[ds-input-suffix]` dentro del wrapper visual del control (el borde envuelve prefix + input + suffix, como un input real). El contenido es responsabilidad del consumidor; el CSS del slot fuerza `pointer-events: none`… **no** — eso rompería tooltips futuros; en cambio, la story documenta que el contenido debe ser decorativo (`aria-hidden`) y el spec lo contractualiza. El foco visual (`:focus-within` en el wrapper) mantiene el ring alrededor de todo el field.

### 4. Estructura del template

`<label>` (condicional) + wrapper `.ds-input__control` (prefix + `<input>` + suffix) + `<p>` hint/error (condicional, `role` neutro — el error no usa `role="alert"` para no interrumpir; queda asociado por `aria-describedby`, y `aria-live="polite"` en el contenedor del error para anunciar su aparición).

## Risks / Trade-offs

- [`ngControl.control.touched` no es reactivo (no signal)] → el template lo lee vía getter en cada CD; con OnPush los eventos del propio input (blur/input) disparan CD suficiente. Si un caso real muestra staleness (touched seteado programáticamente desde afuera), se suma `markForCheck` puntual o se espera la API de signal forms — no se especula ahora.
- [Field completo menos composable que input pelado] → decisión de PO registrada en la HU; si aparece el caso real de composición libre, `ds-field` es una HU nueva.
- [`:focus-within` para el ring incluye foco en contenido del suffix] → aceptado: los slots son pasivos por contrato; si un futuro sufijo interactivo entra, se revisa con su HU.
