# Tasks — components-fix-avatar

## 1. Input configurable

- [ ] 1.1 `avatar-group.ts`: input `moreLabel` de tipo `(count: number) => string` con el default actual (`` (count) => `y ${count} más` ``); el computed pasa a invocarlo con `overflowCount()`
- [ ] 1.2 Verificar que el tipo se exporta si corresponde y que el índice del componente sigue enumerando su superficie (convención de `components-package`)

## 2. Tests

- [ ] 2.1 Sin configurar, el "+N" conserva el texto por defecto (sin regresión)
- [ ] 2.2 Con `moreLabel` provisto, el nombre accesible es el del consumidor y recibe la cantidad oculta
- [ ] 2.3 El override permite pluralizar (mismo grupo con 1 y con 2 ocultos produce textos distintos)

## 3. Changeset y validación

- [ ] 3.1 Changeset **minor** de `components` + patch de `tokens` (lockstep ADR-015)
- [ ] 3.2 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`, `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size` y `pnpm verify:size-margin`

## 4. Commit (requiere OK del PO)

- [ ] 4.1 `git status` fresco + staging con paths explícitos; proponer mensaje Conventional y **esperar el OK explícito del PO**

## 5. Gate visual y archive (bloqueado por D-022)

- [ ] 5.1 Gate visual del PO sobre el grupo de avatares — sin cambio visual esperado
- [ ] 5.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive"
- [ ] 5.3 Proponer el commit de archive y esperar el OK del PO
