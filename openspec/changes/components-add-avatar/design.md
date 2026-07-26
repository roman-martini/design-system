# Design — components-add-avatar (aaa-037)

Decisiones técnicas del change. Sin ADR: el hash de tono es local a Avatar; `space.negative` lo gobierna la jerarquía de ADR-003.

## Context

HU-022 fijó: `DsAvatar` (imagen → fallback a iniciales con tono por hash) + `DsAvatarGroup` (solape con `space.negative.*`, `max` + "+N"). Los tokens `component.avatar.size/font-size/border-*` existen del bootstrap; falta la paleta de tonos, el espejo negativo de space y los dos componentes.

## Goals / Non-Goals

**Goals:**

- Fallback determinístico (mismo `name` → mismo tono, en cualquier app) con override manual.
- `space.negative.*` sin duplicar valores fuera de la jerarquía (HU-018 CA-018.4).
- Grupo con overflow accesible.

**Non-Goals:**

- Status dot / badge sobre avatar (tokens `status-*` reservados, sin consumidor aún).
- Tooltip en "+N" (iteración futura).

## Decisions

### 1. `DsAvatar` — API y fallback

```ts
export type DsAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DsAvatarTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger';

// selector 'ds-avatar', standalone, OnPush
readonly name = input<string>('');            // fuente de iniciales, hash y nombre accesible
readonly src = input<string | null>(null);    // imagen; error de carga → fallback
readonly size = input<DsAvatarSize>('md');
readonly tone = input<DsAvatarTone | 'auto'>('auto'); // 'auto' = hash de name
```

- **Iniciales** (`computed`): primera letra de las dos primeras palabras de `name` (una sola palabra → 1 letra), uppercase con `toLocaleUpperCase`. La referencia muestra 1 letra; dos palabras dan 2 (estándar de kits).
- **Hash determinístico** (`computed`): suma de code points de `name` módulo `TONES.length` sobre el orden fijo `[neutral, primary, success, warning, info, danger]`. Función pura local (testeable); `tone !== 'auto'` la ignora.
- **Error de imagen**: signal interno `imgFailed`; `(error)` del `<img>` lo setea → template cae a iniciales. `src` nuevo resetea el flag (effect o linkedSignal).
- **A11y (CA-022.4)**: con `name` — imagen: `alt="{{ name }}"`; iniciales: `role="img"` + `aria-label="{{ name }}"` (las letras van `aria-hidden`, son decoración del label). Sin `name`: `aria-hidden="true"` en el host del contenido (decorativo).

### 2. `DsAvatarGroup` — solape y "+N"

- Selector `ds-avatar-group`, proyecta `<ds-avatar>`; host `role="group"` + input `label` → `aria-label` (opcional).
- **Solape**: los hijos (salvo el primero) llevan `margin-inline-start: var(--ds-component-avatar-group-overlap)` (token nuevo → `{semantic.space.negative.sm}`) y borde `border-width`/`border-color` (bootstrap, `bg.surface`) para el anillo de separación de la referencia.
- **`max`** (`input<number | null>(null)`): `contentChildren(DsAvatar)` cuenta; los que exceden se ocultan (el grupo les setea una señal interna `hiddenInGroup` — acoplamiento intra-familia, mismo patrón que RadioGroup/Radio) y el grupo renderiza el item **"+N"**: mismo estilo de fallback en tono `neutral`, `role="img"` + `aria-label` "y N más". `max` nulo = sin límite.
- Sin `ds-` selector attr en hijos: la familia es de composición explícita (como Card).

### 3. Tokens

**`semantic/space.json` — `negative.*`** (espejo 2xs–xl; HU-018 CA-018.3):

```json
"negative": {
  "2xs": { "value": "calc(-1 * {semantic.space.2xs})" },
  "xs":  { "value": "calc(-1 * {semantic.space.xs})" },
  "sm":  { "value": "calc(-1 * {semantic.space.sm})" },
  "md":  { "value": "calc(-1 * {semantic.space.md})" },
  "lg":  { "value": "calc(-1 * {semantic.space.lg})" },
  "xl":  { "value": "calc(-1 * {semantic.space.xl})" }
}
```

Style Dictionary interpola referencias dentro de strings: la fuente referencia la jerarquía (cero duplicación de valores, CA-018.4) y el output emite `calc(-1 * <ref>)` (con `outputReferences`, `var(--ds-semantic-space-*)` cuando SD lo soporte para refs parciales; valor resuelto en su defecto — ambos correctos). Sin `2xl/3xl` negativos: sin caso de uso, se agregan si aparece.

**`component/avatar.json`** — se agrega `tone.<t>.{bg,text}` por los 6 tonos, referenciando la **misma cadena semántica que Badge subtle** (`bg.<t>-subtle` + el texto subtle por tono ya gateado); `group.overlap` → `{semantic.space.negative.sm}`; `radius` → `{semantic.radius.full}`. Los planos `bg`/`text` del bootstrap (primary-subtle/link) **se eliminan** en favor de la paleta — el componente no existía, no hay consumidor: no breaking.

### 4. Gate de contraste

Pares nuevos `avatar-tone-<t>` (`text` sobre `bg`, nivel "text" ≥4.5) en los 4 themes. Son los mismos valores ya verdes para Badge subtle; se declaran igual (regla del repo: cada componente declara sus pares — el gate protege contra cambios futuros de la cadena semántica que rompan a Avatar aunque Badge cambie de tokens).

## Risks / Trade-offs

- [SD y `calc(-1 * {ref})`] → si la interpolación no jugara con `outputReferences`, el output cae a valor resuelto (`calc(-1 * 8px)`): correcto igual; la jerarquía vive en la fuente. Se verifica en el build del apply.
- [Acoplamiento grupo→hijo (`hiddenInGroup`)] → interno al package, patrón ya usado por la familia Radio; sin contrato público.
- [Hash simple (suma de code points)] → colisiones posibles entre nombres (aceptable: 6 tonos, es decoración); determinismo es el requisito, no unicidad.

## Open Questions

(ninguna — HU-022 cerró fallback, tokens, overflow y sizes)

## Notas de apply

Del `/ng:review` de aaa-037 (0 altas / 1 media / 0 bajas):

1. **`<img>` plano en vez de `NgOptimizedImage` — decisión, no omisión.** `NgOptimizedImage` rechaza `data:`/`blob:` URIs en runtime; el `src` de un avatar de librería debe aceptar cualquier URL del consumidor (preview de subida = `blob:`, imágenes embebidas = `data:`). A 24–64px el avatar no es candidato LCP, así que el beneficio de la directiva es marginal y el costo de contrato, real (D-017). Constancia explícita en comentario de `avatar.html` (lo que pidió el review). Si el kit sumara un componente de imagen grande (hero/media), ahí sí aplica `NgOptimizedImage`.
2. Excepciones de consistencia de paquete ya conocidas (naming de handlers por evento, queries de test por selector CSS): mismas de aaa-036, sin cambios.
