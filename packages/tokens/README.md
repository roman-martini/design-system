# @romanmartinidev/tokens

Design tokens del sistema de diseño **romanmartinidev**. Distribuye CSS custom properties (con prefijo `--ds-*`) y constantes JS/TS generadas con [Style Dictionary 4](https://amzn.github.io/style-dictionary/), organizadas en una jerarquía **primitives → semantic → component → theme**.

## Instalación

```bash
pnpm add @romanmartinidev/tokens
# o
npm install @romanmartinidev/tokens
```

## Uso

### CSS (lo más común)

Importa el CSS base una vez en el entry point de tu app:

```ts
import '@romanmartinidev/tokens/css';
```

Y consume las variables en cualquier CSS:

```css
.button {
  background: var(--ds-semantic-color-bg-primary);
  color: var(--ds-semantic-color-text-inverse);
  padding: var(--ds-semantic-space-sm) var(--ds-semantic-space-md);
  border-radius: var(--ds-semantic-radius-md);
}

.button:focus-visible {
  box-shadow: var(--ds-semantic-shadow-focus);
}
```

### Themes

Cada theme es un CSS opt-in. Activá el theme aplicando atributos al `<html>`:

```ts
// Importá los themes que vas a usar
import '@romanmartinidev/tokens/themes/dark';
import '@romanmartinidev/tokens/themes/brand-a';
```

```html
<html data-theme="dark" data-brand="a">
  <!-- toda la cascada usa dark + brand-a -->
</html>
```

Los themes solo redefinen tokens **semantic** (no primitives). Podés combinar `data-theme` con `data-brand` libremente — la cascada CSS resuelve el orden.

### JavaScript / TypeScript

Si necesitás los valores como objetos JS (ej. en runtime para librerías de animación):

```ts
import * as tokens from '@romanmartinidev/tokens';

console.log(tokens.DsColorBlue500); // "#3b82f6"
```

## Exports disponibles

| Sub-path           | Contenido                              |
| ------------------ | -------------------------------------- |
| `.` (root)         | JS + types (constantes generadas)      |
| `./css`            | CSS base con `:root { --ds-* }`        |
| `./themes/dark`    | Override de semantics para tema oscuro |
| `./themes/brand-a` | Override de semantics para brand A     |
| `./themes/brand-b` | Override de semantics para brand B     |

Imports a paths internos (`/src`, `/internal`) están bloqueados por el campo `exports` del `package.json`.

## Jerarquía de tokens

```
primitives/   → valores crudos (color.blue.500, dimension.16, shadow.md)
  ↓
semantic/     → uso (bg.primary, text.muted, border.default, space.md, shadow.focus)
  ↓
component/    → específicos por componente (button.bg, modal.shadow, …)
  ↓
theme/        → overrides para dark, brand-a, brand-b
```

**Reglas**:

- `semantic` referencia `primitives` (no al revés).
- `component` referencia `semantic` o `primitives` (no `theme`).
- `theme` solo redefine tokens existentes en `semantic` (no introduce nuevos).
- Sin referencias circulares.

Detalle completo en [ADR-003](../../docs/architecture/adr/ADR-003-arquitectura-design-tokens.md).

## Build (solo desarrollo)

```bash
pnpm -F @romanmartinidev/tokens build
```

Genera `dist/tokens.{css,js,d.ts}` + un CSS por cada theme bajo `dist/themes/`.

## Versionado

Pre-1.0. La superficie API puede cambiar entre minors según política del repo. Cambios significativos siguen el flujo de [Changesets](../../CONTRIBUTING.md) y, cuando son one-way door, generan un [ADR](../../docs/architecture/adr/).

**El prefix `--ds-*` queda parte del contrato API público**: cambiarlo es BREAKING y exige un ADR que reemplace al ADR-003.

## Licencia

[MIT](../../LICENSE) © 2026 Roman Martini
