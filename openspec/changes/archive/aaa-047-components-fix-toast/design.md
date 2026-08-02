# Design — components-fix-toast

## Context

Motivación en `proposal.md` § Why. Estado actual relevante, leído en el código:

- `DsToastService` (`providedIn: 'root'`) mantiene el stack como signal y crea el contenedor con `createComponent` + `document.body.appendChild` dentro de `ensureContainer()`, invocado desde `show()`.
- El `role` vive en el **host del item** (`toast-item.ts`, host binding: `alert` para danger, `status` para el resto). El contenedor no tiene rol.
- El contenedor es `popover: 'manual'` y su CSS declara el `display` solo en `:popover-open` — o sea, **cerrado computa `display: none`** y queda fuera del árbol de accesibilidad. Esa convención se volvió requirement de `components-package` en `aaa-046`.
- El service no toca `document` hasta el primer `show()`. Es accidental, pero hoy es lo único que lo hace tolerable en SSR.

## Goals / Non-Goals

**Goals:**

- Que el primer toast de la sesión se anuncie, con la urgencia que corresponde a su variante.
- Que el anuncio no dependa de que un nodo recién insertado sea observado por la AT.
- Que el fix no empeore el estado SSR del kit.

**Non-Goals:**

- **No** se define la estrategia SSR del kit: eso es la Parte I, que decide el patrón transversal (inyección de `DOCUMENT`, `afterNextRender`, verificación). Acá se usa la guarda mínima que el propio fix exige.
- **No** se extrae un servicio de anuncios reusable: hoy hay un solo consumidor (ver Decisiones §4).
- **No** se cambia el aspecto, la posición, el stacking ni los timers del toast.

## Decisions

### 1. La región vive fuera del popover, no dentro del contenedor

El anunciador es un elemento propio en `document.body`, hermano del contenedor visual, no un hijo suyo. El motivo es concreto y medible: el contenedor es un popover cerrado mientras no hay toasts, y un elemento con `display: none` **no existe para la AT**. Cualquier región alojada ahí adentro aparecería recién con el primer toast, que es exactamente el defecto que se está corrigiendo.

Consecuencia deliberada: el anuncio y la presentación quedan desacoplados. El item visual pierde su `role` y pasa a ser solo presentación; el texto anunciado lo escribe el service. Es el mismo reparto que usa `LiveAnnouncer` en Material.

### 2. Dos regiones estáticas (polite y assertive), no una mutable

El kit ya distingue urgencia por variante (`status` vs `alert`). Mutar `aria-live` sobre una región existente no es confiable: varios lectores cachean el valor cuando construyen el árbol de accesibilidad, así que un cambio en caliente puede no tener efecto. Dos regiones creadas juntas al inicializar, cada una con su politeness fija, evitan el problema sin costo relevante (dos `<div>` vacíos).

### 3. Ocultamiento que preserva el árbol de accesibilidad

La región no puede usar `display: none` ni `visibility: hidden` (ambos la sacan del árbol de accesibilidad) ni `aria-hidden`. Se usa el patrón _visually hidden_ clásico: tamaño de 1px, `overflow: hidden`, `clip-path` y `white-space: nowrap`, con `position: absolute` para que no afecte el layout. Los estilos van **inline en el elemento**, no en un CSS de componente: el anunciador lo crea el service con DOM directo y no tiene encapsulación de Angular que le aplique una clase.

Es la primera vez que el kit necesita este patrón. Queda inline y comentado; si aparece un segundo consumidor, se promueve junto con el servicio de anuncios (§4).

### 4. Sin extracción prematura de un "servicio de anuncios"

Un `DsLiveAnnouncer` reusable es la evolución natural, pero hoy el único consumidor es el toast. ADR-016 regla 3 difiere la extracción hasta el tercer caso, y es el mismo criterio con el que `aaa-046` dejó el typeahead duplicado para la Parte J. Cuando un segundo componente necesite anunciar (validación asíncrona, cambio de página en `DsPagination`), ahí se evalúa con dos casos reales sobre la mesa en vez de con uno y una hipótesis.

### 5. Guarda de plataforma: condición del fix, no adelanto de la Parte I

Mover la creación al arranque del service convierte un acceso al DOM tardío y condicional en uno seguro e incondicional. Como `DsToastService` es `providedIn: 'root'`, en SSR se instanciaría al inyectarlo y tocaría `document` en el servidor: **sin guarda, este change empeora el SSR**. Por eso la guarda entra acá, acotada a este acceso, con `isPlatformBrowser`.

Que la Parte I después unifique el patrón (inyección de `DOCUMENT` o `afterNextRender`) no invalida esto: lo que no se puede hacer es introducir hoy una regresión conocida y dejarla anotada para dentro de tres changes.

### 6. Re-anuncio de mensajes idénticos consecutivos

Escribir dos veces el mismo texto en una live region no siempre produce dos anuncios: si el `textContent` no cambia, varios lectores no detectan mutación. Se limpia la región antes de escribir el mensaje nuevo, de modo que la secuencia sea siempre "vaciar → escribir" y la mutación exista aunque el texto se repita.

## Risks / Trade-offs

- **[jsdom no ejecuta lectores de pantalla]** → los tests verifican la estructura y el destino del texto (la región existe antes del primer toast; el mensaje aterriza en la región de la politeness correcta; el item ya no declara rol), que es lo que la spec puede exigir de forma binaria. El anuncio real es verificación manual, y queda anotado como límite igual que el stack sobre modal en CA-008.6.
- **[El item pierde su `role`, que la spec declaraba]** → cambio de DOM observable, por eso va con delta de spec y mención en el changeset. Un consumidor que asertara ese `role` en sus tests tiene que mirar la región de anuncios.
- **[Dos elementos más en el `body` de toda app que inyecte el service]** → son dos `<div>` vacíos sin presencia visual; el costo es despreciable frente a que el primer toast se anuncie. Se destruyen en `ngOnDestroy` junto con el contenedor.
- **[El bundle crece con 60 B de margen disponible]** → el techo se sube en este PR con la regla de D-031, con el ajuste ya aprobado por el PO.
