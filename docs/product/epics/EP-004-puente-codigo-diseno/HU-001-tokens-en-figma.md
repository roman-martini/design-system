# HU-001 — Tokens del DS disponibles como Variables de Figma (diseñador)

**Épica**: [EP-004 — Puente código ↔ diseño](EP-004-puente-codigo-diseno.md)
**Actor**: Diseñador
**Estado**: Refinada — change [aaa-012 tokens-figma-export](../../../../openspec/changes/tokens-figma-export/) propuesto (4/4 artefactos), **en pausa por decisión del PO**
**Decisiones que aplica**: [D-006](../../decisiones.md)

---

**COMO** diseñador que trabaja el visual del DS en Figma
**QUIERO** que los tokens del repo (colores, espaciados, tipografía, temas) estén disponibles como Variables de Figma sincronizadas desde el código
**PARA** diseñar con los valores reales del sistema, sin tipearlos a mano ni que deriven del código con el tiempo.

## Criterios de aceptación

<!-- Refinados junto con el spec delta de aaa-012 (design-tokens-package § Output DTCG) — al implementar, estos CAs se verifican vía los scenarios del spec. -->

- [ ] **CA-001.1** — Dado el build de tokens, cuando termina, entonces existe un export en formato DTCG (W3C) consumible por Tokens Studio.
- [ ] **CA-001.2** — Dado un token semantic que referencia un primitive, cuando se importa en Figma, entonces llega como **Variable que apunta a Variable** (alias preservado, no valor crudo).
- [ ] **CA-001.3** — Dado los temas `dark`/`brand-a`/`brand-b`, cuando se importan, entonces se mapean como sets/modos diferenciados.
- [ ] **CA-001.4** — Dado un cambio de valor en un primitive del repo, cuando se sincroniza, entonces la Variable de Figma y todo lo que la referencia reflejan el valor nuevo (sin edición manual en Figma).
- [ ] **CA-001.5** — Dado el flujo completo, entonces la dirección es exclusivamente código→Figma (editar en Figma no modifica el repo).

## Dependencias

- Decisión del PO de retomar aaa-012 (pausado el 2026-07-03).
- Validación final en Figma: conectar Tokens Studio al repo — trabajo del PO fuera del código.

## Fuera de alcance

- **Componentes de Figma**: la integración provee Variables; el dibujo de componentes (capas, auto-layout, variantes) es trabajo manual de diseño.
- Sync bidireccional (contradice D-006).
- API REST de Variables de Figma (requiere plan Enterprise; evaluación futura si el sync manual se vuelve fricción).

## Notas

- Diseño técnico completo en el change: [proposal](../../../../openspec/changes/tokens-figma-export/proposal.md) + [design](../../../../openspec/changes/tokens-figma-export/design.md). ADR: [ADR-009](../../../architecture/adr/ADR-009-figma-tokens-export.md).
