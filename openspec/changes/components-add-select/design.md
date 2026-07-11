# Design — components-add-select

## Context

Sexto componente del kit y primer **overlay no modal**. El precedente directo es ADR-013 (Modal sobre `<dialog>` nativo): a11y y comportamiento de plataforma antes que re-implementación o dependencia. Lo que se decida acá sobre posicionamiento lo reutiliza Tooltip (HU-007) y todo overlay anclado futuro (dropdown-menu, popover, datepicker).

## Goals / Non-Goals

**Goals:**

- Cumplir los 7 CAs de HU-003 como scenarios testables del spec.
- Sentar el patrón de overlay anclado (capa + posicionamiento) → ADR-014 al archivar.
- Cero dependencias nuevas.

**Non-Goals:**

- Search/filter y multi-select (HUs posteriores si aparece caso real, D-005).
- Virtualización de listas largas (sin caso real).
- Formato del futuro `ds-input` (HU-005) — solo se comparte la apariencia del trigger vía tokens.

## Decisions

### 1. Capa del dropdown: **Popover API nativa** (`popover` attribute + `showPopover()`)

| Opción                                   | Evaluación                                                                                                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Popover API (elegida)**             | Top layer nativo → el listado **no puede quedar cortado por overflow** (CA-003.7 resuelto por plataforma, igual que Modal). Light-dismiss nativo (`popover="auto"`): click fuera y ESC cierran sin listeners globales propios. Baseline en los engines target. Cero deps. |
| B. `@floating-ui/dom`                    | Battle-tested, pero suma dependencia externa para un caso simple, y el repo ya rechazó dos veces ese camino (ADR-011 sin CDK, ADR-013 dialog nativo). Su fuerte (middleware complejo) no se necesita en un select.                                                        |
| C. Posicionamiento absoluto en DOM local | Descartada: cualquier ancestro con `overflow: hidden` corta el listado — falla CA-003.7.                                                                                                                                                                                  |

Consecuencia compartida con ADR-013: el top layer ignora la jerarquía z-index del DS (`semantic.z-index.dropdown` queda para capas no-top-layer).

### 2. Posicionamiento respecto del trigger: **anchor positioning CSS si el soporte alcanza; fallback JS mínimo propio**

- **Vía primaria**: CSS anchor positioning (`anchor-name`/`position-anchor` + `position-try` para el flip). Declarativo, cero JS, la plataforma repositiona sola.
- **Verificación en pre-flight** (task 1.2): confirmar soporte en los engines target del repo. Si falta en alguno, aplicar el **fallback**: cálculo propio al abrir (`getBoundingClientRect`: debajo del trigger, mismo ancho, flip vertical si no hay espacio) + reposición en `scroll`/`resize` mientras esté abierto. Son ~30 líneas para el caso select; si el fallback creciera a middleware (colisiones múltiples, shift horizontal, arrow), se reevalúa `@floating-ui/dom` en un change propio.
- La rama que quede aplicada se documenta en ADR-014.

### 3. Disabled: caso híbrido de ADR-011 → **`aria-disabled` + guarda en el trigger**

Select es form control (CVA, `setDisabledState`) pero su trigger es un `<button role="combobox">`, no un `<input>` nativo: acá el `disabled` nativo tiene exactamente los tres agujeros que ADR-011 describe para botones (sale del tab order, no se anuncia, sin porqué). Se aplica la rama "botón de acción": `aria-disabled="true"` + guarda que bloquea apertura/selección. `setDisabledState` del CVA mapea a ese estado. CA-003.6 ("no operable pero perceptible") queda cubierto. No contradice ADR-011 — extiende su tabla al caso "form control cuyo control operable es un botón"; se anota en ADR-014.

### 4. API de opciones: **`<ds-option>` proyectadas** (no input array)

Mismo patrón de registración padre-hijo que RadioGroup/Radio (interfaz mínima para evitar dependencia circular). Pros: contenido custom por opción (iconos, descripciones), `disabled` por opción, consistencia con el kit. El array-input queda descartado: obliga a un formato de objeto rígido y duplica la vía de labels.

### 5. Opción activa: **`aria-activedescendant`** (foco real queda en el trigger)

Patrón APG combobox recomendado: el foco DOM nunca entra al listado; el trigger mantiene el foco y expone la opción activa por id. Simplifica la interacción con el popover (no hay focus trap que gestionar — no es modal) y la restauración de foco al cerrar es trivial.

### 6. Nombre accesible: reenvío al trigger (hallazgo alta del gate `/ng:review`)

El `role="combobox"` vive en el `<button>` interno, así que un `aria-label`/`aria-labelledby` puesto en `<ds-select>` quedaría inerte (a diferencia de RadioGroup, cuyo role vive en el host). Se resuelve con inputs con alias (`aria-label` → `ariaLabel`) que consumen el atributo del host y lo re-exponen en el trigger — mismo patrón que Material. Detectado por la auditoría `/ng:review` del gate 7.3; el test del spec valida el reenvío, no el atributo del host.

**Excepciones declaradas del review** (justificadas, no fixes): (a) `DsOption.labelText()` lee `textContent` del contenido proyectado — lectura no mutante, sin alternativa idiomática para contenido rico, mismo mecanismo que MatOption; (b) `DsOption` vive en `src/lib/select/` y no en un directorio propio — a diferencia de `DsRadio` (usable standalone, con output propio), una option no existe sin su select: son una unidad publicada junta, y el spec delta contractualiza esa estructura.

### 7. jsdom

Popover API sin soporte esperado en jsdom → polyfill mínimo de `showPopover`/`hidePopover` + atributo en `test-setup.ts` (precedente del polyfill de `<dialog>`, ADR-013 §6). Se testea el cableado propio (ARIA, teclado, CVA, modelo), no el top layer.

## Risks / Trade-offs

- [Soporte de anchor positioning desparejo entre engines] → la decisión ya incluye el fallback JS; la verificación es task de pre-flight con criterio binario.
- [Light-dismiss nativo difiere en detalles entre engines (orden de eventos)] → los tests cubren el contrato (cierra al click fuera / ESC sin cambiar selección), no el mecanismo.
- [`aria-activedescendant` con opciones en top layer: algunos SR antiguos lo manejan peor que foco real] → aceptado: es el patrón APG de referencia; si una auditoría `/ds:check-a11y` futura lo desmiente con evidencia, se revisa.
- [Dos componentes públicos nuevos en un change] → mismo precedente que RadioGroup+Radio; van juntos porque DsOption no tiene sentido sin DsSelect.
