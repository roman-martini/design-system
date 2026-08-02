---
id: aaa-048
name: components-fix-modal
type: change
status: proposed
modifies-specs:
  - component-modal
related-adrs:
  - ADR-013
  - ADR-020
related-decisions:
  - D-007
  - D-022
---

# Proposal — components-fix-modal

# Why

**Un `DsModal` sin `heading` queda sin nombre accesible** [components-08]. `labelledBy` devuelve `null` cuando `heading` está vacío y no existe ningún input alternativo, así que el `<dialog>` se anuncia como "diálogo" a secas: un lector de pantalla no dice de qué se trata. Es violación de WCAG 4.1.2 y de la regla `dialog-name` de axe.

El caso no es teórico ni raro: el modal soporta contenido completamente proyectado, y una confirmación custom —el uso más común de un modal sin título— cae exactamente ahí. Lo llamativo es que **el kit ya resolvió este problema dos veces**: `DsSelect` y `DsFieldBase` exponen los alias `aria-label`/`aria-labelledby` para cubrir justo este hueco, y el modal no adoptó el patrón. Es la misma clase de convención implícita que `aaa-045` y `aaa-046` encontraron en los índices y en el `display` de los popovers: existe, se cumple en varios lados, y se rompe donde nadie miró.

En el mismo componente, `modal.css` hardcodea `border: 1px solid` [components-12] mientras select, input, toast y menu tokenizan el ancho de borde. Es el único valor dimensional hardcodeado que queda en ese archivo, y rompe la regla "todo valor visual sale de `var(--ds-*)`" que la propia spec del componente declara: un theme que engrose bordes por accesibilidad de bajo contraste no llegaría al modal.

**Prioridad respaldada**: la 1 (buenas prácticas — a11y por diseño, D-007) para el nombre accesible; la 3 (mantenibilidad por convenciones uniformes) para el borde y para escribir el patrón de nombre accesible donde sea verificable.

# What Changes

- **Alias `aria-label` y `aria-labelledby` en `DsModal`**, con la precedencia explícita: un `aria-labelledby` del consumidor gana sobre el `heading`; sin ninguno de los dos, se usa `aria-label`. El nombre se aplica **al `<dialog>`**, que es el elemento con rol, y **se limpia del host**: `aria-label` sobre un `<ds-modal>` sin rol es en sí una violación (`aria-prohibited-attr`), el mismo detalle que el plan dejó anotado para `DsButton`.
- **Un scenario que exige nombre accesible siempre**, por cualquiera de las tres vías. Hoy la spec solo cubre el camino feliz ("título accesible vía heading") y por eso el hueco no lo detectó nadie.
- **Borde tokenizado** en `modal.css` (`var(--ds-dimension-1)`, el mismo token que ya usa `menu.css`).
- Changeset: **patch** de `components` (y `tokens` por el lockstep de ADR-015). Sin cambios de API que rompan: los alias son aditivos y el borde no cambia de valor.

# Capabilities

## Modified Capabilities

- `component-modal`: el requirement suma los alias de nombre accesible y su precedencia; el scenario del título por `heading` se generaliza a "el diálogo siempre tiene nombre accesible", cubriendo el caso sin heading que hoy queda descubierto.

# Alternativas evaluadas

1. **Generar un nombre por defecto** ("Diálogo") cuando no hay ninguna de las tres vías — descartada. Un nombre genérico satisface a axe y no ayuda a nadie: el lector anunciaría "Diálogo, diálogo". Peor, **apagaría el gate**: la violación dejaría de reportarse sin que el problema real —un modal que no dice de qué es— esté resuelto. Es preferible que el consumidor sin nombre siga apareciendo en la auditoría.
2. **Requerir `heading` como input obligatorio** — descartada. Rompe a todo consumidor actual que use contenido proyectado, y el modal sin título visible es un caso legítimo (confirmaciones compactas, contenido con su propio encabezado adentro). El nombre accesible no tiene por qué ser visible.
3. **Poner el alias solo en el host y dejar que la AT lo herede** — descartada por incorrecta. El rol de diálogo lo tiene el `<dialog>` interno, no el custom element: un `aria-label` en el host queda inerte para el nombre del diálogo y encima es una violación por sí mismo.

# Impact

- **Código**: `packages/components/src/lib/modal/{modal.ts, modal.html, modal.css, modal.spec.ts}`, un changeset.
- **Consumidores**: ninguno rompe. Los modales con `heading` mantienen exactamente el comportamiento actual; los que no lo tienen ganan una vía para nombrarse.
- **Bundle**: crecimiento chico (dos inputs y un computed). El techo de `components` quedó en 51.47 kB con 2 kB de margen tras D-032; se mide al cerrar y se ajusta solo si hace falta.
- **ADR**: no genera. Es la adopción de un patrón que ADR-020 ya estableció para los form fields y que `DsSelect` aplicó; ningún ADR se contradice.
- **Gate visual del PO (D-022)**: aplica. Sin cambio visual esperado —el borde conserva su valor— así que el gate verifica que el modal se vea igual.
