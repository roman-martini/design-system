# Tasks — components-fix-button

## 1. Revisión de tokens antes de conectarlos

- [x] 1.1 Comparar cada token de `component.button.*` con el valor que el CSS usa hoy (`height`, `padding-x`, `font-size`, `gap`, `radius`) y anotar las discrepancias — conectar sin mirar cambiaría el diseño de rebote (design §3)
- [x] 1.2 Corregir `component.button.radius` a `{semantic.radius.lg}`, el valor real en uso y aprobado visualmente; resolver del mismo modo cualquier otra discrepancia que aparezca en 1.1

## 2. Dimensionamiento y centrado

- [x] 2.1 `button.css`: consumir `--ds-component-button-height-<size>`, `padding-x`, `font-size`, `gap` y `radius`; el padding pasa a ser solo horizontal
- [x] 2.2 `button.css`: `line-height` a `--ds-font-line-height-normal` para que la caja de línea contenga el texto (design §2)
- [x] 2.3 `button.css`: ancho de borde con `var(--ds-dimension-1)` [components-12]

## 3. Tipo de botón y guarda de submit

- [x] 3.1 `button.ts`: input `type` (`'button' | 'submit' | 'reset'`, default `'button'`); `button.html`: reflejarlo en el `<button>`
- [x] 3.2 `button.ts`: la guarda del click llama `preventDefault()` cuando el botón está bloqueado por `disabled` o `loading`, para que un `submit` tampoco envíe el formulario (design §4)

## 4. Nombre accesible

- [x] 4.1 `button.ts`: alias `aria-label`/`aria-labelledby` + host bindings que los limpian del `<ds-button>`; `button.html`: reenviarlos al `<button>` interno
- [x] 4.2 Simplificar la story `OnIconButton` de tooltip para que use `ds-button` en lugar del `<button>` nativo con estilos inline que la esquivaba

## 5. Tests

- [x] 5.1 El CSS consume los tokens de dimensionamiento y no declara px hardcodeados
- [x] 5.2 `type` se refleja en el `<button>`; con `disabled`/`loading` el submit queda bloqueado además de `clicked`
- [x] 5.3 El `aria-label` llega al `<button>` interno y no queda en el host; axe sin violaciones sobre un botón ícono-only
- [x] 5.4 Sin regresión en los scenarios existentes de loading, variantes y disabled

## 6. Changeset y validación

- [x] 6.1 Changeset **minor** de `components` (input `type` y alias son API nueva) + patch de `tokens`, declarando el cambio visual de altura
- [x] 6.2 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`, `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size` y `pnpm verify:size-margin` (ajustando el techo con la regla de D-032 si se excede)
- [x] 6.3 Verificación medida en Chromium con el `dist` rebuildeado y el dev server reiniciado: espacio arriba/abajo del texto igual, alto del botón igual al del select, radius sin cambios

## 7. Commit (requiere OK del PO)

- [x] 7.1 `git status` fresco + staging con paths explícitos; proponer mensaje Conventional y **esperar el OK explícito del PO**

## 8. Gate visual y archive (bloqueado por D-022)

- [x] 8.1 Gate visual del PO — **es el change con cambio visual deliberado de la parte**: verificar el centrado reportado, la altura nueva y que la curvatura no cambió
- [x] 8.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive"
- [ ] 8.3 Proponer el commit de archive y esperar el OK del PO
