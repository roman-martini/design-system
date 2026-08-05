# Tareas — aaa-052

Orden fijado por D6 del `design.md`: primero lo que no toca tokens, después lo visualmente neutro, y al final los tres cambios visuales, que comparten un único gate del PO.

## 1. Separar definición de ejecución del build (D5)

- [ ] 1.1 Extraer la ejecución de `packages/tokens/sd.config.mjs` a `packages/tokens/build.mjs`. `sd.config.mjs` queda exportando `sdBase`, `themes` y `themeBuilds` sin efectos de import; `build.mjs` los importa y corre `buildAllPlatforms()` para el base y cada theme, en ese orden.
  - **Aceptación**: `node -e "import('./packages/tokens/sd.config.mjs')"` no escribe nada en `dist/`.
- [ ] 1.2 Apuntar los scripts `build` y `watch` de `packages/tokens/package.json` a `build.mjs`.
  - **Aceptación**: `pnpm -F @romanmartinidev/tokens build` produce el mismo `dist/` byte-a-byte que antes del cambio (comparar contra una copia previa).
- [ ] 1.3 Actualizar las referencias a `sd.config.mjs` en los comentarios de `packages/tokens/test/build.spec.ts` y `packages/tokens/test/hierarchy.spec.ts` donde describan el punto de ejecución.
  - **Aceptación**: ninguna referencia describe a `sd.config.mjs` como el archivo que corre el build.

## 2. Superficie invertida (D3)

- [ ] 2.1 Agregar `semantic.color.bg.inverse` = `{color.neutral.900}` en `packages/tokens/src/semantic/color.json` y su override `{color.neutral.50}` en `packages/tokens/src/theme/dark.json`.
  - **Aceptación**: `dist/tokens.css` emite `--ds-semantic-color-bg-inverse`; `dist/themes/dark.css` emite su override.
- [ ] 2.2 Repuntar `component.tooltip.bg` a `{semantic.color.bg.inverse}` y `component.tooltip.text` a `{semantic.color.text.inverse}` en `packages/tokens/src/component/tooltip.json`.
  - **Aceptación**: el valor resuelto de ambos tokens no cambia en ningún scope respecto del build previo.
- [ ] 2.3 Sumar el par `text.inverse` sobre `bg.inverse` a `packages/tokens/test/contrast-pairs.json` con `level: "text"` y `specRef: "design-tokens-package"`.
  - **Aceptación**: el gate de contraste pasa el par en el scope default y en cada theme.

## 3. Tipografía de component vía semantic (D4)

- [ ] 3.1 Repuntar en `packages/tokens/src/component/tooltip.json` el `font-size` a `{semantic.font.size.body-xs}`; en `packages/tokens/src/component/input.json`, `font-size.sm/md/lg` a `{semantic.font.size.body-sm/body-md/body-lg}` y `helper.font-size` a `{semantic.font.size.label-sm}`.
  - **Aceptación**: los valores resueltos son idénticos a los del build previo.
- [ ] 3.2 Agregar a `packages/tokens/test/hierarchy.spec.ts` la regla que falla cuando un token de `component/` referencia una primitiva `font.*` que un token semantic aliasea de forma unívoca, reportando el token y los candidatos.
  - **Aceptación**: el test falla si se revierte cualquier repunte de 3.1, y pasa con la fuente en su estado final.
- [ ] 3.3 Verificar que la regla no levanta falsos positivos sobre `dimension.*`/`space.*` y que un caso muchos-a-uno queda explícitamente fuera de alcance, con un test que lo fije.
  - **Aceptación**: existe un caso de test que documenta que `{dimension.4}` desde `component/` es válido.

## 4. Focus ring theme-aware (D1) — cambio visual

- [ ] 4.1 Realinear `semantic.color.focus-ring`: `{color.blue.500}` en `packages/tokens/src/semantic/color.json` y `{color.blue.400}` en `packages/tokens/src/theme/dark.json` — los colores que el anillo pinta hoy.
  - **Aceptación**: los tokens declaran el color renderizado actual en ambos scopes.
- [ ] 4.2 Ajustar el `focus-ring` de `packages/tokens/src/theme/brand-a.json` y `brand-b.json` a un tono de su paleta con contraste suficiente (partir de `{color.green.600}` y `{color.purple.500}`); el valor final lo decide el gate de 4.4, no el ojo.
  - **Aceptación**: ambos declaran un tono de su propia paleta, no un `200`.
- [ ] 4.3 Recomponer `semantic.shadow.focus` como `0 0 0 3px {semantic.color.focus-ring}` en `packages/tokens/src/semantic/shadow.json` y **eliminar** el override de `semantic.shadow.focus` de `packages/tokens/src/theme/dark.json`, que queda gobernado por su `focus-ring`.
  - **Aceptación**: `dist/tokens.css` emite `--ds-semantic-shadow-focus: 0 0 0 3px var(--ds-semantic-color-focus-ring)`; `dist/themes/dark.css` ya no contiene `--ds-semantic-shadow-focus`.
- [ ] 4.4 Sumar a `packages/tokens/test/contrast-pairs.json` el par `semantic.color.focus-ring` contra `semantic.color.bg.surface` con `level: "ui"`. Hoy no existe ningún par de focus ring — es la razón por la que el desajuste sobrevivió.
  - **Aceptación**: el gate corre el par en los cuatro scopes y todos alcanzan 3:1; si un tono de marca no llega, se ajusta en 4.2 hasta que pase.
- [ ] 4.5 Dejar anotado en `packages/tokens/src/primitives/shadow.json` que `shadow.focus` queda sin consumidor a propósito (la spec exige que exista) para que la próxima auditoría no lo vuelva a triar.
  - **Aceptación**: el archivo o la spec registran la intención.

## 5. Motion sobre la escala primitiva (D2) — cambio visual

- [ ] 5.1 Componer los 6 `semantic.motion.transition.*` de `packages/tokens/src/semantic/motion.json` por referencia: `fast`/`normal`/`slow`/`spring` con sus equivalencias exactas, `overlay-enter` como `{motion.duration.normal} {motion.easing.ease-out}` y `overlay-exit` como `{motion.duration.fast} {motion.easing.ease-in}`.
  - **Aceptación**: ningún value bajo `semantic.motion.transition` contiene un literal; `motion.easing.ease-in` y `motion.easing.spring` dejan de ser huérfanos.
- [ ] 5.2 Actualizar `packages/tokens/test/overlay-motion.spec.ts` para verificar el valor **resuelto** (siguiendo referencias) en vez del literal declarado, y sumar la aserción de que ningún preset es un literal duplicado.
  - **Aceptación**: el test falla si se revierte cualquier composición de 5.1.
- [ ] 5.3 Verificar que la invariante `enter ≥ exit` se sostiene con los valores nuevos (200 ≥ 100).
  - **Aceptación**: el scenario existente de la spec pasa sin modificarse.

## 6. Elevación en dark (D6) — cambio visual

- [ ] 6.1 Overridear en `packages/tokens/src/theme/dark.json` los `semantic.shadow.card`, `card-hover`, `dropdown`, `modal` y `toast` con la misma geometría y mayor opacidad (punto de partida `0.05 → 0.2`, `0.1 → 0.4`, `0.25 → 0.6`). `input` y `focus` quedan fuera: no son elevación.
  - **Aceptación**: `dist/themes/dark.css` emite los cinco tokens; ninguno cambia offsets, blur ni spread.
- [ ] 6.2 Agregar a la suite el test de paridad de geometría entre scopes y el de opacidad estrictamente mayor en dark, según los scenarios del delta de `design-tokens-package`.
  - **Aceptación**: el test falla si se altera la geometría de un override o si una opacidad de dark queda igual o menor que la del default.

## 7. Verificación

- [ ] 7.1 Correr `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test` y `pnpm storybook:build`.
  - **Aceptación**: todo verde, sin warnings nuevos.
- [ ] 7.2 Correr `pnpm -F @romanmartinidev/tokens exec npm pack --dry-run` y `pnpm verify:packaging`.
  - **Aceptación**: el tarball no incorpora `build.mjs` ni `sd.config.mjs` fuera de lo que ya declaraba el contrato de publicación.
- [ ] 7.3 Re-correr `/ds:audit-tokens` y comparar contra `docs/design/tokens/2026-08-04-audit.md`.
  - **Aceptación**: se mantienen 0 hardcodes y 0 violaciones de jerarquía; las advertencias bajan en los 6 tokens de motion; los huérfanos bajan en `motion.easing.ease-in` y `motion.easing.spring`.
- [ ] 7.4 Agregar el changeset describiendo los tres cambios visuales (focus ring por marca, elevación en dark, timing de overlays) como cambio visible, no como fix interno.
  - **Aceptación**: existe un `.changeset/*.md` que nombra los tres.

## 8. Gate visual del PO — bloqueante

- [ ] 8.1 Levantar el playground con `dist/` rebuildeado y el dev server **reiniciado**, y verificar los tres cambios visuales con los toggles de theme y de marca: anillo de foco verde en `brand-a` y violeta en `brand-b`, sombras de card/modal/dropdown/toast visibles en dark, y timing de apertura/cierre de modal y tooltip.
  - **Aceptación**: capturas o verificación en vivo de los tres.
- [ ] 8.2 Esperar el **OK visual explícito del PO** sobre los tres. Si rechaza el timing de overlays, la alternativa de D2 (agregar dos peldaños a la escala primitiva para preservar 250/150 ms) se aplica sin tocar el resto del change.
  - **Aceptación**: OK del PO registrado en la sesión.

## 9. Cierre

- [ ] 9.1 Proponer el mensaje de commit al PO y **esperar su OK explícito** antes de commitear. Staging solo con paths explícitos.
  - **Aceptación**: nada commiteado sin OK.
- [ ] 9.2 Archivar el change siguiendo el checklist de `docs/product/README.md` § "Checklist de archive" — **bloqueado hasta el OK visual de 8.2** (D-022): promover el delta a la spec base de `design-tokens-package`; verificar que los artefactos del change no tengan links relativos; borrar `aaa-052` de "IDs en vuelo" y dejar el próximo ID en `aaa-053` en `openspec/README.md`; sumar la fila a `docs/architecture/catalog.md`; actualizar la HU y el doc de la épica correspondientes; actualizar "Foto táctica" y "Última entrega" en `docs/product/README.md`; groomear `docs/backlog/BACKLOG.md` marcando el avance de la Parte H.
  - **Aceptación**: los nueve puntos del checklist ejecutados; `pnpm openspec validate --all` pasa con el change en `archive/`.
- [ ] 9.3 Registrar en el backlog que la Parte H queda a medias: este change cierra el bloque de sistema y la deuda de `component.*` (66 tokens) sigue pendiente de las cuatro decisiones del PO. Anotar también que `tokens-10` estaba cerrado desde `aaa-041` y que la fila del plan de acción quedó desactualizada.
  - **Aceptación**: `docs/backlog/BACKLOG.md` y el plan de acción reflejan ambos hechos.
