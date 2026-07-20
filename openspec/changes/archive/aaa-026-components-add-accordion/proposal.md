---
id: aaa-026
name: components-add-accordion
type: change
status: archived
archived: 2026-07-20
modifies-specs:
  - components-package (ADDED: DsAccordion, DsAccordionItem)
  - design-tokens-package (sin delta de spec; component.accordion nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
  - ADR-011
  - ADR-013
---

# Proposal — components-add-accordion

## Why

Segunda pieza de la **tanda 2** ([D-011](../../../docs/product/decisiones.md), criterio "navegación y estructura de apps reales"): páginas de settings, FAQs y detalles opcionales necesitan contenido colapsable, y los accordions caseros fallan siempre en lo mismo — headers que no son botones (invisibles al teclado), jerarquía de headings rota para screen readers, animaciones de altura que ignoran `prefers-reduced-motion`. [HU-013](../../../docs/product/epics/EP-002-kit-componentes/HU-013-accordion.md) fue refinada con el PO el 2026-07-19 (base APG heading+button+region, expansión configurable default single, **accordions anidados en v1** — costo aceptado explícitamente). Respalda la prioridad 1 del repo (buenas prácticas: patrón APG completo de serie).

## What Changes

- Nueva familia **`DsAccordion`** (naming ADR-007), primer componente de contenido colapsable del kit — **no es overlay** (sin Popover API ni top layer):
  - **`DsAccordion`** — contenedor que coordina la exclusividad: input `multiple` (default `false` = single, abrir una sección colapsa la abierta). La coordinación es **scoped a la instancia** (patrón de registro padre-hijo de DsSelect/DsMenu).
  - **`DsAccordionItem`** — sección declarativa proyectada: header = heading de nivel configurable (`headingLevel`, default 3) que envuelve un `<button aria-expanded aria-controls>`; panel `role="region"` + `aria-labelledby`. Disabled accesible por la rama "botón de acción" de ADR-011 (focusable + `aria-disabled` + guarda).
- **Teclado APG**: click/Enter/Space alternan la sección; ↑/↓ mueven el foco entre headers de la misma instancia (con wrap); Home/End saltan al primero/último.
- **Accordions anidados**: un accordion dentro del panel de otro opera con exclusividad, navegación de teclado y `headingLevel` independientes (el hijo no registra sus secciones en el padre); la animación de altura tolera un panel anidado cambiando de tamaño dentro de un panel del padre.
- **Animación de expansión/colapso** con tokens de motion y bloque `prefers-reduced-motion` obligatorio (regla vigente del kit, adaptada a transición de altura).
- Nuevos tokens **`component.accordion.*`** (header, panel, borde, estados) referenciando semantic/primitives; sin pares de contraste nuevos previstos (texto sobre superficies existentes) — el gate por script se corre igual.
- Showcase del playground (EP-006): página de `ds-accordion` con single (default), multi, sección disabled, accordion anidado y referencia de teclado.
- Changesets: **minor** de components (familia nueva) y **minor** de tokens (`component.accordion.*`). Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Accordion de contenido colapsable (DsAccordion)" — estructura APG heading+button+region, toggle, single/multi scoped, teclado entre headers, disabled accesible, anidados, animación reduced-motion y tokens, derivado 1:1 de los 9 CAs de HU-013.
- `design-tokens-package`: sin delta de spec — `component/accordion.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003).

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-19, decisiones en HU-013):

1. **`<details>/<summary>` nativo** — evaluado por el criterio plataforma-primero (ADR-013) y descartado: un heading dentro de `<summary>` se aplana a button en la mayoría de los AT (se pierde la navegación por headings) y la animación de altura depende de `interpolate-size`/`::details-content` (aún no Baseline). A diferencia de los overlays, acá la plataforma no aporta focus trap ni top layer — el costo del toggle propio es trivial.
2. **Solo single (sin `multiple`)** — descartado: el PO eligió configurable con default single; el costo de la exclusividad opcional es bajo y cubre páginas de detalle donde se comparan secciones.
3. **Dejar anidados fuera de v1** — recomendación técnica descartada por el PO: acepta el costo explícitamente (prioriza el patrón completo, mismo criterio que los submenús de HU-012). Consecuencia asumida: registro scoped por instancia y animación anidada testeada.
4. **API de datos `[sections]`** — descartada por convención del kit: rompe el patrón declarativo (DsSelect/DsOption, DsMenu/DsMenuItem) y limita contenido rico en headers y paneles.

## Impact

- **Código**: `packages/components/src/lib/accordion/` (contenedor + item, css, spec, stories), `public-api.ts`, `packages/tokens/src/component/accordion.json` (nuevo), página del showcase en playground.
- **Dependencias**: ninguna nueva (sin Popover API, sin CDK; toggle y coordinación propios mínimos).
- **Clasificación** (workflow add-component): componente de **contenido, no overlay** → ADR-013/ADR-014 no aplican como mecanismo (solo la regla de animación reduced-motion como convención); headers = **controles de acción** → ADR-011 rama `aria-disabled` + guarda. Sin CVA (no es form control). Sin iconos propios en v1 (el chevron es SVG decorativo propio o Lucide por proyección — se decide en design).
- **ADR candidato**: si el `design.md` consolida un patrón reutilizable de colapsables animados (transición de altura + reduced-motion aplicable a futuros Disclosure/Tree), se evalúa promover a ADR al archivar — no se decide en silencio.
