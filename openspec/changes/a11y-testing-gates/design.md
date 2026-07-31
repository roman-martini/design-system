# Design — a11y-testing-gates

## Context

La Parte F2 de la review integral instala el enforcement de a11y sobre el DOM (fase 1 de HU-028) y cierra tres brechas de fidelidad de la suite. El terreno se midió antes de decidir, con `axe-core` 4.12.1 sobre jsdom 27.

### Medición de partida (2026-07-31, sobre HEAD `17c85c3`)

27 casos instrumentados: los 23 componentes públicos con markup válido, más los estados abiertos de accordion, select, menu y modal, más el toast disparado por su service.

| Dimensión                          | Medición                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Casos con 0 violaciones            | **26 de 27**                                                                        |
| Hallazgo real                      | `ds-button` ícono-only: `button-name` (critical) + `aria-prohibited-attr` (serious) |
| `color-contrast`                   | `incomplete` en 22 de 27 — jsdom no computa color                                   |
| Contenido de `[popover]`           | invisible para axe (0 passes / 0 violaciones / 0 incomplete)                        |
| `<dialog open>` en el árbol        | **11 reglas con "Axe encountered an error"; deja de detectar violaciones reales**   |
| Suite en zoneless, sin tocar tests | components **316/316**, playground **9/9**                                          |

El control que fija el criterio del gate, aislado de Angular, sobre `<button type="button"></button><img src="x.png">` (dos violaciones garantizadas):

| Envoltorio             | Violaciones detectadas   | passes | incomplete por error |
| ---------------------- | ------------------------ | ------ | -------------------- |
| ninguno                | `button-name, image-alt` | 1      | 0                    |
| `<div popover="auto">` | ninguna                  | 0      | 0                    |
| `<dialog>` cerrado     | ninguna                  | 0      | 0                    |
| `<dialog open>`        | ninguna                  | 0      | **11**               |

Causa raíz de la última fila: `Element.prototype.checkVisibility` y `Element.prototype.getAnimations` son `undefined` en jsdom 27, y las reglas de axe que resuelven visibilidad con un dialog en top layer las necesitan.

## Goals / Non-Goals

**Goals**

- Un helper único que cubra todo componente público, con las reglas y sus exclusiones declaradas en un solo lugar (CA-028.1 a CA-028.5).
- Que el gate **falle** ante una violación AA introducida, y también ante una corrida que no pudo evaluar nada.
- Cerrar las tres brechas de fidelidad: modelo de CD, cobertura de rutas del showcase y scenarios de spec sin test.
- Cero infraestructura nueva en el pipeline.

**Non-Goals**

- La fase 2 (Storybook test-runner con `axe-playwright`): es la Parte L, con su propio change.
- Corregir el hallazgo de `ds-button`: es `components-fix-button` de la Parte G.
- Cubrir el interior de overlays abiertos: jsdom no lo permite (D3, D7).
- Interaction tests con play functions: Parte L.

## Decisions

### D1 — `axe-core` directo, sin `vitest-axe`

`vitest-axe` está en `0.1.0`, sin publicar desde 2025-01-22, y su peer es `vitest >=0.16.0` — no declara Vitest 4, que es el del repo. Lo que aporta es un matcher `toHaveNoViolations` sobre una llamada a `axe.run` que hay que envolver igual, porque CA-028.1 exige un helper propio del repo con configuración centralizada. Interponer una dependencia sin mantenimiento entre el repo y el motor real contradice [D-017] (elegir el patrón robusto, no el barato).

Se depende de `axe-core` (`^4.12.1`, Deque, el motor que también usa `@storybook/addon-a11y` y usará la fase 2), como **devDependency de `packages/components`**. No entra al artefacto publicado: `files` declara solo `dist`.

### D2 — El helper vive en `packages/components/src/testing/`

Junto al código que prueba y dentro del `include` del typecheck de specs de [aaa-040], pero **fuera de `public-api.ts`**: no es superficie publicada. Se excluye del reporte de cobertura por la misma razón que `test-setup.ts` — es infraestructura de test, no código del kit; incluirla inflaría la cobertura con archivos que los propios tests ejercitan al 100%.

Se aprovecha para extraer ahí el helper de lectura de CSS fuente hoy duplicado en `button.spec.ts` y `avatar.spec.ts`, que es lo que `testing-05` pide.

### D3 — Una corrida no concluyente **falla**; ausencia de violaciones no es éxito

Es la decisión central del change. La medición demuestra que `violations.length === 0` es un indicador insuficiente: con un `<dialog open>` en el árbol, axe no reporta violaciones **que existen**. Un gate construido sobre esa señal habría dado verde sobre el modal desde el día uno.

El helper exige tres condiciones, no una:

1. `violations` vacío.
2. **`passes` no vacío** — si axe no evaluó ninguna regla con éxito, no auditó nada: o el subárbol está oculto (caso `popover`) o no se pasó el elemento correcto. Falla con un mensaje que lo dice.
3. **Cero `incomplete` con "Axe encountered an error"** — la firma del fallo interno del motor. Falla nombrando las reglas afectadas.

Las condiciones 2 y 3 se pueden relajar por caso con `options.allowInconclusive`, que **exige un motivo escrito** en el mismo call site. Es lo que hace que la excepción sea visible en el diff en vez de silenciosa.

### D4 — Reglas evaluadas y deshabilitadas, declaradas en un solo lugar (CA-028.4)

Tags evaluadas: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` — el compromiso declarado es WCAG **AA**, y AAA está fuera de alcance por HU-028. Se suma `best-practice` porque la medición mostró que el kit ya la pasa entera: entra como trinquete gratis.

Regla deshabilitada, una sola:

| Regla            | Motivo                                                                                                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-contrast` | jsdom no computa estilos ni layout: la regla nunca concluye (`incomplete` en 22 de 27 casos). **No tapa un hallazgo**: el contraste está cubierto por el gate de [HU-027] sobre los tokens, que evalúa 107 pares × 4 scopes por cálculo — cobertura estrictamente mayor que la de un render en jsdom. |

Ninguna otra regla se apaga. Las que la medición mostró como `incomplete` sin error (`aria-valid-attr-value`, `aria-allowed-attr` en select y menu) se dejan activas: hoy no fallan y si algún día concluyen en violación, se quiere saber.

### D5 — Storybook en CI: medir antes de agregar un step

`playground-02` pedía "`build-storybook`, o al menos el `tsc` del tsconfig de `.storybook`". La segunda mitad **ya está resuelta**: [aaa-040] metió `tsc -p .storybook/tsconfig.json --noEmit` dentro del script `typecheck` del playground, que `pr.yml` corre. El hallazgo está parcialmente cerrado y el plan no lo registraba.

Lo que falta es el build real, que cubre lo que el typecheck no ve: fallos de resolución de `main.ts`, addons rotos, errores de compilación de Angular en los templates de las stories. El criterio de corte era el costo: un step que agregue varios minutos a cada PR necesita justificar su cobertura marginal.

**Medido el 2026-07-31: `pnpm -F playground build-storybook` tarda 27 s** (local, caché tibia; en CI sin caché el orden esperado es ~1–2 min) contra un `timeout-minutes: 15` del job. Barato, así que **se agrega el step**, después del build recursivo porque las stories consumen el artefacto de las libs.

**Pero la recomendación del hallazgo prometía más de lo que el step puede dar**, y eso también se midió en vez de asumirse:

| Rotura inyectada en `badge.stories.ts`              | Exit del build |
| --------------------------------------------------- | -------------- |
| `import { NoExiste } from './no-existe'`            | **1** ✓        |
| `<ds-badge [noExisteEsteInput]="1">` en el template | **0** ✗        |

El caso que `playground-02` describe textualmente —"un refactor de API de un componente puede romper sus stories"— **es el que queda sin cubrir**: los templates de las stories son strings evaluados en runtime por el renderer de Angular, así que no pasan ni por webpack ni por `tsc`. El typecheck de [aaa-040] tampoco los ve, por lo mismo.

Se instala igual (cierra imports rotos y configuración rota, que sí son fallos reales y hoy pasan verdes), pero **la brecha queda declarada en la spec y en el propio step**, en vez de dar por cerrado un hallazgo que no lo está. Cerrarla exige ejecutar las stories en un navegador: interaction tests con el test-runner, que es la Parte L.

### D6 — Zoneless en los dos packages, no solo en el playground

El plan dejaba "evaluar lo mismo para components" abierto. La medición la responde: `setupTestBed({ zoneless: true })` sin `setup-zone` deja **316/316 y 9/9 en verde sin tocar un solo test**. Con el costo medido en cero, dejar `packages/components` en zone sería preservar a propósito la infidelidad que [testing-07] describe, en el package cuyos componentes son signals-first y que se publica para apps zoneless.

`zone.js` se mantiene como devDependency: `@analogjs/vitest-angular` la resuelve por su propia cadena, y sacarla es una limpieza sin relación con este change.

### D7 — Exclusiones: qué NO cubre la fase 1, con motivo verificado

CA-028.2 exige que lo no cubrible en jsdom se liste con su motivo y quede asignado a la fase 2. La lista es corta y su motivo está **medido**, no supuesto:

| Exclusión                           | Motivo verificado                                                                                         | Destino |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| Contenido del listbox de `DsSelect` | `[popover]` sin `:popover-open`: jsdom no implementa top layer, el subárbol cuenta como oculto (0 passes) | Fase 2  |
| Panel de `DsMenu` abierto           | Idem                                                                                                      | Fase 2  |
| Interior de `DsModal` abierto       | `<dialog open>` rompe 11 reglas de axe en jsdom (`checkVisibility`/`getAnimations` ausentes)              | Fase 2  |

En los tres casos, **el trigger sí se audita** en fase 1 (el trigger de select acumuló 12 passes). Lo que queda fuera es el contenido desplegado. La lista vive en el helper, junto a las reglas, para que exclusiones y configuración se lean en el mismo lugar.

### D8 — El smoke del showcase asserta "montó", no el contenido

`it.each` sobre `SHOWCASE_ENTRIES` crea el harness por slug y verifica que la vista montó sin throw y con contenido. **No** asserta markup específico por vista: eso pertenece a los specs del componente, y un smoke que replique aserciones de contenido se vuelve mantenimiento por entrada nueva — exactamente lo que `testing-08` pide evitar. Los dos tests actuales de `/button` y `/select` se conservan aparte, porque asertan cosas concretas que el parametrizado no cubre.

## Risks / Trade-offs

- **El nombre promete más de lo que la fase 1 entrega.** "axe corre sobre el kit" puede leerse como "el kit está auditado"; la mitad interesante de los overlays queda fuera. Mitigación: la lista de exclusiones es código versionado, no prosa, y la spec la nombra.
- **Un gate ciego es peor que ningún gate.** Es el riesgo que D3 ataca de frente; se verifica en los dos sentidos antes de darlo por instalado (patrón de [aaa-041]).
- **Trinquete de cobertura**: [aaa-040] fijó 93/76/96/93 en components. Los archivos de `src/testing/` se excluyen del reporte (D2), así que no deberían moverlo; se verifica antes de cerrar.
- **Zoneless cambia el modelo de CD de toda la suite.** Hoy no rompe nada. Un test futuro que dependiera de un `detectChanges` implícito de zone sería frágil — pero esa fragilidad es la que existe hoy en producción y no se ve.

## Migration Plan

Orden: primero la fidelidad (zoneless y smoke, que no dependen de nada), después el helper y su verificación en ambos sentidos, después la cobertura del kit, y al final los scenarios sin test y la decisión de Storybook. Cada paso deja la suite verde.

## Open Questions

Ninguna abierta. La única que traía el change —el costo del `build-storybook` frente a su cobertura marginal sobre el typecheck (D5)— se cerró con la medición: 27 s.

## Resultado (2026-07-31, al cerrar la implementación)

| Suite                 | Antes   | Después | Delta                                                                   |
| --------------------- | ------- | ------- | ----------------------------------------------------------------------- |
| `packages/tokens`     | 484     | 484     | —                                                                       |
| `packages/components` | 316     | **362** | +23 aserciones de axe, +6 del helper, +3 de cobertura, +14 de scenarios |
| `apps/playground`     | 9       | **32**  | +23 del smoke parametrizado                                             |
| **Total**             | **809** | **878** |                                                                         |

Cobertura de `packages/components` sin movimiento (94.80 / 77.23 / 97.15 / 94.65): los archivos de `src/testing/` quedan fuera del reporte, como decidió D2. El trinquete de [aaa-040] (93/76/96/93) sigue intacto.

**Lo que se verificó en ambos sentidos**, no se asumió:

| Gate               | Prueba negativa                                            | Resultado                          |
| ------------------ | ---------------------------------------------------------- | ---------------------------------- |
| Helper de axe      | violación AA inyectada / subárbol oculto / `<dialog open>` | falla en los 3 (tests permanentes) |
| Cobertura del kit  | aserción borrada de un spec dejando el import              | falla nombrando el componente      |
| Smoke del showcase | entrada del registro con import inexistente                | falla solo esa ruta                |
| CA-017.7 de button | `color` y `padding` literales en el bloque loading         | fallan 3 tests                     |
| Build de Storybook | import roto / template roto                                | exit 1 / **exit 0** (ver D5)       |

**Dos correcciones que salieron de escribir los tests**, no de leer la spec:

1. **El gate de cobertura nació roto**: buscaba `expectNoAxeViolations` como substring, que matchea la línea del `import`. Un spec al que le borraran la aserción y le dejaran el import pasaba el gate. Se detectó porque la prueba negativa dio verde; ahora busca la invocación.
2. **`component-modal` tenía drift**: el scenario del backdrop pedía `var(--ds-semantic-color-bg-overlay)` directo, cuando la implementación usa `var(--ds-component-modal-overlay-bg)` — que resuelve a ese semantic y **es lo correcto** por la jerarquía de tokens. Se corrigió la spec, no el código.

Un tercer hallazgo quedó fuera de alcance a propósito: el helper de CSS fuente que estaba duplicado en 13 specs devolvía `''` cuando el archivo no aparecía, así que las aserciones del tipo "el CSS no contiene hex" pasaban en verde sobre un string vacío. La implementación única ahora lanza. Es el mismo patrón de verde falso que D3 ataca en axe, en otra capa.
