# ADR-016 — Posicionamiento propio con placements por tipo de overlay

- **Fecha**: 2026-07-19
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-014](ADR-014-overlays-anclados-popover-api.md) (extiende su regla 2 de posicionamiento; el resto del patrón — Popover API, top layer, light-dismiss, animaciones, jsdom — queda intacto)

## Contexto

ADR-014 fijó el posicionamiento de overlays anclados como **fallback JS mínimo propio** con un único modo: "debajo del trigger, mismo ancho, flip vertical" (DsSelect). Tooltip (aaa-019) ya introdujo en la práctica un cálculo por placement (`top/bottom/left/right` con flip al opuesto) como función pura local.

El menú (`aaa-025`, HU-012) trae el primer **árbol de overlays anidados**: el panel raíz ancla debajo del trigger **sin heredar su ancho**, y cada submenú ancla **lateral a su item padre** con flip horizontal y clamp vertical. El PO decidió incluir submenús en v1 aceptando este costo explícitamente (decisión 4 de HU-012).

La pregunta: ¿este crecimiento sigue dentro del "fallback mínimo propio" de ADR-014, o cruza el umbral que esa decisión fijó para reevaluar `@floating-ui/dom`? Como modifica el alcance del patrón (de "un placement" a "placements por tipo de overlay") y afecta a todos los overlays futuros → ADR.

## Opciones consideradas

### Opción A — Extender el posicionador propio con modos de placement por overlay (elegida)

Cada overlay define su(s) modo(s) como cálculo puro sobre `getBoundingClientRect` + viewport, con **un** flip por eje relevante y reposición en scroll/resize:

| Overlay          | Placement                                        | Ajuste                           |
| ---------------- | ------------------------------------------------ | -------------------------------- |
| Select (listbox) | debajo, mismo ancho                              | flip vertical                    |
| Tooltip          | `top/bottom/left/right` centrado                 | flip al opuesto                  |
| Menú raíz        | debajo, alineado al borde inicial (ancho propio) | flip vertical + clamp horizontal |
| Submenú          | lateral al item padre, alineado al tope          | flip horizontal + clamp vertical |

- **Pros**: cero dependencias (coherente con ADR-011/013/014); cada modo son ~15-20 líneas puras y testeables; el CSS queda estructurado para el reemplazo declarativo futuro.
- **Contras**: N cálculos chicos en vez de un middleware genérico; sin shift continuo ni colisiones múltiples (no requeridos por ningún caso actual).

### Opción B — Adoptar `@floating-ui/dom` ahora

- **Pros**: middleware battle-tested (flip, shift, offset, size); un solo camino para todos los overlays.
- **Contras**: dependencia nueva para casos que un flip por eje resuelve; ADR-014 fijó el umbral en "colisiones múltiples, shift, arrow" y los submenús **no lo alcanzan** (un flip horizontal + un clamp); el repo rechazó tres veces el camino de la dependencia (ADR-011, ADR-013, ADR-014). Descartada.

## Decisión

**El posicionamiento propio de ADR-014 se generaliza a "placements por tipo de overlay"**: cada overlay declara sus modos como cálculo puro acotado (un flip por eje relevante + clamp al viewport), reutilizando el esquema común (rect del ancla al abrir, reposición en scroll/resize, `position: fixed`).

Reglas que se **reafirman** de ADR-014, ahora sobre el patrón generalizado:

1. **Umbral de reevaluación de `@floating-ui/dom` intacto**: se cruza cuando un overlay necesite colisiones múltiples simultáneas, shift continuo (deslizamiento, no flip) o arrow anclado. Al cruzarse: parar y escribir el ADR de la dependencia **antes** de implementar — no extender el posicionador propio más allá de flip+clamp.
2. **Criterio de migración intacto**: cuando Safari 18 salga de la ventana de soporte, migrar los placements a **CSS anchor positioning** en un change propio (los modos declarativos mapean 1:1 a `position-area`/`@position-try`).
3. **Sin servicio compartido especulativo**: cada overlay mantiene su cálculo local (función pura) hasta que un tercer caso repita el mismo modo — recién ahí se extrae (D-005).

Criterios contra las prioridades del repo: (1) **buenas prácticas** — cálculos puros chicos y testeables, plataforma primero; (2) **escalar ordenado** — el patrón queda nombrado y con umbral explícito en vez de crecer por acreción silenciosa; (3) **mantenibilidad** — cero dependencias y salida declarativa prevista.

## Consecuencias

### Positivas

- Los submenús de `DsMenu` quedan resueltos sin dependencia nueva (~35 líneas de posicionamiento, dos modos).
- Overlays futuros (datepicker, popover genérico) tienen patrón y umbral claros: declarar su placement o justificar la dependencia en un ADR.
- La migración a anchor positioning se simplifica: los modos son la especificación de esa migración.

### Negativas / trade-offs aceptados

- **Duplicación acotada** entre cálculos por overlay (cada uno local): aceptada hasta el tercer caso repetido (regla 3).
- **Capacidad limitada a flip+clamp**: un requisito de shift/colisiones múltiples fuerza un ADR nuevo — es el diseño, no una omisión.
- **El posicionamiento lateral real no es verificable en jsdom**: verificación manual en playground (límite declarado en los tests del menú, mismo criterio que ADR-013 §6).

### Acciones de seguimiento

- Overlays futuros: declarar el placement en el design del change referenciando este ADR.
- Al actualizar la ventana de soporte de Safari, ejecutar la migración de la regla 2.
