# Tasks — aaa-018 — Componente DsTabs + DsTab

Cada tarea es ≤2 h con criterio binario. Diseño: contenedor renderiza los botones / hijo hostea el panel (design.md §1), registración con ids cruzados (§2), activo efectivo derivado (§3), roving tabindex con wrap (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (113/113 post aaa-017).
- [x] 1.2 Confirmar tokens `component.tabs.*` en `dist/tokens.css` y primitives `dimension.*` (existen 32/40/48 y `dimension.2` para el underline-width).

**Criterio**: baseline verde; inventario de tokens confirmado.

## 2. Alineación de tokens

- [x] 2.1 `packages/tokens/src/component/tabs.json`: `size.*.height` → `{dimension.32/40/48}` y `underline-width` → `{dimension.2}`. Valores emitidos idénticos (solo cambian a referencias).
- [x] 2.2 Build + test de tokens verdes; emisión verificada.
- [x] 2.3 Contraste por script (4 scopes, 10 pares) — **1 falla corregida por el gate**: pills/contained `text-default` sobre `bg-hover` daba 4.11 en dark (neutral-400 sobre blue-900). Como los themes solo redefinen semantic (no component), el fix es un token nuevo `text-hover` → `{semantic.color.text.primary}` en ambas variantes (9.92 en dark). Resto de pares en verde.

**Criterio**: valores emitidos idénticos salvo fixes de contraste; pares en verde calculados.

## 3. Componentes DsTab y DsTabs

- [x] 3.1 Crear `tab.ts`/`tab.html`/`tab.css`: standalone, OnPush, signals (`value` e `label` requeridos, `disabled`), interfaz `DsTabRegistration`, ids `tabId`/`panelId` con contador de módulo; host = panel (`role="tabpanel"`, `[id]`, `[attr.aria-labelledby]`, `[hidden]` cuando inactivo, `tabindex="0"`); contenido proyectado.
- [x] 3.2 Crear `tabs.ts`: `value` (model `string | null`), `variant`, `size`; `aria-label`/`aria-labelledby` con alias reenviados al tablist; registración reactiva (signal de tabs); `activeValue` computed (value válido → sino primer habilitado); `select(tab)` con guarda de disabled; keydown del tablist (flechas con wrap + skip disabled, Home/End, activación automática con foco).
- [x] 3.3 Crear `tabs.html`/`tabs.css`: strip `role="tablist"` con `@for` de botones (`role="tab"`, `aria-selected`, `aria-controls`, `aria-disabled`, roving `tabindex`) + `<ng-content />` para los paneles; CSS de las 3 variantes por `data-variant` (underline con `box-shadow` inset, sin layout shift), sizes por tokens, focus ring, bloque `prefers-reduced-motion`.
- [x] 3.4 `index.ts` + `export * from './lib/tabs';` en `public-api.ts`; build APF verde. **Hallazgo de infraestructura destapado por CA-006.1**: el build (`ng-packagr -p ng-package.json`) nunca usaba `tsconfig.lib.json` — compilaba con el default no-estricto de ng-packagr, y los typings publicados colapsaban los tipos nullables (`ModelSignal<string | null>` emitía `<string>`; DsTabs es el primer tipo público nullable del kit). Fix: `-c tsconfig.lib.json` en `build` y `watch` de `packages/components/package.json`; la lib ya compilaba limpia bajo strict real. Presente desde aaa-003; documentado en el changeset.

**Criterio**: compilan y buildean; estructura ADR-010; clasificación ADR-011 rama botón aplicada; cero hardcodes.

## 4. Tests de comportamiento (`tabs.spec.ts`)

- [x] 4.1 Un test por scenario del delta: activo inicial (primer habilitado), click activa y muestra panel, set programático, flechas con wrap y skip disabled, Home/End, roving tabindex (0/-1), ARIA (tablist + reenvío de aria-label, tab/aria-selected/aria-controls, tabpanel/aria-labelledby/tabindex), panel oculto conserva DOM (input con valor), disabled no activable, registración dinámica (@for: alta/baja de tabs y fallback del activo), export.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (113 previos + nuevos).

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + playground

- [x] 5.1 `tabs.stories.ts` (CSF 3, title `Components/Tabs`): Default (con `aria-label`, nombre accesible como responsabilidad del consumidor), Variants (las 3), Sizes, WithDisabledTab, StatefulPanels (form dentro de un panel demostrando que el estado se conserva).
- [x] 5.2 Playground: sección "Tabs" con las 3 variantes y un panel con form real.
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-tabs --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/tabs/` — 0 altas; 1 baja corregida (`activeValue` → private); 1 media resuelta como **excepción justificada con aviso al PO** (design.md §7: `tabindex="0"` incondicional en el tabpanel — la detección de focusables proyectados es frágil; APG lo recomienda para paneles sin focusables; se revisa si `/ds:check-a11y` lo pesa con evidencia de AT real). Excepciones de diseño verificadas una a una por el reviewer.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`, con tabs compilado.
- [x] 6.5 Changesets: **minor** de components (DsTabs + DsTab) y **patch** de tokens (alineación).
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate resuelto; changesets correctos; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo previsto (aplica ADR-011 y patrones del kit). Si la implementación destapa una decisión one-way door, se crea en ese momento.
- [ ] 7.2 Mover a `archive/aaa-018-components-add-tabs/`; frontmatter `archived`; sincronizar spec base `components-package` (2 Requirements ADDED, referencias a design.md convertidas a texto autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (próximo ID → `aaa-019`), catálogo, grooming del BACKLOG (Tabs sale de Now; **promover `components-add-toast`** — siguiente de la tanda; Tooltip ya está en Now), HU-006 → Hecha con CAs tildados, EP-002 actualizado (9 componentes).
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, tanda D-009 avanzada.
