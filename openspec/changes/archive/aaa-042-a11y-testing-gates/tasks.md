# Tasks — aaa-042 — Gates de a11y y fidelidad de la suite

Cada tarea es ≤2 h con criterio binario. Diseño: `axe-core` directo (design D1), ubicación del helper (D2), corrida concluyente (D3), reglas y justificación (D4), Storybook en CI (D5), zoneless en ambos packages (D6), exclusiones (D7), smoke parametrizado (D8).

Orden: primero la fidelidad de la suite (§2, §3), que no depende de nada y deja el terreno parejo; después el helper y su verificación en ambos sentidos (§4); después la cobertura del kit (§5); y al final los scenarios sin test (§6) y el step de CI (§7). Instalar las aserciones de axe antes de migrar a zoneless obligaría a revalidarlas después.

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm typecheck`, `pnpm -r build`, `pnpm -r test:coverage`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging` y `pnpm exec openspec validate --all` pasan.
- [x] 1.2 Medición registrada en `design.md` § Context: 27 casos instrumentados, 26 con 0 violaciones, el hallazgo de `ds-button`, el comportamiento de `[popover]` y `<dialog open>` frente a axe, y el resultado de la suite en zoneless.
- [x] 1.3 Revalidación de los 5 hallazgos de F2 contra el repo (regla 3 del plan): `testing-03`, `testing-05`, `testing-07`, `testing-08` y `playground-02` confirmados. **Corrección a `playground-02`**: su recomendación ofrecía "build-storybook o al menos el tsc del tsconfig de `.storybook`"; la segunda mitad ya entró con [aaa-040] dentro de `pnpm typecheck`. El hallazgo estaba parcialmente cerrado y ni el plan ni el backlog lo registraban.

**Criterio**: suite verde y el terreno de los cinco ítems medido antes de escribir una aserción.

## 2. Fidelidad del modelo de change detection (design D6, [testing-07], [playground-04])

- [x] 2.1 `apps/playground/src/test-setup.ts`: `setupTestBed({ zoneless: true })` sin `setup-zone`, con el comentario actualizado (hoy dice "zoneless: false porque este setup usa zone").
- [x] 2.2 `packages/components/src/test-setup.ts`: el mismo cambio, preservando los polyfills de `HTMLDialogElement` y de la Popover API.
- [x] 2.3 Correr ambas suites completas y confirmar 316/316 y 9/9 sin modificar ningún test.

**Criterio**: las dos suites corren bajo el mismo modelo de change detection que producción, en verde y sin tests tocados.

## 3. Smoke parametrizado del showcase (design D8, [testing-08])

- [x] 3.1 `apps/playground/src/app/app.spec.ts`: `it.each` sobre `SHOWCASE_ENTRIES` que crea el harness por slug y asserta que la vista montó con contenido.
- [x] 3.2 Conservar como tests aparte los asserts específicos de `/button` (headings de casos de uso) y `/select` (`[role="combobox"]`), que asertan más que "montó".
- [x] 3.3 Verificar el gate en los dos sentidos: con una entrada del registro apuntando a un import inexistente, el test de esa ruta **falla**; revertir.

**Criterio**: las 23 entradas cubiertas, cero mantenimiento por entrada nueva, y el smoke probado en ambos sentidos.

## 4. Helper de axe (design D1–D4, D7, CA-028.1, CA-028.3, CA-028.4)

- [x] 4.1 `packages/components/src/testing/axe.ts` **nuevo**: `expectNoAxeViolations(root, options?)` con las tags de D4, `color-contrast` deshabilitada con su justificación escrita en el archivo, y la lista de exclusiones de D7 con su motivo técnico.
- [x] 4.2 Implementar las **tres** condiciones de D3: sin violaciones, con `passes` no vacío, y sin `incomplete` por error interno del motor. El mensaje de fallo SHALL nombrar regla, impacto, nodo y la ayuda de axe.
- [x] 4.3 `options.allowInconclusive` con **motivo obligatorio** en el call site, para los casos que D7 declara no auditables.
- [x] 4.4 Excluir `src/testing/` del reporte de cobertura (design D2), junto a `test-setup.ts`.
- [x] 4.5 Verificar el helper en los **cuatro** sentidos: (a) pasa sobre un render limpio; (b) falla ante una violación inyectada nombrando la regla; (c) falla ante un subárbol oculto donde axe no evalúa nada; (d) falla ante un `<dialog open>` que rompe el motor, en vez de dar verde falso. **Hecho distinto de lo planeado**: en vez de inyectar y revertir a mano, los cuatro casos quedan como **tests permanentes** en `axe.spec.ts` (6 en total, sumando los dos de `allowInconclusive`). El helper es la pieza de la que depende todo el gate: si alguien relaja una condición, la suite lo detecta.

**Criterio**: el helper existe, su configuración está en un solo lugar y está probado en los cuatro sentidos — sobre todo el (d), que es el verde falso que la medición expuso.

## 5. Cobertura del kit (CA-028.2, CA-028.5)

- [x] 5.1 Una aserción de axe sobre el render por defecto en el spec de cada componente público del kit.
- [x] 5.2 Los tres casos de D7 (listbox de select, panel de menu, interior de modal abierto) se asertan sobre lo auditable (el trigger) y declaran su exclusión con motivo en el call site, apuntando a la fase 2.
- [x] 5.3 Confirmar que ningún componente quedó sin cubrir ni sin exclusión declarada: la verificación enumera el filesystem, no una lista escrita a mano (`axe-coverage.spec.ts`). **El gate nació roto y la prueba negativa lo destapó**: buscaba `expectNoAxeViolations` como substring, que matchea la línea del `import`, así que un spec con la aserción borrada y el import intacto pasaba. Ahora exige la invocación.
- [x] 5.4 Verificar el umbral de cobertura de [aaa-040] (93/76/96/93) después de sumar las aserciones.

**Criterio**: cobertura completa del kit o exclusión declarada con motivo, y el trinquete de cobertura intacto.

## 6. Scenarios de spec sin test ([testing-05])

- [x] 6.1 `packages/components/src/testing/css.ts` **nuevo**: extraer el helper de lectura de CSS fuente y migrar los specs. **La duplicación era mayor que la reportada**: no 2 specs sino **13**, en dos variantes (`const cssPath` y una `function readSource` local), más 5 copias del bloque que lee `public-api.ts`. Se migraron todas — dejar 11 duplicados y arreglar 2 sería la inconsistencia que el hallazgo critica. **Defecto corregido de paso**: todas las copias devolvían `''` si el archivo no aparecía, así que un path equivocado hacía pasar en verde las aserciones del tipo "el CSS no contiene hex". La implementación única lanza.
- [x] 6.2 `select.spec.ts`: `data-size` para los tres tamaños, tokens del CSS fuente (sin hex, tokens de motion del overlay, bloque `prefers-reduced-motion`) y export en `public-api`.
- [x] 6.3 `modal.spec.ts`: tokens de tamaño (`--ds-component-modal-size-*`), backdrop, transiciones de overlay y export en `public-api`.
- [x] 6.4 `button.spec.ts`: tokens del bloque `loading` (CA-017.7).
- [x] 6.5 Confirmar contra las specs `component-select`, `component-modal` y `component-button` que los scenarios citados por el hallazgo quedaron cubiertos.

**Criterio**: los scenarios que el hallazgo nombra tienen test, y el helper de CSS fuente tiene una sola implementación.

## 7. Smoke de Storybook en CI (design D5, [playground-02])

- [x] 7.1 `pr.yml`: step de `build-storybook` después del build recursivo, bloqueante.
- [x] 7.2 Verificar el gate en los dos sentidos. **Resultado que cambia lo que el hallazgo prometía**: un import inexistente da exit 1, pero un **template de story roto da exit 0** — los templates son strings evaluados en runtime, así que ni webpack ni `tsc` los analizan. El caso que `playground-02` describe (refactor de API que desactualiza la story) **sigue sin gate**. El step se instala igual por lo que sí cubre, con la brecha declarada en la spec y en el propio step.
- [x] 7.3 Registrar en `design.md` el tiempo del step y confirmar que `storybook-static/` está ignorado.

**Criterio**: un import o una configuración rotos dejan el PR en rojo, con el costo del step (27 s) y **el alcance real del smoke** registrados — sin dar por cerrada la parte del hallazgo que este step no cubre.

## 8. Cierre

- [x] 8.1 Suite completa verde: `pnpm typecheck`, `pnpm -r build`, `pnpm -r test:coverage`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging`, `pnpm exec openspec validate --all`.
- [x] 8.2 Registrar el conteo final de tests y el tiempo de las suites en `design.md` § Resultado.
- [x] 8.3 Changeset **patch** para ambos packages (infraestructura de test; no altera el artefacto publicado — lockstep de [ADR-015]). Verificado sobre el `dist/` emitido: ni el helper de axe ni el de CSS dejan rastro.
- [x] 8.4 Marcar los CAs de **fase 1 de HU-028** como cumplidos (CA-028.1 a CA-028.5), dejando la fase 2 abierta con su alcance definido por la lista de exclusiones.
- [x] 8.5 Registrar el hallazgo de `ds-button` como ítem de `components-fix-button` en la tabla de la **Parte G** del plan de acción.
- [x] 8.6 Actualizar `openspec/README.md` (próximo ID, IDs en vuelo), el avance de la Parte F en `docs/backlog/BACKLOG.md`, el plan de acción, la épica EP-005 y la tabla global de HUs.
- [ ] 8.7 Proponer el mensaje de commit y **esperar el OK del PO** antes de commitear.

**Criterio**: repo verde, artefactos de gobernanza actualizados, el hallazgo derivado encauzado en la tabla que se ejecuta, y commit propuesto sin ejecutar.

> **Sin gate visual del PO** ([D-022]): este change no altera el aspecto de ningún componente — no toca CSS ni tokens. El hallazgo de `ds-button` que sí tocará la API queda para `components-fix-button`, donde el gate visual sí aplica.
