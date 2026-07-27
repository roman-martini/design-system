---
epica: EP-006
actor: Dev consumidor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-024]
adrs: [ADR-003]
---

# HU-036 — Documentación de tokens en Storybook (dev consumidor)

**COMO** dev que instala `@romanmartinidev/tokens` y necesita elegir un token
**QUIERO** ver los foundations del sistema —color, espaciado, tipografía, sombra y movimiento— renderizados en Storybook junto a los componentes
**PARA** elegir el token correcto viéndolo, sin leer JSON ni CSS ni adivinar qué componente lo usa.

## Decisiones de refinamiento

1. **Cinco páginas de foundations** (2026-07-26): Colors, Spacing, Typography, Shadow y Motion. Cubren las categorías que hoy solo se pueden inspeccionar leyendo la fuente.
2. **Generadas desde el output de Style Dictionary, no escritas a mano** — es el punto central de la HU. Una página con valores tipeados a mano deriva de la fuente en el primer cambio de token y pasa a mentir; el DS no puede documentar su propio contrato con una copia manual ([D-017](../../decisiones.md) regla 1: nada a medias que rompa después). Style Dictionary ya es la fuente de verdad del pipeline ([ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md)).
3. **Se documentan los tres niveles con su jerarquía visible** (primitives / semantic / component): la relación entre niveles es parte de lo que hay que enseñar, no ruido.
4. **La página muestra el nombre de la custom property `--ds-*`, no el path de la fuente** — el contrato público del consumidor es el CSS, no el JSON interno.

## Criterios de aceptación

- [ ] **CA-036.1 (páginas de foundations)** — Dado Storybook levantado, entonces existe una sección de foundations con las páginas Colors, Spacing, Typography, Shadow y Motion, navegables junto a los componentes.
- [ ] **CA-036.2 (generadas desde el output)** — Dada cualquier página de foundations, entonces cada token listado y su valor provienen del artefacto de build de `@romanmartinidev/tokens`; **ningún nombre ni valor de token está escrito literalmente en el código de la página**.
- [ ] **CA-036.3 (no derivan de la fuente)** — Dado que se agrega, renombra o elimina un token en `packages/tokens` y se rebuildea, cuando se abre la página de su categoría, entonces el cambio se refleja **sin editar la página**.
- [ ] **CA-036.4 (validación: tokens sin construir)** — Dado que el artefacto de build de tokens no existe o está desactualizado, cuando se levanta o buildea Storybook, entonces falla de forma explícita indicando que hay que construir los tokens — nunca muestra datos vacíos, parciales o viejos como si fueran correctos.
- [ ] **CA-036.5 (identificación consumible)** — Dado un token en cualquier página, entonces se muestra su custom property `--ds-*`, su valor resuelto y su nivel de jerarquía (primitive / semantic / component).
- [ ] **CA-036.6 (themes y modos)** — Dado que se cambia el theme o el modo claro/oscuro desde el toolbar de Storybook, entonces las páginas de foundations re-renderizan con los valores de ese theme (los semantic y component cambian; los primitives no).
- [ ] **CA-036.7 (build verde)** — Dado el build de producción de Storybook, entonces incluye las cinco páginas y queda verde en CI.

## Dependencias

- `packages/tokens` construido antes de levantar o buildear Storybook (relación de build a explicitar en los scripts — la hace visible CA-036.4).
- [D-024](../../decisiones.md): la migración a formato DTCG y la normalización de la taxonomía de namespaces **renombran buena parte del contrato público**. Conviene ejecutar esta HU **después** de esa normalización, o asumir que las páginas se regeneran solas (que es justamente lo que CA-036.3 garantiza).

## Fuera de alcance

- Editor interactivo de tokens o theme builder: no es documentación, es otra capacidad con su propio disparador.
- Cálculo y visualización de ratios de contraste por par de color: eso lo cubre el gate de contraste AA de EP-005, no esta página.
- Documentación MDX de los componentes (props, guías de uso): otra HU si aparece.
- Publicación de Storybook en GitHub Pages: HU aparte del mismo bloque ([D-021](../../decisiones.md)).
- La vista de iconografía del showcase, que ya existe y no se toca.

## Notas

- Origen: hallazgo **playground-07** de la [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md) (severidad media): cero archivos `.mdx` en el repo y el glob de stories restringido a `packages/components/src/lib`, de modo que los tokens —un package publicado— no tienen ninguna representación visual.
- Se ejecuta en la **Parte L** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md) ("Storybook avanzado y docs públicas"), vía change OpenSpec.
- El glob de stories de `.storybook/main.ts` hoy solo mira `packages/components`; habilitar estas páginas implica ampliarlo, decisión de implementación del change.
- Todo DS profesional documenta sus foundations junto a los componentes (Carbon, Polaris, Material); sin esto, validar visualmente un cambio de token obliga a adivinar qué componentes lo consumen.
