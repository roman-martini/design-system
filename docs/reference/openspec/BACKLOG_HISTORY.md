# Backlog History — angular-ui-kit

Ítems del backlog ya implementados. Se mueven acá cuando el change queda
archivado, así [BACKLOG.md](BACKLOG.md) refleja solo lo pendiente.

Cada entrada incluye link al change archivado en
`openspec/changes/archive/` y, cuando corresponde, link a la spec
consolidada en `openspec/specs/`.

---

## 2026

### `ngx-card` ghost variant — variante sin caja visible
- **Origen**: la card siempre rendía con background + border. Faltaba una
  variante para agrupar contenido con padding consistente sin caja visible.
- **Resultado**: `<ngx-card variant="ghost">` — sin background, sin border,
  sin shadow. Conserva padding y radius. Slots header/content/footer/accent
  siguen funcionando.
- **API**: extensión no-breaking del union `CardVariant` →
  `'flat' | 'outlined' | 'elevated' | 'ghost'`.
- **Tokens**: 1 token nuevo `--card-bg-ghost: transparent` en `_card.scss`.
- **Versiones**: `@avain/ngx-ui` `0.10.0` → `0.11.0`;
  `@avain/ngx-theming` `0.2.3` → `0.2.4`.
- **Change**: [`aaa-024-card-ghost-variant`](changes/archive/aaa-024-card-ghost-variant/).
- **Spec**: [`openspec/specs/card/spec.md`](specs/card/spec.md) — requirement
  `Variants visuales` modificado + requirement `Token --card-bg-ghost` agregado.

---

### `ngx-table` — Componente de tabla reutilizable
- **Origen**: implementaciones de tabla duplicadas en proyectos consumidores;
  componetizar para evitar divergencia.
- **Resultado**: `<ngx-table>` con `[data]`, `[columns]`, `[sortable]`,
  `[selectable]`, `[pageSize]`, render custom de cells via
  `*ngxTableCell="<field>"`. Sort/selection/pagination controlados por el
  consumer.
- **Change**: [`aaa-004-ngx-table`](changes/archive/aaa-004-ngx-table/).
- **Spec**: [`openspec/specs/table/spec.md`](specs/table/spec.md).
- **Referencia**: [`project.md`](../project.md).
