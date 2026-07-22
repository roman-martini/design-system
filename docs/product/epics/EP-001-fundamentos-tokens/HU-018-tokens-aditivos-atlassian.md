# HU-018 — Tokens aditivos del research Atlassian (dev consumidor)

**Épica**: [EP-001 — Fundamentos: tokens y theming](EP-001-fundamentos-tokens.md)
**Actor**: Dev consumidor
**Estado**: Identificada — ninguno de los tres tokens tiene disparador activo ([BACKLOG § Later](../../../backlog/BACKLOG.md)). Cada CA es independiente y se activa por separado: el token se refina y se implementa **como su propio change** cuando aparece su caso de uso real (D-005).
**Decisiones que aplica**: [D-002, D-005](../../decisiones.md) · Técnica: [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md)

---

**COMO** dev que construye UI con tokens semánticos
**QUIERO** tres aditivos que hoy faltan en la capa `semantic` (`space.0`, tipografía `metric.*`, `space.negative.*`)
**PARA** cubrir con tokens casos que hoy obligan a hardcodear o a bajar a `primitives` directos, sin romper ningún nombre ni convención existente.

## Origen

[Research Atlassian §4](../../../design/research/atlassian-design.md), recomendación "inspiración selectiva": cada aditivo entra **como CHG separado cuando aparezca la necesidad real, no en bulk**. Los tres son aditivos puros (no reemplazan ni renombran nada) y respetan el naming T-shirt del DS (no se adopta el naming factor-based de Atlassian, ver §3 del research).

## Alcance — un change por token

Esta HU agrupa tres entregas independientes; cada una es su propio change y se dispara por su cuenta:

| CA candidato | Change tentativo               | Capa                  | Changeset | Disparador                                        |
| ------------ | ------------------------------ | --------------------- | --------- | ------------------------------------------------- |
| CA-018.1     | `tokens-add-space-zero`        | `semantic/space`      | patch     | Primer dev que quiera `gap/margin: 0` con token   |
| CA-018.2     | `tokens-add-metric-typography` | `semantic/typography` | minor     | Primer componente que renderice cifras (KPI/stat) |
| CA-018.3     | `tokens-add-negative-space`    | `semantic/space`      | minor     | Primer componente con overlap (avatares, badges)  |

## Criterios de aceptación (candidatos)

<!-- Provisionales mientras la HU está Identificada. Cada uno se refina a binario y se vuelve
     scenario del spec design-tokens-package (delta de su change) al activarse su disparador. -->

- [ ] **CA-018.1 (space.0)** — Dado `semantic/space.json`, cuando se agrega `space.0` mapeado a la primitive `dimension.0`, entonces existe `var(--ds-space-0)` con valor `0`, el build de Style Dictionary pasa y no se altera ningún nombre existente (changeset **patch**).
- [ ] **CA-018.2 (metric typography)** — Dado `semantic/typography.json`, cuando se agregan `metric.small` (16px/bold), `metric.medium` (24px/bold) y `metric.large` (28px/bold) con su line-height (valores del research §1.2), entonces existen los tres tokens como capa aditiva sin reemplazar `heading.*`/`body.*` (changeset **minor**).
- [ ] **CA-018.3 (negative space)** — Dado `semantic/space.json`, cuando se agregan `space.negative.*` (`-2 … -32`, mapeados a las primitives correspondientes), entonces existen para overlapping/romper padding sin duplicar valores fuera de la jerarquía (changeset **minor**).
- [ ] **CA-018.4 (jerarquía intacta)** — Dado cualquiera de los tres changes, cuando se audita la cadena de referencia, entonces cada token `semantic` referencia una `primitive` (respeta la regla anti-duplicación `component → semantic → primitive` de [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md)) y no introduce valores hardcodeados (caso de validación).

## Dependencias

- Ninguna bloqueante. El único gate de cada CA es su **disparador** (caso de uso real); sin él, el token no entra (D-005).

## Fuera de alcance

- **Ticks faltantes de `space`** (6, 12, 20, 40, 80 en semantic): research §4 punto 2, "solo si aparece necesidad concreta repetida" — no forma parte de esta HU.
- **Renombrar el naming semantic** a factor-based (`space.100` en vez de `space.md`): explícitamente **no recomendado** (research §3); rompería una convención documentada.
- **Renombrar easings de motion** con intent (`bold`/`practical`): no recomendado, es estética de marca Atlassian (research §4 punto 5).
- Iconografía y librería de iconos: ya resuelto por [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md) (fuera de esta HU).

## Notas

- Los tres son aditivos: **ninguno rompe ADRs existentes** ni la API `var(--ds-*)` (research §2). Cada change lleva su delta de `design-tokens-package`.
- Esta HU puede **cerrarse parcialmente**: cada CA se tilda cuando su change se archiva; la HU queda Hecha cuando los tres se activaron y cerraron. Si algún token nunca gana disparador, su CA puede quedar como no-aplica al cierre (D-005: no se implementa por completitud).
- Estimación del research (§ tabla de changes): cada uno ~1 sesión (`space.0` ≤2h).
