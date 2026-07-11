# HU-002 — Primer release publicado en npm (dev consumidor)

**Épica**: [EP-003 — Consumo y distribución](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada
**Decisiones que aplica**: [D-003, D-004](../../decisiones.md)

---

**COMO** dev de una app Angular (empezando por los proyectos del propio PO)
**QUIERO** instalar `@romanmartinidev/tokens` y `@romanmartinidev/components` desde npm
**PARA** usar el DS en proyectos reales fuera de este monorepo.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir: versiones iniciales publicadas vía el pipeline de release (aaa-005) consumiendo los changesets acumulados; `workspace:*` resuelto a semver real en los tarballs; quickstart verificado instalando desde npm en un proyecto limpio.

## Dependencias

- Decisión del PO de estrenar el pipeline (pregunta abierta 1 de la épica).

## Fuera de alcance

- Política de estabilidad 1.0 (D-004: se acuerda al llegar; este primer release es `0.x`).
- Promoción/difusión del package.

## Notas

- El pipeline (GitHub Actions + Changesets que abre PR de versionado) existe desde [aaa-005](../../../../openspec/changes/archive/aaa-005-bootstrap-fase-5-ci/) y nunca se estrenó.
