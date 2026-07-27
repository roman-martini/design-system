---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-002, D-017]
---

# HU-030 — Presupuesto de tamaño de bundle (mantenedor)

**COMO** mantenedor de dos librerías que ya se instalan desde npm
**QUIERO** que CI mida el peso del `dist` de `tokens` y `components` contra un presupuesto declarado y falle el PR cuando se excede
**PARA** que el peso que paga el consumidor sea parte del contrato verificado y no una degradación acumulativa que nadie ve hasta que la sufre en su app.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **`size-limit` sobre el `dist`, no sobre el tarball** — se mide lo que el consumidor efectivamente carga (entrypoints construidos, con el gzip que aplica el transporte), no el empaquetado de npm. Aprobado como gate de EP-005 en [D-021](../../decisiones.md).
2. **Los presupuestos se fijan en el change, no acá** — el hallazgo `ci-cd-14` recomienda **fijar la línea base ahora que los números son chicos**, midiendo el peso real; ningún valor en KB se inventa en esta HU. Lo que la HU exige es que exista un presupuesto por entrypoint y que excederlo **falle**.
3. **El presupuesto es un techo, no una meta** — se fija con un margen sobre la medición actual y solo se sube por decisión explícita del PO, dejando registrada la razón del aumento en el PR que lo mueve (mismo criterio de trinquete que [HU-026](HU-026-coverage-typecheck-ci.md)).

## Criterios de aceptación

- [ ] **CA-030.1 (presupuesto declarado)** — Dado cada package publicable (`@romanmartinidev/tokens` y `@romanmartinidev/components`), cuando se inspecciona su configuración de `size-limit`, entonces declara al menos un entrypoint de su `dist` con un límite explícito y la unidad de medida (gzip) que se aplica.
- [ ] **CA-030.2 (línea base medida)** — Dado que ningún presupuesto puede inventarse, cuando se implementa el change, entonces cada límite se fija a partir del peso **medido** del `dist` construido, y tanto el valor medido como el margen elegido quedan documentados en el change.
- [ ] **CA-030.3 (medición sobre artefacto real)** — Dado un PR, cuando corre el gate, entonces mide el `dist` producido por el build de ese PR (no un artefacto previo ni el código fuente), de modo que el número refleje lo que se publicaría.
- [ ] **CA-030.4 (exceso hace fallar el PR)** — Dado un PR que agrega una dependencia o un import que empuja un entrypoint por encima de su límite, cuando corre el job de CI, entonces el job **termina en error** y el PR no puede mergearse — no alcanza con emitir una advertencia.
- [ ] **CA-030.5 (diagnóstico accionable)** — Dado un gate que falla por exceso, cuando se lee la salida del job, entonces indica qué entrypoint excedió, el peso medido y el límite configurado, sin obligar a reproducir la medición localmente para entender la causa.
- [ ] **CA-030.6 (cableado y documentación)** — Dado el workflow de PR, cuando se ejecuta, entonces incluye el step de presupuesto como bloqueante, y `CONTRIBUTING.md` documenta cómo correr la medición localmente y cuál es la política para mover un límite.

## Dependencias

- Requiere que el `dist` de ambos packages esté construido antes del step (encadenar con el build que ya corre en el pipeline de PR).
- Ninguna sobre otras HUs de la épica; convive con [HU-026](HU-026-coverage-typecheck-ci.md) como un step más del mismo job de validación.

## Fuera de alcance

- Análisis de composición del bundle (treemap, `source-map-explorer`) y persecución de reducciones de peso: esta HU instala el techo, no optimiza lo que hay debajo.
- Presupuesto sobre el bundle de `apps/playground` — no es artefacto publicable.
- Publicar el histórico de tamaños en un servicio externo o comentar el diff de peso en el PR (candidato a futuro, si el gate se vuelve ruidoso o poco visible).
- Medición del tarball de npm (`pnpm pack`) como métrica alternativa: se evaluó y se descartó a favor del `dist` (decisión de refinamiento 1).

## Notas

- Hallazgos que la originan: `ci-cd-14` (sin bundle size budget para los packages publicados; el ítem estaba en Cantera y [ADR-006](../../../architecture/adr/ADR-006-estrategia-ci-cd.md) lo había diferido como `ci-bundle-budget`) y `ci-cd-13` (`actionlint` declarado como requirement de la spec de CI pero ausente del pipeline, misma clase de gate declarado y no cableado) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **Parte F** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md), como change OpenSpec junto al resto de los gates de CI.
- Los valores en KB quedan deliberadamente sin fijar acá (decisión de refinamiento 2): cualquier número escrito hoy sería un dato no verificado. Se miden y se fijan al implementar.
