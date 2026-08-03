---
id: aaa-050
name: components-fix-avatar
type: change
status: proposed
modifies-specs:
  - component-avatar
related-adrs:
  - ADR-007
related-decisions:
  - D-007
  - D-022
---

# Proposal — components-fix-avatar

# Why

`DsAvatarGroup` computa el nombre accesible del overflow como `` `y ${count} más` `` sin ningún input para cambiarlo [components-09]. **Es el único texto del kit anunciado por tecnología asistiva que un consumidor no puede traducir ni ajustar**: el resto de los strings por defecto ya son overridables — `closeLabel` del modal, `dismissLabel` del toast, `label` del spinner, y los seis labels de `DsPagination`, que incluso documentan "defaults en español, el consumidor los traduce".

Para una lib publicada que apunta a proyectos profesionales, eso es un bloqueo de i18n en la superficie de accesibilidad: una app en inglés anuncia el overflow en español sí o sí. Y rompe una convención que el propio kit ya cumple en todos los demás casos — la misma clase de inconsistencia que la Parte G viene cerrando.

**Prioridad respaldada**: la 1 (buenas prácticas — a11y utilizable fuera del español) y la 3 (mantenibilidad por convenciones uniformes: si todos los strings anunciados son overridables, éste también).

# What Changes

- **Input `moreLabel`** de tipo `(count: number) => string`, con el default actual. Se elige función y no string porque **el texto entero depende del número**: una traducción puede necesitar pluralización ("1 more" vs "2 more") o un orden de palabras distinto, y ninguna de las dos cosas se resuelve concatenando fragmentos fijos (ver design §1).
- **La convención se escribe en la spec**: todo texto que el kit expone a tecnología asistiva SHALL ser overridable por el consumidor. Hoy se cumple en seis componentes por imitación y se rompió en éste; es exactamente el patrón que `aaa-045` y `aaa-046` mostraron que hay que convertir en requirement verificable.
- Changeset: **minor** de `components` (input nuevo, aditivo) y patch de `tokens` por el lockstep de ADR-015.

# Capabilities

## Modified Capabilities

- `component-avatar`: el requirement del grupo suma el input `moreLabel` y el scenario del overflow pasa a exigir que su nombre accesible sea configurable, no solo que exista.

# Alternativas evaluadas

1. **`moreLabel` como string con placeholder** (`'y {count} más'`) — descartada. Es más cómoda en templates y en Storybook, pero obliga a inventar un mini-lenguaje de interpolación y **no cubre pluralización**, que es justamente lo que un consumidor en otro idioma necesita. El kit terminaría con un formato propio a medio camino de ICU.
2. **Fragmentos componibles, como `DsPagination`** (`morePrefix` + count + `moreSuffix`) — descartada. Funciona para "Página 3 de 10", donde los fragmentos son fijos y el número va al medio, pero asume un orden de palabras. En idiomas donde el número va al final o la palabra cambia según cantidad, los fragmentos no alcanzan.
3. **Dejarlo en español y documentarlo como limitación conocida** — descartada. Es la superficie de accesibilidad, no un detalle cosmético: un usuario de lector de pantalla en una app en inglés escucharía "y 3 más" en medio de una interfaz traducida.

# Impact

- **Código**: `packages/components/src/lib/avatar/{avatar-group.ts, avatar.spec.ts}`, un changeset.
- **Consumidores**: ninguno rompe — el default es exactamente el texto actual. Quien no toque nada no nota diferencia.
- **Bundle**: crecimiento marginal (un input que reemplaza a un computed). El techo quedó con 1.06 kB de margen bajo el tope de D-032; se mide al cerrar.
- **ADR**: no genera.
- **Gate visual del PO (D-022)**: aplica, pero sin cambio visual esperado — el "+N" se ve igual; lo que cambia es lo que anuncia un lector de pantalla si el consumidor lo traduce.
