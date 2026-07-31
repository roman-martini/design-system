---
id: aaa-042
name: a11y-testing-gates
type: change
status: archived
archived: 2026-07-31
modifies-specs:
  - components-package
  - playground-app
  - ci-cd-pipeline
  - component-modal
related-decisions:
  - D-021
  - D-007
  - D-017
---

# Proposal — a11y-testing-gates

# Why

**El repo declara WCAG AA como compromiso de producto y ningún test lo verifica sobre el DOM.** [D-007] eleva la a11y a parte del valor del producto y tres ADRs la ejecutan ([ADR-011] disabled accesible, [ADR-012] iconografía, [ADR-013] overlays), pero el enforcement es humano: la skill `/ds:check-a11y` corre cuando alguien la invoca. `@storybook/addon-a11y` está instalado en el playground desde hace meses y **no falla nada** — da feedback en desarrollo y nada más. Con 23 componentes, auditar a mano no escala y ya dejó pasar hallazgos reales [testing-03, ci-cd-10].

Junto a eso, tres brechas de **fidelidad de la suite** que erosionan lo que los tests dicen probar:

1. **La suite testea un modelo de change detection que no es el de producción.** `apps/playground` provee `provideZonelessChangeDetection()` y su spec exige modo zoneless, pero su `test-setup.ts` importa `setup-zone` y llama `setupTestBed({ zoneless: false })`. Lo mismo en `packages/components`, cuyos componentes son signals-first. Un bug de CD específico de zoneless pasa los tests y falla en la app real [testing-07, playground-04].

2. **El smoke del showcase cubre 2 de 23 rutas.** `app.spec.ts` testea `/button` y `/select` a mano; las otras 21 vistas lazy no tienen ninguna verificación de que monten. El playground es la validación "en condiciones reales" de las libs y esa validación es hoy manual en el 92% de sus vistas [testing-08].

3. **Hay scenarios de spec sin test.** `component-select` declara `size`, tokens y public-api; `component-modal` declara tokens y public-api; `component-button` tiene CA-017.7 sin cubrir. La regla del repo es que un scenario de spec sea un contrato testable, y la asimetría entre componentes (avatar y button asertan CSS fuente y public-api; select y modal no) erosiona la convención [testing-05].

Es la **Parte F** de la review integral 2026-07-26, ítems 5, 7, 8, 9 y 11 (sub-parte **F2**), y entrega la **fase 1 de HU-028** (EP-005). El PO aprobó la a11y automatizada en dos fases en [D-021].

**Prioridad que lo respalda**: la **1 (buenas prácticas)** — un compromiso de producto sin gate automático es papel mojado, y testear bajo una configuración de CD distinta a la de producción es una fidelidad falsa —, y la **2 (escalar ordenado)**: el helper de axe y el smoke parametrizado hacen que cada componente y cada vista nuevos entren con la vara puesta, sin mantenimiento por entrada.

## Medición previa (2026-07-31)

Patrón probado en [aaa-040] y [aaa-041]: **medir primero, después fijar el gate**. Se instrumentaron 27 casos de render (los 23 componentes públicos, más los estados abiertos de accordion, select, menu y modal) con `axe-core` 4.12.1 sobre jsdom, con las tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `best-practice`.

| Resultado                                                   | Detalle                                                                                                                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **26 de 27 casos: 0 violaciones**                           | El kit entra limpio. El gate es **trinquete**, no destapa deuda.                                                                                |
| **1 hallazgo real**: `ds-button` ícono-only                 | `button-name` (critical) + `aria-prohibited-attr` (serious). No se corrige acá — ver abajo.                                                     |
| **`color-contrast` no evaluable**: `incomplete` en 22 de 27 | jsdom no computa color ni layout. La capa la cubre [HU-027] sobre tokens (428 evaluaciones).                                                    |
| **El contenido de un `popover` es invisible para axe**      | Con `[popover]` sin `:popover-open` (jsdom no implementa top layer), el subárbol cuenta como oculto: **0 passes, 0 violaciones, 0 incomplete**. |
| **Un `<dialog open>` en el árbol CIEGA a axe**              | 11 reglas caen a `incomplete` con "Axe encountered an error" y **deja de detectar violaciones reales**.                                         |

Las dos últimas filas son el hallazgo de diseño del change. Verificación aislada, sin Angular de por medio, sobre un markup con dos violaciones garantizadas (`<button type="button"></button><img src="x.png">`):

| Envoltorio             | Violaciones detectadas   | passes | incomplete por error |
| ---------------------- | ------------------------ | ------ | -------------------- |
| ninguno (control)      | `button-name, image-alt` | 1      | 0                    |
| `<div popover="auto">` | **ninguna**              | 0      | 0                    |
| `<dialog>` (cerrado)   | **ninguna**              | 0      | 0                    |
| `<dialog open>`        | **ninguna**              | 0      | **11**               |

Es decir: **un gate que se conforme con `violations.length === 0` daría verde sobre un modal con violaciones críticas**. `Element.prototype.checkVisibility` y `getAnimations` son `undefined` en jsdom (27.x), que es lo que rompe las reglas de axe cuando hay un dialog abierto. Este change trata ese caso explícitamente: el helper **exige que axe haya evaluado algo** y falla si no, en vez de contar la ausencia de violaciones como éxito (design D3).

**Migración a zoneless, medida antes de proponerla**: con `setupTestBed({ zoneless: true })` y sin `setup-zone`, las dos suites pasan **sin modificar un solo test** — 316/316 en components y 9/9 en playground. El plan dejaba "evaluar lo mismo para components" como pregunta abierta; la medición la responde y se hace en ambos.

## Hallazgo derivado: `ds-button` no admite nombre accesible

`DsButton` renderiza un `<button>` interno y **no reenvía `aria-label`**, a diferencia de los 6 componentes del kit que sí exponen el input con alias (`DsBreadcrumbs`, `DsFieldBase`, `DsPagination`, `DsSelect`, `DsTabs`, `DsAvatarGroup`). Consecuencia: `<ds-button aria-label="Cerrar">` con solo un ícono adentro produce **un botón sin nombre accesible** (`button-name`, critical) y además un `aria-label` sobre un elemento sin rol (`aria-prohibited-attr`, serious). La evidencia de que el patrón falta es el propio repo: la story `OnIconButton` de tooltip esquiva `ds-button` y arma un `<button>` nativo con estilos inline para poder ponerle `aria-label`.

**No se corrige en este change**: toca la superficie pública de `DsButton` y exige delta de la spec `component-button`, que es exactamente el alcance de `components-fix-button` en la **Parte G** — change que ya existe en la tabla del plan. Se suma ahí como ítem, siguiendo la regla de que un pendiente descubierto al ejecutar va a la tabla que se ejecuta, no a una nota en prosa. HU-028 lo respalda: su § Fuera de alcance dice que las violaciones que aparezcan se encauzan como trabajo propio, porque esta HU instala los gates.

# What Changes

- **Helper único de axe**: `packages/components/src/testing/axe.ts` con `expectNoAxeViolations(root, options?)` — corre axe sobre un fixture, falla con regla, impacto, nodo y ayuda de axe, y **verifica que la corrida haya sido concluyente** (design D3). La configuración de reglas vive en un solo lugar y cada regla deshabilitada está justificada en el propio archivo — CA-028.1, CA-028.3, CA-028.4.
- **Cobertura del kit**: una aserción de axe sobre el render por defecto en cada spec de componente — CA-028.2. Lo no cubrible en jsdom queda en una **lista de exclusiones versionada** en el helper, con motivo técnico verificado (no supuesto) y asignado a la fase 2: el contenido del listbox de `DsSelect`, el panel de `DsMenu` y el interior de `DsModal` abierto — CA-028.8 delega en la fase 2.
- **Cero infraestructura nueva en el pipeline**: las aserciones entran al `pnpm test:coverage` que `pr.yml` ya corre — CA-028.5.
- **Ambos test-setup pasan a zoneless**: `setupTestBed({ zoneless: true })` sin `setup-zone`, en `packages/components` y `apps/playground`. Los tests corren bajo el mismo modelo de change detection que producción [testing-07, playground-04].
- **Smoke parametrizado del showcase**: `it.each` sobre las 23 entradas de `SHOWCASE_ENTRIES` que monta cada ruta lazy y asserta que la vista montó. Los asserts específicos de `/button` y `/select` se conservan aparte por lo que aportan de más [testing-08].
- **Scenarios sin test cubiertos** [testing-05]: `select.spec.ts` (`data-size`, tokens del CSS fuente, export en public-api), `modal.spec.ts` (tokens de tamaño y transiciones, export en public-api) y `button.spec.ts` (tokens del bloque loading, CA-017.7). El helper de lectura de CSS fuente, hoy duplicado en `button.spec.ts` y `avatar.spec.ts`, se extrae a `src/testing/`.
- **Smoke de Storybook en CI** [playground-02]: ver la decisión D5 del design — el `tsc` del `tsconfig.json` de `.storybook` **ya entró** con [aaa-040] dentro de `pnpm typecheck`, así que lo que falta es el build real, cuyo costo se mide antes de decidir.

Requiere changeset: el change toca `packages/components/src`. Es **patch** — agrega infraestructura de test sin alterar el artefacto publicado (`files` declara solo `dist`, y `src/testing/` no entra al tarball ni a la superficie de `exports`).

## Alternativas evaluadas

| Opción                                                    | Por qué se descarta                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`vitest-axe` en vez de `axe-core` directo**             | Está en `0.1.0`, sin publicar desde enero de 2025 y con peer `vitest >=0.16.0` — no declara Vitest 4, que es el del repo. Aporta un matcher `toHaveNoViolations` sobre un `axe.run` que igual hay que envolver, porque CA-028.1 pide un helper propio. Una dependencia sin mantenimiento entre el repo y el motor real contradice [D-017]. |
| **Contar `violations.length === 0` como verde**           | La medición muestra que con un `<dialog open>` eso es **verde falso**: axe deja de detectar violaciones reales. Un gate que no distingue "no hay violaciones" de "no se pudo evaluar" es peor que no tener gate, porque da confianza infundada.                                                                                            |
| **Deshabilitar `color-contrast` sin decirlo**             | CA-028.4 exige que cada regla apagada esté declarada y justificada en un solo lugar. Se apaga porque jsdom no computa color, no para tapar un hallazgo — y la capa está cubierta por el gate de [HU-027] sobre los tokens.                                                                                                                 |
| **Arreglar el `aria-label` de `DsButton` en este change** | Cambia la API pública y exige delta de `component-button`. Ese es el alcance de `components-fix-button` (Parte G), que ya existe. Mezclarlo acá haría que un change de gates altere la superficie del kit.                                                                                                                                 |
| **Instrumentar axe solo en los componentes "de riesgo"**  | Contradice [D-017] y CA-028.2: adoptado un patrón, se aplica en todo el kit. Instrumentar de a uno es cómo se llega a la asimetría que `testing-05` señala.                                                                                                                                                                                |
| **Migrar a zoneless solo el playground**                  | El plan lo dejaba como "evaluar" para components; la medición muestra que los 316 tests pasan sin cambios. Dejar components en zone sería mantener a propósito la infidelidad que el hallazgo describe, teniendo el costo medido en cero.                                                                                                  |
| **Un job de CI aparte para las aserciones de axe**        | CA-028.5 pide explícitamente que la fase 1 no agregue infraestructura: su valor es entrar gratis a la suite que ya corre. Un job propio es la fase 2, que sí necesita navegador.                                                                                                                                                           |

Este change no introduce un patrón arquitectónico nuevo ni es one-way door: **no genera ADR**. Los contratos quedan en las specs `components-package`, `playground-app` y `ci-cd-pipeline`.

# Capabilities

## New Capabilities

Ninguna.

## Modified Capabilities

- `components-package`: se agrega el requirement de **verificación automática de accesibilidad** sobre el DOM renderizado — helper único, cobertura de todo componente público, exclusiones declaradas con motivo, y la regla de que una corrida no concluyente falla.
- `playground-app`: el requirement de **modo zoneless** pasa a exigirlo también en la configuración de test, y el de **smoke del showcase** pasa de rutas puntuales a cobertura parametrizada de todas las entradas del registro.
- `ci-cd-pipeline`: queda registrado qué cubre el pipeline respecto de Storybook (typecheck de stories desde [aaa-040], más lo que decida D5 del design).

# Impact

**Código y configuración**

- `packages/components/src/testing/axe.ts` — **archivo nuevo** (helper + configuración de reglas + exclusiones).
- `packages/components/src/testing/css.ts` — **archivo nuevo** (lectura de CSS fuente, hoy duplicada en dos specs).
- `packages/components/src/lib/*/*.spec.ts` — una aserción de axe por componente; `select`, `modal` y `button` suman además los scenarios sin test.
- `packages/components/src/test-setup.ts` y `apps/playground/src/test-setup.ts` — zoneless.
- `apps/playground/src/app/app.spec.ts` — smoke parametrizado sobre las 23 entradas.
- `packages/components/package.json` — devDependency `axe-core` (`^4.12.1`).
- `.github/workflows/pr.yml` — solo si D5 concluye que el build de Storybook agrega cobertura sobre el typecheck ya existente.

**Riesgos**

- **La fase 1 cubre menos de lo que sugiere el nombre**: el contenido de overlays abiertos no es auditable en jsdom, y esa es la mitad interesante de menu, select y modal. La lista de exclusiones lo deja explícito para que nadie lea "axe corre en el kit" como "el kit está auditado" — cerrarlo es la fase 2 (Parte L).
- La cobertura de `packages/components` está bajo trinquete de [aaa-040] (93/76/96/93). Sumar aserciones a specs existentes no baja cobertura, pero los archivos nuevos de `src/testing/` entran al `include` del reporte y hay que verificar el umbral antes de cerrar.
- Migrar a zoneless no rompió ningún test hoy, pero cambia el modelo de CD de toda la suite: un test que pasaba por un `detectChanges` implícito de zone podría volverse frágil más adelante. Es el comportamiento correcto, y el mismo que corre en producción.

**Sin impacto en**: la superficie de `exports` de los packages, el artefacto publicado (`files` declara solo `dist`), el gate de publish de [ADR-022] y la duración del pipeline (salvo lo que decida D5).
