# HU-002 — Primer release publicado en npm (dev consumidor)

**Épica**: [EP-003 — Consumo y distribución](README.md)
**Actor**: Dev consumidor
**Estado**: Refinada — se activa cuando el PO decida estrenar el pipeline
**Decisiones que aplica**: [D-003, D-004](../../decisiones.md)

---

**COMO** dev de una app Angular (empezando por los proyectos del propio PO)
**QUIERO** instalar `@romanmartinidev/tokens` y `@romanmartinidev/components` desde npm
**PARA** usar el DS en proyectos reales fuera de este monorepo.

## Criterios de aceptación

- [ ] **CA-002.1** — Dado los changesets acumulados, cuando corre el pipeline de release (aaa-005), entonces `@romanmartinidev/tokens` y `@romanmartinidev/components` quedan publicados en npm con `access: public` y versiones `0.x` acordes a los changesets.
- [ ] **CA-002.2** — Dado el tarball publicado de `components`, entonces la dependencia a `tokens` figura como rango semver real (nada de `workspace:*`).
- [ ] **CA-002.3** — Dado un proyecto Angular limpio fuera del monorepo, cuando se instala desde npm y se sigue el quickstart de los READMEs, entonces un `ds-button` con tokens aplicados renderiza sin pasos no documentados.
- [ ] **CA-002.4** — Dado el release publicado, entonces el repo queda consistente: changesets consumidos, versiones commiteadas y tag/changelog generados por el pipeline.

## Dependencias

- Decisión del PO de estrenar el pipeline (pregunta abierta 1 de la épica) — es el **disparador de ejecución**, no bloquea el refinamiento.

## Fuera de alcance

- Política de estabilidad 1.0 (D-004: se acuerda al llegar; este primer release es `0.x`).
- Promoción/difusión del package.

## Notas

- El pipeline (GitHub Actions + Changesets que abre PR de versionado) existe desde [aaa-005](../../../../openspec/changes/archive/aaa-005-bootstrap-fase-5-ci/) y nunca se estrenó.
