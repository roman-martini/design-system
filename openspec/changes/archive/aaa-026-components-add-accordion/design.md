# Design — components-add-accordion (aaa-026)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Segunda pieza de la tanda 2 (D-011). HU-013 refinada (PO 2026-07-19) fija: base APG heading+button+region (se evaluó y descartó `<details>/<summary>`), expansión configurable default single, **accordions anidados en v1** (costo aceptado), disabled por ADR-011. Clasificación: componente de **contenido**, no overlay — ADR-013/ADR-014 no aplican como mecanismo; el reto técnico es la **animación de altura** (auto → 0) tolerante a anidados y el registro scoped por instancia.

## Goals / Non-Goals

**Goals:**

- Patrón APG _accordion_ completo: heading real para AT, toggle por button, teclado entre headers, single/multi por instancia.
- Anidados sin código especial: la exclusividad, la navegación y el `headingLevel` de cada instancia son independientes por construcción (inyección jerárquica), no por casuística.
- Animación de expansión/colapso 100% CSS con `prefers-reduced-motion`.

**Non-Goals:**

- Disclosure standalone, lazy rendering de paneles y drag & drop (fuera de alcance de HU-013).
- Generalizar la animación de altura a un patrón compartido: se extrae solo si un segundo colapsable la repite (D-005).

## Decisions

### 1. API pública

```ts
// public-api.ts
DsAccordion; // selector ds-accordion; inputs: multiple (default false), headingLevel (default 3)
DsAccordionItem; // selector ds-accordion-item; model: expanded (default false); input: disabled (default false)
```

- **Header por proyección única**: `<ng-content select="[dsAccordionHeader]" />` dentro del button (contenido rico sin API paralela — una sola vía, mantenibilidad); el resto de la proyección es el contenido del panel. Sin input `label` duplicado.
- **`expanded` como `model()` two-way** por item (precedente `[(open)]` de DsModal, regla 1 de ADR-013 adaptada): el estado nunca diverge del consumidor y la apertura programática viene gratis. La exclusividad single la ejecuta el contenedor escribiendo el model de los hermanos.
- **`headingLevel` en el contenedor** (no por item): todos los headers de una instancia comparten nivel — jerarquía de headings coherente por diseño; un accordion anidado declara el suyo.

### 2. Registro scoped por instancia (anidados gratis)

- Mismo patrón anti-ciclo del kit: interfaz `DsAccordionItemRegistration` en `accordion.ts` + `inject(DsAccordion)` en el item — la inyección jerárquica resuelve **el contenedor más cercano**, así un item anidado se registra en su propio accordion y nunca en el del padre (sin `descendants`, sin filtrado manual). Precedentes: `DsTabRegistration` (tabs), `DsMenuItemRegistration` (aaa-025).
- ↑/↓ (con wrap) y Home/End navegan la lista registrada de la instancia — los headers anidados quedan fuera de la navegación del padre por el mismo scoping. Ids únicos para `aria-controls`/`aria-labelledby` con contador a nivel módulo (patrón `nextUniqueId` de radio-group).

### 3. Heading con `role="heading"` + `aria-level` (no `<h2>`…`<h6>` con switch)

- El wrapper del header es `<div role="heading" [attr.aria-level]="headingLevel()">` conteniendo el `<button aria-expanded aria-controls>`. Equivalente para AT al heading nativo y evita quintuplicar el template con `@switch` por nivel — menos ramas, un solo punto de verdad.
- Descartado `<details>/<summary>` (refinamiento): `<summary>` aplana el heading a button en la mayoría de los AT y su animación depende de `interpolate-size` (no Baseline). Registrado en proposal §Alternativas.

### 4. Animación de altura con CSS Grid `0fr → 1fr` (sin JS de medición)

- El panel es un grid de una fila: colapsado `grid-template-rows: 0fr`, expandido `1fr`, con `transition` sobre `grid-template-rows`. El wrapper interno lleva `min-height: 0; overflow: hidden`. La técnica anima height auto **sin medir con JS** y tolera contenido dinámico — incluido un accordion anidado expandiéndose dentro del panel del padre (el track `fr` sigue al contenido).
- Contenido colapsado invisible **también para AT y tab order**: `visibility: hidden` en el wrapper interno cuando colapsa (transicionada de forma discreta para que se oculte al terminar la animación de salida) — sin `display: none`, que mataría la transición.
- `prefers-reduced-motion`: transición desactivada, el cambio es instantáneo (regla vigente del kit).
- **Descartados**: medición JS de `scrollHeight` + `ResizeObserver` (frágil con anidados, reimplementa lo que el grid da) e `interpolate-size: allow-keywords` (no Baseline; puede adoptarse en el futuro como progressive enhancement sin cambiar API).
- jsdom no computa layout: la animación no se testea; se testean estado, ARIA y visibilidad lógica. Verificación visual manual del PO en playground (mismo límite declarado que aaa-016/aaa-023/aaa-025).

### 5. Disabled y chevron

- **Disabled**: rama "botón de acción" de ADR-011 — header focusable, `aria-disabled="true"`, guarda en la activación (no expande/colapsa). La navegación ↑/↓ **no** saltea headers disabled (descubribilidad).
- **Chevron**: import estático `LucideChevronDown` en `DsAccordionItem` (mismo caso que el chevron de DsSelect, ADR-012 §1), decorativo (`aria-hidden`), rotación por CSS según estado con la misma transición tokenizada (y desactivada bajo reduced-motion).

### 6. Tokens `component.accordion.*`

Lenguaje visual de superficie plana (no elevada — no es overlay):

| Grupo  | Tokens                                                                                      | Referencia                                                                |
| ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| header | min-height, padding-x, padding-y, font-size, font-weight, text, bg-hover, gap, chevron-size | semantic de texto/superficie existentes + `{dimension.*}`                 |
| panel  | padding-x, padding-y, text                                                                  | mismos semantic de texto secundario que usan card/tabs                    |
| borde  | color, width, radius, divider entre secciones                                               | `{semantic.color.border.default}`, `{semantic.radius.*}`                  |
| motion | duration, easing                                                                            | primitives de motion existentes (los que consumen los overlays), sin raws |

- Sin pares de contraste nuevos previstos (texto sobre superficies ya verificadas); el gate por script se corre igual y, si algo falla, se trata como D-008 (decisión del PO, no silenciosa).

## Risks / Trade-offs

- [`transition` de `grid-template-rows` sin soporte en engines viejos] → degrada a snap sin animación (progressive enhancement, funcionalidad intacta — mismo criterio que ADR-013 con `@starting-style`).
- [`role="heading"` en div vs heading nativo: outline de documento HTML plano] → aceptado: la navegación por headings de AT (el caso que motivó descartar `<details>`) funciona igual con `aria-level`; si un consumidor necesita headings nativos se reevalúa con caso real (D-005).
- [Animación anidada: colapso del padre mientras el hijo anima] → el grid del padre sigue a su contenido, no hay alturas cacheadas que invalidar; se cubre con demo anidada en el showcase para la verificación visual.
- [Doble vía de colapso en single (model del consumidor + exclusividad del padre) puede ciclar] → la exclusividad solo escribe `expanded=false` en hermanos ya expandidos (idempotente, sin rebote); se testea el escenario de dos items con models controlados.

## Open Questions

(ninguna — el refinamiento de HU-013 cerró todas las decisiones de producto; las técnicas quedan resueltas arriba)
