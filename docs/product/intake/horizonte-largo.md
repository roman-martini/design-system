---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Horizonte largo: multi-framework, multi-plataforma y patterns

## Requerimiento

Ideas de los niveles 4–5 del [roadmap de madurez](../../reference/roadmap-madurez-ds.md). Se registran para no perderlas, con la advertencia heredada de la Cantera: **son sobre-ingeniería mientras haya un solo consumidor Angular**.

- **Multi-framework vía Web Components** (Lit) — que los componentes se consuman fuera de Angular.
- **Tokens multi-plataforma** (iOS/Android) — Style Dictionary ya podría emitirlos.
- **Sync bidireccional con Figma** — contradice frontalmente [D-006](../decisiones.md), que fija el flujo one-way código→diseño. Entrar acá exige revertir esa decisión con una D-XXX nueva, no asumirlo.
- **Theme builder** — herramienta para generar themes sin editar JSON.
- **Modos extra** — alto contraste AAA, densidad, RTL.
- **Patterns / recipes** — login, panel de settings, data table, dashboard, estados vacíos y de error, onboarding. Nota heredada: como **stories compuestas**, no como componentes del package.

## Preguntas

- [ ] RTL y propiedades lógicas CSS: la revisión integral del 2026-07-26 lo marcó como gap propio y sugirió una auditoría dedicada cuando haya demanda. Es el ítem más cercano a ser real de esta lista, porque afecta el CSS que hoy se escribe — cada componente nuevo que use `left`/`right` en vez de propiedades lógicas aumenta el costo de la migración futura. ¿Vale adoptar propiedades lógicas ya como convención, aunque no se soporte RTL todavía?
- [ ] Patterns/recipes: ¿es realmente horizonte largo? El template-lume ([EP-007](../epics/EP-007-template-lume/EP-007-template-lume.md)) va a producir composiciones reales; capturarlas como stories podría salir casi gratis.

## Exploración

Migrado desde la Cantera del BACKLOG el 2026-07-26 ([D-019](../decisiones.md)). El marco conceptual que acompañaba a estas ideas (niveles de madurez, métricas, anti-patrones) vive en [docs/reference/roadmap-madurez-ds.md](../../reference/roadmap-madurez-ds.md).

Ninguno tiene disparador y varios exigirían revisar decisiones vigentes. Se refinan solo si aparece demanda concreta.
