---
epica: EP-005
actor: Mantenedor
estado: Hecha (2026-07-27, commit directo — Parte M de la review integral; skill `/ds:audit-tokens` + `scripts/audit-tokens.mjs`)
decisiones: [D-021, D-015, D-002, D-017]
adrs: [ADR-003]
---

# HU-032 — Auditoría de consistencia de tokens (mantenedor)

**COMO** mantenedor de un sistema con 754 custom properties y 23 componentes que lo consumen
**QUIERO** una skill `/ds:audit-tokens` que detecte de forma determinística tokens huérfanos, valores hardcodeados en el CSS de componentes y bypass de la jerarquía semantic → primitives
**PARA** que la consistencia de tokens —el contrato central del DS— deje de verificarse a ojo en code review y el drift no crezca en silencio con cada componente nuevo.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **Activación aprobada, con el disparador cumplido hace tiempo** — el criterio declarado era "más de 100 tokens **o** el primer drift detectado en code review". Ambos están cumplidos: hoy hay **754 declaraciones `--ds-`** en el CSS construido y el **primer hardcode real** apareció el **2026-07-11** (`white` en el checkmark de `DsCheckbox` y el dot de `DsRadio`, detectado en la auditoría de accesibilidad). La confirmación quedó pendiente 15 días mientras se archivaban ~13 changes; [D-021](../../decisiones.md) la resuelve activando el ítem, con el resguardo de [D-015](../../decisiones.md) (nada entra en silencio: la promoción la aprueba el PO explícitamente).
2. **Tres verificaciones, una sola skill** — huérfanos, hardcodes y bypass de jerarquía comparten fuente de datos (la salida de Style Dictionary y el CSS de componentes) y comparten consumidor (el mantenedor antes de un release). Se entregan juntas.
3. **Es tooling, va por commit directo** — la skill vive en `.claude/`, no toca los packages publicables y por lo tanto **no requiere change OpenSpec del kit** (mismo criterio que el resto del ecosistema `/ds:*`). Se ejecuta en la Parte M del plan.
4. **Script determinístico, al estilo del gate de contraste** — la verificación la hace un script reproducible (símil `contrast.mjs`), no la interpretación del modelo; la skill lo envuelve y explica los hallazgos. Los hardcodes preexistentes se reportan; corregirlos es trabajo aparte.

## Criterios de aceptación

- [x] **CA-032.1 (tokens huérfanos)** — Dado el conjunto de tokens definidos en `packages/tokens`, cuando se ejecuta `/ds:audit-tokens`, entonces reporta los que **no son referenciados** por ningún otro token ni por el CSS de ningún componente, cada uno con su nombre y el archivo donde está definido. _Verificado: 219 huérfanos sobre 754 tokens, cada uno con su path y archivo._
- [x] **CA-032.2 (hardcodes en componentes)** — Dado el CSS de los componentes de `packages/components/src`, cuando se ejecuta la auditoría, entonces reporta todo valor visual escrito literal fuera de `var(--ds-*)` (colores, medidas, radios, sombras) con su ubicación `archivo:línea`. _Verificado: reporta `archivo:línea`, propiedad, valor y tipo de literal._
- [x] **CA-032.3 (bypass de jerarquía)** — Dado el nivel semantic, cuando se ejecuta la auditoría, entonces reporta los tokens semantic que **no consumen primitives** —valor literal en vez de referencia— y, simétricamente, los tokens de componente que referencian primitives salteando semantic. _Verificado, con un matiz de implementación: ambos casos se reportan, pero como **advertencia** y no como violación, porque [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md) autoriza explícitamente `component → primitives`. Tratarlos como incumplimiento sería aplicar una regla que el repo no tomó; endurecerla exige un ADR nuevo. Ver Notas._
- [x] **CA-032.4 (detecta el drift conocido)** — Dado el hardcode `white` del checkmark de `DsCheckbox` y del dot de `DsRadio` (2026-07-11), cuando se ejecuta la auditoría, entonces **ambos aparecen** en el reporte. _Verificado: el checkmark aparece como hardcode (`checkbox.css:55` y `:63`, `stroke='white'` dentro del data URI SVG) y el dot de Radio aparece como advertencia `css-usa-primitive-de-color` — ya fue tokenizado a `var(--ds-color-white)`, pero sigue siendo un primitive que no responde al theme._
- [x] **CA-032.5 (cero falsos positivos en lo válido)** — Dado un archivo de componente que usa exclusivamente `var(--ds-*)`, cuando se ejecuta la auditoría, entonces **no** se reporta ningún hallazgo sobre él; los valores estructurales que legítimamente no se tokenizan quedan cubiertos por una lista de excepciones **declarada y justificada**. _Verificado: sobre 135 archivos escaneados el detector reporta 2 hallazgos, ambos reales. Las excepciones son tres listas explícitas y comentadas en el script (`ALLOWED_KEYWORDS`, `ALLOWED_DIMENSIONS`, `AUDITED_PROPS`); el único falso positivo de la primera corrida (`transition: visibility 0s`, patrón legítimo) se corrigió agregando `0s`/`0ms` a las excepciones._
- [x] **CA-032.6 (salida accionable y determinística)** — Dada la misma versión del repo, cuando se ejecuta la auditoría dos veces, entonces produce el mismo resultado, agrupado por tipo de hallazgo, con ubicación y con el conteo total por categoría. _Verificado por doble corrida con `diff`: salida idéntica. Todas las colecciones se ordenan antes de imprimir._
- [x] **CA-032.7 (documentada y descubrible)** — Dado el catálogo de comandos `/ds:*`, cuando se lo consulta, entonces `/ds:audit-tokens` figura con su propósito y cuándo conviene ejecutarla, y el ítem de backlog que la originó queda cerrado con referencia a esta HU. _Verificado: fila en la tabla "Existentes" de `.claude/commands/ds/README.md`, el ítem sale de la sección "Backlog" con la razón de su activación, y `check-a11y` linkea a la skill nueva._

## Dependencias

- Requiere el `dist` de `packages/tokens` construido (la auditoría se apoya en la salida de Style Dictionary además de la fuente).
- Ninguna sobre otras HUs. Complementa al gate de contraste AA ([HU-027](HU-027-gate-contraste-aa-ci.md)): aquel verifica pares de color, esta verifica el uso y la jerarquía de los tokens.

## Fuera de alcance

- **Corregir** los hardcodes que la auditoría encuentre (empezando por `white` en Checkbox y Radio): esta HU entrega el detector; cada corrección es trabajo propio con su commit o change.
- **Convertirla en gate bloqueante de CI**: se entrega como skill de ejecución bajo demanda. Promoverla a step de `pr.yml` es candidato a futuro, razonable una vez que el reporte esté en cero.
- Auditar el uso de tokens en `apps/playground` o en las stories.
- Proponer o crear tokens faltantes a partir de los hardcodes detectados (eso es una decisión de tokens con su propio disparador).
- Cambios en la taxonomía o el formato de la fuente de tokens — trabajo separado, aprobado por [D-024](../../decisiones.md) y ejecutado en la Parte N del plan.

## Notas

- Hallazgos que la originan: `claude-ecosystem-06` (el disparador declarado está objetivamente cumplido —754 declaraciones `--ds-`— y la skill sigue sin crearse), `producto-hus-05` (disparador marcado como "posiblemente activado" hace 15 días, sin confirmación registrada, mientras la tanda 3 sumaba sets `component.*` nuevos) y `backlog-04` (decisión estancada: el grooming reevalúa disparadores pero no escala decisiones al PO) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **Parte M** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md), **por commit directo** — es tooling `/ds:*`, no toca los packages publicables y por lo tanto no pasa por el flujo de changes del kit (decisión de refinamiento 3).
- El número 754 y la fecha del primer hardcode provienen de la verificación del hallazgo `claude-ecosystem-06`; conviene revalidarlos al implementar, porque el kit siguió creciendo. **Revalidado el 2026-07-27: siguen siendo 754 tokens.**

### Resultado de la primera corrida (2026-07-27)

`2` hardcodes · `0` violaciones de contrato · `44` advertencias · `219` huérfanos. Nada de esto se corrigió acá: la HU entrega el detector, las correcciones son trabajo aparte (§ Fuera de alcance).

**Tensión de diseño encontrada al implementar, que conviene decidir explícitamente**: CA-032.3 pide reportar como bypass los `component → primitives`, pero ADR-003 los **autoriza** (`semantic, primitives (no theme)`). Hay 21 casos en la fuente, casi todos deliberados (`component.badge.*.solid-text → {color.white}`: el texto sobre un fondo sólido probablemente no debe seguir al theme). Se resolvió reportándolos como advertencia informativa y documentando que promoverlos a violación **requiere un ADR que restrinja ADR-003**. Si el PO quiere esa restricción, es un ADR de la Parte N, coordinado con [D-024](../../decisiones.md) (normalización de taxonomía).
