# Design — components-fix-modal

## Context

Motivación en `proposal.md` § Why. Estado actual leído en el código:

- `modal.ts` expone `labelledBy = computed(() => (this.heading() ? this.headingId : null))` y el template lo bindea con `[attr.aria-labelledby]`. Sin `heading`, el `<dialog>` queda sin nombre.
- `DsSelect` ya resolvió el mismo problema: inputs con alias `aria-label`/`aria-labelledby` reenviados al elemento con rol (el trigger), no al host.
- `modal.css:4` declara `border: 1px solid var(--ds-component-modal-border)`; el color sale de token, el ancho no.

## Goals / Non-Goals

**Goals:**

- Que el diálogo tenga nombre accesible por alguna de tres vías, con precedencia definida.
- Que el nombre viaje al elemento que tiene el rol, no al custom element.
- Cerrar el último hardcode dimensional del CSS del modal.

**Non-Goals:**

- **No** se inventa un nombre por defecto (ver Decisiones §2).
- **No** se toca el resto de la API del modal ni su comportamiento de apertura, cierre o scroll lock.
- **No** se unifica `closeLabel`/`dismissLabel` (components-15): es una decisión de naming del PO, no de este change.

## Decisions

### 1. Precedencia: `aria-labelledby` > `heading` > `aria-label`

Tres vías posibles obligan a fijar un orden, y el que corresponde es el que respeta la intención más específica del consumidor:

- **`aria-labelledby` explícito gana sobre `heading`**: si alguien apunta a un elemento propio teniendo además un heading, es porque quiere nombrar el diálogo con otra cosa. Ignorarlo sería silenciar una instrucción directa.
- **`heading` gana sobre `aria-label`**: el título visible y el nombre accesible deben coincidir cuando ambos existen (WCAG 2.5.3, _label in name_). Preferir un `aria-label` distinto del título visible es justamente el antipatrón que esa regla previene.

`labelledBy` y `label` se calculan de modo que **nunca se emitan los dos a la vez**: cuando hay `labelledby`, el `aria-label` no se aplica. Emitir ambos no es un error de la plataforma —`aria-labelledby` gana— pero deja el DOM diciendo dos cosas distintas sobre el mismo elemento.

### 2. Sin nombre por defecto

Es tentador poner "Diálogo" cuando no hay nada, pero eso **apaga la señal**: el modal sin nombre dejaría de aparecer en la auditoría de axe sin que el problema real esté resuelto, y el lector anunciaría "Diálogo, diálogo". Un consumidor que no nombra su modal tiene un defecto de accesibilidad y corresponde que lo vea. El kit le da tres formas de arreglarlo; ninguna es adivinar por él.

### 3. El nombre va al `<dialog>` y se limpia del host

Angular no remueve del DOM el atributo que un `input({ alias })` consume: si el consumidor escribe `<ds-modal aria-label="…">`, ese atributo queda **también** en el custom element. Sobre un elemento sin rol, `aria-label` es una violación por sí misma (`aria-prohibited-attr`), además de inerte para nombrar el diálogo interno. Por eso el host los limpia explícitamente con host bindings a `null`, y el valor se aplica al `<dialog>`.

Es el detalle que el plan de la review dejó anotado para `DsButton` y que conviene resolver igual acá, para que los dos componentes que adoptan el patrón lo adopten completo.

### 4. Borde: `var(--ds-dimension-1)`, no un token nuevo de componente

`menu.css` ya usa `--ds-dimension-1` para lo mismo. Crear `component.modal.border-width` daría override por componente, pero suma un token al presupuesto de `tokens` sin caso de uso: nadie pidió engrosar el borde solo del modal. Si aparece esa necesidad, el token se agrega entonces. Mismo criterio con el que ADR-016 difiere las extracciones.

## Risks / Trade-offs

- **[Un consumidor podría estar pasando `aria-label` al host y viendo que "no hace nada"]** → hoy ese atributo es inerte; después del change pasa a nombrar el diálogo. Es una mejora, no una ruptura: nadie depende de que un atributo sea ignorado.
- **[La precedencia elegida puede sorprender a quien espere que `aria-label` gane]** → queda declarada en el scenario de la spec y en el changeset. La alternativa (label gana sobre heading) contradice WCAG 2.5.3.
- **[jsdom no verifica el nombre accesible computado]** → los tests asertan los atributos y su ausencia en el host, que es lo binario; axe corre sobre el render y cubre la regla `dialog-name`.
