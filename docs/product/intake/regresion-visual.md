---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Regresión visual automatizada

## Requerimiento

Detectar automáticamente cuando un cambio altera el aspecto de un componente sin que nadie lo haya pedido. El actor es el **mantenedor**: hoy el único control de regresión visual es la revisión del PO antes de archivar ([D-022](../decisiones.md)), que es humana y no cubre el histórico.

Opciones tanteadas en la ex Cantera: **Chromatic** (free tier, integrado con Storybook) o **snapshots de Playwright** (sin dependencia SaaS, mantenimiento propio).

## Preguntas

- [ ] ¿Chromatic o Playwright? Chromatic trae infraestructura y revisión de diffs resueltas, a cambio de una dependencia SaaS y de subir los builds a un tercero. Playwright no depende de nadie, pero los snapshots hay que hospedarlos y mantenerlos, y son notoriamente frágiles entre sistemas operativos.
- [ ] ¿Cuánto valor agrega sobre el gate de contraste automático más la revisión visual del PO, que ya existen? Es la pregunta que decide si esto entra o no.
- [ ] ¿Corre en cada PR o solo antes de un release? La frecuencia define el costo real.

## Exploración

**Diferido explícitamente** al aprobar [D-021](../decisiones.md): el PO aprobó publicar Storybook en GitHub Pages ahora ([HU-031](../epics/EP-005-calidad-profesional/HU-031-storybook-publicado.md)) y dejó Chromatic y la regresión visual para evaluar por separado. Este intake es ese "por separado".

Disparador natural: que HU-031 esté hecha (Storybook publicado es prerequisito de Chromatic) y que aparezca la primera regresión visual real que el gate del PO no haya atajado.
