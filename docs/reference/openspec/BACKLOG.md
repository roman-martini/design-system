# Backlog — angular-ui-kit

Lista de cambios pendientes (componentes, features, mejoras, refactors).
Cada ítem indica si va por **OpenSpec** (cambios al kit: `@avain/ngx-ui` o
`@avain/ngx-theming`) o por **commit directo** (prototype, demo-app, tooling)
— siguiendo la regla del [CLAUDE.md](../CLAUDE.md): _"OpenSpec aplica a
cambios del kit. Cambios al prototype o demo-app van por commit directo
sin spec."_

Cuando un ítem se activa, los OpenSpec arrancan con
`/opsx:propose <prefijo>-<NNN>-<slug>` siguiendo la convención de
[openspec/README.md](README.md). Próximo ID disponible: **`aaa-025`**.

Los ítems ya implementados viven en [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

---

## Prototype / demo-app — vía commit directo

### Routing por dashboard en `prototype-metricas-a`

**Tipo**: commit directo. Prototype/demo-app — sin OpenSpec.

**Origen**: hoy `prototype-metricas-a` cambia de dashboard via state interno
(`selectedApiId` signal) + `@switch`. Consecuencias:

- Refresh pierde el dashboard activo.
- No se puede compartir URL del dashboard.
- El consumer (.NET en la integración real) no puede deep-linkear.

**Alcance propuesto**:

- Cada dashboard tiene su propia ruta: `/prototype-metricas-a/interfaces`,
  `/prototype-metricas-a/teleconsultas`, `/prototype-metricas-a/qr-examenes`.
- `prototype-metricas-a.page.ts` se vuelve un shell con `<router-outlet>`
  en lugar de `@switch`.
- El sidebar usa `routerLink` en vez de actualizar el signal interno.
- Refresh preserva el dashboard. URL compartible.

**Decisiones pendientes**:

- ¿La ruta raíz (`/prototype-metricas-a`) redirige al primer dashboard o
  renderiza un landing de descripción del prototype?
- ¿Lazy load por dashboard o todo eager? (3 dashboards livianos →
  probablemente eager).
- ¿Se mantiene el tipo `ApiIconName` como union, o se reemplaza por
  metadata derivada de la config de rutas?

**Estado**: pendiente — directo, sin spec. Edits + commit cuando se active.

---

### Sacar `ngx-section-title` de adentro de las cards en `prototype-metricas-a`

**Tipo**: commit directo. El componente `ngx-section-title` del kit no
cambia; solo cambia cómo lo usa el prototype.

**Origen**: hoy varios dashboards meten `<ngx-section-title>` adentro de
cards. Visualmente queda atrapado en la caja y pierde su rol de header
de sección de la página.

**Alcance propuesto**: en cada dashboard de
`prototype-metricas-a/dashboards/` mover los `<ngx-section-title>` afuera
de las cards al header de la sección correspondiente.

**Decisiones pendientes**:

- ¿Va junto con el routing o como commit separado? (Recomendado:
  **separado** — uno es estructural, otro visual; no mezclar para que el
  diff sea legible).
- ¿Hay que ajustar el spacing entre el title nuevo y la card siguiente?

**Estado**: pendiente — directo, sin spec.

---

### QR Exámenes V2 — desplegable `Consultados | Generados`

**Tipo**: commit directo. Prototype, dashboard de QR Exámenes.

**Origen**: el filtro actual del dashboard QR Exámenes no permite
distinguir entre exámenes consultados y generados.

**Alcance propuesto**: agregar un filtro tipo `select` al filter-bar del
dashboard QR Exámenes con opciones `Consultados | Generados`. Filtrar la
data mock según selección.

**Estado**: pendiente — directo, sin spec.

---

### Consolidar documentación de arquitectura del kit — `STYLING.md` está deprecado

**Tipo**: commit directo (docs / repo housekeeping). No toca el kit ni el prototype.

**Origen**: `projects/STYLING.md` quedó desactualizado respecto al estado
actual del kit (capas de tokens, naming, patrones de componentes). Hoy la
"fuente de verdad" sobre arquitectura del kit está dispersa entre
`CLAUDE.md`, `project.md`, `projects/STYLING.md`, `openspec/README.md`,
`openspec/specs/<capability>/spec.md` y varios archivos en
`.claude/knowledge/`. Eso causa drift: la misma decisión vive en 3 lugares
con redacciones distintas y solo uno está al día.

**Alcance propuesto**:

1. **Inventariar** todos los archivos de docs del repo que hablen de
   arquitectura del kit, tokens, patrones de componentes o convenciones
   del proyecto. Candidatos conocidos:
   - `CLAUDE.md`
   - `project.md`
   - `projects/STYLING.md`
   - `openspec/README.md`
   - `openspec/specs/*/spec.md` (uno por capability)
   - `.claude/knowledge/component-patterns.md`
   - `.claude/knowledge/token-system.md`
   - `.claude/blueprints/angular-ui-kit.md`
   - `docs/references/*`
2. **Mapear solapamientos**: tabla con qué tema cubre cada archivo y
   dónde hay duplicación, contradicción o info desactualizada.
3. **Definir la fuente de verdad** por tema (ver decisiones pendientes).
4. **Migrar** el contenido vigente al destino elegido, dejando los
   archivos deprecados como stubs con redirect (`Ver: <ruta>`) durante
   1-2 changes para no romper referencias.
5. **Borrar** los stubs después de validar que ninguna referencia viva
   sigue apuntando ahí.

**Cuidado — NO TOCAR (vienen del blueprint upstream, se sobreescriben en
`as-blueprint-sync`)**:

- `.claude/skills/*`
- `.claude/agents/*`
- `.claude/knowledge/*` (estos también vienen del blueprint — verificar
  antes de modificar)
- `.claude/blueprints/angular-ui-kit.md`

**Cuidado — NO TOCAR (fuente de verdad de OpenSpec)**:

- `openspec/specs/<capability>/spec.md` (son la salida consolidada de
  los changes archivados)
- `openspec/changes/archive/*` (historia inmutable)

**Decisiones pendientes**:

- **¿Cuál es el archivo destino consolidado?**
  - Opción A: ampliar `CLAUDE.md` para que sea la única fuente de
    arquitectura (riesgo: crece demasiado y se vuelve ilegible).
  - Opción B: usar `project.md` como hub central y dejar `CLAUDE.md`
    como instrucciones cortas para Claude que apuntan a `project.md`.
  - Opción C: crear `docs/architecture.md` nuevo, con secciones para
    cada tema (tokens, patrones, naming, build, publish).
- **¿Qué se hace con `projects/STYLING.md`?** ¿Se borra, se deja como
  stub con redirect, o se mantiene como guía de implementación visual
  (separada de arquitectura)?
- **¿Los knowledge files de `.claude/knowledge/`** que vienen del
  blueprint upstream entran al scope (lectura para identificar drift)
  o quedan totalmente fuera?

  RESPUESTA: los `.claude/knowledge/` son para los agentes, pero sería necesario que si la arquitectura cambia los agentes lean la fuente de la verdad. Asi que debemos pensar una mejor practica para eso. Que el agente apunte a la fuente de la verdad o que knowledge apunte a la fuente de la verdad.

- **¿En qué momento se ejecuta?** Antes de cualquier change nuevo del
  kit (para que arranquen contra docs al día) o como cierre del próximo
  hito (`aaa-NNN` finales).

**Estado**: en pausa — el inventario inicial mostró que es más complejo de
lo previsto. Insight relevante para retomar: `project.md` mezcla
**arquitectura del kit** (decisiones técnicas, tokens, build) con **catálogo
de componentes** (lista de 16 componentes con su API). Son dos
responsabilidades distintas que probablemente deban vivir separadas (ej.:
`project.md` o `architecture.md` para lo primero; un `COMPONENTS.md` /
`components.md` para el catálogo). Retomar con tiempo.

---

## Orden sugerido cuando arrancamos

1. **Docs consolidation** — empezar por inventario para tener un mapa
   antes de tocar nada. El resto del backlog se beneficia de tener docs
   al día.
2. **Routing por dashboard** — estructural, sienta base para refresh y
   deep-link.
3. **`ngx-section-title` fuera de cards** — visual, después del routing
   para no chocar diffs.
4. **QR Exámenes V2** — feature chica del prototype, en cualquier orden.

---

## Plantilla para nuevos ítems

```markdown
### `<nombre>` — <título corto>

**Tipo**: OpenSpec (kit) | commit directo (prototype)

**Origen**: <por qué surge>

**Alcance propuesto**:

- <pasos>

**Decisiones pendientes**:

- <preguntas a cerrar>

**Estado**: pendiente | en exploración | propuesta activa (link al `<prefijo>-NNN-slug`)
```
