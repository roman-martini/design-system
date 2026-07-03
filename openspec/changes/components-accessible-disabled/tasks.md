# Tasks — aaa-011 — Estado disabled accesible del ds-button

Cada tarea es ≤2 h y tiene criterio de aceptación binario. El scope de código es **solo `ds-button`** (design.md: patrón diferenciado; `ds-checkbox`/`ds-radio` ratifican su `disabled` nativo, no se tocan).

## 1. Pre-flight

- [x] 1.1 Confirmar suite verde de partida: `pnpm -F @romanmartinidev/components test` pasa (45/45).
- [x] 1.2 Releer el estado actual de `ds-button` (TS con `disabled` nativo sin guarda, HTML con `[disabled]`, CSS con `:disabled`/`:not(:disabled)`) — punto de partida del design.md.

**Criterio**: baseline verde documentado; nada modificado.

## 2. TS — guarda + disabledReason + describedby

- [x] 2.1 En `button.ts`: agregar `readonly disabledReason = input<string>('')`.
- [x] 2.2 Agregar contador de módulo `nextReasonId` y `protected readonly reasonId = ds-button-reason-${n}`.
- [x] 2.3 Agregar `protected readonly describedBy = computed(() => this.disabled() && this.disabledReason() ? this.reasonId : null)`.
- [x] 2.4 Agregar `protected onClick(event: MouseEvent)` con guarda `if (this.disabled()) return;` que emite `clicked` solo si habilitado. Importar `computed`.

**Criterio**: `button.ts` compila; la clase expone `disabledReason`, `reasonId`, `describedBy`, `onClick`.

## 3. Template — aria-disabled + describedby + span del motivo

- [x] 3.1 En `button.html`: reemplazar `[disabled]="disabled()"` por `[attr.aria-disabled]="disabled() ? 'true' : null"`.
- [x] 3.2 Cambiar `(click)="clicked.emit($event)"` por `(click)="onClick($event)"`.
- [x] 3.3 Agregar `[attr.aria-describedby]="describedBy()"` al `<button>`.
- [x] 3.4 Después del `<button>`, agregar `@if (disabled() && disabledReason()) { <span [id]="reasonId" class="ds-button__reason">{{ disabledReason() }}</span> }`.

**Criterio**: el botón deshabilitado no tiene `disabled` nativo; expone `aria-disabled` y (si hay motivo) `aria-describedby` + el `<span>`.

## 4. CSS — migrar de :disabled a [aria-disabled]

- [x] 4.1 En `button.css`: cambiar `button:disabled` por `button[aria-disabled='true']` (mantener `opacity: var(--ds-opacity-50)` + `cursor: not-allowed`).
- [x] 4.2 Cambiar los 3 selectores `:hover:not(:disabled)` y `:active:not(:disabled)` (primary, secondary, ghost) por `:not([aria-disabled='true'])`.
- [x] 4.3 Estilar `.ds-button__reason` con tokens (color secundario/muted + font-size sm + margin-top pequeño) — sin valores hardcoded, solo `var(--ds-*)`.

**Criterio**: sin selectores `:disabled` en `button.css`; el estado atenuado y el hint usan solo tokens.

## 5. Tests de comportamiento

- [x] 5.1 Actualizar `button.spec.ts` — el test "does NOT emit clicked when disabled" ahora pasa por la guarda (no por `disabled` nativo); verificar que sigue verde.
- [x] 5.2 Agregar test: botón disabled **es focuseable** — el `<button>` NO tiene atributo `disabled` ni `tabindex="-1"`.
- [x] 5.3 Agregar test: `aria-disabled="true"` presente cuando `disabled`, ausente cuando habilitado.
- [x] 5.4 Agregar test: con `disabled` + `disabledReason`, existe el `<span>` con el texto y el `<button>` lo referencia por `aria-describedby` (el id coincide).
- [x] 5.5 Agregar test: sin `disabledReason` (o habilitado), no hay `<span>` de motivo ni `aria-describedby`.
- [x] 5.6 `pnpm -F @romanmartinidev/components test` pasa (45 previos + nuevos).

**Criterio**: todos los scenarios del spec delta cubiertos por un test; suite verde.

## 6. Story + playground (opcional-demostrativo)

- [x] 6.1 En `button.stories.ts`: agregar una story `DisabledWithReason` que muestre `disabled` + `disabledReason` (demuestra el patrón en Storybook).
- [x] 6.2 Verificar que el playground (`app.html`) con botones disabled sigue renderizando bien (el disabled ahora es `aria-disabled`); ajustar si algún estilo dependía de `:disabled`.

**Criterio**: story visible; playground sin regresión visual.

## 7. Validación de cierre

- [x] 7.1 `pnpm openspec validate components-accessible-disabled --strict` pasa.
- [x] 7.2 `pnpm lint` y `pnpm format:check` pasan.
- [x] 7.3 `pnpm -r build` pasa.
- [x] 7.4 `pnpm -F @romanmartinidev/components test` y `pnpm -F playground test` verdes.
- [x] 7.5 Revisión manual a11y: con teclado, el botón disabled recibe foco y el SR (o el árbol de accesibilidad en devtools) anuncia "no disponible" + el motivo. (Opcional para el merge; documentar resultado.)
- [ ] 7.6 Proponer mensaje de commit y esperar OK del usuario.

**Criterio**: automáticos verdes; aprobación explícita antes del commit.

## 8. ADR + archive

- [ ] 8.1 Crear **ADR-011** "Estrategia de estado disabled accesible" (formato MADR): principio diferenciado (acción → `aria-disabled` + guarda + motivo focuseable; form control → `disabled` nativo), opciones evaluadas (uniforme vs diferenciado; reason visible vs solo-SR; CDK vs manual). Estado `Aceptado` al cierre.
- [ ] 8.2 Agregar fila en `docs/architecture/decisions-log.md`.
- [ ] 8.3 Changeset **minor** de `@romanmartinidev/components` (nuevo input `disabledReason` — feature aditiva; el input `disabled` se mantiene).
- [ ] 8.4 Mover `openspec/changes/components-accessible-disabled/` → `archive/aaa-011-components-accessible-disabled/`; sincronizar spec base `components-package` con el Requirement ADDED; frontmatter `archived`.
- [ ] 8.5 Actualizar `openspec/README.md` (nota aaa-011 archivado) + catálogo de changes en `docs/architecture/README.md`.
- [ ] 8.6 `pnpm openspec validate --all` pasa; proponer commit del archive y esperar OK.

**Criterio**: change archivado, ADR-011 aceptado, spec base sincronizada, openspec valida.
