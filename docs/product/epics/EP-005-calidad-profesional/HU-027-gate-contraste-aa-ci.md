---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-007, D-002, D-008, D-012, D-016]
---

# HU-027 — Gate de contraste WCAG AA en CI (mantenedor)

**COMO** mantenedor de un design system que declara WCAG AA como parte de su valor
**QUIERO** que los pares texto/fondo se verifiquen por cálculo en cada PR y que un par bajo umbral falle el build
**PARA** que el contrato de contraste que las specs declaran verificable deje de depender de acordarse de correr un script a mano.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **La lógica de contraste se muda al repo productivo** — hoy vive únicamente en la skill `check-a11y` (`scripts/contrast.mjs`), fuera del pipeline: corre on-demand. Se porta a `packages/tokens/test/contrast.spec.ts`, donde entra **gratis al gate de CI existente** (`pnpm -r test` ya corre en PR).
2. **Los pares son datos versionados** — los pares texto/fondo que las specs declaran normativos se versionan junto al test (no se recalculan a ojo ni se enumeran dentro del código del test de forma dispersa), de modo que sumar un componente sea sumar pares.
3. **Una sola lógica, dos consumidores** — la skill `check-a11y` sigue existiendo para auditorías amplias de componentes y **consume la misma lógica** que el gate. No se duplica el cálculo de ratio ([D-017](../../decisiones.md): un patrón adoptado se establece como estándar).
4. **Es enforcement, no una decisión de diseño nueva** — materializa [D-007](../../decisiones.md) (a11y como feature) y protege las tres correcciones de tokens ya pagadas por contraste: [D-008](../../decisiones.md), [D-012](../../decisiones.md) y [D-016](../../decisiones.md). Sin gate, cualquiera de esas puede revertirse sin que nadie lo note.

## Criterios de aceptación

- [ ] **CA-027.1 (gate en el repo productivo)** — Dado `packages/tokens`, cuando corre su suite de tests, entonces se ejecuta un spec de contraste que calcula el ratio de cada par declarado **por cálculo determinístico** sobre los valores de tokens, no por estimación visual.
- [ ] **CA-027.2 (cobertura de themes)** — Dado que el sistema publica varios themes, cuando corre el gate, entonces cada par se evalúa en **todos los themes disponibles**, no solo en el default.
- [ ] **CA-027.3 (pares versionados)** — Dado el conjunto de pares que verifican los requirements de contraste de las specs, cuando se inspecciona el repo, entonces los pares están declarados en un artefacto versionado junto al test y sumar un componente nuevo se resuelve agregando sus pares, sin tocar la lógica de cálculo.
- [ ] **CA-027.4 (par bajo umbral falla el build)** — Dado un token modificado que deja un par por debajo de 4.5:1 (texto normal), cuando corre CI, entonces el test **falla** e informa el par, el theme y el ratio obtenido; el PR queda bloqueado. El caso simétrico también vale: si el par cumple, el test pasa sin intervención manual.
- [ ] **CA-027.5 (una sola fuente de lógica)** — Dado que existen el gate de CI y la skill `check-a11y`, cuando se compara el cálculo de ratio de ambos, entonces es **el mismo** (la skill consume la lógica del repo); no hay dos implementaciones que puedan divergir.
- [ ] **CA-027.6 (trazabilidad con las specs)** — Dado un requirement de contraste de una spec (por ejemplo el de `component-button`), cuando se busca su verificación, entonces existe un par cubierto por el gate que lo respalda; los requirements sin par cubierto se listan explícitamente en el change.

## Dependencias

- La skill `check-a11y` debe adaptarse a consumir la lógica portada (misma sesión / mismo change).
- Sin dependencias sobre otras HUs. Complementa a [HU-028](HU-028-a11y-automatizada-axe.md): esta cubre contraste calculado sobre tokens; aquella cubre violaciones de a11y detectadas sobre el DOM renderizado.

## Fuera de alcance

- Contraste de texto grande (3:1) y de componentes gráficos/estados de foco (WCAG 1.4.11) — se pueden sumar como pares adicionales más adelante; esta HU fija el mecanismo con el umbral de texto normal.
- Auditoría visual de componentes renderizados (eso es `check-a11y` y HU-028).
- Cambiar valores de tokens: si el gate revela un par fallido en tokens ya publicados, se trata como hallazgo con su propia decisión de producto, igual que D-008/D-012/D-016.
- Nivel AAA.

## Notas

- Hallazgos que la originan: `testing-01` (el gate de contraste AA que las specs declaran normativo no corre en CI) y `tokens-04` (el requirement de contraste WCAG AA no tiene gate: el script existe pero solo corre on-demand) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md). Ambos fueron confirmados por verificación adversarial y son el mismo problema visto desde dos capas.
- Ejecución: **Parte F** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md), como change OpenSpec.
- La review verificó manualmente que hoy los pares del spec **pasan** (por ejemplo blanco sobre `blue.600` ≈ 5.17:1). El riesgo no es un fallo actual sino la regresión silenciosa: nada impide que dejen de cumplir.
