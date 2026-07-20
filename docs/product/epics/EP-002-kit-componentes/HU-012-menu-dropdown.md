# HU-012 — Menu/Dropdown de acciones (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-19) — [`aaa-025 components-add-menu`](../../../../openspec/changes/archive/aaa-025-components-add-menu/) archivado; 19 tests, review con 2 hallazgos aplicados (Tab + visibilidad), pares danger AA vía [D-012](../../decisiones.md), genera [ADR-016](../../../architecture/adr/ADR-016-posicionamiento-placements-por-overlay.md). Verificación manual pendiente del PO: árbol de submenús (lateral, flip, hover intent), light-dismiss y reduced-motion en playground
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que construye interfaces con acciones contextuales
**QUIERO** un `ds-menu` accesible disparado desde un botón
**PARA** agrupar acciones secundarias (editar, duplicar, eliminar) sin saturar la UI principal.

## Decisiones de refinamiento (PO, 2026-07-19)

1. **Trigger por directiva**: `[dsMenuTriggerFor]` aplicable a cualquier botón (DsButton, icon button o botón nativo) + panel `ds-menu` separado. La directiva cablea `aria-haspopup="menu"` y `aria-expanded` en el trigger. Se descartó el trigger embebido (duplicaría estilos de botón y limitaría el caso típico del botón kebab).
2. **Items declarativos proyectados**: `ds-menu-item` hijos con content projection y registro en el padre — mismo patrón que DsSelect/DsOption (aaa-016). Sin API de datos `[items]`.
3. **Capacidades v1 completas**: icono opcional por item (convención [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md), decorativo), separador de grupos, **variante danger** por item (introduce par de contraste nuevo al gate a11y) y **typeahead por carácter**. El PO prioriza una v1 robusta del patrón completo.
4. **Submenús anidados EN v1**: el PO acepta el costo explícitamente (prioriza completitud del patrón). Items con submenú (`aria-haspopup="menu"`), panel lateral anidado. **Consecuencia técnica**: el posicionamiento lateral excede el fallback mínimo de [ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md) ("debajo, mismo ancho, flip vertical") — el `design.md` del change decide entre extender el posicionamiento propio o reevaluar `@floating-ui/dom`; si cambia el patrón, se promueve a ADR al cerrar (regla 2 de ADR-014).
5. **Context menu (click derecho) fuera de v1**: otro patrón de invocación (anclaje al puntero, supresión del menú nativo, retorno de foco sin trigger). Si aparece el caso real, entra como change propio reutilizando el panel.
6. **Disabled items sin re-decidir**: rama "botón de acción" de [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md) — focusable + `aria-disabled` + guarda, para descubribilidad por teclado/screen reader.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-menu). -->

- [x] **CA-012.1 (apertura)** — Dado un botón con `[dsMenuTriggerFor]`, cuando se activa por click, Enter, Space o ↓, entonces el panel abre con `role="menu"` en el top layer (Popover API, ADR-014) con el foco en el primer item habilitado, y el trigger refleja `aria-haspopup="menu"` + `aria-expanded="true"`.
- [x] **CA-012.2 (teclado)** — Dado un menú abierto, entonces ↑/↓ mueven el foco entre items (con wrap), Home/End saltan al primero/último, tipear un carácter salta al siguiente item que empieza con él (typeahead), y Esc cierra el panel devolviendo el foco al trigger.
- [x] **CA-012.3 (activación)** — Dado un item habilitado (`role="menuitem"`), cuando se activa por click, Enter o Space, entonces emite su evento de selección y se cierra todo el árbol de menús, devolviendo el foco al trigger.
- [x] **CA-012.4 (contenido de items)** — Dado un item con icono Lucide proyectado (convención ADR-012; sin API de icono propia — ajuste registrado en el design de aaa-025), entonces el icono es decorativo (`aria-hidden`); dado un item `danger`, entonces usa el rojo semántico tokenizado y su par de contraste pasa el gate AA; dado un `ds-menu-separator`, entonces expone `role="separator"` y no es focusable.
- [x] **CA-012.5 (disabled accesible)** — Dado un item disabled, entonces es focusable, expone `aria-disabled="true"`, no ejecuta la acción ni cierra el menú (ADR-011).
- [x] **CA-012.6 (submenú)** — Dado un item con submenú (`aria-haspopup="menu"` + `aria-expanded`), cuando se activa por →, Enter o hover, entonces el panel hijo abre lateral al item (flip al lado opuesto si no hay espacio) con foco en su primer item; ← o Esc cierran solo el submenú y devuelven el foco al item padre; activar un item hoja cierra todo el árbol.
- [x] **CA-012.7 (light-dismiss)** — Dado cualquier nivel de menú abierto, cuando se clickea fuera del árbol de menús, entonces se cierra todo el árbol (light-dismiss de plataforma, popovers anidados); el estado interno se sincroniza vía evento `toggle` (regla 1 de ADR-014).
- [x] **CA-012.8 (tokens)** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.menu.*` nuevos + primitives/semantic existentes), incluida la animación de entrada/salida con bloque `prefers-reduced-motion` (regla 4 de ADR-014).
- [x] **CA-012.9 (showcase)** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-menu` con: menú de acciones básico, grupos con separador, items con icono, item danger, item disabled, submenú anidado y la referencia de teclado.

## Dependencias

- Ninguna bloqueante. La decisión de posicionamiento lateral (decisión 4) se resuelve dentro del change, en `design.md`.

## Fuera de alcance

- Context menu por click derecho (decisión 5) — change futuro sobre el mismo panel.
- Menubar horizontal (patrón APG menubar) y apertura por hover del trigger raíz.
- Items con estado `menuitemcheckbox`/`menuitemradio`: sin caso de uso (D-005); candidatos a change propio.

## Notas

- Change OpenSpec: `components-add-menu` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: registro padre-hijo y Popover API de `select/` (aaa-016); directiva de `tooltip/` (aaa-019) como precedente de trigger por directiva; popovers anidados de la plataforma para el árbol de submenús.
