# Tasks — aaa-035 — Switch/Toggle (DsSwitch)

Cada tarea es ≤2 h con criterio binario. Diseño: API paridad Checkbox (design §1), input+track/thumb (§2), tokens extendidos (§3), gate 1.4.11 (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

## 2. Tokens

- [x] 2.1 Extender `component/switch.json`: agregar `track.width.lg`/`track.height.lg` (56/28), `thumb.size.lg` (24); cambiar `track.bg-off` → `{semantic.color.bg.secondary-active}` y `bg-off-hover` → `{semantic.color.border.strong}` (themable).
- [x] 2.2 Build de tokens + **gate `switch-thumb-on-track`** (thumb vs bg-on, ui ≥3): 5.17/5.02/5.38/**3.68** en los 4 themes ✓. El par on-vs-off track no se gatea (dark 2.12): el estado lo comunica la **posición del thumb** (no-cromático) + shadow, no el color del track — reencuadre a lo que 1.4.11 pide para un toggle, documentado en design §4.

**Criterio**: tokens emitidos (sm/md/lg); bg-off themable; gate del thumb ≥3 verde.

## 3. Componente

- [x] 3.1 `switch/` (`switch.ts/.html/.css` + `index.ts`): `DsSwitch` standalone + OnPush + `ControlValueAccessor` (patrón de `DsCheckbox` sin indeterminate); `model` `checked`/`disabled`, inputs `label`/`size`; host `data-size`.
- [x] 3.2 `switch.html`: `<label>` con `<input type="checkbox" role="switch" #inputEl>` + track/thumb + `@if(label())`.
- [x] 3.3 `switch.css`: track/thumb por tokens y `[data-size]`; `:checked` mueve el thumb (`translateX`); transición con motion + bloque reduced-motion; disabled con opacidad.
- [x] 3.4 `export * from './lib/switch';` en `public-api.ts`; build APF; typings exportan `DsSwitch` + `DsSwitchSize`.

**Criterio**: compila y buildea; API = componente + type; CVA operativo; cero hardcodes.

## 4. Tests de comportamiento (`switch.spec.ts`)

- [x] 4.1 Un test por scenario: `role="switch"` en el input, toggle por click (checked cambia + onChange), `writeValue`/`setDisabledState`, disabled bloquea, `data-size` reflejado, label asociado, no-hardcodes por CSS fuente, export público.
- [x] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [x] 5.1 `switch.stories.ts`: Default, Sizes, WithLabel, Disabled, CookieSettings.
- [x] 5.2 Showcase del playground (registro tipado): ruta `/switch` con el bloque Cookie Settings de la referencia + estados y sizes, snippets copiables (CA-023.6).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: geometría del thumb/track y reduced-motion.

**Criterio**: stories compilan; showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-switch --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría `/ng:review` sobre `src/lib/switch/` — 0 altas, 2 medias, 1 baja, **todas corregidas** (calidad de tests): disabled testeado por `dispatchEvent` real (no bracket-notation), `describe` de integración con `[formControl]` agregado (setValue/toggle/disable), y aserción de `onTouched`. El código (ts/html/css) quedó sin observaciones. Excepciones (naming `handleInput`, `model()` para disabled) ratificadas por paridad con DsCheckbox.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 Changeset único con **minor** de components (DsSwitch) y **minor** de tokens (switch extendido). Lockstep (ADR-015).
- [x] 6.6 Commit del feat autorizado por el PO (modo "ejecuta todo").

**Criterio**: automáticos verdes; gate ≥3; changeset correcto.

## 7. Archive

- [x] 7.1 Sin ADR nuevo (reutiliza ADR-011; tokens reversibles).
- [x] 7.2 Mover a `archive/aaa-035-components-add-switch/`; `status: archived` + fecha; crear la spec base `component-switch` desde el delta.
- [x] 7.3 Registros: `openspec/README.md`, catálogo de changes y specs en `docs/architecture/README.md`, grooming del BACKLOG (Switch sale; `components-add-textarea` promovido), HU-023 → Hecha, EP-002 al día.
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive.

**Criterio**: change archivado, spec base creada, registros al día.
