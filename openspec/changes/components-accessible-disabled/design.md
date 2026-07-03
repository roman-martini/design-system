# Design — `aaa-011` components-accessible-disabled

> Decide el detalle técnico del patrón de estado disabled accesible. Lee `proposal.md` y [ADR-004](../../../docs/architecture/adr/ADR-004-arquitectura-components.md). Las decisiones one-way-door se promueven al ADR al archivar.

## Decisión central — patrón **diferenciado por tipo de componente**

No todo control disabled tiene el mismo problema de a11y. La decisión es **diferenciar**, no unificar:

| Tipo                | Componentes               | Patrón                                                                                | Por qué                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Botón de acción** | `ds-button`               | **`aria-disabled` + guarda + `disabledReason`**                                       | Un botón deshabilitado bloquea un flujo (submit/continuar). Con `disabled` nativo sale del tab order y el usuario nunca se entera de qué falta. Es el caso donde "explicar el porqué" rinde el máximo.                                                                                                                                                                                                                                              |
| **Form control**    | `ds-checkbox`, `ds-radio` | **`disabled` nativo (ratificado)** + `disabledReason` opcional vía `aria-describedby` | El `disabled` nativo en un `<input>` es semánticamente correcto y los screen readers lo anuncian **en contexto del formulario** (al recorrer el form con su `<label>`). Forzar `aria-disabled` exigiría reimplementar en JS la prevención del toggle y perdería el soporte nativo (`:disabled`, validación de formularios) — sobre-ingeniería sin beneficio claro, porque el control rara vez es el único gate de un flujo (el botón submit lo es). |

**Consecuencia de scope**: en este change, **solo `ds-button` cambia de código**. `ds-checkbox` y `ds-radio` quedan como están (su `disabled` nativo se **ratifica** como patrón correcto); se les puede sumar `disabledReason` vía `aria-describedby` de forma incremental si aparece la necesidad, sin migrar a `aria-disabled`. El ADR documenta el principio para los tres y para componentes futuros.

## Mecanismo de "explicar el porqué"

- Input nuevo **`disabledReason: string`** (vacío por default).
- Cuando el control está `disabled` **y** hay `disabledReason`, se renderiza un texto asociado por **`aria-describedby`** → el SR lo anuncia tras el nombre del control; el usuario vidente también lo ve.
- **Visible, no solo-SR**: el beneficio central es que el usuario sepa qué falta; ocultarlo del vidente lo socava. El `disabledReason` se renderiza como hint visible asociado. Quien no lo quiera, no pasa `disabledReason`.

## Diseño del `ds-button`

**TS** (vuelve la guarda — con `aria-disabled` el click sí se dispara, así que es necesaria, no dead code):

```ts
let nextReasonId = 0;

export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly disabledReason = input<string>('');
  readonly clicked = output<MouseEvent>();

  protected readonly reasonId = `ds-button-reason-${nextReasonId++}`;
  protected readonly describedBy = computed(() =>
    this.disabled() && this.disabledReason() ? this.reasonId : null,
  );

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) return; // Enter/Space en un <button> también pasan por click
    this.clicked.emit(event);
  }
}
```

**Template** (`aria-disabled`, no `disabled` nativo → sigue focuseable):

```html
<button
  type="button"
  [attr.data-variant]="variant()"
  [attr.data-size]="size()"
  [attr.aria-disabled]="disabled() ? 'true' : null"
  [attr.aria-describedby]="describedBy()"
  (click)="onClick($event)"
>
  <ng-content />
</button>
@if (disabled() && disabledReason()) {
<span [id]="reasonId" class="ds-button__reason">{{ disabledReason() }}</span>
}
```

**CSS** — migrar de `:disabled` / `:not(:disabled)` a `[aria-disabled="true"]`:

```css
button[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: var(--ds-opacity-50);
}
button:not([aria-disabled='true']):hover {
  /* estilos hover actuales */
}
```

**Tests de comportamiento** (vitest + jsdom):

- El botón disabled **es focuseable** (no `tabindex="-1"`, no atributo `disabled` nativo).
- `aria-disabled="true"` presente cuando `disabled`.
- **No emite `clicked`** al click cuando disabled (la guarda).
- Con `disabledReason`: existe el `<span>` con el texto y el botón lo referencia por `aria-describedby`.

## Decisiones técnicas (con su por qué)

- **Sin `@angular/cdk`**: el patrón se resuelve con `aria-describedby` manual; no se suma dependencia para algo que es un atributo. Si en el futuro hace falta anuncio dinámico (`LiveAnnouncer`) se reevalúa. Coherente con el anti-patrón del repo "no agregar deps sin necesidad real".
- **Sin primitiva compartida ahora**: `ds-button` es hoy el único que adopta el patrón completo. Extraer una directiva/util para un consumidor sería abstracción prematura. Si un segundo componente de acción lo adopta (ej. menú-item, tab), se extrae entonces.
- **`id` del reason**: contador a nivel de módulo (`ds-button-reason-N`). Simple, único, suficiente.

## Alternativas técnicas evaluadas

- **Uniforme (aria-disabled en todos)** vs **diferenciado** → **diferenciado**. Uniforme obliga a reimplementar el bloqueo de toggle en form controls y descarta el soporte nativo sin beneficio proporcional.
- **Reason visible** vs **solo-SR (visually-hidden)** → **visible**. Solo-SR le niega el porqué al usuario vidente con teclado, que es justo a quien queremos ayudar.
- **CDK `AriaDescriber`** vs **`aria-describedby` manual** → **manual**. Menos superficie y cero dependencia nueva.

## Riesgos / notas

- **`aria-disabled` no previene submit nativo**: irrelevante acá porque el `<button>` es `type="button"` (no submit). Si en el futuro hay un botón submit, la guarda en `onClick` + no propagar cubre el caso.
- **Consistencia**: el principio (acción → aria-disabled + porqué; form control → disabled nativo) queda en el ADR para que componentes futuros lo sigan.
- **Promoción a ADR** al archivar: "Estrategia de estado disabled accesible".
