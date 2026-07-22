---
epica: EP-006
actor: Dev consumidor
estado: Hecha (2026-07-19, aaa-022 playground-showcase)
decisiones: [D-005]
---

# HU-011 — Showcase navegable de casos de uso por componente (dev consumidor)

**COMO** dev que evalúa cómo usar un componente del DS
**QUIERO** navegar por un sidebar a la vista de ese componente y ver sus casos de uso funcionando, con el código de cada uno
**PARA** entender el uso real sin scrollear una página monolítica ni leer el fuente del repo.

## Decisiones de refinamiento (PO, 2026-07-18)

1. **Nombre "showcase"** — se mantiene la convención personal del PO, que además coincide con el término del ecosistema Angular (Material, PrimeNG).
2. **Reemplaza** la página única actual del playground: el showcase pasa a ser LA interfaz; una sola fuente de demos, sin duplicación.
3. **Angular Router con ruta por componente** (lazy): URLs compartibles y el playground pasa a ejercitar routing real (hoy no lo usa — consumo más realista del DS).
4. **Demos + snippet de código** por caso de uso (patrón Material/PrimeNG): el showcase también documenta el consumo.
5. **Alcance del primer change: estructura + migración completa** de las demos de los 11 entregables (9 componentes + directiva + service).

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec playground-app (delta del change). -->

- [x] **CA-011.1 (sidebar)** — Dado el playground abierto, entonces un sidebar lista todos los entregables del kit; seleccionar uno navega a su vista sin recarga completa.
- [x] **CA-011.2 (deep link)** — Dado que cada componente tiene ruta propia (`/<slug>`, lazy), cuando se abre esa URL directamente, entonces se renderiza su vista; una ruta desconocida redirige a un destino válido (sin pantalla rota).
- [x] **CA-011.3 (casos de uso)** — Dada la vista de un componente, entonces muestra sus casos de uso renderizados y funcionales — como mínimo los que hoy existen en la página única.
- [x] **CA-011.4 (snippet copiable)** — Dado un caso de uso, entonces muestra su snippet de código y un botón de copiar que deja el snippet en el clipboard.
- [x] **CA-011.5 (migración completa)** — Dado el cierre del change, entonces los 11 entregables tienen su vista en el showcase y la página monolítica anterior no existe más.
- [x] **CA-011.6 (el showcase consume el DS)** — Dado el shell del showcase (sidebar, layout, vistas), entonces sus estilos salen de tokens `--ds-*` (sin hardcodes) y usa componentes del DS donde aplique — el showcase es en sí mismo un caso de consumo.
- [x] **CA-011.7 (a11y de navegación)** — Dado el sidebar, entonces es navegable por teclado con foco visible, la vista activa se marca (`aria-current`), y la navegación es un landmark (`<nav>` con nombre accesible).
- [x] **CA-011.8 (tests)** — Dada la suite del playground, entonces cubre la navegación (render de la vista según la ruta, redirección de ruta desconocida) y queda verde.

## Dependencias

- Ninguna bloqueante (el kit ya está entregado; Spinner/Skeleton se suman al showcase en sus propios changes).

## Fuera de alcance

- Búsqueda/filtro en el sidebar, playground interactivo de props (knobs) — candidatos a futuro con disparador propio.
- Dark mode switcher / selector de themes (candidata natural de EP-006, HU aparte).
- Cambios a los componentes del kit (EP-002) y a Storybook.
- Publicación del showcase como sitio (hoy es app local).

## Notas

- **Cierre (2026-07-19)** — [`aaa-022 playground-showcase`](../../../../openspec/changes/archive/aaa-022-playground-showcase/) archivado; 9 tests de navegación, review sin altas (foco post-navegación incluido).
- Los changes futuros de componentes (Spinner en adelante) agregan su vista al showcase como parte de su definición de done (actualizar el workflow `/ds:add-component` al cerrar este change).
- Referencia de estructura: las demos actuales de `app.html` se reparten en una vista por componente; los snippets pueden mantenerse como strings colocados junto a cada demo (sin tooling de extracción automática en esta iteración).
