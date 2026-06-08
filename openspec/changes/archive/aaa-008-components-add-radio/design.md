## Context

Este change suma `DsRadio` + `DsRadioGroup` al package `@romanmartinidev/components`. Es el segundo componente del backlog Nivel 1 después de Checkbox (aaa-006), y el primero con la nueva convención `aaa-NNN` (ADR-008) y el config v3 OpenSpec (que fuerza separación entre comportamiento observable en specs e implementación en design).

Decisiones tomadas en kickoff:

1. **Componente compuesto** (Group + Radio) — Opción C de la propuesta, alineada con Mat / Nz / Tui. NO se hace un radio "suelto" ni un group con `[options]` array.
2. **CVA en el group, no en el radio individual**: el group expone una sola fuente de verdad al form layer.
3. **Context injection con `inject(DsRadioGroup, { optional: true })`** desde el radio — funciona standalone o anidado.
4. **3 sizes** alineados con Button y Checkbox (`sm`/`md`/`lg`).
5. **Label dual** (`label` input + `<ng-content>`) — mismo patrón que Checkbox.
6. **Keyboard nav** con flecha-derecha/izquierda (ARIA APG `radiogroup` pattern).
7. **Sin tokens nuevos** — semantic existentes son suficientes.

## Goals / Non-Goals

### Goals

- `DsRadioGroup` + `DsRadio` standalone + OnPush + signals + CVA en el group.
- Selección única gestionada por el group; los radios se inyectan el group y reportan su valor.
- Integración nativa con FormControl reactivo y template-driven via CVA.
- Keyboard nav del group (flecha derecha/izquierda mueve foco al siguiente/anterior radio habilitado; Home/End van al primero/último).
- ARIA correcto: `role="radiogroup"` en el group, `role="radio"` + `aria-checked` en cada radio.
- Tests Vitest cubren: standalone, group, FormControl, keyboard.
- Stories Storybook con 6 variantes.
- Demo en playground (3 secciones).

### Non-Goals

- NO crear tokens dedicados `component/radio.json` — semantic existentes son suficientes.
- NO crear ADR nuevo — ADR-004 + ADR-007 cubren la arquitectura general.
- NO soportar `options` array en el group (pattern más adecuado para Select).
- NO sumar `Indeterminate` (no aplica a Radio — radio o está seleccionado o no, no hay estado mixto).
- NO publicar a npm en este change.
- NO sumar Select ni Toggle en este change.

## Decisions

### 1. Composición Group + Radio con context injection

El `DsRadio` se inyecta el `DsRadioGroup` ancestro como dependency opcional. Si lo encuentra, delega selección y propaga `disabled`/`name`. Si no, se comporta standalone.

```ts
// Pseudocódigo — implementación va en aaa-008
@Component({ selector: 'ds-radio', standalone: true, ... })
export class DsRadio {
  private readonly group = inject(DsRadioGroup, { optional: true });
  readonly value = input.required<unknown>();
  readonly disabled = input<boolean>(false);
  // ...
  protected isSelected(): boolean {
    return this.group ? this.group.value() === this.value() : this._localChecked();
  }
}
```

**Por qué context injection en lugar de `@ContentChildren`**:

- El `@ContentChildren` del group sería un patrón inverso: el group descubre los radios hijos. Eso requiere `AfterContentInit`, query stability checks, y NO funciona si el radio está envuelto en `@if` / `@for` dinámicamente porque el observable de queries falla a ser estable en algunos casos.
- Con `inject({ optional: true })` desde el hijo, el flow es: el radio busca el group ancestro al construirse. Los radios dinámicos funcionan sin problema. Es el patrón usado por Mat / Nz / Tui.

### 2. ControlValueAccessor en el group, NO en el radio

```ts
// Pseudocódigo
export class DsRadioGroup implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  // ...
  writeValue(v: unknown) {
    this.value.set(v);
  }
  registerOnChange(fn: (v: unknown) => void) {
    this.onChange = fn;
  }
  // ...
}
```

**Por qué CVA en el group**:

- Un FormControl representa "el framework elegido" (single value), no "el botón Angular está checked". Eso es lo que el group conceptualmente es.
- Si CVA estuviera en el radio individual, un FormControl tendría que ser por radio (ej. `frameworkIsAngular`, `frameworkIsReact`, etc.) — anti-patrón.
- Convención Angular: Material y ng-zorro hacen CVA en el group exclusivamente.

### 3. Generic type `<T>` para el valor del group

`value` puede ser cualquier tipo (string, number, object, enum). El group acepta `model<T>(null as T)` con `T` definido en consumidor.

**Por qué generic en lugar de string-only**:

- En apps reales el valor de un radio suele ser un enum o un object (ej. `{ id: 1, label: 'Angular' }`). Forzar string obliga al consumidor a serializar.
- En forms reactivos, el `FormControl<T>` ya es generic — radio group debe alinearse.
- Trade-off: comparación por referencia para objects. Documentado en design + scenario en spec ("igualdad por referencia para valores no primitivos").

### 4. Auto-generación de `name` si no se provee

```ts
private static nextId = 0;
readonly name = input<string>(`ds-radio-group-${++DsRadioGroup.nextId}`);
```

**Por qué auto-generar**:

- El atributo HTML `name` agrupa radios al nivel de form submission native. Sin él, dos `DsRadioGroup` en la misma página podrían "compartir" radios accidentalmente.
- Hacer obligatorio el `name` ensucia el API para el caso 99% donde el dev no lo necesita explícito.
- Auto-genera con counter estático garantiza unicidad. Si el dev quiere control (ej. para tests E2E), provee el suyo.

### 5. Keyboard navigation: flecha derecha/izquierda + Home/End

Sigue el [WAI-ARIA APG Radio Group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/):

- `ArrowRight` / `ArrowDown` → siguiente radio habilitado, se selecciona automáticamente.
- `ArrowLeft` / `ArrowUp` → anterior radio habilitado, se selecciona automáticamente.
- `Home` → primer radio habilitado.
- `End` → último radio habilitado.
- `Space` o `Enter` en un radio focused → selecciona ese radio (default browser behavior, no se sobreescribe).
- Tab/Shift-Tab → entra al group por el radio seleccionado (o el primero habilitado si ninguno); deja el group para el siguiente focusable.

**Implementación**: keydown listener en el `DsRadioGroup` host. Calcula el índice del siguiente/anterior habilitado y dispara `.focus()` + actualiza `value`.

### 6. Sizes consistentes con Button y Checkbox

| Size | Box size | Token usado              |
| ---- | -------- | ------------------------ |
| `sm` | 16px     | `var(--ds-dimension-16)` |
| `md` | 20px     | `var(--ds-dimension-20)` |
| `lg` | 24px     | `var(--ds-dimension-24)` |

Mismo tradeoff que Checkbox (aaa-006): primitives directos para evitar fórmulas híbridas en CSS.

**Tipo compartido**: `DsRadioSize = 'sm' | 'md' | 'lg'`. **Decisión**: exportar como type independiente (`DsRadioSize`), NO reusar `DsButtonSize` o `DsCheckboxSize`. Razón: aunque son nominalmente iguales, **acoplar types entre componentes** rompe encapsulación. Si en el futuro Radio gana un size `xl` y Button no, refactor sin ripple effect.

### 7. ARIA y accesibilidad

- `<div role="radiogroup">` en el host del group, con `aria-label` o `aria-labelledby` que el dev puede proveer.
- Cada `<DsRadio>` renderiza `<input type="radio">` nativo escondido visualmente + label que envuelve. El input tiene `role="radio"`, `aria-checked` reflejando estado, `aria-disabled` reflejando disabled.
- Click en label togglea el input por default del browser.
- `:focus-visible` con `box-shadow: var(--ds-semantic-shadow-focus)`.
- `disabled` aplica al input nativo (browser bloquea clicks).

### 8. Propagación de `disabled`

El group tiene `disabled` como model. Si está true, todos los radios hijos se comportan como disabled, sin importar su input local.

```ts
// Pseudocódigo en DsRadio
protected isDisabled(): boolean {
  return (this.group?.disabled() ?? false) || this.disabled();
}
```

**Por qué disabled del group propaga**: simetría con `<fieldset disabled>` HTML nativo. Y porque CVA del group recibe `setDisabledState(boolean)` al hacer `ctrl.disable()` — debe afectar a todos los radios, no a uno.

### 9. Propagación de `name`

`DsRadioGroup` provee su `name()` a todos los `DsRadio` hijos. El `<input type="radio">` interno de cada radio usa ese nombre.

**Trade-off**: si el dev pone un `name` en `<ds-radio>` individual, ese gana sobre el del group. Casi nunca se usa pero permite override.

## Risks / Trade-offs

| Riesgo                                                                                              | Mitigación                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`inject(DsRadioGroup, { optional: true })` falla si el group no es ancestro directo**             | Funciona siempre que el group esté en la cadena de injection. Si el dev hace `<ds-radio-group><div><ds-radio /></div></ds-radio-group>`, sigue funcionando porque Angular DI atraviesa elementos no-componentes. Documentado en design + verificado en test. |
| **Generic `<T>` con valores object compara por referencia**                                         | Documentado en spec scenario. Si el dev necesita comparación por valor, debe usar el mismo object (no clonarlo) o un primitivo derivado (id). Anti-patrón si crea objects nuevos en cada render.                                                             |
| **Auto-generated `name` causa drift entre SSR y client**                                            | El counter estático arranca igual en ambos. Si en algún momento se soporta SSR streaming (no ahora), revisitar. No-issue hoy.                                                                                                                                |
| **Keyboard nav selecciona al mover foco (típico de radios), confunde a usuarios con screen reader** | Es el comportamiento WAI-ARIA APG estándar. Documentado. Si el usuario quiere "navegar sin seleccionar", debe usar Tab (que mueve fuera del group).                                                                                                          |
| **`disabled` del group sobrescribe el de los radios — puede confundir**                             | Documentado: group disabled = todos disabled. Mismo modelo que `<fieldset disabled>`. Symmetric, predecible.                                                                                                                                                 |
| **2 componentes nuevos = 2x carpetas, 2x tests, 2x stories — más mantenimiento**                    | Aceptado. Es el patrón profesional. Alternativa "todo en un componente" sería peor mantenibilidad a largo plazo (1 archivo gigante con responsabilidades mezcladas).                                                                                         |
| **El playground crece con cada componente — eventualmente saturación visual**                       | Cuando haya >6 componentes en playground, considerar dividir en sub-pages (ruteo). No urgente. Aparece como follow-up en BACKLOG si se materializa.                                                                                                          |

## Migration Plan

No aplica — feature aditiva, sin migración. Consumidores existentes no se rompen.

## Open Questions

- **¿`DsRadio` permite `value` opcional?** No. `value` es `input.required<T>()`. Sin valor un radio no tiene sentido. Documentado.
- **¿Soportar atributo `required` al nivel del group?** Postergado. El FormControl reactivo ya maneja `Validators.required`. Si aparece caso template-driven con `[required]`, sumar en CHG posterior.
- **¿Soportar orientación horizontal vs vertical via input?** Postergado. Hoy el CSS por default es vertical (column flex). El dev puede sobrescribir con CSS layer override. Si aparece patrón consistente, sumar `orientation: 'horizontal' | 'vertical'`.
- **¿Sumar `DsRadioCard` (radio con look de card)?** No en este change. Es un variant visual; si aparece, va como CHG separado o como variant del Radio.
