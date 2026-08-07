# Tareas — aaa-054

## 1. Overlays

- [x] 1.1 Crear `packages/tokens/src/theme/brand-a-dark.json` y `brand-b-dark.json` con los tonos de la tabla del design. _(Ajuste sobre la tabla: `brand-b-dark.text.link` sube a `purple.300`/`200` — el gate combinado midió 2.96:1 para `purple.400` sobre el track de progress/slider.)_
  - **Aceptación**: el test de jerarquía pasa (solo redefinen claves de semantic; referencias resolubles).
- [x] 1.2 Sumar los dos builds a `sd.config.mjs` con selector `[data-theme="dark"][data-brand="a|b"]` y los exports `./themes/brand-a-dark`/`brand-b-dark` a `package.json`.
  - **Aceptación**: `dist/themes/brand-a-dark.css` y `brand-b-dark.css` emitidos bajo el selector combinado; `verify:packaging` verde.

## 2. Gate combinado

- [x] 2.1 `loadScopes` en `scripts/contrast.mjs` compone `dark+brand-<x>` = base ∪ dark ∪ marca ∪ overlay, detectando marcas por convención de nombre; los overlays no aparecen como scope suelto.
  - **Aceptación**: la suite reporta los scopes combinados; en su primera corrida encontró 2 violaciones reales más (fill de progress/slider en dark+brand-b), corregidas en 1.1.
- [x] 2.2 Sumar el par `text.primary` sobre `bg.primary-subtle` (`level: "text"`) a `contrast-pairs.json`.
  - **Aceptación**: el par pasa en default, themes y combinados (778 tests de tokens verdes).

## 3. Playground

- [x] 3.1 Importar los dos overlays donde el playground carga los themes (`apps/playground/src/styles.css`).
  - **Aceptación**: con los toggles en dark + brand-a/b, el radio card del prototipo H1 se lee (fondo profundo de marca, texto claro) — pendiente de la verificación del PO en 4.3.

## 3b. Foco de fields solo por border (decisión del PO en el gate, 2026-08-07)

- [x] 3b.1 `field.css` (`:focus-within`) y `select.css` (`:focus-visible` del trigger): se elimina el ring; el indicador de foco es el cambio de color del border. _(Iteración del gate: se probó ring 2px apilado y shadow inset 1px — el PO descartó ambos por leerse más anchos que el border de 1px de las cards.)_
  - **Aceptación**: contorno del field enfocado idéntico en posición y grosor al border de card; controles sin border conservan `semantic.shadow.focus`.
- [x] 3b.2 Repuntar `component.input.border-focus` y agregar `component.select.trigger.border-focus`, ambos a `{semantic.color.focus-ring}` — el único indicador debe cumplir ≥3:1 y `border.primary` no lo cumple en brand-a (green.500 = 2.3:1 sobre blanco); la cadena focus-ring ya está gateada en los 6 scopes.
  - **Aceptación**: 778 tests de tokens + 440 de components verdes; el foco del field es azul/verde/violeta según marca con contraste garantizado.

## 4. Verificación y cierre

- [x] 4.1 `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`, `pnpm storybook:build`, `pnpm verify:packaging`.
  - **Aceptación**: todo verde (1251 tests en el monorepo).
- [x] 4.2 Changeset (tokens minor): dark+marca deja de estar roto; nombra radio card/links/hovers.
  - **Aceptación**: `.changeset/tokens-brand-scheme-matrix.md` presente.
- [x] 4.3 **Gate visual del PO** (D-022): dark + brand-a y dark + brand-b en el playground (radio card, links, botones primary, focus). Bloqueante.
  - **Aceptación**: OK del PO el 2026-08-07 ("todo OK"), tras las iteraciones del foco de fields (3b) y la precedencia foco>hover reportada y corregida en el mismo gate.
- [ ] 4.4 Proponer mensaje de commit y esperar OK; luego archive con el checklist completo (spec base, README de openspec, catálogo, producto, backlog).
  - **Aceptación**: checklist ejecutado con `validate --all` verde.
