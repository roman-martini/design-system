# Design — components-add-menu (aaa-025)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Primera pieza de la tanda 2 (D-011). HU-012 refinada (PO 2026-07-19) fija: trigger por directiva, items declarativos, icono/separador/danger/typeahead, **submenús anidados en v1** (costo aceptado), context menu fuera. Clasificación: overlay no modal (ADR-014), items como controles de acción (ADR-011), iconos (ADR-012). Primer overlay del kit con árbol anidado — el reto técnico está ahí.

## Goals / Non-Goals

**Goals:**

- Patrón APG _menu button_ completo: teclado con typeahead, foco gestionado, top layer, light-dismiss.
- Submenús anidados sobre popovers nativos anidados, con posicionamiento lateral resuelto sin dependencia nueva (o con la decisión de dependencia tomada explícitamente).

**Non-Goals:**

- Context menu por click derecho, menubar horizontal, `menuitemcheckbox`/`menuitemradio` (fuera de alcance de HU-012).
- Generalizar el posicionamiento a un servicio compartido: se extrae solo si un tercer overlay lo repite (D-005).

## Decisions

### 1. API pública

```ts
// public-api.ts
DsMenuTrigger; // directiva [dsMenuTriggerFor], host: botones
DsMenu; // panel role="menu", selector ds-menu
DsMenuItem; // selector ds-menu-item; inputs: icon?, danger (default false), disabled (default false); output: selected
DsMenuSeparator; // selector ds-menu-separator
```

- La directiva referencia el panel por template ref (`[dsMenuTriggerFor]="menu"`), cablea `aria-haspopup="menu"`/`aria-expanded` y maneja apertura (click/Enter/Space/↓). Precedente de directiva: DsTooltip (aaa-019).
- `DsMenuItem` emite `selected` y el árbol se cierra solo; no hay `[(open)]` en v1 — la apertura programática se agrega si aparece el caso (D-005).
- Items declarativos con registro en el padre (`DsMenuItemRegistration`, mismo patrón anti-ciclo que `DsOptionRegistration` de aaa-016).

### 2. Foco real sobre items (no `aria-activedescendant`)

- APG _menu_ mueve el **foco DOM real** entre items (`tabindex="-1"` + `focus()` — roving), a diferencia del combobox de DsSelect que mantiene el foco en el trigger con `aria-activedescendant`. Se sigue APG: menos estados sintéticos, el focus ring nativo funciona gratis, y los submenús heredan el modelo sin excepción.
- Typeahead: buffer de caracteres con reset por timeout (~500 ms), busca el siguiente item habilitado cuyo `textContent` empiece con el buffer (case-insensitive). Sin tokens propios: el timeout es constante interna documentada (no es valor visual).

### 3. Árbol de submenús sobre popovers nativos anidados

- Cada `ds-menu` (raíz o submenú) es un popover `popover="auto"`. La plataforma mantiene la **cadena de popovers anidados** abierta (ancestros invocadores) y el light-dismiss cierra el árbol entero — sin stack manager propio (mismo principio anti-manager que ADR-013).
- Un item con submenú actúa de invocador: `aria-haspopup="menu"` + `aria-expanded`; abre por →, Enter o hover con **intención** (delay corto tokenizado en `component.menu.submenu-delay`), ← o Esc cierran solo ese nivel devolviendo el foco al item padre; activar una hoja cierra todo (via `hidePopover()` del raíz — la cadena cae en cascada).
- jsdom: se reutiliza el polyfill de `showPopover`/`hidePopover` + `toggle` de `test-setup.ts` (ADR-014 regla 6); el anidamiento de plataforma no se testea (es de la plataforma), sí el cableado propio (aperturas, cierres, foco).

### 4. Posicionamiento: extender el fallback propio con placement lateral (candidato a ADR)

El fallback de ADR-014 posiciona "debajo del trigger, mismo ancho, flip vertical". El menú necesita dos modos:

| Panel     | Placement                                                     | Flip                                                    |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| Menú raíz | debajo del trigger, alineado al borde inicial (no full-width) | vertical (arriba si no hay espacio)                     |
| Submenú   | lateral al item padre, alineado al tope del item              | horizontal (lado opuesto) + ajuste vertical si desborda |

- **Elegido**: extender el posicionador propio con estos dos modos (~40 líneas más sobre `getBoundingClientRect`, reposición en scroll/resize como hoy). Sigue sin middleware genérico: dos placements con un flip cada uno, no colisiones múltiples.
- **Descartado (por ahora)** `@floating-ui/dom`: el caso sigue por debajo del umbral que ADR-014 fija para reevaluarla ("colisiones múltiples, shift, arrow"). Si durante la implementación el ajuste vertical del submenú degenerara en middleware real, **se para y se escribe el ADR de floating-ui antes de seguir** — no se cruza el umbral en silencio.
- **Promoción a ADR al cierre**: la extensión modifica el alcance del patrón ADR-014 (de "un placement" a "placements por tipo de overlay"). Al archivar se promueve a ADR corto que documenta los modos y reafirma el criterio de migración a CSS anchor positioning.

### 5. Items: danger, disabled, iconos

- **Danger**: `danger` input booleano → texto/icono en `{semantic.color.text.danger}` sobre el panel elevado, hover con `{semantic.color.bg.danger-subtle}`. **Pares de contraste nuevos al gate**: danger/bg-elevated y danger/danger-subtle — se verifican por script en el change (si alguno falla, el ajuste es de token semántico y se trata como D-008: decisión del PO, no silenciosa).
- **Disabled**: rama "botón de acción" de ADR-011 — focusable, `aria-disabled="true"`, guarda en la activación (no ejecuta, no cierra). El typeahead y la navegación **no** saltean disabled (descubribilidad), la activación sí está bloqueada.
- **Iconos**: input opcional de icono Lucide (ADR-012 §1: import por icono, 16/1.5, `currentColor`, `aria-hidden` — decorativo siempre; el canal accesible es el texto del item).

### 6. Tokens `component.menu.*`

Superficie del panel calcada del lenguaje de `select.listbox`/`select.option` (misma familia visual):

| Grupo     | Tokens                                                                   | Referencia                                                          |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| panel     | bg, border, radius, shadow, padding, min-width                           | `{semantic.color.bg.elevated}`, `{semantic.shadow.dropdown}`, etc.  |
| item      | height, padding-x, font-size, radius, text, text-disabled, bg-hover, gap | mismos semantic que `select.option` + `{dimension.8}` de gap icono  |
| danger    | text, bg-hover                                                           | `{semantic.color.text.danger}`, `{semantic.color.bg.danger-subtle}` |
| separator | color, margin-y                                                          | `{semantic.color.border.default}`, `{semantic.space.2xs}`           |
| submenu   | offset (solape lateral), delay (hover intent)                            | `{dimension.4}`, `150ms` raw documentado (sin primitive de delay)   |

- Animación de entrada/salida: tokens de overlay existentes (`overlay-enter`/`overlay-exit`) con `@starting-style` + `allow-discrete` y bloque `prefers-reduced-motion` (regla 4 de ADR-014) — sin tokens de motion nuevos.

## Risks / Trade-offs

- [Hover intent de submenús: demasiado corto parpadea, demasiado largo se siente roto] → 150 ms tokenizado (ajustable sin tocar código); teclado no depende del delay.
- [Anidamiento de popovers no verificable en jsdom] → se testea el cableado propio (aria, foco, aperturas/cierres); el árbol real y el posicionamiento lateral se verifican a mano en playground (mismo criterio que aaa-016/aaa-023, límite declarado).
- [El posicionamiento propio crece (~40 líneas, dos modos)] → aceptado y con freno explícito: si pide middleware real, ADR de floating-ui antes de seguir (§4).
- [Typeahead con `textContent` de contenido proyectado] → mismo mecanismo documentado de `DsOption.labelText()` (aaa-016); items con contenido no textual quedan fuera del typeahead (declarado).

## Open Questions

(ninguna — el refinamiento de HU-012 cerró todas las decisiones de producto; la única decisión técnica abierta, posicionamiento lateral, queda resuelta en §4 con su condición de escape)
