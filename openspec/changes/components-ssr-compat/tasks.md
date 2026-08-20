# Tasks — components-ssr-compat (aaa-055)

## 1. Infraestructura de verificación (el gate primero, para verlo fallar con el código actual)

- [ ] 1.1 Agregar `@angular/platform-server` `^21` como devDependency de `packages/components` y correr `pnpm install`
- [ ] 1.2 Escribir el kitchen-sink SSR (`design.md` D3): componente standalone que instancia todos los componentes públicos (modal con `open=true`, tooltip aplicado, toast disparado en el render, breadcrumbs-router con `provideRouter([])`) + spec con `renderApplication` en `// @vitest-environment node` que asserta render completo y presencia de cada selector
- [ ] 1.3 Correrlo contra el código actual y **verificar que falla** por los accesos a DOM global (modal/toast) — el rojo inicial es la prueba de que el gate mide; registrar qué rutas cazó
- [ ] 1.4 Agregar al spec el test de cobertura: todo componente público de `src/lib/*/index.ts` está ejercitado en el kitchen-sink o declara su forma de ejercitación (service/directiva) — probarlo fallando con un componente comentado
- [ ] 1.5 Escribir el test de barrido estático (`design.md` D4): `document.`/`window.` como global o `getComputedStyle(` sin receptor en `src/lib/**/*.ts` (sin specs/stories, ignorando comentarios) → falla con archivo:línea — probarlo fallando y confirmar que el código actual lo pone en rojo

## 2. Migración al patrón (por componente; en browser la semántica no cambia — la suite existente lo verifica en cada paso)

- [ ] 2.1 `DsModal`: inyectar `DOCUMENT`; crear el effect de sincronización solo en browser (`design.md` D2); `lockBodyScroll`/`unlockBodyScroll` reciben `Document` como parámetro (D5); unit test con `PLATFORM_ID: 'server'`: render con `open=true` no lanza ni lockea
- [ ] 2.2 `DsToastService`: `show()` y atajos con early-return no-op en server devolviendo ref inerte; unit test: `show()` en plataforma server no toca DOM, la ref y su `dismiss()` no lanzan
- [ ] 2.3 `DsTooltip`: migrar `document.*`/`window.*`/`getComputedStyle` a `DOCUMENT` inyectado + `defaultView`
- [ ] 2.4 `DsSelect`: migrar listeners de reposicionamiento, `window.innerWidth/innerHeight` y `getComputedStyle` a la vía inyectada
- [ ] 2.5 `DsMenu` + `DsMenuItem`: migrar `document.activeElement`, listeners y `getComputedStyle` a la vía inyectada
- [ ] 2.6 `DsRadio` (`hasFocus()`) y `DsToastItem` (`getComputedStyle`): migrar a la vía inyectada
- [ ] 2.7 Verificar que el kitchen-sink (1.2), la cobertura (1.4) y el barrido (1.5) quedan en verde, y que la suite completa del package pasa sin regresiones

## 3. Documentación del patrón

- [ ] 3.1 Crear `docs/architecture/adr/ADR-024-patron-ssr-del-kit.md` (MADR): vía única de acceso al DOM por DI, taxonomía ruta→primitiva de `design.md` D2 con los cuándo-no, no-op semántico de APIs imperativas en server, verificación por kitchen-sink + barrido, y el límite conocido de IDs module-level (components-10, Parte J)
- [ ] 3.2 Agregar la fila de ADR-024 a `docs/architecture/decisions-log.md`
- [ ] 3.3 Declarar el soporte SSR en `packages/components/README.md` (sección breve: qué garantiza el kit en server y qué se materializa al hidratar)
- [ ] 3.4 Agregar changeset (`pnpm changeset`, patch del lockstep) describiendo la compatibilidad SSR

## 4. Validación y cierre

- [ ] 4.1 Validación final: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm -r build`, `pnpm -r test`, `pnpm typecheck`, `pnpm storybook:build`, `pnpm verify:packaging`; si `size-limit` se pone rojo por los bytes de las guardas, ajustar techo con su medición en el mismo commit (D-031)
- [ ] 4.2 Proponer mensaje de commit y esperar el OK explícito del PO
- [ ] 4.3 **[bloqueada por OK del PO — D-022]** Gate del PO: este change no tiene delta visual (checklist: 1. la app browser se ve y comporta igual — smoke en playground; 2. el spec SSR en verde es el criterio de aceptación); presentar evidencia y esperar el OK
- [ ] 4.4 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive": promover deltas a specs base (`components-package`, `component-modal`, `component-toast`), artefactos sin links relativos, `openspec/README.md` (borrar aaa-055 de IDs en vuelo), fila en `docs/architecture/catalog.md`, registros de producto (HU/épica si corresponde, README de producto), grooming del BACKLOG (marcar Parte I hecha; evaluar 0.3.0 con el PO)
