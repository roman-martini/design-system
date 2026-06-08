# Buenas prácticas de componentes Angular — extraídas de angular.dev

> **Fuente**: documentación oficial de Angular (angular.dev). **Versión de referencia**: Angular v22
> (válido para v20+). **Fecha de extracción**: 2026-06-07.
>
> Este archivo es el **knowledge base** que alimenta al grupo de agentes `ng-*`.
> Cada práctica lleva la URL fuente para trazabilidad y para que el agente de sincronización
> (`ng-sync`) pueda re-verificarla cuando Angular publique versiones nuevas.

---

## Lista de URLs canónicas vigiladas

El agente de sincronización recorre estas URLs para detectar prácticas nuevas o cambiadas:

| # | Tema | URL |
|---|------|-----|
| 1 | Style guide | https://angular.dev/style-guide |
| 2 | Componentes (authoring) | https://angular.dev/guide/components |
| 3 | Signals | https://angular.dev/guide/signals |
| 4 | Control flow en templates | https://angular.dev/guide/templates/control-flow |
| 5 | Zoneless | https://angular.dev/guide/zoneless |
| 6 | Runtime performance | https://angular.dev/best-practices/runtime-performance |
| 7 | Skipping subtrees (OnPush) | https://angular.dev/best-practices/skipping-subtrees |
| 8 | Zone pollution | https://angular.dev/best-practices/zone-pollution |
| 9 | Slow computations | https://angular.dev/best-practices/slow-computations |
| 10 | Security | https://angular.dev/best-practices/security |
| 11 | Accessibility (a11y) | https://angular.dev/best-practices/a11y |
| 12 | Server-side rendering | https://angular.dev/best-practices/performance/ssr |

> Roadmap y novedades de versión: https://angular.dev/roadmap y https://blog.angular.dev/.

---

## 1. Naming y organización de archivos
_Fuente: https://angular.dev/style-guide_

- Separar palabras en nombres de archivo con guiones: `user-profile.ts`.
- El nombre del archivo refleja la clase/componente principal que contiene.
- TS, template y estilos del componente comparten el mismo nombre base.
- Tests terminan en `.spec.ts`.
- Agrupar archivos estrechamente relacionados en el mismo directorio (componente + template + test juntos).
- Organizar por **áreas de feature**, no por tipo de código (evitar carpetas `components/`, `directives/`, `services/`).
- Un concepto por archivo; dividir cuando un directorio se vuelve inmanejable.
- Todo el código de UI vive bajo `src/`; bootstrap en `src/main.ts`.

## 2. Autoría de componentes
_Fuente: https://angular.dev/guide/components y https://angular.dev/style-guide_

- **Standalone por defecto** (default desde v19+): agregar dependencias directo al array `imports`; cero `NgModule` en código nuevo.
- Todo componente tiene: clase TS con comportamiento, template HTML y un selector CSS.
- Separar template y estilos en archivos (`templateUrl` / `styleUrl`) para claridad.
- Selector con prefijo específico de la app; selectores de atributo en camelCase.
- Agrupar miembros Angular (inputs, outputs, queries, dependencias inyectadas) **antes** de los métodos.
- `protected` para miembros usados solo por el template; `readonly` para lo que Angular setea (`input`, `model`, `output`, queries).
- Nombrar event handlers por la **acción** que realizan, no por el evento: `saveUserData()`, no `handleClick()`.
- Mantener lifecycle hooks simples; extraer la lógica a métodos auxiliares bien nombrados.
- Implementar las interfaces de lifecycle (`OnInit`, etc.) para garantizar nombres correctos.
- Mantener el componente enfocado en presentación; sacar validaciones/transformaciones complejas afuera.
- Evitar lógica compleja en templates; usar `computed()` para complejidad moderada.

## 3. Inyección de dependencias y sintaxis moderna
_Fuente: https://angular.dev/style-guide_

- Preferir la función `inject()` sobre inyección por parámetros de constructor.
- Preferir bindings directos `[class]` y `[style]` sobre `NgClass` / `NgStyle` (legibilidad y performance).
- Ante conflicto de reglas con el estilo de un archivo existente, priorizar la **consistencia** dentro del archivo.

## 4. Signals (modelo reactivo por defecto)
_Fuente: https://angular.dev/guide/signals_

- Estado mutable con `signal(initialValue)`; leer con el getter `miSignal()`.
- Preferir `.update(v => ...)` para cambios derivados; `.set()` para asignación directa.
- Exponer estado de solo lectura con `.asReadonly()`.
- Igualdad custom con `{ equal: isEqual }` para evitar actualizaciones innecesarias.
- Estado derivado con `computed()`: lazy, memoizado, seguro para operaciones costosas (filtros, etc.).
- Un `computed` **no es escribible** (`.set()` da error de compilación).
- Solo se trackean las signals **realmente leídas** durante la derivación (lecturas condicionales optimizan dependencias).
- `untracked()` para leer una signal sin crear dependencia.
- El contexto reactivo se pierde tras un `await`: leer las signals **antes** de la llamada async.
- `effect()` **solo** para sincronizar con APIs externas no reactivas. **No** usar `effect()` para derivar estado: usar `computed()` o `linkedSignal()`.
- `linkedSignal()` para estado escribible derivado de otras signals.
- `resource()` / `rxResource()` para datos async integrados a signals con acceso síncrono.
- **Signal inputs**: `input()` / `input.required()` para props reactivas.
- `model()` para two-way binding; `output()` para emitir eventos.
- **Signal queries**: `viewChild()`, `viewChildren()`, `contentChild()`.
- Interop RxJS: convertir observables con `toSignal()` o `rxResource()` en el límite async.
- Helpers de runtime: `isSignal()`, `isWritableSignal()`.

## 5. Control flow en templates
_Fuente: https://angular.dev/guide/templates/control-flow_

- Usar control flow nativo `@if` / `@else if` / `@else`, `@for`, `@switch`; reemplazan a `*ngIf` / `*ngFor` (legacy) con mejor performance.
- `@if (cond; as value)` para guardar el resultado de la condición.
- **`@for` siempre con `track`**; trackear por identificador único (`id`/`uuid`), no por índice ni por referencia.
- `track $index` solo para colecciones estáticas; `track item` (referencia) provoca updates mucho más lentos.
- Variables de contexto en `@for`: `$count`, `$index`, `$first`, `$last`, `$even`, `$odd`; aliasar con `let` en loops anidados.
- `@empty` inmediatamente después del `@for` para colección vacía.
- `@switch` con comparación estricta (`===`), sin fallthrough; `@default` opcional; `@default never;` para chequeo exhaustivo de uniones.
- `@let` para variables locales en el template.

## 6. Performance en runtime
_Fuente: https://angular.dev/best-practices/runtime-performance, /skipping-subtrees, /zone-pollution, /slow-computations_

- `ChangeDetectionStrategy.OnPush` para saltar subárboles que no cambiaron.
- **Zoneless** como objetivo: elimina el overhead de Zone.js.
- Evitar **zone pollution**: no disparar operaciones async innecesarias que fuerzan change detection.
- `@defer` con triggers explícitos para cargar secciones del template solo cuando se necesitan.
- `NgOptimizedImage` (`<img ngSrc>`) para imágenes; `width`/`height` y `priority` en la imagen LCP.
- Evitar expresiones pesadas en templates (se recalculan en cada ciclo de CD); mover a `computed()`.
- Identificar y refactorizar **slow computations**.
- Medir con Angular DevTools / Chrome DevTools antes y después de optimizar.

## 7. Seguridad
_Fuente: https://angular.dev/best-practices/security_

- Angular trata todos los valores como **no confiables** por defecto y los sanitiza al insertarlos en el DOM.
- La interpolación escapa automáticamente; no interpreta HTML.
- Bindear datos del usuario a `innerHTML` es riesgo de XSS sin sanitización.
- `DomSanitizer.sanitize()` con el `SecurityContext` correcto para manipulación directa del DOM.
- `bypassSecurityTrust*` solo tras inspección; construir el `SafeValue` lo más cerca posible del dato de entrada (auditoría más fácil).
- Compilador **AOT** por defecto: previene inyección en templates. Nunca generar templates concatenando input de usuario, ni en el servidor con un motor de plantillas.
- **CSP**: baseline `default-src 'self'`; `style-src`/`script-src` basados en nonce único por request (no predecible). Nonce vía `autoCsp`, atributo `ngCspNonce` o token `CSP_NONCE`.
- **Trusted Types** para reforzar a nivel DOM; configurar headers CSP en producción.
- **XSRF/CSRF**: `HttpClient` lee cookie `XSRF-TOKEN` y setea header `X-XSRF-TOKEN` en requests mutantes; configurable con `withXsrfConfiguration()`.
- **XSSI**: `HttpClient` quita el prefijo `")]}',\n"` de respuestas JSON (el server debe agregarlo).
- No usar APIs del DOM directamente (`document`, `ElementRef.nativeElement`) — no tienen sanitización automática; preferir templates.
- Mantener Angular actualizado (parches de seguridad); no usar forks privados; auditar usos de `bypassSecurityTrust*` en review.
- **SSRF** (SSR): validar con allowlist los headers `Host`/`X-Forwarded-*`; configurar `security.allowedHosts` en `angular.json`; evitar wildcard `*`.

## 8. Accesibilidad
_Fuente: https://angular.dev/best-practices/a11y_

- Reutilizar elementos nativos (`<button>`, `<a>`) antes que implementaciones custom.
- Usar content projection (componente contenedor) cuando hay que envolver un elemento nativo.
- ARIA dinámico con attribute binding: `[attr.role]`, `[aria-label]`; ARIA estático como atributo HTML normal.
- Angular CDK a11y: `LiveAnnouncer` (regiones `aria-live`), `cdkTrapFocus` para modales.
- Angular Aria (directivas headless): accordion, combobox, listbox, menu, tabs, toolbar con teclado y foco resueltos.
- Tras navegación, mover el foco al contenido principal (escuchando `NavigationEnd`).
- `RouterLinkActive` con `ariaCurrentWhenActive="page"` para indicar la ruta activa.
- Envolver bloques `@defer` en regiones `aria-live` para anunciar contenido cargado dinámicamente.
- Enforzar reglas de a11y con Angular ESLint (`@angular-eslint/template`).

## 9. Principios transversales de frontend (agnósticos de Angular)

- Composición sobre herencia; responsabilidad única; separación de incumbencias.
- Flujo de datos unidireccional; inmutabilidad de inputs (nunca mutar un input).
- Frontera clara entre lógica de dominio y UI (presentacionales puros, sin servicios de dominio).
- TypeScript estricto (`strict: true`), cero `any`.
- Nombres reveladores; DRY sin sobre-abstraer.
- Testing de comportamiento, no de implementación; queries por rol/label, no por selectores CSS.

---

## Cómo se usa este knowledge

- **`ng-component` (builder)**: genera componentes aplicando §1–§9.
- **`ng-review` (reviewer)**: audita cada componente contra §1–§9; cada ítem es verificable (sí/no).
- **`ng-sync` (sincronizador)**: recorre la *Lista de URLs canónicas vigiladas*, detecta prácticas
  nuevas/cambiadas respecto de este archivo (fecha de extracción), y reporta qué hay que actualizar
  acá y qué del código quedó desalineado con la versión nueva de Angular.
