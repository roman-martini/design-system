# HU-013 — Accordion de contenido colapsable (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-20) — [`aaa-026 components-add-accordion`](../../../../openspec/changes/archive/aaa-026-components-add-accordion/) archivado; 11 tests, review con 1 hallazgo bajo aplicado (templateUrl), sin pares de contraste nuevos (gate verificado igual), sin ADR (grid `0fr→1fr` se promueve con el 2º colapsable, D-005). Verificación manual pendiente del PO: animación de altura (incluido colapso del padre con hijo expandido) y reduced-motion en playground `/accordion`
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que organiza contenido extenso en una página
**QUIERO** un `ds-accordion` accesible con secciones colapsables
**PARA** mantener escaneables páginas de settings, FAQs y detalles opcionales.

## Decisiones de refinamiento (PO, 2026-07-19)

1. **Expansión configurable, default single**: input `multiple` (default `false`). En single, abrir una sección cierra la que estaba abierta; con `multiple`, las secciones son independientes. La exclusividad es **por instancia** de accordion (no global).
2. **Base APG (heading + button + region), no `<details>/<summary>`**: cada header es un heading de nivel configurable que envuelve un `<button aria-expanded aria-controls>`; el panel expone `role="region"` + `aria-labelledby`. Se evaluó `<details>/<summary>` por el criterio plataforma-primero ([ADR-013](../../../architecture/adr/ADR-013-overlays-dialog-nativo.md)) y se descartó: un heading dentro de `<summary>` se aplana a button en la mayoría de los AT (se pierde la navegación por headings) y la animación de altura depende de `interpolate-size`/`::details-content` (aún no Baseline). A diferencia de los overlays, acá la plataforma no aporta focus trap ni top layer — el costo de la alternativa propia es un toggle trivial. Si el `design.md` del change consolida un patrón reutilizable de colapsables, se promueve a ADR al cerrar (regla 2 de [ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md)).
3. **Accordions anidados EN v1**: el PO acepta el costo explícitamente (prioriza completitud del patrón, mismo criterio que los submenús de HU-012). Consecuencias técnicas: registro de secciones **scoped a su instancia** (un accordion anidado no registra sus secciones en el padre — patrón de registro padre-hijo de DsSelect/DsMenu con inyección scoped), `headingLevel` por instancia para mantener jerarquía de headings coherente, y animación de altura que tolera un panel anidado cambiando de tamaño dentro de un panel animado.
4. **Disabled sin re-decidir**: sección disabled = header focusable + `aria-disabled="true"` + guarda que no expande ([ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md), rama botón de acción).

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-accordion). -->

- [x] **CA-013.1 (estructura accesible)** — Dado un `ds-accordion` con secciones proyectadas, entonces cada header es un heading de nivel configurable (`headingLevel`, default 3) que contiene un `<button>` con `aria-expanded` y `aria-controls` apuntando al panel, y cada panel expone `role="region"` + `aria-labelledby` referenciando su header.
- [x] **CA-013.2 (toggle)** — Dado un header habilitado, cuando se activa por click, Enter o Space, entonces su panel alterna entre expandido y colapsado y `aria-expanded` refleja el estado.
- [x] **CA-013.3 (single vs multi)** — Dado un accordion sin `multiple` (default), cuando se expande una sección con otra abierta, entonces la abierta se colapsa (exclusividad scoped a la instancia); dado `multiple`, entonces cada sección alterna de forma independiente.
- [x] **CA-013.4 (teclado entre headers)** — Dado el foco en un header, entonces ↑/↓ mueven el foco entre los headers **de la misma instancia** (con wrap) y Home/End saltan al primero/último; los headers de un accordion anidado no participan de la navegación del padre.
- [x] **CA-013.5 (disabled accesible)** — Dada una sección disabled, entonces su header es focusable, expone `aria-disabled="true"` y no expande ni colapsa al activarse (ADR-011).
- [x] **CA-013.6 (anidados)** — Dado un accordion dentro del panel de otro, entonces su exclusividad single/multi y su navegación por teclado operan de forma independiente del padre, y su `headingLevel` permite mantener la jerarquía de headings coherente.
- [x] **CA-013.7 (animación)** — Dada la expansión o colapso de un panel, entonces la transición de altura está animada con tokens de motion y se desactiva bajo `prefers-reduced-motion`; la animación no se rompe cuando un panel anidado cambia de tamaño dentro de un panel del padre.
- [x] **CA-013.8 (tokens)** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.accordion.*` nuevos + primitives/semantic existentes), sin valores hardcoded.
- [x] **CA-013.9 (showcase)** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-accordion` con: single (default), multi, sección disabled, accordion anidado y la referencia de teclado.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Disclosure standalone (un colapsable suelto sin grupo): si aparece el caso real, change propio reutilizando la base.
- Lazy rendering del contenido de paneles colapsados (D-005; el contenido proyectado se renderiza siempre).
- Drag & drop para reordenar secciones.

## Notas

- Change OpenSpec: `components-add-accordion` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: registro padre-hijo scoped de `select/` (aaa-016) y `menu/` (aaa-025); patrón de animación con reduced-motion de los overlays (ADR-014 regla 4, adaptado a altura).
