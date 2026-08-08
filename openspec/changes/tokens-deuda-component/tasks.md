# Tareas — aaa-053

Orden de `design.md`: retiros → tokens → CSS → verificación → gate → cierre.

## 1. Retiros (D5)

- [x] 1.1 Eliminar `packages/tokens/src/component/alert.json` (24 tokens; D-033a, capacidad registrada en HU-041).
  - **Aceptación**: el archivo no existe; `pnpm -F @romanmartinidev/tokens build` verde; `dist/tokens.css` sin `--ds-component-alert-*`.
- [x] 1.2 Borrar las claves `focus-ring-color` y `focus-ring-width` de `button.json`, y `focus-ring` de `checkbox.json`, `input.json`, `radio.json` y `switch.json` (D-033b).
  - **Aceptación**: `dist/tokens.css` sin `--ds-component-*-focus-ring*`; los componentes siguen resolviendo el foco vía `--ds-semantic-shadow-focus`.
- [x] 1.3 Borrar `radio.dot-size.sm/md`, `modal.z-index`, `avatar.status-border`, `avatar.status-size` y `card.padding.lg`. (+ `button.link.*` (5), descubierto en el apply: `DsButtonVariant` no incluye `link` — se retira por el criterio de D5, no se conecta.)
  - **Aceptación**: build y suite de tokens verdes; ninguna referencia rota (el test de jerarquía lo verifica).

## 2. Tokens (D3 + D4)

- [x] 2.1 `component.switch.thumb.bg` → `{semantic.color.text.inverse}` en `switch.json`, con comentario del racional (cadena de `aaa-051`, va sobre `bg.primary`).
  - **Aceptación**: `dist/themes/dark.css` hace que el thumb resuelva a `neutral.900` en dark; el par thumb/track del gate de contraste pasa en los 4 themes.
- [x] 2.2 Agregar `component.radio.bg-on-hover` = `{semantic.color.bg.primary-hover}` en `radio.json`.
  - **Aceptación**: emitido en `dist/tokens.css`; simétrico con `checkbox.bg-on-hover`.

## 3. Botón (D1 + D2)

- [x] 3.1 Conectar `button.css` a su capa component: los colores de `primary`, `secondary`, `ghost`, `danger` y `danger-ghost` pasan de `var(--ds-semantic-color-*)` a `var(--ds-component-button-<variant>-*)`.
  - **Aceptación**: cero consumos de `--ds-semantic-color-*` en `button.css` para valores que `button.json` declara; los valores computados en los 4 themes son idénticos a los previos (verificar con el playground o diff del CSS emitido).
- [x] 3.2 `font-weight: var(--ds-component-button-font-weight)` en `button.css` (semibold 600 — la verdad decidida por el PO).
  - **Aceptación**: peso computado 600 en todas las variantes y sizes; la altura del control y el centrado vertical no cambian (tests de `aaa-047` verdes).
- [x] 3.3 Actualizar la suite del botón: no-consumo de semantic directo para valores declarados en la capa component, y peso desde el token.
  - **Aceptación**: el test falla si se revierte 3.1 o 3.2.

## 4. Hovers de controles (D4)

- [x] 4.1 `checkbox.css`: fondo `bg-off-hover`/`bg-on-hover` bajo `:hover:not(:disabled)` (aplica también a indeterminate como estado marcado).
  - **Aceptación**: hover visible en ambos estados; disabled inmutable; sin literales de color.
- [x] 4.2 `radio.css`: ídem con `bg-off-hover`/`bg-on-hover`.
  - **Aceptación**: ídem 4.1.
- [x] 4.3 Tests de checkbox y radio: los tokens hover tienen consumidor y disabled no reacciona.
  - **Aceptación**: fallan si se revierte 4.1/4.2.

## 5. Card (D4)

- [x] 5.1 `card.css`: `shadow-hover` en `:hover` de `outline` y `elevated`, transición con tokens de motion y bloque `prefers-reduced-motion` que la anula; `flat` sin cambio.
  - **Aceptación**: las dos variantes elevan al hover, `flat` no; reduced-motion la anula.
- [x] 5.2 Test de card: elevación por variante.
  - **Aceptación**: falla si se revierte 5.1.

## 6. Verificación

- [x] 6.1 `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`, `pnpm storybook:build`.
  - **Aceptación**: todo verde.
- [x] 6.2 Re-correr `/ds:audit-tokens`: la deuda de `component.*` queda en 0 (los 6 falsos positivos del detector TS no cuentan; su fix va por commit directo aparte).
  - **Aceptación**: reporte fechado con 0 hardcodes, 0 violaciones y sin deuda nueva.
- [x] 6.3 Changeset describiendo los cambios visibles: botón semibold, thumb del switch theme-aware en dark, hovers nuevos en checkbox/radio/card, y los 36 tokens retirados (los `--ds-component-alert-*` y `--ds-component-*-focus-ring*` desaparecen del CSS emitido — para un consumidor pre-1.0 es un cambio de superficie, no interno).
  - **Aceptación**: existe el `.changeset/*.md` y nombra los retiros además de los cambios visuales.

## 7. Gate visual del PO — bloqueante (D-022)

- [x] 7.1 Playground con `dist/` rebuildeado y dev server reiniciado: botón en 600 (todas las variantes), switch en dark **on y off** (atención al thumb oscuro sobre track gris del estado off), hovers de checkbox/radio/card, todo también en light.
  - **Aceptación**: verificación en vivo de los cinco frentes.
- [x] 7.2 OK visual explícito del PO. Vueltas atrás previstas en `design.md`: peso → corregir la cadena a `label` (D2); thumb off en dark → token intermedio para ese caso (D3); card estática que "invita" → queda para un input `interactive` con disparador propio (D4).
  - **Aceptación**: OK registrado en la sesión.

## 8. Cierre

- [x] 8.1 Proponer el mensaje de commit y **esperar el OK explícito del PO**; staging con paths explícitos.
  - **Aceptación**: nada commiteado sin OK.
- [ ] 8.2 Archivar según el checklist de `docs/product/README.md` § "Checklist de archive" — bloqueado hasta 7.2: promover los 5 deltas a sus specs base; verificar ausencia de links relativos en los artefactos; borrar `aaa-053` de "IDs en vuelo" y actualizar el próximo ID en `openspec/README.md`; fila en `docs/architecture/catalog.md`; registros de producto (Foto táctica, Última entrega); grooming del BACKLOG.
  - **Aceptación**: checklist completo; `pnpm openspec validate --all` verde con el change archivado.
- [ ] 8.3 Marcar la **Parte H completa** en `docs/backlog/BACKLOG.md` y el plan de acción (bloque de sistema `aaa-052` + deuda component `aaa-053`), dejando anotado qué siguió camino propio: fixes chicos del detector y `badge.solid-*` (commit directo pendiente), HU-041 (Alert en roadmap).
  - **Aceptación**: backlog y plan reflejan el cierre y los remanentes.
