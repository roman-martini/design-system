# Design — components-add-toast (aaa-021)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## 1. API pública: service + provider, nada de componentes exportados

```ts
// Entry points públicos (public-api.ts)
DsToastService          // Injectable; se inyecta donde se dispare feedback
provideDsToasts(config?: { position?: DsToastPosition })  // EnvironmentProviders, opcional
type DsToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type DsToastVariant  = 'success' | 'info' | 'warning' | 'danger'
interface DsToastOptions { message: string; variant: DsToastVariant; duration?: number; action?: { label: string; callback: () => void } }
interface DsToastRef { dismiss(): void }
```

- `show(options)` y atajos `success/info/warning/danger(message, options?)` (options parciales sin `message`/`variant`).
- **Sin provider**, la service funciona con defaults (`bottom-right`): el quickstart no exige configurar nada (mismo espíritu que el resto del kit). El provider existe solo para cambiar la posición (decisión PO §1 de la HU) y el `dismissLabel` (default "Cerrar").
- La config viaja por `InjectionToken` interno con `providedIn`-safe default; `provideDsToasts` es la única forma documentada de setearla.
- El contenedor (`DsToastContainer`) y el item (`DsToastItem`) son **internos no exportados** — mismo criterio que `DsTooltipPanel` (aaa-019): la API pública es la service; el DOM es detalle de implementación.

## 2. Capa: popover manual (ADR-014, tercer consumidor — solo la regla de capa)

- El contenedor se crea **perezoso** al primer toast (`createComponent` + `ApplicationRef.attachView`, append a `document.body`), con `popover="manual"` y `showPopover()` al tener ≥1 toast; `hidePopover()` al vaciarse el stack (el elemento queda creado para el próximo).
- A diferencia de Select/Tooltip, **no hay anclaje**: la posición es fija respecto del viewport (`position: fixed` + `inset` según `data-position`). Las reglas de placement/flip de ADR-014 no aplican; solo la de top layer.
- Ventaja verificada del top layer: los toasts se ven **sobre un `DsModal` abierto** (ambos en top layer, el último promovido gana) — un `z-index` no puede lograrlo (ADR-013 §top-layer).
- jsdom: el polyfill de Popover API existe desde aaa-016; no hay posicionamiento que polyfillear (fixed puro).

## 3. Stack

- La service mantiene `signal<ToastEntry[]>`; el contenedor renderiza con `@for (track entry.id)`.
- Nuevos toasts se agregan al **final del array**; en posiciones `bottom-*` el contenedor usa `flex-direction: column-reverse` para que el más nuevo quede pegado al borde (convención dominante), en `top-*` `column`.
- Cada `dismiss` saca la entry del array; el reacomodo es flujo normal de flexbox (CA-008.6). Gap entre toasts por `component.toast.gap`.
- Sin límite de stack en esta iteración (D-005: sin features hipotéticas); si en uso real se acumulan, se decide con el PO.

## 4. Timers pausables (patrón de tooltip.ts, extendido con "remaining")

- success/info/warning: `setTimeout(duration)` donde `duration = options.duration ?? token component.toast.duration (5000ms)`; `duration: 0` → persistente.
- danger: **nunca** hay timer (decisión PO §2, WCAG 2.2.1 — los errores se leen).
- Pausa: `mouseenter`/`focusin` sobre el toast cancelan el timeout guardando `remaining = deadline - now`; `mouseleave`/`focusout` re-arman con `remaining`. Con `action` presente la pausa funciona igual (la exige CA-008.4 al navegar con Tab).
- Limpieza: `dismiss()` y destroy del contenedor cancelan timers pendientes (mismo rigor de cleanup que la directiva tooltip).

## 5. A11y

- **Anuncio**: el elemento del toast lleva `role="status"` (success/info/warning — cortés) o `role="alert"` (danger — asertivo). El elemento con el role se renderiza **antes de inyectar el mensaje** no es necesario: Angular crea el nodo con contenido; `role="status"`/`alert` como live regions implícitas anuncian al insertarse — se testea que el role esté en el DOM del toast.
- **Foco**: nunca se mueve al aparecer (popover manual no roba foco — misma garantía que tooltip). Los botones (acción, cierre) son alcanzables por Tab en el orden del DOM.
- **Cierre**: botón X (LucideX 16/1.5, `aria-hidden`) con `aria-label` = `dismissLabel` ("Cerrar" default). Danger lo muestra siempre; el resto también (pausable + cierre manual conviven — un toast sin botón de cierre y con timer pausado quedaría atrapado).
- **Color no es el único canal** (WCAG 1.4.1): icono por variante (ADR-012): `LucideCircleCheck`, `LucideInfo`, `LucideTriangleAlert`, `LucideCircleAlert` — decorativos (`aria-hidden`), el mensaje es el contenido.

## 6. Visual y tokens (`component.toast.*`)

Anatomía: superficie `bg.elevated` + **borde izquierdo grueso de status** (canal de variante) + icono de status + mensaje `text.primary` + acción (estilo link/ghost) + X.

| Token                | Referencia                                                  |
| -------------------- | ----------------------------------------------------------- |
| `toast.bg`           | `{semantic.color.bg.elevated}`                              |
| `toast.text`         | `{semantic.color.text.primary}`                             |
| `toast.border-width` | `{dimension.4}` (borde de acento por variante)              |
| `toast.radius`       | `{semantic.radius.md}`                                      |
| `toast.shadow`       | `{semantic.shadow.lg}` (flota sobre contenido)              |
| `toast.padding-x/y`  | `{semantic.space.md}` / `{semantic.space.sm}`               |
| `toast.gap`          | `{semantic.space.sm}` (entre toasts del stack)              |
| `toast.offset`       | `{semantic.space.lg}` (distancia al borde del viewport)     |
| `toast.width`        | raw px documentado (~360px, mismo criterio que modal sizes) |
| `toast.duration`     | raw ms documentado (5000 — no hay primitive de esa escala)  |

Los colores de variante NO son tokens `component.toast.*` nuevos: el borde usa `semantic.color.border.<variant>` (arreglados en este change) y el icono `semantic.color.icon.<variant>` — la variante se resuelve en CSS por `data-variant`.

## 7. Fix `tokens-fix-status-borders` (CA-008.7)

Primer consumo real de `border.success/warning/info` → se activa el item del BACKLOG dentro de este change:

- `semantic/color.json`: `border.success` `green.400→500`, `border.warning` `yellow.400→500`, `border.info` `teal.400→500`.
- `theme/dark.json`: los tres de `*-800` → `*-400`.
- Idéntico al fix de `border.danger` (aaa-017). Gate: script de contraste, par `border.<status>` / `bg.surface` ≥ 3:1 **y** `border.<status>` / `bg.elevated` (el bg real del toast) en los 4 themes.
- Riesgo de regresión visual: hoy **ningún componente publicado** consume esos tres tokens (verificado en aaa-017) — el cambio es seguro.

## 8. Testabilidad (jsdom)

- Timers: fake timers de vitest (patrón tooltip) — default 5s, `duration` custom, `0` persistente, pausa/reanudación con remaining, danger sin timer.
- Popover: polyfill existente; se asserta `showPopover`/`hidePopover` del contenedor y visibilidad de toasts.
- Lo no testeable en jsdom (promoción real en top layer sobre un modal) queda como verificación manual en playground — mismo criterio que ADR-013 §6.
