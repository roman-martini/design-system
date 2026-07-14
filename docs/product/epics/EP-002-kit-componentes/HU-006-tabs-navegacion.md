# HU-006 — Tabs para navegación de contenido (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Refinada (2026-07-12, ambigüedades resueltas con el PO)
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que organiza vistas con secciones alternativas
**QUIERO** `ds-tabs`/`ds-tab` accesibles con navegación por teclado
**PARA** alternar contenido en una misma pantalla sin construir el patrón (y su a11y) a mano.

## Decisiones de refinamiento (PO, 2026-07-12)

1. **Variantes: las 3** — `underline | pills | contained`. Los tokens `component.tabs.*` ya las definen desde el bootstrap; dejarlas huérfanas sería drift.
2. **Activación automática** — la selección sigue al foco (APG para contenido local; consistente con RadioGroup).
3. **Paneles en el DOM** — todos renderizados, los inactivos con `hidden` (conserva el estado del DOM; APG). Lazy opcional queda para una HU futura si aparece contenido pesado real.
4. **API por value** — cada `ds-tab` declara `value` (string); el contenedor expone `[(value)]`. Sin valor inicial, el primer tab habilitado arranca activo.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-tabs). -->

- [ ] **CA-006.1** — Dado un `<ds-tabs [(value)]="active">` con tabs de values `'a'`/`'b'`/`'c'`, cuando el usuario clickea el tab `'b'`, entonces el model pasa a `'b'` y su panel se muestra; cuando el consumidor setea `'c'` programáticamente, el tab `'c'` queda activo. Sin `value` inicial, el primer tab habilitado arranca activo.
- [ ] **CA-006.2** — Dado el foco en un tab, cuando se presiona `←`/`→`, entonces el foco **y la selección** se mueven al tab habilitado anterior/siguiente (con wrap en los extremos, salteando disabled); `Home`/`End` van al primero/último habilitado. El tablist es un solo tab-stop (roving tabindex: solo el tab activo tiene `tabindex="0"`).
- [ ] **CA-006.3** — Dado el componente renderizado, entonces implementa el patrón tabs de ARIA APG: contenedor `role="tablist"` (con el `aria-label` del consumidor reenviado si el rol no vive en el host), cada tab `role="tab"` con `aria-selected` y `aria-controls` hacia su panel, cada panel `role="tabpanel"` con `aria-labelledby` hacia su tab y `tabindex="0"`.
- [ ] **CA-006.4** — Dado un panel inactivo, entonces permanece en el DOM con `hidden` (un form a medio completar dentro de un tab no pierde estado al cambiar y volver).
- [ ] **CA-006.5** — Dado el input `variant` (`underline | pills | contained`, default `underline`), entonces cada variante consume exclusivamente sus tokens `component.tabs.*` y los pares de contraste de los estados activo/hover/default pasan AA calculados por script en los 4 themes. Los tokens `tabs.size.*.height` con px crudos se alinean a `{dimension.*}` en el change (consistencia con input/select).
- [ ] **CA-006.6** — Dado un `<ds-tab [disabled]="true">`, entonces no es activable por click ni teclado (la navegación lo saltea), expone `aria-disabled="true"` y permanece perceptible (rama botón de ADR-011 — el tab es un control de acción).
- [ ] **CA-006.7** — Dado el CSS del componente, entonces todo valor visual sale de `var(--ds-*)`, los sizes `sm | md | lg` escalan por tokens, y toda transición (underline, colores) tiene su bloque `prefers-reduced-motion`.
- [ ] **CA-006.8** — Dado un tab enfocado por teclado, entonces muestra el indicador de foco tokenizado (`--ds-semantic-shadow-focus`) sin `outline: none` desnudo.

## Dependencias

- Ninguna bloqueante (sin posicionamiento ni deps nuevas).

## Fuera de alcance

- Integración con el router de Angular (tabs como navegación de URLs): HU posterior si aparece caso real (D-005).
- Tabs cerrables/reordenables, overflow con scroll/flechas, orientación vertical y lazy rendering opcional del panel: HUs posteriores con caso real.

## Notas

- Change OpenSpec: `components-add-tabs` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: registración padre-hijo de RadioGroup/Select, `aria-disabled` + guarda de Button, reenvío de `aria-label` de Select/Input.
