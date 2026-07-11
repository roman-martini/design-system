---
name: check-a11y
description: Audit the design system components against WCAG AA and the repo's accessibility ADRs, producing a dated report with findings per file:line. Use when the user asks for an accessibility audit of the components ("/ds:check-a11y", "auditá la a11y", "revisá contraste/ARIA/teclado de los componentes") or before a release to verify D-007.
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "1.0"
---

# check-a11y

Auditá los componentes de `@romanmartinidev/components` contra WCAG 2.x AA y las decisiones de a11y del repo, y producí un reporte fechado en `docs/design/a11y/<YYYY-MM-DD>-audit.md` con hallazgos accionables en `archivo:línea`.

**Esta skill audita, no arregla.** No modifica `packages/`, `apps/` ni tokens. Los fixes salen del reporte: chicos → commit directo posterior (con OK del usuario); grandes → item de BACKLOG o change OpenSpec.

Materializa **D-007** ("Accesibilidad como feature", `docs/product/decisiones.md`): la a11y es parte del valor del producto y se verifica, no se asume.

---

## Input

El usuario invoca con `/ds:check-a11y` (audita **todos** los componentes de `packages/components/src/lib/`) u opcionalmente restringe el alcance: `/ds:check-a11y modal` o "auditá solo checkbox y radio". Respetar el scope pedido y declararlo en el reporte.

---

## Fuentes normativas (leer antes de auditar)

La skill **no duplica** las reglas — las lee de sus fuentes de verdad en cada corrida:

1. [ADR-011](../../../docs/architecture/adr/ADR-011-estado-disabled-accesible.md) — patrón disabled diferenciado: botones de acción → `aria-disabled` + guarda + `disabledReason` visible via `aria-describedby`; form controls → `disabled` nativo.
2. [ADR-012](../../../docs/architecture/adr/ADR-012-iconografia-lucide.md) §1 — a11y de iconos: decorativo → `aria-hidden="true"`; único contenido de un control → `aria-label` en el control.
3. [ADR-013](../../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md) — overlays sobre `<dialog>` nativo: a11y de plataforma (focus trap, ESC, top layer), siempre una vía de cierre visible, `prefers-reduced-motion` obligatorio.
4. `openspec/specs/components-package/spec.md` — scenarios a11y ya contractuales (verificar que los tests los cubran).
5. Si existe `.claude/knowledge/ng-best-practices.md` § accesibilidad, usarlo como referencia complementaria (no normativa del DS).

---

## Workflow

### 1. Preparación

1. Enumerar componentes en `packages/components/src/lib/` (o el subset pedido).
2. Asegurar tokens buildeados: si falta `packages/tokens/dist/tokens.css`, correr `pnpm -F @romanmartinidev/tokens build`.
3. Leer las fuentes normativas de arriba.

### 2. Auditoría estática por componente

Leer los 5 archivos del componente (`.ts`, `.html`, `.css`, `.spec.ts`, `.stories.ts`) y evaluar **6 dimensiones**. Cada hallazgo se registra con `archivo:línea`, criterio WCAG (SC) y severidad.

| # | Dimensión | Qué verificar | SC WCAG típicos |
|---|---|---|---|
| 1 | **Semántica y ARIA** | Elemento nativo correcto (button/input/dialog) antes que role manual; `role`, `aria-checked`, `aria-expanded`, `aria-labelledby`, `aria-describedby` según el patrón ARIA APG del componente; ids referenciados existen y son únicos | 4.1.2, 1.3.1 |
| 2 | **Disabled** | El patrón corresponde al tipo según la tabla de ADR-011 (acción vs form control); `disabledReason` visible cuando aplica | 4.1.2, 2.1.1 |
| 3 | **Teclado** | Todo lo operable con mouse es operable con teclado; tab order coherente; sin `tabindex` positivos; en overlays, ESC/foco delegados a la plataforma (ADR-013) y no re-implementados | 2.1.1, 2.4.3, 2.1.2 |
| 4 | **Foco visible** | `:focus-visible` con indicador tokenizado (`--ds-semantic-shadow-focus` u outline); nunca `outline: none` sin reemplazo; el indicador cumple contraste no-textual 3:1 | 2.4.7, 1.4.11 |
| 5 | **Motion** | Toda `animation`/`transition` tiene bloque `@media (prefers-reduced-motion: reduce)` | 2.3.3 |
| 6 | **Contraste** | Ver paso 3 — pares reales derivados del CSS, calculados con el script | 1.4.3, 1.4.11 |

**Severidades**: **alta** = incumplimiento AA verificable (ratio bajo umbral, control inoperable por teclado, ARIA rota); **media** = patrón subóptimo con impacto real pero con mitigación parcial; **baja** = mejora recomendada o cobertura de test faltante.

### 3. Contraste con el script (determinístico, no estimar a ojo)

1. **Derivar los pares** fg/bg del CSS real de cada componente: por cada regla donde un `color`/`stroke`/`border-color` se renderiza sobre un `background` conocido del mismo estado (default, hover, active, checked, disabled), anotar el par de tokens. Clasificar `level`: `text` (texto normal), `large-text` (≥24px o ≥18.66px bold), `ui` (bordes de controles, indicadores de foco, iconos funcionales — WCAG 1.4.11).
2. Escribir el manifest de pares en el **scratchpad de la sesión** (no en el repo) y ejecutar:

   ```bash
   node .claude/skills/check-a11y/scripts/contrast.mjs --pairs <scratchpad>/pairs.json
   ```

   El script resuelve cada token contra `packages/tokens/dist/tokens.css` y todos los themes de `dist/themes/*.css`, y devuelve ratio + pass/fail por scope (default, dark, brand-a, brand-b, …). Exit code: `0` pasa todo, `1` hay fallas, `2` hay pares no resolubles.

3. Reglas de honestidad:
   - Par con `error` (no resoluble a color plano) → fila "no determinable" en el reporte, nunca inventar el ratio.
   - `notes` de alpha compositado (ej. overlay `rgba`) → declarar el supuesto de backdrop en el reporte.
   - Los estados `disabled` no tienen requisito de contraste AA (excepción de 1.4.3) — reportarlos como informativos, no como falla.

### 4. Cobertura de tests y stories

Por componente: ¿los scenarios a11y del spec (`components-package`) tienen test en el `.spec.ts`? ¿Las stories documentan el uso accesible (labels, `SinHeading`-style warnings)? Los gaps van como severidad baja.

### 5. Reporte

Escribir `docs/design/a11y/<YYYY-MM-DD>-audit.md`. Si ya existe uno con la misma fecha, sufijar `-2`. Estructura:

```markdown
# Auditoría de accesibilidad — <YYYY-MM-DD>

Alcance: <componentes auditados> · Referencias: WCAG 2.2 AA, ADR-011/012/013, D-007
Método: análisis estático + contraste calculado con `check-a11y/scripts/contrast.mjs` sobre <n> pares × <m> scopes

## Resumen ejecutivo

| Componente | Alta | Media | Baja | Veredicto |
|---|---|---|---|---|

## Contraste (script)

<tabla: par, level, ratio por scope, umbral, pass/fail — incluir los "no determinable">

## Hallazgos por componente

### <componente>

- **[alta|media|baja]** `archivo:línea` — <hallazgo> (WCAG <SC>). Recomendación: <fix concreto>.

## Fuera de alcance / limitaciones

<qué no cubre el análisis estático: SR real, zoom 400%, HCM, etc.>

## Próximos pasos sugeridos

<fixes chicos para commit directo · fixes grandes como candidato a change/BACKLOG>
```

---

## Constraints

- **Cero modificaciones** fuera de `docs/design/a11y/` (el manifest de pares va al scratchpad, no al repo).
- **Cero ratios estimados**: todo número de contraste sale del script.
- **Cero hallazgos sin ubicación**: cada uno lleva `archivo:línea` y SC WCAG.
- **No re-auditar la plataforma**: lo que `<dialog>` nativo garantiza (focus trap, top layer, ESC) no es hallazgo — auditar solo el cableado propio (ADR-013 §6).
- **Cero emojis** en el reporte.
- La auditoría estática tiene límites: declararlos en "Fuera de alcance" en vez de simular verificaciones que requieren browser/AT real.

## Quality checks (auto-verificación antes de cerrar)

1. ¿El reporte está en `docs/design/a11y/<fecha>-audit.md` con las 5 secciones?
2. ¿Todos los componentes del alcance tienen fila en el resumen?
3. ¿La tabla de contraste cubre los 4 scopes (default + 3 themes) o declara por qué no?
4. ¿Cada hallazgo tiene severidad + `archivo:línea` + SC?
5. ¿Se tocó algún archivo fuera de `docs/design/a11y/`? Si sí, error — revertir y declarar.

## When to use

- `/ds:check-a11y` (con o sin scope) o pedidos de auditoría a11y/WCAG/contraste sobre los componentes del DS.
- Antes de un release, como verificación de D-007.

## When NOT to use

- Para **arreglar** hallazgos — eso es trabajo posterior (commit directo o change OpenSpec según tamaño).
- Para auditar sitios externos (eso es `research-design-system` o los agentes `web-*`).
- Para auditar consistencia de tokens no relacionada con color/contraste (eso será `/ds:audit-tokens`).
