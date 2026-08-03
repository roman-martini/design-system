# Design — components-fix-button

## Context

Motivación y mediciones en `proposal.md` § Why. Lo esencial, medido en Chromium sobre el playground:

| Dato                                | Valor                       |
| ----------------------------------- | --------------------------- |
| Alto natural del texto (16 px)      | 21 px                       |
| `line-height` aplicado              | 20 px                       |
| Espacio libre arriba / abajo (`md`) | 8 px / 9 px                 |
| Alto del botón `md`                 | 38 px                       |
| Alto del select `md`                | 40 px                       |
| `component.button.height.md`        | 40 px (declarado, sin usar) |

## Goals / Non-Goals

**Goals:**

- Texto centrado por construcción, no por ajuste.
- El botón mide lo que su token declara y alinea con el resto de los controles.
- Cubrir el botón de submit y el botón ícono-only.

**Non-Goals:**

- **No** se rediseña el botón: el radius, los colores y las variantes conservan su aspecto actual (ver Decisiones §3).
- **No** se unifica el naming `closeLabel`/`dismissLabel` (components-15), que es decisión del PO.

## Decisions

### 1. Altura declarada en vez de padding vertical

Con `height` tokenizado y `align-items: center`, el centrado lo resuelve el flex sobre una caja de alto conocido y par, y deja de depender de que el padding vertical y la métrica de la fuente sumen simétrico. El padding pasa a ser solo horizontal.

Es además lo que hacen los otros controles del kit: select e input ya consumen su token de altura, y por eso miden 40 px donde el botón mide 38. La inconsistencia no era estética — un formulario con un campo y un botón al lado no alinea.

### 2. `line-height` que contiene el texto

El `tight` (1.25 → 20 px) recorta la caja de línea por debajo del alto natural del texto (21 px). Ese _half-leading_ negativo es lo que el PO vio: el sobrante se reparte en medio píxel por lado y el redondeo lo empuja hacia arriba.

Pasa a `--ds-font-line-height-normal` (1.5 → 24 px), que contiene el texto con holgura simétrica. Con la altura ya fijada por token, subir el `line-height` **no cambia el alto del control**: solo deja de recortar.

### 3. El token `radius` se corrige, no se adopta a ciegas

`component.button.radius` resuelve hoy a `semantic.radius.md` (6 px) mientras el CSS usa `semantic.radius.lg` (8 px). Consumir el token tal como está cambiaría la curvatura de todos los botones del kit como efecto colateral de un fix de centrado — un rediseño que nadie pidió, colado dentro de un fix.

El valor real en uso es el que el PO aprobó visualmente; el token es el que quedó desactualizado. Se corrige el token a `lg` y recién ahí se consume. Regla general que conviene retener: **cuando un token y el render discrepan, primero hay que decidir cuál de los dos es la verdad**, y sólo después conectarlos.

### 4. Guarda de submit, no solo de `clicked`

Con `type="submit"`, bloquear la emisión del output no alcanza: el `<button>` sigue enviando el formulario por comportamiento nativo. La guarda existente pasa a llamar `preventDefault()` cuando el botón está bloqueado. ADR-011 ya lo había anticipado al aceptar el trade-off de `aria-disabled` sobre `disabled` nativo ("si aparece un botón submit, la guarda en el click + no propagar cubre el caso — a documentar en su momento"): este es ese momento.

### 5. Nombre accesible: mismo patrón que el modal

Alias reenviados al `<button>` interno y limpiados del host con bindings a `null`. Se resuelve igual que en `aaa-048` a propósito: son dos adopciones del mismo patrón en la misma parte, y conviene que se vean idénticas.

Como efecto colateral, la story `OnIconButton` de tooltip puede dejar de esquivar el componente. Ese workaround era la evidencia de la brecha; borrarlo es parte del fix, no un extra.

## Risks / Trade-offs

- **[Cambio visual: el botón crece 2 px en `md`]** → es deliberado y es el punto: pasa a medir lo que su token declara y a alinear con los demás controles. Va al gate visual del PO, que es donde corresponde aprobarlo.
- **[Al conectar los tokens podrían aparecer más discrepancias como la del radius]** → se revisan uno por uno antes de conectar (`font-size`, `padding-x`, `gap`), comparando el valor del token con el que el CSS usa hoy; cualquier diferencia se resuelve explícitamente en vez de heredarla.
- **[`type="submit"` habilita un camino que antes no existía]** → cubierto con tests de envío y de bloqueo por `disabled`/`loading`; el default sigue siendo `button`, así que ningún consumidor cambia de comportamiento sin pedirlo.
- **[jsdom no mide layout]** → el centrado y la altura se verifican en Chromium con Playwright, comparando espacio arriba/abajo del texto y alto del botón contra el del select; los tests cubren el contrato de tokens sobre el CSS fuente.
