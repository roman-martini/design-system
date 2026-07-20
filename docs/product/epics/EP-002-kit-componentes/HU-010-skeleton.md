# HU-010 — Skeleton de contenido en carga (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-19) — [`aaa-024 components-add-skeleton`](../../../../openspec/changes/archive/aaa-024-components-add-skeleton/) archivado; 8 tests, review sin hallazgos, sin pares de contraste (decorativo). Cierra la tanda 1 (D-009). Verificación manual pendiente del PO: pulso y apagado reduced-motion en playground
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que renderiza vistas con datos remotos
**QUIERO** un `ds-skeleton` para placeholders de carga
**PARA** mantener la estructura visual estable mientras llegan los datos (menos layout shift que un spinner a pantalla).

## Decisiones de refinamiento (PO, 2026-07-19)

1. **Dimensiones libres con defaults por shape**: inputs `width`/`height`/`radius` aceptan cualquier valor CSS (px, %, rem) y cada `shape` (`text | rect | circle`) trae defaults tokenizados sensatos — el caso común (línea de texto) no configura nada; imitar contenido real pide medidas arbitrarias.
2. **Animación por pulso de opacidad**: un solo color de fondo tokenizado que pulsa suave. Sin shimmer/gradiente (más movimiento y más tokens sin caso que lo pida).
3. **`prefers-reduced-motion` → estático**: la animación se apaga y queda el bloque fijo. A diferencia del spinner, un placeholder no necesita comunicar actividad — la estructura ya lo hace. **Consecuencia**: no se repite el patrón "reduced-motion por reemplazo" de aaa-023 → no amerita ADR (nota del BACKLOG resuelta).
4. **Una línea por elemento, sin input `lines`**: un párrafo se compone repitiendo `ds-skeleton` (el showcase lo demuestra). Coherente con D-005 y con dejar los compuestos como recipes.
5. **Decorativo siempre** (ya fijado al identificar la HU): `aria-hidden="true"`, sin role ni texto; la región en carga se anuncia por el contenedor del consumidor (patrón documentado en el showcase), no por cada bloque.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-skeleton). -->

- [x] **CA-010.1** — Dado `<ds-skeleton />` (standalone, OnPush), cuando se renderiza con `shape` `text | rect | circle` (default `text`), entonces cada shape aplica sus defaults tokenizados de dimensiones y radius (`text`: ancho completo × altura de línea, radius chico; `rect`: bloque de altura tokenizada, radius chico; `circle`: diámetro tokenizado, radius total).
- [x] **CA-010.2** — Dados los inputs `width`/`height`/`radius` con cualquier valor CSS válido (px, %, rem), entonces overridean los defaults del shape.
- [x] **CA-010.3** — Dado cualquier skeleton, entonces es decorativo: `aria-hidden="true"`, sin role y sin texto en el árbol de accesibilidad; el showcase documenta el patrón del contenedor que anuncia la carga.
- [x] **CA-010.4** — Dada la animación, entonces es un pulso de opacidad con color de fondo, duración y rango de opacidad tokenizados, y bajo `prefers-reduced-motion` se apaga (bloque estático).
- [x] **CA-010.5** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.skeleton.*` nuevos + primitives/semantic); al ser un elemento decorativo no textual, no introduce pares de contraste al gate.
- [x] **CA-010.6** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-skeleton` con los 3 shapes, un párrafo multilínea por composición, una card compuesta como demo (sin componente nuevo) y la nota de reduced-motion.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Skeletons compuestos prearmados (card, tabla, lista): son patterns/recipes (nivel 5 de FUTURE-WORK), no componentes del package.
- Input `lines`/multilínea (decisión 4) y variante shimmer (decisión 2).

## Notas

- Change OpenSpec: `components-add-skeleton` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: `@keyframes` de pulso de `spinner.css` (aaa-023, mismo lenguaje visual); defaults por `data-shape` estilo `:host([data-*])` del kit.
