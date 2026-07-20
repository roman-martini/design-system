# HU-014 — Breadcrumbs de ubicación (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-20) — [`aaa-027 components-add-breadcrumbs`](../../../../openspec/changes/archive/aaa-027-components-add-breadcrumbs/) archivado; 15 tests (11 core + 4 router), review con 1 media + 1 baja aplicadas (track por url, directiva a archivo propio), gate AA con fix local (`ellipsis.text-hover`), genera [ADR-017](../../../architecture/adr/ADR-017-secondary-entry-points.md) (secondary entry points). Verificación manual pendiente del PO: wrap responsive, truncamiento/expansión con foco y auto-rutas navegando el playground `/breadcrumbs`
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que construye jerarquías de páginas
**QUIERO** un `ds-breadcrumbs` accesible
**PARA** ubicar al usuario en la jerarquía y permitirle volver a niveles superiores.

## Decisiones de refinamiento (PO, 2026-07-20)

1. **Links proyectados, core agnóstico del router**: `ds-breadcrumb-item` proyecta el link del consumidor (`<a href>` o `routerLink`) — el core no depende de `@angular/router`. El item actual (último) se marca automáticamente con `aria-current="page"`. Se descartaron el input `href` (recarga completa u obligaba a acoplar el router) y la API de datos `[items]` (rompe el patrón declarativo del kit).
2. **Separador configurable por template**: default chevron Lucide estático ([ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md), decorativo `aria-hidden`); el consumidor puede proyectar un `ng-template` de separador para cualquier markup. Los separadores nunca son focusables ni se anuncian a AT.
3. **Truncamiento EN v1, "…" expande inline**: input `maxItems` **opt-in** (sin colapso por default). Al superarlo, los items intermedios se ocultan tras un botón "…" con nombre accesible; activarlo los revela en la misma línea (sin overlay — los links permanecen en el nav). Se descartaron el menú dropdown para los ocultos (overlay + foco dentro del nav) y el colapso automático por espacio (ResizeObserver, frágil).
4. **Auto-generación desde rutas EN v1, como secondary entry point**: el PO prioriza el patrón completo. Para no contradecir la decisión 1, la pieza vive en **`@romanmartinidev/components/router`** (primer secondary entry point del package) con `@angular/router` como **peer opcional**: quien no la importa no arrastra el router. Convención `data: { breadcrumb: ... }` en las rutas aceptando **string o función resolver** `(route) => string` (labels con parámetros); rutas sin la data se omiten. **Consecuencia técnica**: la estructura de secondary entry points es one-way door del package → se promueve a ADR al cerrar el change.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-breadcrumbs). -->

- [x] **CA-014.1 (estructura accesible)** — Dado un `ds-breadcrumbs` con items proyectados, entonces el landmark es `<nav>` con nombre accesible configurable (default "breadcrumb") y los items se renderizan como lista ordenada (`<ol>`/`<li>`, patrón APG).
- [x] **CA-014.2 (links agnósticos y item actual)** — Dado un item con un link proyectado (`<a href>` o `routerLink`), entonces el link navega según lo declare el consumidor; dado el último item, entonces expone `aria-current="page"` automáticamente y se renderiza como ubicación actual (no requiere link).
- [x] **CA-014.3 (separador)** — Dado el default, entonces el separador es el chevron Lucide decorativo (`aria-hidden`, tokenizado); dado un template de separador proyectado, entonces se renderiza ese markup entre items; en ambos casos el separador no es focusable ni se anuncia.
- [x] **CA-014.4 (truncamiento opt-in)** — Dado `maxItems` y una jerarquía que lo supera, entonces se muestran el primero y los últimos con un botón "…" (con nombre accesible que indica cuántos niveles oculta) en lugar de los intermedios; cuando se activa, entonces los ocultos se revelan inline, el botón desaparece y el foco queda en el primer item revelado; sin `maxItems`, entonces nunca hay colapso.
- [x] **CA-014.5 (tokens)** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.breadcrumbs.*` nuevos + primitives/semantic existentes) y los pares de contraste que consuma (link, item actual, separador sobre superficie) pasan el gate AA por script.
- [x] **CA-014.6 (auto-generación desde rutas)** — Dado el entry point `@romanmartinidev/components/router` y rutas con `data.breadcrumb` (string o `(route) => string`), entonces la pieza arma los items desde el árbol de rutas activo omitiendo las rutas sin la data, y el item de la ruta activa queda como actual; dado un consumidor que NO importa ese entry point, entonces no necesita `@angular/router` instalado (peer opcional).
- [x] **CA-014.7 (showcase)** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-breadcrumbs` con: básico con links, separador custom por template, truncamiento con "…", auto-generación desde las rutas reales del playground y nota de accesibilidad.

## Dependencias

- Ninguna bloqueante. La estructura del secondary entry point (ng-packagr) se resuelve en el `design.md` del change.

## Fuera de alcance

- Colapso automático por ancho disponible (ResizeObserver) — si aparece el caso real, change propio.
- Menú dropdown para los items colapsados (decisión 3) — el colapso es expansión inline.
- Structured data Schema.org/JSON-LD de breadcrumbs — responsabilidad de la app, no del componente.
- Labels async en el resolver (observables/promesas) — el resolver de v1 es síncrono.

## Notas

- Change OpenSpec: `components-add-breadcrumbs` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: registro padre-hijo scoped (`accordion/`, aaa-026); chevron estático de `select/` (ADR-012); el playground ya usa router con rutas por componente (aaa-022) — banco de prueba real para CA-014.6.
