---
id: aaa-055
name: components-ssr-compat
type: change
status: proposed
modifies-specs:
  - components-package (requirement transversal de compatibilidad SSR)
  - component-modal (comportamiento del modal abierto durante server render)
  - component-toast (comportamiento de show() durante server render)
related-adrs:
  - ADR-024 (a crear al cerrar: patrón SSR del kit)
  - ADR-013
  - ADR-014
related-decisions:
  - D-028
---

## Why

`@romanmartinidev/components` se publica como lib Angular profesional, pero **crashea el server render de cualquier app con `@angular/ssr`** (hallazgo `components-01` de la review integral del 2026-07-26, severidad alta — uno de los Top 6 críticos). Dos rutas tocan el DOM global durante el render en server: el `effect` de `DsModal` (con `open=true` inicial ejecuta `dialog.showModal()` y `document.body.style.overflow`) y `DsToastService.show()` (si la app lo llama en el arranque, `ensureContainer()` hace `document.createElement`/`document.body.appendChild`). Además, cinco componentes consumen los globals `document`/`window` directamente en vez del `DOCUMENT` inyectable, sin ningún patrón declarado que gobierne cómo un componente futuro debe tocar el DOM.

Es el **último bloqueante acordado del release `0.3.0`** (el acuerdo con el PO era Partes E + G + I; E y G ya cerraron) y una decisión one-way door: el patrón que se fije acá lo heredan los 23 componentes actuales y todos los futuros.

**Prioridades que respalda**: (1) buenas prácticas — SSR-safety es la vara de toda lib Angular seria (Material/CDK, PrimeNG, Spartan la cumplen); (2) arquitectura que escala — un patrón único documentado por ADR evita que cada componente nuevo improvise su propia guarda.

## What Changes

- **Patrón SSR del kit (nuevo, transversal)**: todo acceso al documento se hace vía `DOCUMENT` inyectado (de `@angular/core`) y `window` se deriva de `document.defaultView`; las rutas que pueden ejecutarse durante server render llevan guarda de plataforma; los handlers de eventos DOM y las rutas solo alcanzables desde ellos pueden asumir browser (un evento DOM no dispara en server). Queda documentado como **ADR-024** al cerrar el change.
- **`DsModal`**: el `effect` que sincroniza `open` con el `<dialog>` nativo se vuelve no-op en server. Un modal con `open=true` en SSR no invoca `showModal()` ni lockea el scroll del body: se abre en el cliente cuando la hidratación ejecuta el effect.
- **`DsToastService`**: `show()` (y los atajos `success`/`info`/`warning`/`danger`) se vuelven no-op en server y devuelven un ref inerte — un toast es feedback transitorio para un usuario que aún no está interactuando; serializarlo no tiene sentido. `ensureContainer()` queda inalcanzable en server.
- **`DsTooltip`, `DsSelect`, `DsMenu`, `DsRadio`, `DsModal`, `DsToastService`**: migración de los globals `document.*`/`window.*` a `DOCUMENT` inyectado + `defaultView`, sin cambio de comportamiento en browser.
- **Verificación por render real en server**: spec nuevo en `packages/components` que renderiza con `@angular/platform-server` (`renderApplication`) una página kitchen-sink con **todos** los componentes del kit — no solo los cinco afectados — y asserta que el render server completa y emite el HTML esperado. Todo componente futuro queda cubierto por defecto al sumarse al kitchen-sink (misma mecánica de barrido que el test de índices de `aaa-045`).
- **Specs**: requirement transversal de compatibilidad SSR en `components-package`; escenarios SSR propios en `component-modal` y `component-toast` (los únicos con semántica SSR observable más allá de "renderiza sin crashear").
- Sin cambios de API pública ni visuales: en browser el comportamiento es idéntico.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `components-package`: nuevo requirement transversal — todo componente del kit debe renderizar en server (platform server) sin tocar DOM global, con la regla de patrón (DOCUMENT por DI, guarda en rutas no event-driven) y el kitchen-sink de platform-server como verificación.
- `component-modal`: nuevo requirement — comportamiento declarado del modal durante server render (`open=true` no invoca APIs imperativas del dialog ni lockea scroll; el estado se materializa al hidratar).
- `component-toast`: nuevo requirement — `show()` y atajos son no-op seguros en server y devuelven ref inerte.

## Impact

- **Código**: `modal.ts`, `toast.ts`, `tooltip.ts`, `select.ts`, `menu.ts`, `radio.ts` (inyección de `DOCUMENT`, guardas, sin cambio de API). Los helpers module-level de `modal.ts` (`lockBodyScroll`/`unlockBodyScroll`) reciben el documento como parámetro o se mueven al componente.
- **Dependencias**: `@angular/platform-server` entra como **devDependency** de `packages/components` (solo para el spec SSR; no toca `peerDependencies` — el consumidor sin SSR no paga nada).
- **Tests**: spec nuevo `ssr.spec.ts` (kitchen-sink con `renderApplication`) + escenarios unit de las guardas de modal/toast. Suite actual: 1245 tests.
- **Docs**: ADR-024 (patrón SSR del kit) + fila en `docs/architecture/decisions-log.md`; el README de `packages/components` declara el soporte SSR.
- **Riesgo**: bajo en browser (misma semántica; la migración a `DOCUMENT` es mecánica y la cubre la suite existente). El gate de bundle size puede requerir ajuste menor de techo (`size-limit`) por los bytes de las guardas.

## Alternativas evaluadas

1. **Declarar el kit browser-only** (documentar "no soporta SSR" en README y specs) — descartada: contradice la vara profesional declarada del repo; Material, PrimeNG y todo design system Angular maduro soportan SSR. Bloquearía la adopción en cualquier app con `@angular/ssr`, que es el default de `ng new` moderno.
2. **Adoptar `@angular/cdk` (Platform/OverlayContainer) para resolver plataforma y contenedores** — descartada: el kit decidió no depender de CDK (ADR-013/ADR-014 construyen overlays sobre primitivas de plataforma justamente para no arrastrarlo); sumarlo como peer por dos guardas y una inyección es costo de dependencia desproporcionado.
3. **Abstracción propia `DsDomAdapter`/`DsPlatform` (service que envuelve todo acceso DOM)** — descartada: capa de indirección sin segundo consumidor real; Angular ya provee las primitivas exactas (`DOCUMENT`, `isPlatformBrowser`, `afterNextRender`) y envolverlas viola YAGNI sin ganar testabilidad (los specs ya corren en jsdom).
4. **Guardar con `afterNextRender` en vez de `isPlatformBrowser` en las rutas server** — matiz, no alternativa completa: `afterNextRender` sirve para trabajo one-shot post-render (así lo usa breadcrumbs), pero el `effect` del modal es reactivo continuo y `show()` del toast es una API programática síncrona — en ambos la guarda de plataforma es el patrón correcto. El ADR documenta cuándo va cada primitiva.
