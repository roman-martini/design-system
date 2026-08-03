# Tasks — components-fix-checkbox-radio

## 1. Tokens

- [x] 1.1 `checkbox.json`: `bg-off` → `{semantic.color.bg.surface}`, `bg-off-hover` → `{semantic.color.bg.secondary-hover}`, `check-color` → `{semantic.color.text.inverse}`
- [x] 1.2 `radio.json`: mismos dos fondos, `dot-color` → `{semantic.color.text.inverse}` y **corregir `bg-on`** a `{semantic.color.bg.primary}`, que es lo que el control marcado realmente pinta (design §3)
- [x] 1.3 Build de tokens verde y las vars nuevas presentes en el CSS emitido

## 2. CSS del checkbox

- [x] 2.1 Consumir `component.checkbox.*` para fondo, borde, radius, tamaños y color de label en lugar de `semantic.*` directo
- [x] 2.2 Checkmark e indeterminate: pasar de `background-image` con data URI a `::before` con `mask-image` (+ `-webkit-mask-image`) y `background-color: var(--ds-component-checkbox-check-color)`, conservando el mismo `path` (design §2)
- [x] 2.3 Verificar que el `::before` es decorativo y no intercepta eventos

## 3. CSS del radio

- [x] 3.1 Consumir `component.radio.*` para fondo, borde, tamaños y color de label
- [x] 3.2 El punto pasa a `var(--ds-component-radio-dot-color)` en el gradiente (acá sí resuelve: es CSS, no un SVG aislado)

## 4. Tests

- [x] 4.1 Ningún literal de color en los dos CSS, incluido el interior del SVG embebido
- [x] 4.2 El color de la marca y del punto sale de su token de componente
- [x] 4.3 Ningún token declarado en `component.checkbox.*` / `component.radio.*` queda sin consumidor
- [x] 4.4 Sin regresión en los scenarios existentes (CVA, indeterminate, sizes, a11y)

## 5. Changeset y validación

- [x] 5.1 Changeset patch de `components` + `tokens`
- [x] 5.2 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test` (incluido el gate de contraste de tokens), `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size` y `pnpm verify:size-margin`
- [x] 5.3 Verificación medida en Chromium **en light y en dark** (forzando `data-theme`, porque el playground no tiene switcher hasta la Parte K): el render en light no cambia y la marca en dark contrasta contra el fondo primario

## 6. Commit (requiere OK del PO)

- [x] 6.1 `git status` fresco + staging con paths explícitos; proponer mensaje Conventional y **esperar el OK explícito del PO**

## 7. Gate visual y archive (bloqueado por D-022) — cierra la Parte G

- [x] 7.1 Gate visual del PO **con dark encendido**, que es donde se ve el fix
- [x] 7.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive"; la tabla de la Parte G queda 7/7 y la parte cerrada
- [ ] 7.3 Proponer el commit de archive y esperar el OK del PO
