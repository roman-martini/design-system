---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Distribución y consumo: tipos estructurados y guía de migración

## Requerimiento

Dos mejoras en cómo se consumen los packages desde afuera. El actor es el **dev consumidor**.

- **Tokens TypeScript estructurados** — hoy los tokens se exportan como constantes planas (`DsColorBlue500`, tras el rename de [D-018](../decisiones.md)). La alternativa es un objeto anidado navegable (`tokens.color.blue[500]`), que se autocompleta por familia en vez de por prefijo. En la ex Cantera figuraba como change futuro `tokens-rich-types`.
- **Guía de migración y consumo** — documentación de cómo actualizar entre versiones cuando haya breaking changes que comunicar.

## Preguntas

- [ ] Tipos estructurados: ¿reemplazan a las constantes planas o conviven? Reemplazarlas es breaking; convivir duplica la superficie pública y hay que justificar por qué.
- [ ] ¿Cómo afecta al tree-shaking? Es el argumento clásico a favor de las constantes planas y hay que medirlo, no suponerlo — más ahora que [HU-030](../epics/EP-005-calidad-profesional/HU-030-bundle-size-budget.md) mete el peso bajo presupuesto.
- [ ] ¿Interactúa con la normalización de taxonomía de [D-024](../decisiones.md)? Conviene no renombrar la superficie JS dos veces.
- [ ] La guía de migración depende de la **política de estabilidad 1.0**, que sigue pendiente ([D-004](../decisiones.md)): sin saber qué se promete, no hay nada que documentar.

## Exploración

Migrado desde la Cantera del BACKLOG el 2026-07-26 ([D-019](../decisiones.md)), donde figuraba como "nivel 3" del roadmap de madurez.

Ambos ítems tienen el mismo disparador natural: **el primer release post-veto**. Hasta que se levante el veto de publicación y se defina la política 1.0, ninguno de los dos tiene consumidor real.
