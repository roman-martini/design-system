---
'@romanmartinidev/components': minor
---

`DsButton` estado `loading` (HU-017, aaa-031): input `loading` que embebe un `ds-spinner` (`xs`, `currentColor`) por composición y bloquea la reactivación de forma accesible — guarda de click/teclado sin `disabled` nativo (sigue focuseable y anunciado, ADR-011) y `aria-busy="true"`. Contenido configurable: el modo default reemplaza el contenido conservando el ancho (cero layout shift) y el input opcional `loadingText` muestra spinner + texto de progreso. `loading` tiene precedencia sobre `disabled`/`disabledReason`. Mientras carga, el botón se lee como no interactivo (`cursor: progress`, sin hover/active).

Refinamiento visual del botón base (todas las variantes/sizes): gap de contenido `2px → 8px` y radius `6px → 8px` para una separación y redondeo más cómodos. Sin cambios de API. Sin tokens nuevos (reutiliza `component.spinner.*` y la escala existente); el par se versiona lockstep (ADR-015).
