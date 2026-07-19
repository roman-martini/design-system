# Design — playground-showcase (aaa-022)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## 1. Registro único componente → ruta → sidebar

Un solo array tipado es la fuente de verdad de todo el showcase:

```ts
// showcase/registry.ts
interface ShowcaseEntry {
  slug: string; // 'button' → ruta /button
  label: string; // 'Button' → texto del sidebar
  loadComponent: () => Promise<Type<unknown>>; // import lazy de la vista
}
export const SHOWCASE_ENTRIES: readonly ShowcaseEntry[] = [
  /* 11 entradas */
];
```

- `app.routes.ts` genera las rutas mapeando el registro (`loadComponent` lazy por vista) + `''` → redirect a la primera entrada + `'**'` → redirect igual (CA-011.2, sin pantalla rota).
- El sidebar itera el mismo registro con `routerLink`/`routerLinkActive` — imposible que ruta y menú diverjan.
- Slugs: el nombre del componente en kebab (`button`, `checkbox`, `radio`, `radio-group`, `modal`, `select`, `input`, `tabs`, `tooltip`, `toast`, `iconography`). La sección de iconografía existente se conserva como vista propia (es demo de ADR-012, no un componente).

## 2. Shell

- `App` queda como shell: header breve + `<nav aria-label="Componentes">` (sidebar) + `<main><router-outlet /></main>`.
- Layout con CSS Grid de dos columnas (sidebar fija, contenido con scroll propio), 100% tokens `--ds-*` (CA-011.6). En viewport angosto el sidebar colapsa arriba (flujo normal, sin JS).
- Item activo: `routerLinkActive` + `[attr.aria-current]="'page'"` vía `ariaCurrentWhenActive` del router (CA-011.7).
- Zoneless se mantiene: `provideRouter(routes)` es compatible; no se agrega zone.js.

## 3. Vistas y componente de caso de uso

- Una vista standalone por entregable en `src/app/showcase/<slug>/<slug>-showcase.ts` (+ `.html`/`.css` si amerita), migrando 1:1 las secciones de `app.html`. El estado de las demos (signals, FormControls) se muda del `App` monolítico a cada vista — quedan autocontenidas.
- Componente compartido `ShowcaseCase` (`showcase/ui/showcase-case.ts`, interno del playground): `title` (input), `snippet` (input string), slot para la demo renderizada, y botón copiar. Evita repetir la estructura título+demo+código 30+ veces.

## 4. Snippets

- Strings colocados junto a cada vista (const por caso), sin tooling de extracción — decisión de la HU (notas). El snippet muestra el uso del consumidor (template/TS mínimos), no el fuente de la demo.
- Copiar: `navigator.clipboard.writeText(snippet)` con feedback vía `DsToastService.success('Copiado')` — dogfooding del toast recién entregado. El botón es un `ds-button` ghost sm con `aria-label` descriptivo.
- Render del código: `<pre><code>{{ snippet }}</code></pre>` con tokens de tipografía mono. Sin highlighter (dependencia nueva sin caso que la justifique — D-005); candidato futuro si molesta.
- jsdom: `navigator.clipboard` no existe → el handler cae en no-op seguro; el test lo stubbea (`Object.assign(navigator, { clipboard: { writeText: vi.fn() } })`).

## 5. Tests de navegación (CA-011.8)

- `RouterTestingHarness` sobre la config real de rutas: navegar a `/button` renderiza la vista del button; `/select` la del select; ruta desconocida redirige a la primera entrada.
- Sidebar: render de los 11 links con `href` correcto y `aria-current` en el activo.
- ShowcaseCase: snippet visible + copiar llama al clipboard con el texto del caso.
- Los tests actuales de `app.spec.ts` (página monolítica) se reescriben al shell; se pierde cobertura redundante con las suites de components (que ya cubren cada componente).

## 6. Definition of done para componentes futuros

Al archivar: actualizar la skill `/ds:add-component` (paso nuevo: "agregar la vista `<slug>-showcase` + entrada en `SHOWCASE_ENTRIES`") para que Spinner en adelante nazcan con vista propia.
