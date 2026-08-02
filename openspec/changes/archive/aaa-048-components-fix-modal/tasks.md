# Tasks — components-fix-modal

## 1. Nombre accesible del diálogo

- [x] 1.1 `modal.ts`: inputs `ariaLabel` (alias `aria-label`) y `ariaLabelledby` (alias `aria-labelledby`)
- [x] 1.2 `modal.ts`: `labelledBy` pasa a `ariaLabelledby() ?? (heading() ? headingId : null)` y se agrega `label`, que emite el `aria-label` solo cuando no hay `labelledBy` (design §1)
- [x] 1.3 `modal.ts`: host bindings que limpian `aria-label`/`aria-labelledby` del `<ds-modal>` — inertes ahí y violación por atributo ARIA no permitido (design §3)
- [x] 1.4 `modal.html`: bindear `[attr.aria-label]` en el `<dialog>` junto al `aria-labelledby` ya existente

## 2. Borde tokenizado

- [x] 2.1 `modal.css`: `border: 1px solid …` → `var(--ds-dimension-1)`, el mismo token que usa `menu.css`

## 3. Tests

- [x] 3.1 Con `heading`: el `<dialog>` referencia el heading por `aria-labelledby` (comportamiento actual, sin regresión)
- [x] 3.2 Sin `heading` y con `aria-label`: el `<dialog>` lo expone; el host no conserva el atributo
- [x] 3.3 Con `aria-labelledby` explícito + `heading`: gana el del consumidor, y no se emite `aria-label` a la vez
- [x] 3.4 Sin ninguna de las tres vías: el `<dialog>` no inventa nombre (queda visible para la auditoría)
- [x] 3.5 El CSS no declara px hardcodeados fuera de `0`

> **Nota de implementación**: en el host de prueba, bindear el alias exige property binding (`[aria-label]="expr"`), no `[attr.aria-label]` — el attribute binding escribe el atributo pero no alimenta el input, y con el host binding que lo limpia el valor se perdía. El consumidor real que escribe el atributo estático (`<ds-modal aria-label="…">`) no tiene ese problema.

## 4. Changeset y validación

- [x] 4.1 Changeset patch de `components` + `tokens` (lockstep ADR-015), documentando la precedencia elegida
- [x] 4.2 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test` (419 en components, 956 en el repo), `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size` (49.97 sobre 51.47 kB) y `pnpm verify:size-margin`
- [x] 4.3 Verificación medida en Chromium con el `dist` rebuildeado y el dev server reiniciado: el árbol de accesibilidad expone `dialog "Confirmar acción"`, el host quedó sin atributos ARIA y el borde computa `1px` (sin cambio visual)

## 5. Commit (requiere OK del PO)

- [x] 5.1 `git status` fresco + staging con paths explícitos; proponer mensaje Conventional (`fix(components): …`, header ≤100 chars, sin trailer) y **esperar el OK explícito del PO** — commiteado con OK

## 6. Gate visual y archive (bloqueado por D-022)

- [x] 6.1 Gate visual del PO sobre el modal en el playground — sin cambio visual esperado (OK del PO el 2026-08-02; el borde computa `1px` igual que antes, verificado en Chromium)
- [x] 6.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive"
- [ ] 6.3 Proponer el commit de archive y esperar el OK del PO
