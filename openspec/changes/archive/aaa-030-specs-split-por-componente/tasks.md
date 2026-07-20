## 1. Preparación

- [ ] 1.1 Confirmar que `openspec/specs/components-package/spec.md` en HEAD es el oráculo de verificación (33 requirements, 1592 líneas) y no hay cambios sin commitear sobre él.
- [ ] 1.2 Releer la regla de partición D1 del `design.md` (gobierna ≥2 componentes o el package → transversal; exactamente 1 → per-componente) para validar cada ubicación al aplicar.

## 2. Aplicar el split a las specs base (promoción de deltas)

- [ ] 2.1 Archivar/aplicar el delta `## REMOVED Requirements` sobre `openspec/specs/components-package/spec.md`: quitar los 19 requirements por-componente listados en el delta, dejando los 14 transversales (Identidad, peer deps Angular/tokens, arquitectura flat, standalone+signals, selector prefix, naming, styles, ViewEncapsulation, public-api, ng-packagr APF, disabled accesible, iconografía Lucide, reglas de dependencia, @angular/forms peer).
- [ ] 2.2 Crear las 16 specs base `openspec/specs/component-<name>/spec.md` con frontmatter (`name`, `type: spec`, `status: active`, `created: 2026-07-20`) + el contenido `ADDED` de cada delta (verbatim, con `## Purpose` breve por componente).
- [ ] 2.3 Correr el script de paridad (`verify_parity.py`): confirmar 19 movidos + 14 transversales = 33, cada bloque verbatim idéntico al oráculo, sin drift de texto.
- [ ] 2.4 `openspec validate --specs` y `openspec validate --changes` en verde.

## 3. Actualizar convención y catálogos

- [ ] 3.1 `openspec/README.md`: agregar nota "un change de componente escribe su delta contra `component-<name>` (nueva → ADDED; existente → MODIFIED); solo toca `components-package` si cambia algo transversal", con ref a ADR-018. Actualizar próximo ID a **aaa-031** y quitar aaa-030 de "IDs en vuelo" al archivar.
- [ ] 3.2 `docs/architecture/README.md` § "Catálogo de Specs": agregar las 16 specs `component-<name>` y reencuadrar `components-package` como "transversal del package". Verificar el índice/numeración de la sección.
- [ ] 3.3 `docs/architecture/README.md` § "Catálogo de Changes": agregar fila `aaa-030 · specs-split-por-componente · archived · 2026-07-20 · modifica components-package + introduce 16 component-<name> · ADR-018`.
- [ ] 3.4 `docs/architecture/decisions-log.md`: fila para ADR-018 (transversal, organización de specs por componente).

## 4. ADR-018

- [ ] 4.1 Escribir `docs/architecture/adr/ADR-018-specs-por-componente.md` (MADR): contexto (spec monolítico), regla de partición D1, opciones evaluadas (per-componente / familia / único), decisión, consecuencias. Estado **Aceptado** al archivar.
- [ ] 4.2 Enlazar ADR-018 desde el frontmatter del proposal (ya está en `related-adrs`) y desde `openspec/README.md`.

## 5. Reapuntar enlaces entrantes vivos

- [ ] 5.1 `.claude/skills/add-component/SKILL.md`: el paso de spec delta apunta a `openspec/specs/component-<name>/` (nueva o MODIFIED), no a `components-package`.
- [ ] 5.2 `grep -rn "components-package/spec.md#"` en archivos **vivos** (fuera de `openspec/changes/archive/**` y los ADRs inmutables): reapuntar solo los anchors que referencian un requirement **movido** a su spec nueva. Los enlaces genéricos a `components-package` (el package sigue existiendo) y los anchors a requirements transversales se mantienen.
- [ ] 5.3 No tocar `openspec/changes/archive/**` ni ADRs aceptados: son registros inmutables; sus referencias históricas a `components-package` quedan como estaban (contexto del momento).

## 6. Verificación final y cierre

- [ ] 6.1 `pnpm -F @romanmartinidev/components test` sigue en verde (control de que no se tocó código — debe pasar idéntico).
- [ ] 6.2 `openspec validate --strict` (o equivalente) sin errores; `openspec list --specs` muestra 20 specs (4 previas + components-package + 16 component-<name> = 21; confirmar el conteo real).
- [ ] 6.3 Confirmar que no queda ningún enlace vivo roto (`grep` de anchors a requirements movidos = vacío fuera de archive).
- [ ] 6.4 Proponer mensaje de commit (split docs/specs) y esperar OK del PO antes de commitear.
