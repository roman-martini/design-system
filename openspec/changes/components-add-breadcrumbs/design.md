# Design — components-add-breadcrumbs (aaa-027)

Decisiones técnicas del change. Muere al archivar; lo one-way door (secondary entry points) se promueve a ADR al cerrar.

## Context

Tercera pieza de la tanda 2 (D-011). HU-014 refinada (PO 2026-07-20) fija: links proyectados con core agnóstico del router, separador por template con default chevron, truncamiento opt-in con "…" inline, y **auto-generación desde rutas en v1 empaquetada como secondary entry point** `@romanmartinidev/components/router` con peer opcional. Los retos técnicos: intercalar separadores/"…" entre contenido proyectado, y el primer secondary entry point del package (estructura APF nueva).

## Goals / Non-Goals

**Goals:**

- Patrón APG _breadcrumb_: landmark `nav` + lista, `aria-current="page"` automático en el último item, separadores invisibles para AT.
- Core sin `@angular/router`; la pieza auto solo cuesta a quien la importa.
- Truncamiento accesible sin overlay: revelar inline con foco gestionado.

**Non-Goals:**

- Colapso automático por ancho (ResizeObserver), menú dropdown de ocultos, JSON-LD, resolvers async (fuera de alcance de HU-014).
- Generalizar la infraestructura de secondary entry points más allá de `router`: el ADR fija el criterio; no se crean otros entry points "por si acaso" (D-005).

## Decisions

### 1. API pública

```ts
// public-api.ts (core)
DsBreadcrumbs; // selector ds-breadcrumbs; inputs: aria-label (default 'breadcrumb'), maxItems?: number
DsBreadcrumbItem; // selector ds-breadcrumb-item; proyecta el link (<a href>/routerLink) o texto (item actual)
DsBreadcrumbsSeparator; // directiva de template: <ng-template dsBreadcrumbsSeparator>…</ng-template>

// @romanmartinidev/components/router (secondary entry point)
DsBreadcrumbsRouter; // selector ds-breadcrumbs-router; genera los items desde el árbol de rutas
```

- `DsBreadcrumbs` renderiza `<nav [attr.aria-label]><ol><ng-content /></ol></nav>`. Los `ds-breadcrumb-item` proyectados exponen `role="listitem"` en el host y el `<ol>` lleva `role="list"` explícito — los custom elements intermedios rompen la relación implícita `ol>li` para AT; los roles explícitos la restauran (mismo criterio pragmático que los roles custom de menu/tabs).
- `aria-current="page"` automático: el último item registrado lo expone; sin input `current` (una sola vía — si aparece el caso de current intermedio, se re-evalúa con caso real, D-005).

### 2. Separadores y "…" renderizados por el item (registro con índice)

El contenedor no puede intercalar markup entre contenido proyectado, así que **cada item renderiza su separador previo** (excepto el primero visible) dentro de su template, y el item inmediatamente posterior al rango colapsado renderiza además el **botón "…"**. La coordinación viene del registro padre-hijo scoped (patrón aaa-026) enriquecido con índice:

- `DsBreadcrumbs` computa por item: `isFirst`, `isHidden` (colapso activo y el índice cae en el rango oculto), `showEllipsisBefore` (primer visible después del rango).
- Separador: default chevron Lucide estático (`LucideChevronRight`, ADR-012, `aria-hidden`); si hay `ng-template[dsBreadcrumbsSeparator]`, el item lo renderiza con `ngTemplateOutlet` (el TemplateRef viaja por el registro). Siempre `aria-hidden="true"` en el wrapper del separador — nunca focusable ni anunciado, sea cual sea el markup del template.
- Truncamiento (`maxItems` opt-in): visibles = **primer item + los últimos `maxItems - 1`**; los intermedios se ocultan (`display: none` — también fuera de AT y tab order). El botón "…" expone nombre accesible "Mostrar N niveles ocultos"; al activarse, el contenedor pasa a expandido (estado interno, no vuelve a colapsar solo), los ocultos se revelan y el **foco se mueve al link del primer item revelado**.

### 3. Secondary entry point `components/router` (candidato a ADR — confirmado)

- Estructura APF con ng-packagr: `packages/components/router/` con `ng-package.json` propio (`lib.entryFile: src/public-api.ts`) — ng-packagr lo detecta como secondary entry point y emite `@romanmartinidev/components/router` (FESM propio, types propios, mismo tarball).
- `package.json` de components: `@angular/router` entra a `peerDependencies` con `peerDependenciesMeta: { "@angular/router": { "optional": true } }` — el core no lo importa desde ningún archivo del entry principal (verificable por grep en el gate).
- `DsBreadcrumbsRouter`: se suscribe a `Router.events` (`NavigationEnd`) con `toSignal`, recorre el árbol de `ActivatedRouteSnapshot` desde la raíz acumulando la URL, y arma `{ label, url }[]` con `data.breadcrumb` (string o `(route: ActivatedRouteSnapshot) => string`, síncrono); rutas sin la data se omiten. Renderiza internamente `<ds-breadcrumbs>` + `<ds-breadcrumb-item>` con `routerLink` (acá sí puede — vive en el entry point router) y reenvía `maxItems`/`aria-label`/template de separador.
- **ADR al archivar**: "secondary entry points del package components" — criterio de cuándo se crea uno (integración opcional con una dependencia que el core no debe arrastrar), estructura ng-packagr y regla de peers opcionales. Modifica el alcance de ADR-004 §surface (de "public-api.ts único barrel" a "un public-api por entry point").

### 4. Tokens `component.breadcrumbs.*`

| Grupo     | Tokens                 | Referencia                                                               |
| --------- | ---------------------- | ------------------------------------------------------------------------ |
| item      | gap, font-size         | `{semantic.space.*}`, `{semantic.font.size.body-sm}`                     |
| link      | text, text-hover       | `{semantic.color.text.link}`, `{semantic.color.text.link-hover}`         |
| current   | text, font-weight      | `{semantic.color.text.primary}`, `{font.weight.medium}`                  |
| separator | color, size            | `{semantic.color.icon.muted}`, `{dimension.16}`                          |
| ellipsis  | text, bg-hover, radius | `{semantic.color.text.secondary}`, `{semantic.color.bg.secondary-hover}` |

- **Pares nuevos al gate**: link/surface y link-hover/surface (primer uso de `text.link` en un componente del kit), current/surface, secondary/surface (ya verificado en accordion, se corre igual).

## Risks / Trade-offs

- [`role="list"`/`role="listitem"` explícitos vs `ol>li` nativo] → aceptado: equivalente para AT y es la única forma de mantener items como custom elements proyectados; documentado en el spec.
- [El item renderiza el separador del "anterior": borrado/reorden dinámico de items debe recomputar índices] → el registro es un signal; los computed por índice se recalculan solos; se testea agregando/quitando items.
- [Primer secondary entry point: el pack puede romperse (types/exports)] → gate reforzado: `npm pack --dry-run` debe listar los bundles de `router/` y el test de export verifica ambos public-api; smoke de import en playground (que ya usa router).
- [Peer opcional mal declarada rompería a consumidores sin router] → verificación explícita en el gate: grep de `@angular/router` fuera de `router/` = 0 ocurrencias; `pnpm -F playground build` cubre el consumo real.
- [Resolver `(route) => string` ejecuta código del consumidor en cada navegación] → contrato documentado: síncrono y puro; async queda fuera (HU-014 §Fuera de alcance).

## Open Questions

(ninguna — el refinamiento de HU-014 cerró todas las decisiones de producto; las técnicas quedan resueltas arriba)
