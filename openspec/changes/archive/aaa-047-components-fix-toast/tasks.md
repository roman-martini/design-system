# Tasks — components-fix-toast

## 1. Región de anuncios persistente

- [x] 1.1 `toast.ts`: crear al inicializar el service un anunciador en `document.body` con dos regiones (`polite` y `assertive`), ocultas con el patrón visually-hidden inline que preserva el árbol de accesibilidad (design §1, §3)
- [x] 1.2 `toast.ts`: guarda `isPlatformBrowser` sobre esa creación — sin ella el fix rompe SSR, hoy tolerable solo porque el service no toca el DOM hasta el primer `show()` (design §5)
- [x] 1.3 `toast.ts`: `show()` escribe el mensaje en la región según la variante (danger → assertive, resto → polite), vaciando antes de escribir para que un mensaje repetido siga produciendo mutación (design §6)
- [x] 1.4 `toast.ts`: destruir el anunciador en `ngOnDestroy` junto con el contenedor

## 2. El item deja de ser live region

- [x] 2.1 `toast-item.ts`: quitar el host binding de `role` (con la región persistente anunciando, conservarlo duplica el anuncio); verificar que no queden estilos ni tests atados a ese atributo

## 3. Tests

- [x] 3.1 La región existe antes del primer `show()` y ofrece las dos politeness
- [x] 3.2 Un toast success/info/warning aterriza en `polite`; uno danger, en `assertive`
- [x] 3.3 El elemento visual del toast ya no declara rol de live region, y el foco no se mueve al aparecer
- [x] 3.4 Un mensaje repetido pasa por vacío antes de reescribirse (verificado con `takeRecords()`: el callback del observer es asíncrono y no llega dentro del test)
- [x] 3.5 Actualizar el test existente de roles por variante (CA-008.5), que hoy asserta sobre el item

## 4. Bundle, changeset y validación

- [x] 4.1 Medir `pnpm size` post-build y subir el techo de `components` con la regla de D-031 — medido 49.47 kB, excedía por 1.06 kB; techo a 51.94 kB. **Quedó un efecto de segundo orden anotado en `CONTRIBUTING.md`**: el margen del 5% ya vale 2.47 kB, más que el costo de un componente (2.32 kB), así que el gate dejó de detectar la entrada silenciosa de uno — corregirlo pide decisión del PO
- [x] 4.2 Changeset patch de `components` + `tokens` (lockstep ADR-015), mencionando el cambio de DOM observable (el item pierde su `role`)
- [x] 4.3 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test` (951 tests), `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size`
- [x] 4.4 Verificación medida en Chromium con el `dist` rebuildeado y el dev server reiniciado: ambas regiones existen vacías antes del primer toast, el mensaje de un success aterriza en `polite` y el de un danger en `assertive`, y el item no declara `role`

## 5. Commit (requiere OK del PO)

- [x] 5.1 `git status` fresco + staging con paths explícitos; proponer mensaje Conventional (`fix(components): …`, header ≤100 chars, sin trailer) y **esperar el OK explícito del PO** — commiteado con OK en `8809d86`

## 6. Gate visual y archive (bloqueado por D-022)

- [x] 6.1 Gate visual del PO sobre el stack de toasts en el playground — sin cambio visual esperado, es justamente lo que se verifica (OK del PO el 2026-08-02; medido además en Chromium: sin scroll fantasma, sin captura de foco ni de clicks)
- [ ] 6.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive": sync de `component-toast`, artefactos sin links relativos, `openspec/README.md`, `docs/architecture/catalog.md`, HU-008 y EP-002, README de producto, grooming del BACKLOG (Parte G → 3/7)
- [ ] 6.3 Proponer el commit de archive y esperar el OK del PO
