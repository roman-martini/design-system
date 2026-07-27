---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Componentes candidatos sin disparador: Stepper y DatePicker

## Requerimiento

Dos componentes que el kit todavía no cubre y que aparecerían en apps reales, sin caso de uso concreto que los reclame hoy. El actor es el **dev consumidor**, que hoy tendría que construirlos a mano o traer una librería externa rompiendo la consistencia del sistema.

- **Stepper** — pasos discretos de un flujo (onboarding, checkout, wizard de configuración). Se descartó explícitamente del alcance de Progress al refinar [HU-016](../epics/EP-002-kit-componentes/HU-016-progress.md).
- **DatePicker** — selección de fecha. Nota heredada de la Cantera: se resolvería **envolviendo una librería existente** (`flatpickr`, `vanilla-calendar`), no construyéndolo desde cero; construir un date picker accesible desde cero está documentado como anti-patrón.

## Preguntas

- [ ] ¿El Stepper es un componente o un patrón compuesto sobre los que ya existen? Antes de comprometerlo conviene intentar armarlo con el kit actual y ver qué falta de verdad.
- [ ] Para el DatePicker: ¿qué librería, y cómo se envuelve sin filtrar su API al consumidor ni atarse a su ciclo de releases? Es una dependencia externa en una lib publicable — decisión con peso.
- [ ] ¿Alguno de los dos aparece en el template-lume ([EP-007](../epics/EP-007-template-lume/EP-007-template-lume.md))? Ese inventario es el disparador natural.

## Exploración

Migrado desde la Cantera del BACKLOG el 2026-07-26 ([D-019](../decisiones.md)). El Slider, que compartía esa lista, ya está comprometido como [HU-025](../epics/EP-002-kit-componentes/HU-025-slider.md) y cierra la tanda 3.
