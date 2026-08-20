# Design — components-ssr-compat (aaa-055)

## Context

Motivación en `proposal.md` § Why. Estado real medido en sesión (2026-08-08), que matiza el hallazgo `components-01`:

- **Rutas que sí se ejecutan durante server render** (las que crashean):
  - `DsModal` — el `effect` del constructor (`packages/components/src/lib/modal/modal.ts:85-102`): con `open=true` invoca `dialog.showModal()` y `lockBodyScroll()` → `document.body`. Los effects corren en server durante el render.
  - `DsToastService.show()` (`packages/components/src/lib/toast/toast.ts:112-119`): API programática; si la app la llama en el arranque (constructor, resolver), `ensureContainer()` hace `document.createElement` + `document.body.appendChild`. El announcer del constructor **ya está guardado** con `isPlatformBrowser` desde `aaa-047` — la guarda cubre el constructor, no `show()`.
- **Rutas event-driven** (no corren en server, pero consumen globals): tooltip (`show()` por mouseenter/focusin — `document.body.appendChild`, listeners en `document`/`window`), select y menu (listeners de reposicionamiento y `window.innerWidth/Height` al abrir), menu y radio (`document.activeElement` en handlers de teclado), y los `getComputedStyle` de tooltip/select/menu/menu-item/toast-item.
- **Precedentes en el kit**: `isPlatformBrowser(inject(PLATFORM_ID))` en toast; `afterNextRender` en breadcrumbs. No hay patrón declarado — exactamente el tipo de convención implícita que la Parte G enseñó a escribir como requirement con test.
- La suite corre en Vitest con environment **jsdom**, donde `document` global existe — un test SSR mal ubicado daría verde falso.

## Goals / Non-Goals

**Goals:**

- Server render sin excepción para los 23 componentes + service, verificado por render real con `@angular/platform-server`.
- Un único patrón de acceso al DOM, verificable mecánicamente, que los componentes futuros hereden sin depender de imitación.
- ADR-024 documentando el patrón (taxonomía de ruta → primitiva a usar).

**Non-Goals:**

- Soporte de hydration incremental o event replay más allá de no romperlos (el kit no controla la config de hydration del consumidor).
- Estabilidad de IDs generados entre server y client (`nextHeadingId` y afines): es `components-10`, va en la Parte J con `createDsId`. Riesgo conocido, ver abajo.
- Render _visual_ del modal abierto en el HTML serializado (el `<dialog>` sin `showModal()` no se pinta; el contenido viaja serializado y se materializa al hidratar). Serializar el estado visual del top layer exigiría duplicar el render del dialog y no lo hace ninguna lib de referencia.
- SSR del playground (no publicable; la verificación vive en la suite del package, no en una app demo).

## Decisions

### D1 — Acceso al DOM: `DOCUMENT` inyectado; `window` derivado de `defaultView`

Todo acceso pasa a `this.document = inject(DOCUMENT)` (import desde `@angular/core`, su casa desde v20; el de `@angular/common` es re-export legacy) y `this.document.defaultView` para `window`/`getComputedStyle`/`innerWidth`.

- **Alternativa: globals + guardas donde haga falta** — descartada: deja dos vías de acceso conviviendo; un refactor que mueve un acceso global de un handler a un effect reintroduce el crash sin que nada lo detecte. Una sola vía hace la regla barrible (D5).
- **Alternativa: CDK `Platform`/`OverlayContainer`** — descartada en proposal (§ Alternativas 2): ADR-013/014 construyeron overlays sin CDK a propósito.
- **Alternativa: adapter propio** — descartada en proposal (§ Alternativas 3): YAGNI.

Es lo que hace Angular Material/CDK en todo su código DOM — la práctica de referencia del ecosistema.

### D2 — Taxonomía de rutas → primitiva (el corazón de ADR-024)

| Tipo de ruta                                            | Primitiva                                                                            | Casos en este change                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| Reactiva continua que toca DOM imperativo (effects)     | Crear el effect **solo en browser** (`if (isBrowser) effect(...)` en el constructor) | `DsModal`                               |
| API programática invocable en server                    | Early-return no-op con ref inerte                                                    | `DsToastService.show()`                 |
| Trabajo one-shot post-render que lee/toca DOM           | `afterNextRender`                                                                    | breadcrumbs (ya existente, se ratifica) |
| Handler de evento DOM y rutas solo alcanzables desde él | Sin guarda — un evento DOM no dispara en server — pero acceso vía D1                 | tooltip, select, menu, radio            |

Para el effect del modal se eligió **no crearlo en server** en vez de early-return adentro: el effect no tiene ningún rol en server (su única salida es DOM imperativo) y no crearlo evita trabajo por render y deja la intención legible. `isPlatformBrowser(inject(PLATFORM_ID))` es la detección canónica y estable.

- **Alternativa: `afterNextRender` para el modal** — descartada: es one-shot; el modal necesita reaccionar a cada cambio de `open`, no solo al primero. El ADR debe decir explícitamente cuándo NO usar cada primitiva — la confusión entre estos dos casos es el error más probable de un componente futuro.
- **Alternativa: toast que bufferea los `show()` de server y los reproduce al hidratar** — descartada: un toast es feedback de una interacción; reproducir en cliente avisos de un render que el usuario no vio es UX incorrecta (y ninguna lib de referencia lo hace). No-op documentado.

### D3 — Verificación: kitchen-sink con `renderApplication` en environment **node**

Spec nuevo `packages/components/src/ssr.spec.ts` (o `test/` según convención del package) que:

1. Define una página standalone que instancia **todos** los componentes públicos (modal con `open=true`, tooltip aplicado, toast disparado durante el render vía inyección en constructor, breadcrumbs-router con `provideRouter([])`).
2. La renderiza con `renderApplication` de `@angular/platform-server` (config zoneless, igual que la suite).
3. Asserta render completo + presencia de cada selector en el HTML.
4. Verifica cobertura: la lista de componentes instanciados se compara contra el filesystem/`public-api.ts` (misma mecánica que el test de índices de `aaa-045`) — un componente nuevo que no esté en el kitchen-sink pone la suite en rojo.

**El detalle que decide el diseño**: el archivo corre con `// @vitest-environment node`. En el environment jsdom de la suite, `document` global existe y **cualquier acceso global daría verde falso** — el test pasaría hoy mismo sin ninguna guarda. En node, el acceso global crashea de verdad. Regla de la Parte F: un gate que no se probó fallando no está instalado — la task de verificación incluye correr el spec con una guarda removida y ver el rojo.

- **Alternativa: smoke SSR en playground (app `@angular/ssr` real)** — descartada como gate: infra nueva (app SSR, build extra en CI, puerto), señal más lenta y no por-componente. El kitchen-sink unit da la misma señal de crash con granularidad de stack trace y cero infra. Una app SSR de validación manual puede sumarse después si el PO la quiere (no bloquea).
- **Alternativa: solo unit tests por componente con `PLATFORM_ID: 'server'` mockeado** — descartada como vía única: mockear la plataforma en jsdom no detecta el acceso global (jsdom lo satisface). Sirve como complemento para las semánticas finas (ref inerte del toast, no-lock del modal) y así se usa.

`@angular/platform-server` entra como devDependency `^21` — no toca `peerDependencies`; el consumidor sin SSR no paga nada.

### D4 — Guarda del barrido estático de globals

Test estructural (en la suite de tokens-style specs del package, junto al de popover display de `aaa-046`) que barre `src/lib/**/*.ts` excluyendo `*.spec.ts`/`*.stories.ts` y falla ante `document.`/`window.` como identificador global o `getComputedStyle(` sin receptor, ignorando líneas de comentario. Señala archivo:línea.

- **Alternativa: ESLint `no-restricted-globals`** — es el destino correcto a largo plazo, pero angular-eslint entra recién en la Parte N (`tooling-repo-01`). El test mantiene la convención del repo (named exports, popover display) y corre en CI hoy; la Parte N puede migrarlo a regla de lint y retirar el test.

### D5 — Scroll lock del modal: helpers reciben el `Document`

`lockBodyScroll`/`unlockBodyScroll` son module-level (contador compartido entre modales anidados) y quedan así, pero reciben `Document` como parámetro desde el componente que lo inyecta. El contador compartido entre documentos distintos es un edge case (multi-window) sin consumidor real; no se complejiza.

## Risks / Trade-offs

- **[Verde falso del gate SSR]** → environment node por archivo + task explícita de "probar el gate fallando" (quitar una guarda, ver el rojo, restaurar) antes de dar por instalado.
- **[Hydration mismatch por IDs module-level]** (`nextHeadingId`, ids de tooltip/select): dos renders (server + client) generan secuencias independientes; con hydration puede loguear mismatch en atributos aria. Preexistente, no introducido acá; su fix es `components-10` (`createDsId` con `APP_ID`, Parte J). El ADR-024 lo deja anotado como límite conocido para no re-descubrirlo.
- **[Bytes de guardas vs techo de size-limit]** → los techos de D-031 tienen margen fino a propósito; si el gate se pone rojo, el ajuste de techo va en el mismo PR con su medición (regla ya documentada en `CONTRIBUTING.md`).
- **[`renderApplication` + zoneless + Vitest en node]**: combinación no ensayada aún en el repo → se valida al escribir el primer spec; si `@analogjs/vite-plugin-angular` no compila templates para el spec en environment node, el fallback es compilar el kitchen-sink como fixture TS puro con `template:` inline (sin `.html` externo), que el plugin ya maneja.
- **[Cobertura del kitchen-sink depende de un mapeo selector→export]** → el test de cobertura se ancla al filesystem (`src/lib/*/index.ts`), la misma fuente que ya usa el test de named exports; un componente sin selector (service, directiva de atributo) declara su forma de ejercitación en el propio spec.

## Migration Plan

Cambio interno sin superficie de API: en browser la semántica es idéntica (la suite de 446 tests del package lo cubre). Rollback = revert del commit. No requiere changeset major; entra al `0.3.0` acumulado como patch/minor del lockstep.

## Open Questions

Ninguna que altere specs o enfoque. La redacción final del README de components (sección "SSR") se resuelve en el apply.
