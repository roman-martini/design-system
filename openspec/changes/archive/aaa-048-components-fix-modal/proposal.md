---
id: aaa-048
name: components-fix-modal
type: change
status: archived
archived: 2026-08-02
modifies-specs:
  - component-modal
related-adrs:
  - ADR-013
  - ADR-020
related-decisions:
  - D-007
  - D-022
---

# Proposal â€” components-fix-modal

# Why

**Un `DsModal` sin `heading` queda sin nombre accesible** [components-08]. `labelledBy` devuelve `null` cuando `heading` estÃ¡ vacÃ­o y no existe ningÃºn input alternativo, asÃ­ que el `<dialog>` se anuncia como "diÃ¡logo" a secas: un lector de pantalla no dice de quÃ© se trata. Es violaciÃ³n de WCAG 4.1.2 y de la regla `dialog-name` de axe.

El caso no es teÃ³rico ni raro: el modal soporta contenido completamente proyectado, y una confirmaciÃ³n custom â€”el uso mÃ¡s comÃºn de un modal sin tÃ­tuloâ€” cae exactamente ahÃ­. Lo llamativo es que **el kit ya resolviÃ³ este problema dos veces**: `DsSelect` y `DsFieldBase` exponen los alias `aria-label`/`aria-labelledby` para cubrir justo este hueco, y el modal no adoptÃ³ el patrÃ³n. Es la misma clase de convenciÃ³n implÃ­cita que `aaa-045` y `aaa-046` encontraron en los Ã­ndices y en el `display` de los popovers: existe, se cumple en varios lados, y se rompe donde nadie mirÃ³.

En el mismo componente, `modal.css` hardcodea `border: 1px solid` [components-12] mientras select, input, toast y menu tokenizan el ancho de borde. Es el Ãºnico valor dimensional hardcodeado que queda en ese archivo, y rompe la regla "todo valor visual sale de `var(--ds-*)`" que la propia spec del componente declara: un theme que engrose bordes por accesibilidad de bajo contraste no llegarÃ­a al modal.

**Prioridad respaldada**: la 1 (buenas prÃ¡cticas â€” a11y por diseÃ±o, D-007) para el nombre accesible; la 3 (mantenibilidad por convenciones uniformes) para el borde y para escribir el patrÃ³n de nombre accesible donde sea verificable.

# What Changes

- **Alias `aria-label` y `aria-labelledby` en `DsModal`**, con la precedencia explÃ­cita: un `aria-labelledby` del consumidor gana sobre el `heading`; sin ninguno de los dos, se usa `aria-label`. El nombre se aplica **al `<dialog>`**, que es el elemento con rol, y **se limpia del host**: `aria-label` sobre un `<ds-modal>` sin rol es en sÃ­ una violaciÃ³n (`aria-prohibited-attr`), el mismo detalle que el plan dejÃ³ anotado para `DsButton`.
- **Un scenario que exige nombre accesible siempre**, por cualquiera de las tres vÃ­as. Hoy la spec solo cubre el camino feliz ("tÃ­tulo accesible vÃ­a heading") y por eso el hueco no lo detectÃ³ nadie.
- **Borde tokenizado** en `modal.css` (`var(--ds-dimension-1)`, el mismo token que ya usa `menu.css`).
- Changeset: **patch** de `components` (y `tokens` por el lockstep de ADR-015). Sin cambios de API que rompan: los alias son aditivos y el borde no cambia de valor.

# Capabilities

## Modified Capabilities

- `component-modal`: el requirement suma los alias de nombre accesible y su precedencia; el scenario del tÃ­tulo por `heading` se generaliza a "el diÃ¡logo siempre tiene nombre accesible", cubriendo el caso sin heading que hoy queda descubierto.

# Alternativas evaluadas

1. **Generar un nombre por defecto** ("DiÃ¡logo") cuando no hay ninguna de las tres vÃ­as â€” descartada. Un nombre genÃ©rico satisface a axe y no ayuda a nadie: el lector anunciarÃ­a "DiÃ¡logo, diÃ¡logo". Peor, **apagarÃ­a el gate**: la violaciÃ³n dejarÃ­a de reportarse sin que el problema real â€”un modal que no dice de quÃ© esâ€” estÃ© resuelto. Es preferible que el consumidor sin nombre siga apareciendo en la auditorÃ­a.
2. **Requerir `heading` como input obligatorio** â€” descartada. Rompe a todo consumidor actual que use contenido proyectado, y el modal sin tÃ­tulo visible es un caso legÃ­timo (confirmaciones compactas, contenido con su propio encabezado adentro). El nombre accesible no tiene por quÃ© ser visible.
3. **Poner el alias solo en el host y dejar que la AT lo herede** â€” descartada por incorrecta. El rol de diÃ¡logo lo tiene el `<dialog>` interno, no el custom element: un `aria-label` en el host queda inerte para el nombre del diÃ¡logo y encima es una violaciÃ³n por sÃ­ mismo.

# Impact

- **CÃ³digo**: `packages/components/src/lib/modal/{modal.ts, modal.html, modal.css, modal.spec.ts}`, un changeset.
- **Consumidores**: ninguno rompe. Los modales con `heading` mantienen exactamente el comportamiento actual; los que no lo tienen ganan una vÃ­a para nombrarse.
- **Bundle**: crecimiento chico (dos inputs y un computed). El techo de `components` quedÃ³ en 51.47 kB con 2 kB de margen tras D-032; se mide al cerrar y se ajusta solo si hace falta.
- **ADR**: no genera. Es la adopciÃ³n de un patrÃ³n que ADR-020 ya estableciÃ³ para los form fields y que `DsSelect` aplicÃ³; ningÃºn ADR se contradice.
- **Gate visual del PO (D-022)**: aplica. Sin cambio visual esperado â€”el borde conserva su valorâ€” asÃ­ que el gate verifica que el modal se vea igual.
