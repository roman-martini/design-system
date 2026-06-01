# FUTURE-WORK — Backlog del Design System

Rescate del roadmap del repo de investigación previo, **realineado** al naming y estructura actuales (`rmd-` selectores, `--ds-*` CSS vars, monorepo pnpm + Angular 21 zoneless).

> Este documento es **inspirativo, no normativo**. Cada componente / feature concreta se propone como **change OpenSpec** (`CHG-NNN`) cuando llegue su turno, con su propio `proposal.md` + `design.md` + `tasks.md` + spec deltas. No tomar este backlog como contrato.

---

## Estado actual respecto a los niveles de madurez

| Nivel | Tema                                                    | Estado           | Coverage                                                                                         |
| ----- | ------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| 1     | Cerrar deuda — componentes base + tokens                | 🟡 En curso      | 1/11 componentes (Button), tokens base completos                                                 |
| 2     | Calidad profesional — tests, a11y CI, stylelint, bundle | 🔴 Sin empezar   | 0%                                                                                               |
| 3     | Distribución y consumo — monorepo, publish, versionado  | 🟢 Casi completo | Monorepo + ng-packagr + Changesets ya hechos (CHG-001..003). Falta CI/release (Fase 5 = CHG-005) |
| 4     | Escalado real — multi-framework, mobile, Figma sync     | 🔴 Sin empezar   | 0% — diferido a "cuando aparezca necesidad real"                                                 |
| 5     | Patterns / Templates / Recipes                          | 🔴 Sin empezar   | 0% — útil cuando haya ≥10 componentes                                                            |

---

## Componentes futuros

Cada uno = un change OpenSpec (`components-add-<name>` o similar) con su propio scope.

### Prioridad alta — usabilidad para una app real

| Componente             | Selector                        | Variantes / props                                                                                                 | Sizes       | Tokens nuevos             | Notas                                                                                                            |
| ---------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Checkbox**           | `rmd-checkbox`                  | `checked`, `indeterminate`, `disabled`, `label`                                                                   | sm/md       | `component/checkbox.json` | Indeterminate vía `effect()` + `viewChild()`. ARIA `aria-checked="mixed"`                                        |
| **Radio + RadioGroup** | `rmd-radio` / `rmd-radio-group` | `value` model + `name` en group                                                                                   | sm/md       | `component/radio.json`    | Radio se inyecta el group con `inject(RadioGroupComponent, { optional: true })` → funciona standalone o en grupo |
| **Modal / Dialog**     | `rmd-modal`                     | `[(open)]`, `[modalFooter]` slot, focus trap, body scroll lock, cierre por ESC/overlay/X, fade+scale anim         | sm/md/lg/xl | `component/modal.json`    | Requiere z-index tokens (ver abajo)                                                                              |
| **Select / Combobox**  | `rmd-select`                    | `[options]`, `[(value)]`, keyboard nav (↑↓ Enter Esc Home End), variante con search/filter, variante multi-select | sm/md/lg    | `component/select.json`   | Requiere `@floating-ui/dom`                                                                                      |
| **Tabs**               | `rmd-tabs` / `rmd-tab`          | Variantes underline/pills/contained, `[(activeIndex)]`, keyboard nav (← →, Home, End)                             | —           | `component/tabs.json`     | —                                                                                                                |

### Prioridad media — completitud

| Componente               | Selector                     | Variantes / props                                                                            | Tokens nuevos                                          | Notas                       |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------- |
| **Tooltip**              | Directiva `[rmdTooltip]`     | Placement top/bottom/left/right + auto, delay configurable, trigger hover + focus            | `component/tooltip.json`                               | Requiere `@floating-ui/dom` |
| **Toast / Notification** | `rmd-toast` + `ToastService` | Variantes success/warning/danger/info, 6 posiciones, auto-dismiss, stacking, acción opcional | `component/toast.json` (hereda de alert si suficiente) | Requiere z-index alto       |
| **Spinner**              | `rmd-spinner`                | Círculo girando, sizes xs/sm/md/lg                                                           | `component/spinner.json`                               | —                           |
| **Skeleton**             | `rmd-skeleton`               | Bloque pulsante, props `width`, `height`, `radius`, `shape: 'text' \| 'rect' \| 'circle'`    | `component/skeleton.json`                              | —                           |
| **Progress**             | `rmd-progress`               | Barra determinada (con value) o indeterminada                                                | `component/progress.json`                              | —                           |

### Prioridad baja / nice-to-have

| Componente              | Notas                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Accordion / Collapsible | —                                                                                                         |
| Breadcrumbs             | —                                                                                                         |
| Pagination              | —                                                                                                         |
| Stepper                 | —                                                                                                         |
| Menu / Dropdown         | Similar a Select pero para acciones, no selección                                                         |
| Slider                  | Range input                                                                                               |
| **DatePicker**          | **Considerar wrapping** de librería existente (`flatpickr`, `vanilla-calendar`) — no construir desde cero |

---

## Tokens faltantes

### Z-index (alta prioridad — bloquea Modal / Tooltip / Toast)

Sumar `packages/tokens/src/semantic/z-index.json`:

```json
{
  "semantic": {
    "z-index": {
      "hide": { "value": "-1" },
      "auto": { "value": "auto" },
      "base": { "value": "0" },
      "docked": { "value": "10" },
      "dropdown": { "value": "1000" },
      "sticky": { "value": "1020" },
      "banner": { "value": "1030" },
      "overlay": { "value": "1040" },
      "modal": { "value": "1050" },
      "popover": { "value": "1060" },
      "skiplink": { "value": "1070" },
      "toast": { "value": "1080" },
      "tooltip": { "value": "1090" }
    }
  }
}
```

> Verificar si ya existe `z-index.json` en el repo actual (la lista del package tokens lo menciona, pero no validamos su contenido).

### Breakpoints (media prioridad — necesarios para componentes responsive)

Sumar `packages/tokens/src/semantic/breakpoint.json`:

```json
{
  "semantic": {
    "breakpoint": {
      "sm": { "value": "640px" },
      "md": { "value": "768px" },
      "lg": { "value": "1024px" },
      "xl": { "value": "1280px" },
      "2xl": { "value": "1536px" }
    }
  }
}
```

Convención: **mobile-first**, usar `@media (min-width: var(--ds-breakpoint-md))`.

### Motion adicional (baja prioridad)

Sumar a `packages/tokens/src/primitives/motion.json`:

- `delay`: 0, 75, 100, 150, 200, 300 (ms).
- Easings extras: `bounce`, `back-in`, `back-out`.

### Density tokens (postergar)

Convención `[data-density="compact"]` con overrides de heights y paddings — sumar **solo si aparece la necesidad** (no por completitud).

---

## Roadmap por nivel — qué viene después

### Nivel 1 — Cerrar deuda obvia

**Objetivo**: que el DS sea utilizable para una app real, no solo demo.

1. **Z-index tokens** (bloquea Modal/Tooltip/Toast).
2. **Checkbox** + **Radio + RadioGroup**.
3. **Modal / Dialog** (requisito de apps reales).
4. **Tabs**.
5. **Select / Combobox** (el más complejo — hacer después de Tabs).
6. **Tests unitarios** de los componentes existentes + nuevos (Vitest ya configurado).

### Nivel 2 — Calidad profesional

**Objetivo**: confianza para que el DS pueda ser mantenido por equipo.

1. **Tooltip** (requiere `@floating-ui/dom` — instalar como dep al hacer Select).
2. **Toast / Notification**.
3. **Spinner + Skeleton + Progress**.
4. **A11y en CI**: `@storybook/test-runner` + `axe-playwright` — violaciones WCAG AA fallan el build.
5. **Docs de tokens en Storybook**: stories MDX para Colors, Spacing, Typography, Shadow, Motion (grid visual de paletas, escala de spacing, etc.).
6. **Visual regression**: Chromatic (free tier 5000 snapshots/mes) o Playwright snapshots.
7. **Stylelint para forzar tokens**: detecta `color: #fff` hardcodeado → falla lint.
8. **Bundle size budget**: `size-limit` — `main < 150 KB`, `styles < 30 KB`. CI corre en cada PR.

### Nivel 3 — Distribución y consumo (casi completo)

- ✅ Monorepo pnpm workspaces (CHG-001).
- ✅ ng-packagr para publicar `@romanmartinidev/components` (CHG-003).
- ✅ Changesets configurado (CHG-001).
- ⏳ **CI + release con GitHub Actions** (Fase 5 = CHG-005).
- ⏳ **Tokens TypeScript estructurados** (objeto vs constantes planas) — diferido a `tokens-rich-types` change futuro.
- ⏳ **Docs de migración / consumo** — README de cada package ya cubre uso básico; falta guide cuando haya v1.0.

### Nivel 4 — Escalado real (solo si hay necesidad)

> **Decisión clave**: solo si hay ≥2 frameworks objetivo, apps nativas iOS/Android, o sync bidireccional Figma. Caso contrario, sobre-ingeniería.

- **Multi-framework via Web Components**: Lit (recomendado) o Stencil. Crear `packages/ui-core/` con componentes en Lit, mantener `@romanmartinidev/components` como wrapper Angular.
- **Multi-platform mobile**: agregar platforms en `sd.config.mjs` para iOS (Swift) y Android (XML). Workflow GH Actions publica tokens a repos nativos.
- **Sync bidireccional Figma**: Token Studio plugin Figma + sync con GitHub.
- **Theme builder UI**: página MDX en Storybook con sliders de hue/saturation/lightness, selectores de fuente, generador de `theme.json`.
- **Modos extra**: high contrast (WCAG AAA, ratios 7:1), density compact/spacious, RTL (logical properties).

### Nivel 5 — Patterns / Templates / Recipes

Cuando haya ≥10 componentes: composiciones reusables que muestran el DS en uso.

- Login form
- Settings panel
- Data table layout
- Dashboard skeleton
- Empty state
- Error states (404, 500, network)
- Onboarding flow

Cada pattern como **story compuesta**, no como componente nuevo del package.

---

## Anti-patrones a evitar

(Heredados del roadmap viejo, siguen siendo válidos.)

- **No agregar Web Components todavía**. Stencil/Lit suman complejidad sin valor mientras solo haya un consumidor Angular.
- **No saltar a Nx hasta tener ≥5 packages**. pnpm workspaces es suficiente.
- **No documentar componentes que aún no existen**. Storybook se desactualiza solo si la doc va por detrás.
- **No usar Material Angular como base**. Va contra el ejercicio de aprendizaje y agrega dependencias pesadas.
- **No crear DatePicker propio**. Wrapping de `flatpickr` o `vanilla-calendar` es más realista.
- **No usar `!important` ni override por especificidad**. Si un token no alcanza, sumar uno nuevo en lugar de hackear CSS.
- **No commitear archivos generados** (Compodoc `documentation.json`, builds, etc.). Deben estar en `.gitignore`.

Ver también [PLAYBOOK.md § Anti-patrones a evitar](PLAYBOOK.md#anti-patrones-a-evitar) para anti-patrones de la **infraestructura** del repo.

---

## Métricas de éxito por nivel

| Nivel | Métrica                                                                                       |
| ----- | --------------------------------------------------------------------------------------------- |
| 1     | App real puede construirse 100% con componentes del DS (sin componentes ad-hoc).              |
| 2     | Otro dev hace PR cambiando un componente y el CI lo bloquea/aprueba sin intervención manual.  |
| 3     | App externa instala `@romanmartinidev/components` y la usa sin mirar el código fuente del DS. |
| 4     | Cambio de token en Figma llega a producción en < 5 minutos sin código manual.                 |
| 5     | Nuevo prototipo se arma combinando templates existentes en < 30 minutos.                      |

---

## Recursos de referencia

- **Style Dictionary v4 docs**: https://styledictionary.com/
- **Storybook Angular**: https://storybook.js.org/docs/get-started/install?renderer=angular
- **Changesets**: https://github.com/changesets/changesets
- **ng-packagr**: https://github.com/ng-packagr/ng-packagr
- **Floating UI**: https://floating-ui.com/ — positioning para Select/Tooltip/Popover
- **Chromatic**: https://www.chromatic.com/
- **Token Studio**: https://tokens.studio/
- **WAI-ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

---

> Actualizado: 2026-06-01. Si modificás este doc, mantener alineación con [README.md](README.md) (síntesis arquitectónica) y [PLAYBOOK.md](PLAYBOOK.md) (instructable de replicación).
