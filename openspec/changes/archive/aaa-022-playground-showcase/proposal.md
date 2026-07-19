---
id: aaa-022
name: playground-showcase
type: change
status: archived
archived: 2026-07-19
modifies-specs:
  - playground-app (REMOVED: single page sin routing, demo del Button en la app; ADDED: showcase navegable por componente)
related-adrs:
  - ADR-005
---

# Proposal — playground-showcase

## Why

Con el kit en 11 entregables (9 componentes + directiva + service), la página única del playground dejó de escalar: encontrar los casos de uso de una pieza exige scrollear todo, y el "sin routing" que fijó la Fase 4 ([ADR-005](../../../docs/architecture/adr/ADR-005-scaffolding-playground.md) / aaa-004) ya cumplió su propósito de simplicidad inicial. [HU-011](../../../docs/product/epics/EP-006-playground/HU-011-showcase-componentes.md) (EP-006, pedido directo del PO en 2026-07-18) convierte el playground en un **showcase navegable**: sidebar + una vista por componente con sus casos de uso y el código de cada uno.

## What Changes

- **Shell con sidebar + Angular Router**: una ruta **lazy por componente** (`/<slug>`), redirect de `''` y de rutas desconocidas a un destino válido. Primera vez que el playground ejercita routing — consumo más realista del DS.
- **Una vista por entregable** (11): migración completa de las demos existentes de `app.html`; la página monolítica desaparece (decisión PO §2/§5 de la HU).
- **Casos de uso con snippet copiable** (patrón Material/PrimeNG): componente compartido de "caso de uso" (título + demo renderizada + código + botón copiar).
- **El showcase consume el DS**: shell y vistas 100% con tokens `--ds-*` y componentes del kit donde aplique (CA-011.6) — el propio showcase es un caso de consumo.
- **A11y de navegación**: sidebar como landmark `<nav>` con nombre accesible, teclado + foco visible, vista activa con `aria-current` (CA-011.7).
- Al cierre: actualizar el workflow `/ds:add-component` para que los changes futuros de componentes incluyan su vista del showcase como parte del done.
- **Sin changeset**: el playground es app privada, no artefacto publicable.

## Capabilities

### New Capabilities

(ninguna — se modifica la capability existente del playground)

### Modified Capabilities

- `playground-app`: REMOVED Requirements "Single page sin routing" y "Demo del Button en la app" (ambos de Fase 4, superados); ADDED Requirement "Showcase navegable por componente" — derivado 1:1 de los 8 CAs de HU-011.

## Impact

- **Código**: `apps/playground/src/app/` (shell + `showcase/` con una carpeta por vista + registro único componente→ruta→label), `app.routes.ts` nuevo, `app.config.ts` (`provideRouter`), tests de navegación. Storybook y las stories de los packages no se tocan.
- **Dependencias**: `@angular/router` (ya presente en el workspace vía Angular; solo se empieza a usar). Nada nuevo publicable.
- **Riesgo**: la migración de demos es mecánica pero extensa (11 vistas); el criterio de done por vista es "sus casos de uso actuales funcionan igual". El modo zoneless del playground se mantiene (provideRouter es compatible).
- **Sin ADR previsto**: no hay decisión one-way door — ADR-005 queda como historia de la Fase 4 y el spec registra el nuevo contrato; si el patrón de showcase creciera a sitio publicado, ahí se re-evalúa.
