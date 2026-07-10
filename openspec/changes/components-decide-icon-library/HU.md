## OpenSpec — cambios al kit publicable

### `components-decide-icon-library` — ADR librería de iconos

**Tipo**: OpenSpec transversal (decisión arquitectónica + primer uso).

**Origen**: research/atlassian-design.md identifica iconografía como gap
explícito del DS actual. Bloquea Modal (X de cierre), Select (chevron),
y potencialmente mejora Checkbox (que hoy usa SVG inline en CSS).

**Alcance propuesto**:

- ADR con opciones evaluadas (número al crearse — ADR-009 ya tomado por
  `tokens-figma-export`): Lucide / Heroicons / Feather / custom SVG.
- Recomendación de partida: Lucide (open-source, mantenida activamente,
  tree-shakeable, 1.5px stroke por default — alineado con observación
  de Atlassian: `docs/design/research/atlassian-design.md §1.8`).
- Decidir distribución: inline SVG en componente vs package separado
  `@romanmartinidev/icons`.
- Aplicar al primer componente que la necesite (probablemente Modal).
- Delta components-package.

**Disparador**: al activar `components-add-modal` o
`components-add-select`.

**Estado**: pendiente.
