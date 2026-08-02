---
id: aaa-047
name: components-fix-toast
type: change
status: archived
archived: 2026-08-02
modifies-specs:
  - component-toast
related-adrs:
  - ADR-014
  - ADR-016
related-decisions:
  - D-007
  - D-022
  - D-031
---

# Proposal — components-fix-toast

# Why

**El primer toast de la sesión puede no anunciarse en un lector de pantalla** [components-04]. `ensureContainer()` crea el contenedor recién en el primer `show()`, y el `role="status"`/`role="alert"` viaja en el host del item que se inserta en ese mismo ciclo: una live region que aparece junto con su contenido frecuentemente no se anuncia — las regiones `aria-live` tienen que preexistir en el DOM para que la AT las observe. Es una limitación conocida de los lectores de pantalla, y por eso Material y Spectrum mantienen una región viva persistente.

Leyendo el componente aparece un agravante que el hallazgo no registra: el contenedor es un **popover manual**, y un popover cerrado computa `display: none` (convención confirmada como requirement en `aaa-046`). Un elemento con `display: none` está **fuera del árbol de accesibilidad**, así que la región no solo nace con su contenido: nace saliendo de la invisibilidad. Crear el contenedor de forma temprana —lo que el hallazgo propone— no alcanza por sí solo: mientras el elemento anunciador esté dentro del popover, sigue oculto para la AT hasta que hay un toast.

Es severidad **media** por catálogo, pero su impacto es alto y silencioso: el primer toast suele ser el más importante de la sesión (la confirmación de que algo se guardó, o el error de que no). Y contradice a D-007, que es la razón por la que el kit existe. Tercer change de la Parte G, ordenado por severidad.

**Prioridad respaldada**: la 1 (buenas prácticas — a11y por diseño, no como agregado).

# What Changes

- **Región de anuncios persistente, fuera del popover**: el service crea al inicializarse un elemento anunciador en `document.body`, oculto visualmente pero presente en el árbol de accesibilidad, con **dos regiones**: una `polite` y una `assertive`. Se necesitan dos porque la _politeness_ de una región no se puede cambiar en caliente de forma confiable, y el kit ya distingue `status` (success/info/warning) de `alert` (danger).
- **El texto del toast se escribe en la región correspondiente** al mostrarlo, en vez de depender de que el nodo visual recién insertado sea leído. El item visual **deja de llevar `role`**: con la región persistente anunciando, conservarlo produciría un anuncio duplicado.
- **Guarda de plataforma obligatoria**: crear el anunciador al inicializar el service lo haría tocar `document` en cualquier entorno, y hoy `DsToastService` es `providedIn: 'root'`. Sin guarda, este fix **empeoraría** el estado SSR en lugar de dejarlo igual (hoy el service no toca el DOM hasta el primer `show()`). La guarda entra acá porque es condición del fix, no como adelanto de la Parte I — que sigue siendo la dueña de la estrategia SSR del kit.
- **Tests** de que la región existe antes del primer toast, de que el mensaje aterriza en la región de la politeness correcta y de que el item ya no duplica el anuncio.
- Changeset: **patch** de `components` (y `tokens` por el lockstep de ADR-015). **El techo de bundle de `components` se sube en este PR**: quedó con 60 B de margen tras `aaa-046` y este change agrega código; el ajuste está aprobado por el PO (2026-08-01) y se aplica con la regla de D-031 sobre lo medido.

# Capabilities

## Modified Capabilities

- `component-toast`: el scenario de anuncio por live region cambia de "el elemento del toast lleva `role`" a "existe una región de anuncios persistente que recibe el mensaje", agregando que la región preexiste al primer toast.

# Alternativas evaluadas

1. **Crear el contenedor de forma temprana y dejar el `role` en el item** (lo que recomienda el hallazgo) — descartada. Es la mitad del problema: aunque el contenedor exista desde el arranque, el elemento que lleva el `role` sigue siendo el item, que nace con su texto; y el contenedor es un popover cerrado con `display: none`, invisible para la AT. Se corregiría el síntoma solo en los lectores más tolerantes.
2. **Mantener el contenedor siempre abierto** (`showPopover()` desde el inicio, vacío) para que la región nunca esté oculta — descartada. Un popover manual abierto y vacío queda en el top layer de forma permanente, con riesgo de interceptar eventos y de aparecer en recorridos de foco; se gana la persistencia de la región a cambio de un elemento invisible siempre presente en la capa superior de toda app consumidora.
3. **Una sola región cambiando `aria-live` según la variante** — descartada. Cambiar la _politeness_ de una región existente no es confiable entre lectores: varios cachean el valor al construir el árbol. Dos regiones estáticas es el patrón que usan los DS de referencia.
4. **Exponer la creación en `provideDsToasts` vía `ENVIRONMENT_INITIALIZER`** (la otra vía que sugiere el hallazgo) — descartada por su modo de fallo. Ataría el fix a que el consumidor llame al provider, pero `provideDsToasts` es **opcional** hoy (la config tiene defaults y el service es `providedIn: 'root'`): una app que usa toasts sin providerlos —caso soportado— se quedaría sin región. Inicializar con el service cubre a todos los consumidores por igual.

# Impact

- **Código**: `packages/components/src/lib/toast/{toast.ts, toast-item.ts, toast.spec.ts}`, `.size-limit.json` y la tabla de medidos de `CONTRIBUTING.md`, un changeset.
- **Consumidores**: sin cambios de API. Cambia el DOM observable del toast (el item pierde su `role`), que la spec declaraba: por eso el delta. Un consumidor que asertara el `role` sobre el elemento visual en sus propios tests tendría que mirar la región de anuncios; se documenta en el changeset.
- **Bundle**: crece por el anunciador y la guarda de plataforma. El techo de `components` se recalcula en este PR (D-031, ajuste aprobado); parte de lo que crece acá lo recupera la Parte J al deduplicar el scaffolding de overlays.
- **ADR**: no genera. La región de anuncios es hoy un mecanismo interno de un solo componente; si un segundo componente necesita anunciar (paginación, validación asíncrona), ahí corresponde evaluar extraerlo como servicio interno compartido — el umbral del "tercer caso" de ADR-016 aplica igual que para los overlays.
- **Gate visual del PO (D-022)**: aplica. Es un fix de a11y sin cambio visual esperado, así que el gate verifica justamente eso: que el stack se vea y se comporte igual que antes.
