# Design — aaa-014 — components-add-modal

> Decide el detalle técnico de `DsModal`. Lee `proposal.md`, ADR-011 (disabled/a11y), ADR-012 (iconos). La decisión del mecanismo de diálogo se promueve a ADR al archivar (sienta el patrón de overlays futuros).

## Context

Primer overlay del kit. Todo el material está preparado: tokens `component.modal.*` (sizes 448/640/896/1152, radius, padding, shadow, tipografía), semantic de overlay (aaa-009: `transition-overlay-enter/exit`, `effect.blur.overlay`, `bg.overlay`, z-index), iconografía (ADR-012: `LucideX`, peer-al-primer-uso). Stack: Angular 21 zoneless + signals + standalone; tests Vitest + jsdom.

## Goals / Non-Goals

**Goals:**

- `DsModal` con `[(open)]`, 4 sizes, cierre ESC/overlay/X, focus trap + restauración, fondo inerte, scroll lock, fade+scale con tokens, `prefers-reduced-motion`, backdrop con blur.
- `@lucide/angular` como peerDependency de components (ejecuta ADR-012 §2) + README.
- Fix `component.modal.overlay-bg` → `{semantic.color.bg.overlay}`.
- Tests de comportamiento cubriendo el contrato del spec delta.

**Non-Goals:**

- NO stack manager dedicado (ver Decisión 2 — el top layer nativo lo vuelve innecesario).
- NO Drawer/Toast/Popover (reutilizarán el patrón después).
- NO output `closed` con razón de cierre en el primer corte — `[(open)]` cubre la necesidad; se suma si aparece caso real (YAGNI).
- NO `@angular/cdk` (ver Decisión 1, Opción B).

## Decisions

### 1. Mecanismo: **`<dialog>` nativo con `showModal()`** (→ ADR al archivar)

| Opción                                             | Evaluación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — `<dialog>` nativo `showModal()` (elegida)**  | La plataforma provee gratis: **top layer** (renderiza sobre todo, sin guerras de z-index), **focus trap** nativo, **restauración de foco** al cerrar, **fondo inerte** (interacción y árbol de accesibilidad), **ESC** vía evento `cancel` cancelable, **`::backdrop`** estilable. Baseline desde 2022; las animaciones de entrada/salida con `@starting-style` + `transition-behavior: allow-discrete` son Baseline 2024 — degradan a "sin animación" en engines viejos (progressive enhancement, el modal funciona igual). |
| B — `div` + `@angular/cdk` (`Overlay`/`FocusTrap`) | Dependencia pesada nueva para reimplementar lo que la plataforma ya da; contradice el precedente de ADR-011 ("no sumar CDK sin necesidad real"). Descartada.                                                                                                                                                                                                                                                                                                                                                                 |
| C — `div` + focus trap manual                      | Reimplementar trap/inert/restauración a mano es la clase de código sutilmente roto que ARIA APG desaconseja mantener. Máximo riesgo, cero beneficio sobre A. Descartada.                                                                                                                                                                                                                                                                                                                                                     |

Es **one-way door de patrón** (Drawer y todo overlay modal futuro siguen el mismo camino) → se promueve a **ADR-013** al archivar.

**Consecuencia asumida**: el top layer ignora `z-index` → `--ds-component-modal-z-index` **no lo consume** `DsModal`. El token queda vigente para overlays no-top-layer (dropdown, sticky, toast). Se documenta en el ADR — no se borra el token (la jerarquía z-index sigue siendo el contrato para el resto de las capas).

### 2. Stack de modales anidados: **resuelto por la plataforma, sin manager**

El top layer apila en orden de apertura y `ESC`/`cancel` llega al diálogo superior — exactamente lo que el "stack manager" del backlog iba a coordinar con z-index. Con `<dialog>` ese manager es infraestructura muerta. Lo único que requiere cuidado propio es el **scroll lock anidado** (Decisión 5: contador a nivel módulo).

### 3. API del componente

```ts
// pseudocódigo del contrato — la implementación exacta vive en modal.ts
export type DsModalSize = 'sm' | 'md' | 'lg' | 'xl';

export class DsModal {
  readonly open = model<boolean>(false); // [(open)]
  readonly size = input<DsModalSize>('md');
  readonly heading = input<string>(''); // título → <h2 [id]> + aria-labelledby
  readonly closeLabel = input<string>('Cerrar'); // aria-label del botón X (i18n)
  readonly closeOnEscape = input<boolean>(true);
  readonly closeOnOverlay = input<boolean>(true);
}
```

- **Sincronización signal ↔ dialog**: `viewChild` del `<dialog>` + `effect(...)` — `open()===true` → `showModal()` (si no está abierto); `false` → `close()`. Evento `cancel` (ESC): `preventDefault()` siempre y `open.set(false)` solo si `closeOnEscape()` — así el estado del consumidor nunca diverge del DOM. Evento `close` (cierres nativos residuales): sincroniza `open.set(false)`.
- **Click en overlay**: en el `<dialog>` con `showModal()`, un click sobre el backdrop dispara `click` con `event.target === dialog` (el contenido interno va envuelto en un wrapper que absorbe los clicks propios). Si `closeOnOverlay()` → `open.set(false)`.
- **Header**: si `heading` no vacío → `<h2 [id]="headingId">` + `aria-labelledby` en el dialog (id con contador de módulo, mismo patrón que `ds-button-reason-N` de ADR-011). Sin `heading`, el consumidor proyecta su propio título y provee accesibilidad (documentado en story).
- **Slots**: default para el cuerpo; `[ds-modal-footer]` para acciones. Botón X siempre presente (es la vía de cierre garantizada — WCAG: no depender solo de ESC).
- **Botón X**: `LucideX` 16/1.5 + `aria-label="closeLabel()"` + svg `aria-hidden` — patrón semántico exacto de ADR-012.

### 4. Animación: CSS puro con los tokens de aaa-009

- Fade+scale: base (cerrado) `opacity: 0; transform: scale(0.95)`; `[open]` → `opacity: 1; scale(1)` con `@starting-style` para la entrada.
- **Duraciones asimétricas por estado**: la transición declarada en el estado base usa `--ds-semantic-motion-transition-overlay-exit` (aplica al cerrar) y la declarada en `dialog[open]` usa `...-overlay-enter` (aplica al abrir) — así enter=250ms/ease-out y exit=150ms/ease-in sin JS.
- `transition-behavior: allow-discrete` sobre `display`/`overlay` para que la salida se vea antes del despintado.
- `::backdrop`: `background: var(--ds-semantic-color-bg-overlay)` + `backdrop-filter: blur(var(--ds-semantic-effect-blur-overlay))`, con el mismo fade.
- `@media (prefers-reduced-motion: reduce)` → `transition: none` (dialog y backdrop).

### 5. Body scroll lock: efecto con contador de módulo

`<dialog>` modal **no** bloquea el scroll del fondo. Un componente con encapsulación Emulated no puede estilar `body` → se hace por efecto: al abrir, guardar `document.body.style.overflow` y setear `hidden`; al cerrar/destruir, restaurar. **Contador a nivel módulo** para que N modales anidados restauren el overflow solo cuando el último cierra (sin esto, el primer cierre desbloquearía el fondo con otro modal abierto). Es el único estado compartido del diseño — 5 líneas, no un "manager".

### 6. Dependencia Lucide (ejecuta ADR-012 §2)

- `packages/components/package.json`: `"@lucide/angular": "^1.23.0"` en **`peerDependencies`** y en **`devDependencies`** (para compilar specs/stories localmente). Verificar que ng-packagr no lo liste como dependencia bundled.
- README de components: sección de instalación actualizada (peer nueva + por qué).

### 7. Tests (Vitest + jsdom) — riesgo de soporte `<dialog>`

Tests de comportamiento: abrir/cerrar vía model, ESC respeta `closeOnEscape`, overlay respeta `closeOnOverlay`, X cierra y lleva `aria-label`, `aria-labelledby` apunta al heading, sizes aplican el token esperado, scroll lock setea/restaura overflow.

**Riesgo**: el soporte de `showModal()`/`cancel` en jsdom ha sido históricamente parcial. Mitigación escalonada (pre-flight lo verifica): (1) jsdom actual del workspace lo soporta → tests directos; (2) si falta algo puntual, espiar/mockear `showModal`/`close` sobre el elemento real y disparar eventos `cancel`/`close` sintéticos — el contrato observable (atributos, estado del model, overflow del body) se testea igual.

## Risks / Trade-offs

- [Animación de salida invisible en engines sin `allow-discrete`] → Progressive enhancement: el modal abre/cierra correctamente sin animación. Aceptado.
- [jsdom sin soporte completo de dialog] → Mitigación escalonada de Decisión 7.
- [Top layer ignora la jerarquía z-index del DS] → Documentado en ADR-013; el token modal-z-index queda para contextos no-top-layer. Un overlay futuro no-dialog (toast) sigue usando la jerarquía.
- [peerDependency nueva rompe consumidores que actualicen sin leer] → Semver minor + README + changeset explícito; npm warnea la peer faltante (comportamiento estándar, mismo caso que `@angular/forms`).
- [`heading` opcional permite modales sin nombre accesible] → Story y README documentan la obligación del consumidor cuando no usa `heading`; scenario del spec cubre el caso con `heading`.

## Migration Plan

No aplica — componente nuevo, aditivo. El fix de tokens no cambia el valor resuelto.

## Open Questions

Ninguna bloqueante. La verificación de jsdom (Decisión 7) se resuelve en pre-flight con la mitigación ya definida.
