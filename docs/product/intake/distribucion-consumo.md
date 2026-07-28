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

**Revisión del 2026-07-28** (grooming al archivar `aaa-038`): el **veto se levantó** ([D-028](../decisiones.md)), así que ya no es el obstáculo — pero el disparador sigue sin cumplirse, porque el release en sí no ocurrió: falta destrabar el pipeline (Parte E) y cerrar las Partes G e I antes de publicar `0.3.0`. La **guía de migración** sigue además bloqueada por la política de estabilidad 1.0 ([D-004](../decisiones.md), pendiente). Este intake se revisita cuando `0.3.0` esté publicado.
