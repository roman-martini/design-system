---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Familias de tokens candidatas: breakpoints, motion adicional y density

## Requerimiento

Tres familias de tokens que el sistema todavía no define. Ninguna tiene consumidor real hoy, y por eso no entraron: sumarlas por completitud contradice el resguardo de calidad que [D-015](../decisiones.md) conserva. El actor es el **dev consumidor**, que sin ellas hardcodea valores fuera del sistema.

- **Breakpoints** (`semantic/breakpoint.json`) — escala mobile-first tanteada en la Cantera: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536. Los necesita el primer componente responsive del kit.
- **Motion adicional** — `delay` (0–300 ms) y easings extra (`bounce`, `back-in`, `back-out`), sobre la familia de motion que ya existe.
- **Density** (`[data-density="compact"]`) — modo compacto de espaciado. Nota heredada de la Cantera: solo si aparece la necesidad, no por completitud.

## Preguntas

- [ ] Breakpoints: ¿tokens puros, o también utilidades/mixins que los consuman? Un token de breakpoint sin mecanismo de uso en CSS es de valor dudoso — vale explorar cómo lo resuelven los sistemas de referencia.
- [ ] ¿La migración a formato DTCG ([D-024](../decisiones.md)) cambia cómo conviene definir estas familias? Conviene resolverla antes de sumar tokens nuevos, no después.
- [ ] Density: ¿es una familia de tokens o un modo del sistema de theming, como dark? La respuesta cambia mucho el alcance.
- [ ] ¿El template-lume ([EP-007](../epics/EP-007-template-lume/EP-007-template-lume.md)) necesita alguna de las tres? Sería el disparador real.

## Exploración

Migrado desde la Cantera del BACKLOG el 2026-07-26 ([D-019](../decisiones.md)). No confundir con los **tokens aditivos del research Atlassian** ([HU-018](../epics/EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md)), que sí están comprometidos y viven en el BACKLOG con disparador propio.
