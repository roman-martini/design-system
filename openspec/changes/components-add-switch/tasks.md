# Tasks — aaa-035 — Switch/Toggle (DsSwitch)

Cada tarea es ≤2 h con criterio binario. Diseño: API paridad Checkbox (design §1), input+track/thumb (§2), tokens extendidos (§3), gate 1.4.11 (§4).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

## 2. Tokens

- [ ] 2.1 Extender `component/switch.json`: agregar `track.width.lg`/`track.height.lg` (56/28), `thumb.size.lg` (24); cambiar `track.bg-off` → `{semantic.color.bg.secondary-active}` y `bg-off-hover` → `{semantic.color.border.strong}` (themable).
- [ ] 2.2 Build de tokens + **gate**: `switch-on-vs-off` (bg-on vs bg-off, ui ≥3) y `switch-thumb-on` (thumb vs bg-on, ui ≥3), en los 4 themes. Registrar ratios.

**Criterio**: tokens emitidos (sm/md/lg); bg-off themable; gate ≥3 verde.

## 3. Componente

- [ ] 3.1 `switch/` (`switch.ts/.html/.css` + `index.ts`): `DsSwitch` standalone + OnPush + `ControlValueAccessor` (patrón de `DsCheckbox` sin indeterminate); `model` `checked`/`disabled`, inputs `label`/`size`; host `data-size`.
- [ ] 3.2 `switch.html`: `<label>` con `<input type="checkbox" role="switch" #inputEl>` + track/thumb + `@if(label())`.
- [ ] 3.3 `switch.css`: track/thumb por tokens y `[data-size]`; `:checked` mueve el thumb (`translateX`); transición con motion + bloque reduced-motion; disabled con opacidad.
- [ ] 3.4 `export * from './lib/switch';` en `public-api.ts`; build APF; typings exportan `DsSwitch` + `DsSwitchSize`.

**Criterio**: compila y buildea; API = componente + type; CVA operativo; cero hardcodes.

## 4. Tests de comportamiento (`switch.spec.ts`)

- [ ] 4.1 Un test por scenario: `role="switch"` en el input, toggle por click (checked cambia + onChange), `writeValue`/`setDisabledState`, disabled bloquea, `data-size` reflejado, label asociado, no-hardcodes por CSS fuente, export público.
- [ ] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [ ] 5.1 `switch.stories.ts`: Default, Sizes, WithLabel, Disabled, CookieSettings.
- [ ] 5.2 Showcase del playground (registro tipado): ruta `/switch` con el bloque Cookie Settings de la referencia + estados y sizes, snippets copiables (CA-023.6).
- [ ] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: geometría del thumb/track y reduced-motion.

**Criterio**: stories compilan; showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-switch --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría `/ng:review` sobre `src/lib/switch/` — 0 altas, 0 medias; hallazgos menores resueltos o documentados.
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changeset único con **minor** de components (DsSwitch) y **minor** de tokens (switch extendido). Lockstep (ADR-015).
- [ ] 6.6 Commit del feat autorizado por el PO (modo "ejecuta todo").

**Criterio**: automáticos verdes; gate ≥3; changeset correcto.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo (reutiliza ADR-011; tokens reversibles).
- [ ] 7.2 Mover a `archive/aaa-035-components-add-switch/`; `status: archived` + fecha; crear la spec base `component-switch` desde el delta.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo de changes y specs en `docs/architecture/README.md`, grooming del BACKLOG (Switch sale; `components-add-textarea` promovido), HU-023 → Hecha, EP-002 al día.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive.

**Criterio**: change archivado, spec base creada, registros al día.
