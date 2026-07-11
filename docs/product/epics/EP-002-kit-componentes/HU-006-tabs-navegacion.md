# HU-006 — Tabs para navegación de contenido (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que organiza vistas con secciones alternativas
**QUIERO** `ds-tabs`/`ds-tab` accesibles con navegación por teclado
**PARA** alternar contenido en una misma pantalla sin construir el patrón (y su a11y) a mano.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): selección activa (`[(activeIndex)]` o model equivalente), keyboard nav (`←`/`→`, `Home`/`End`), patrón tabs de ARIA APG (`tablist`/`tab`/`tabpanel`, `aria-selected`), variantes (underline/pills/contained — el refinamiento decide si todas entran), contenido perezoso o no del panel.

## Dependencias

- Ninguna bloqueante (sin dependencias de posicionamiento ni deps nuevas).

## Fuera de alcance

- Integración con el router de Angular (tabs como navegación de URLs): HU posterior si aparece caso real (D-005).
- Tabs cerrables/reordenables.

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-tabs`).
