---
name: audit-tokens
description: Audit token consistency across the design system — orphan tokens, hardcoded visual values in component CSS, and hierarchy bypasses — using a deterministic script, producing a dated report. Use when the user asks to audit tokens ("/ds:audit-tokens", "auditá los tokens", "hay hardcodes en el CSS", "qué tokens no se usan") or before a release to verify the token contract.
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "1.0"
---

# audit-tokens

Auditá la consistencia de los tokens del design system y producí un reporte fechado en `docs/design/tokens/<YYYY-MM-DD>-audit.md` con hallazgos accionables en `archivo:línea`.

**Esta skill audita, no arregla.** No modifica `packages/`, `apps/` ni la fuente de tokens. Los fixes salen del reporte: chicos → commit directo posterior (con OK del PO); grandes → item de BACKLOG o change OpenSpec.

Materializa **[HU-032](../../../docs/product/epics/EP-005-calidad-profesional/HU-032-audit-tokens-skill.md)** (EP-005), activada por **[D-021](../../../docs/product/decisiones.md)**: la consistencia de tokens es el contrato central del DS y deja de verificarse a ojo en code review.

Es la contraparte de [`check-a11y`](../check-a11y/SKILL.md): aquella verifica **pares de color y contraste**; esta verifica **el uso y la jerarquía** de los tokens. Juntas cubren el contrato del sistema de tokens.

---

## Input

El usuario invoca con `/ds:audit-tokens` (auditoría completa). Opcionalmente puede pedir una sola categoría: "solo los hardcodes", "¿qué tokens están huérfanos?". Respetar el scope pedido y declararlo en el reporte.

---

## Workflow

### 1. Preparación

1. Verificar que exista `packages/tokens/dist/tokens.css`. Si falta, correr `pnpm -F @romanmartinidev/tokens build` — el script necesita la fuente, pero el reporte cita el conteo del `dist` construido.
2. Leer el contrato vigente antes de interpretar hallazgos: [ADR-003](../../../docs/architecture/adr/ADR-003-arquitectura-design-tokens.md) §jerarquía y la spec [`design-tokens-package`](../../../openspec/specs/design-tokens-package/spec.md). **La skill no define las reglas: las lee de ahí.**

### 2. Ejecutar el script (determinístico, no interpretar a ojo)

```bash
node .claude/skills/audit-tokens/scripts/audit-tokens.mjs
```

Opciones: `--json` (salida estructurada) · `--only=hardcodes,hierarchy,warnings,orphans` (una o varias categorías).

Exit codes: `0` sin hallazgos accionables · `1` hay hardcodes o violaciones de contrato · `2` error de ejecución (JSON inválido, fuente vacía).

El script produce **cuatro categorías, con severidad distinta**. Respetar esa distinción en el reporte: es lo que separa un hallazgo real de una preferencia.

| Categoría      | Qué detecta                                                                                             | Severidad                       |
| -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **hardcodes**  | Valores visuales literales en el CSS de componentes, fuera de `var(--ds-*)` — incluye colores dentro de data URIs SVG | **Alta** — rompe el exit code   |
| **hierarchy**  | Violaciones del contrato vigente: referencia a un token inexistente, `component` → `theme`               | **Alta** — rompe el exit code   |
| **warnings**   | Permitido por ADR-003 pero con consecuencia: `component` → primitive de color, `semantic` con valor literal, CSS que consume un primitive | **Media** — informativo         |
| **orphans**    | Tokens que nadie referencia ni consume                                                                  | **Baja** — informativo          |

> **Por qué `component → primitives` es advertencia y no violación**: ADR-003 lo autoriza explícitamente ("semantic, primitives (no theme)"). Reportarlo como incumplimiento sería inventar una regla que el repo no tomó. Se informa porque tiene consecuencia real —un primitive no responde al theme, que es el origen del bug de focus ring en los brands— pero **promoverlo a violación exige un ADR nuevo que restrinja ADR-003**, no un cambio en este script.

### 3. Interpretar, no solo transcribir

El script da los hechos; el valor de la skill es el juicio sobre ellos:

- **Huérfanos**: distinguir los que son deuda (un token que quedó sin consumidor tras un refactor) de los que son **inventario deliberado** — una escala de color completa o la jerarquía de z-index de 13 niveles (aaa-009) existen para cubrir casos futuros y no son un defecto. Decirlo explícitamente en el reporte en vez de listar 200 líneas sin criterio.
- **Hardcodes en data URI SVG**: `var()` no funciona dentro de un data URI, así que la corrección no es "usar el token" sino cambiar la técnica (`mask-image` + `background-color` tokenizado). Explicarlo al proponer el fix.
- **Advertencias**: verificar si el caso es deliberado. Un `component.badge.*.solid-text` apuntando a `{color.white}` puede ser intencional (el texto sobre un fondo sólido no debe cambiar con el theme). Marcar cuáles conviene revisar y cuáles están bien.

### 4. Reporte

Escribir `docs/design/tokens/<YYYY-MM-DD>-audit.md`. Si ya existe uno con la misma fecha, sufijar `-2`. Estructura:

```markdown
# Auditoría de tokens — <YYYY-MM-DD>

Alcance: <categorías auditadas> · Referencias: ADR-003, spec design-tokens-package, HU-032
Método: `audit-tokens/scripts/audit-tokens.mjs` sobre <n> tokens definidos y <m> archivos de componente

## Resumen ejecutivo

| Categoría | Cantidad | Severidad | Veredicto |
|---|---|---|---|

## Hardcodes

<archivo:línea, propiedad, valor, por qué es un problema, fix propuesto>

## Violaciones del contrato de jerarquía

<token, archivo, qué regla incumple>

## Advertencias

<agrupadas por tipo, separando "deliberado" de "revisar">

## Huérfanos

<agrupados por origen, separando deuda real de inventario deliberado>

## Próximos pasos sugeridos

<fixes chicos para commit directo · fixes grandes como candidato a change/BACKLOG>
```

---

## Constraints

- **Cero modificaciones** fuera de `docs/design/tokens/`.
- **Cero hallazgos inventados**: todo número y ubicación sale del script. Si algo parece un problema pero el script no lo detecta, se declara como limitación del detector, no se agrega a mano al reporte.
- **Cero hallazgos sin ubicación**: cada uno lleva `archivo:línea` (hardcodes) o `token + archivo` (jerarquía, huérfanos).
- **No cambiar el contrato desde acá**: si la auditoría sugiere que una regla debería ser más estricta, eso es un ADR, no una edición del script.
- **La lista de excepciones del script es explícita y justificada** (`ALLOWED_KEYWORDS`, `ALLOWED_DIMENSIONS`, `AUDITED_PROPS`). Ampliarla es una decisión documentada, no un parche para silenciar un hallazgo incómodo.
- **Cero emojis** en el reporte.

## Quality checks (auto-verificación antes de cerrar)

1. ¿El reporte está en `docs/design/tokens/<fecha>-audit.md` con todas sus secciones?
2. ¿Los conteos del reporte coinciden exactamente con la salida del script?
3. ¿Cada categoría respeta su severidad, sin promover advertencias a violaciones?
4. ¿Los huérfanos están agrupados con criterio (deuda vs inventario deliberado) en vez de volcados en crudo?
5. ¿Se tocó algún archivo fuera de `docs/design/tokens/`? Si sí, error — revertir y declarar.

## When to use

- `/ds:audit-tokens` o pedidos de auditoría de consistencia de tokens, hardcodes o jerarquía.
- Antes de un release, junto con `/ds:check-a11y`.
- Después de sumar un set `component.*` nuevo, para verificar que no introdujo drift.

## When NOT to use

- Para **arreglar** los hallazgos — eso es trabajo posterior (commit directo o change OpenSpec según tamaño).
- Para verificar **contraste** entre pares de color: eso es `/ds:check-a11y`.
- Para auditar el uso de tokens en `apps/playground` o en las stories: fuera de alcance por HU-032.
- Para proponer tokens nuevos a partir de los hardcodes detectados: es una decisión de tokens con su propio disparador.
