---
estado: En refinamiento (creada 2026-07-26 por D-020; HU-037 Refinada, HU-038…HU-040 candidatas sin archivo)
actor: Dev consumidor · Mantenedor
---

# EP-007 — template-lume

## Contexto

> El PO construye un template/sitio propio ("template-lume") que consume el design system. La referencia visual que lo gobierna es la misma que ya ordena la tanda 3 del kit. Esta épica trae esa iniciativa a producto.

El PO trabaja en **template-lume**: un template/sitio que se construye consumiendo `@romanmartinidev/tokens` y `@romanmartinidev/components`. Su lenguaje visual es la referencia **modern-minimal** — un set de 5 capturas de una UI minimalista estudiado por el PO — que ya gobierna la **tanda 3 del kit** ([D-014](../../decisiones.md), que la nombra con la errata "moder-minimal"; el nombre correcto, fijado por [D-020](../../decisiones.md), es `modern-minimal`).

Hasta ahora esta iniciativa vivía únicamente en `TASK.md`, el archivo personal gitignored del PO. [D-019](../../decisiones.md) formalizó ese archivo como **inbox de borrador** y prohibió que artefactos versionados dependan de él: una iniciativa de tamaño épica —con un rename de un theme ya publicado en npm adentro— no puede tener su única fuente de verdad ahí. La review integral del 2026-07-26 lo levantó como hallazgo `backlog-03` (severidad alta) y [D-020](../../decisiones.md) aprobó la creación de esta épica.

## Alcance

**Qué entra**: todo lo que el design system necesita para que template-lume se construya sin salirse del kit — el nombre del theme que representa el lenguaje visual, el análisis del sitio de referencia, el inventario de componentes faltantes y la vista del template dentro del playground.

**Actor**: **Dev consumidor** como actor principal. Según la [tabla de actores](../../README.md) del espacio de producto, el dev consumidor es "quien instala las libs en una app Angular (hoy: Roman en sus proyectos)" — y eso es exactamente template-lume: el primer consumo real y completo del DS, la app que somete al kit a un requerimiento entero en vez de a demos aisladas. **Mantenedor** como actor secundario: cada hueco que el template descubre es feedback que el DS incorpora, y el rename del theme es trabajo de mantenimiento de la superficie pública.

**Qué queda afuera**:

- El **contenido, copy y negocio** de template-lume: esta épica cubre lo que el DS debe proveer, no el producto del PO.
- El **repo del template en sí**: si template-lume vive fuera de este monorepo, su código no es de esta épica.
- Los **componentes del kit**: siguen siendo de [EP-002](../EP-002-kit-componentes/EP-002-kit-componentes.md). Acá se identifica qué falta; la HU que agrega un componente nace en EP-002.
- La **evolución general del playground** (navegación, showcase, theming switcher): [EP-006](../EP-006-playground/EP-006-playground.md).
- Los **tokens base y su theming estructural**: [EP-001](../EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md). Acá solo entra el nombre del theme.

## Historias de usuario

| HU                                              | Título                                                         | Actor          | Estado                |
| ----------------------------------------------- | -------------------------------------------------------------- | -------------- | --------------------- |
| [HU-037](HU-037-rename-theme-modern-minimal.md) | Rename del theme brand-a a modern-minimal                      | Dev consumidor | Refinada (2026-07-26) |
| HU-038 (sin archivo)                            | Research del sitio de referencia modern-minimal                | Mantenedor     | Identificada          |
| HU-039 (sin archivo)                            | Inventario de componentes faltantes para construir el template | Mantenedor     | Identificada          |
| HU-040 (sin archivo)                            | Web-page del template en el playground                         | Dev consumidor | Identificada          |

**HU-038…HU-040 no tienen archivo propio todavía**: son candidatas listadas acá según la regla del [README de producto](../../README.md) § Flujo de trabajo ("las HUs candidatas sin refinar pueden listarse en el documento de la épica sin archivo propio"). Cada una recibe su archivo al entrar en refinamiento; el ID ya está reservado y no cambia. Notas de alcance de cada candidata:

- **HU-038** — analizar el sitio de referencia con la skill [`/ds:research-design-system`](../../../../.claude/skills/research-design-system/SKILL.md), que produce un reporte de adopción razonado (qué se adopta, qué se adapta, qué se descarta) en vez de una copia. Alimenta a HU-039 y al contenido del theme `modern-minimal`.
- **HU-039** — contrastar lo que el template necesita contra el kit actual y listar los huecos. El resultado son HUs nuevas **en EP-002**, no acá.
- **HU-040** — la vista del template dentro de `apps/playground`, como consumo real del kit. Ver la relación con D-023 más abajo.

## Decisiones aplicables

- [D-020](../../decisiones.md) — crea esta épica y decide el rename `brand-a` → `modern-minimal` con alias deprecado (gobierna HU-037).
- [D-014](../../decisiones.md) — declara la referencia visual como criterio de la tanda 3 del kit; es el origen del lenguaje visual de esta épica.
- [D-019](../../decisiones.md) — prohíbe que el trabajo real viva en `TASK.md`; es el motivo por el que esta épica existe como artefacto versionado.
- [D-023](../../decisiones.md) — fija cómo se verifica el hito H1 (ver abajo).
- [D-015](../../decisiones.md) — sin HUs en silencio: cada candidata entra con disparador o aprobación explícita del PO.
- [D-010](../../decisiones.md) — tokens y components publicados en npm `0.2.0`: la razón por la que el rename necesita alias en vez de ser un corte seco.

## Relación con otras épicas

| Épica                                                                        | Relación                                                                                                                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [EP-001](../EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md) — tokens | HU-037 toca la superficie pública del package de tokens (entry point y selector del theme). El mecanismo de theming en sí no cambia.                 |
| [EP-002](../EP-002-kit-componentes/EP-002-kit-componentes.md) — kit          | Bidireccional: la tanda 3 nace de la misma referencia visual; el inventario de HU-039 devuelve HUs nuevas a EP-002. Ningún componente se define acá. |
| [EP-006](../EP-006-playground/EP-006-playground.md) — playground             | HU-040 agrega una vista al playground. La evolución de la app como vitrina (navegación, showcase) sigue siendo de EP-006.                            |

### Relación con D-023 y el hito H1

[D-023](../../decisiones.md) resolvió que el **hito H1** ("una app real se construye 100% con componentes del DS") **se verifica construyendo un prototipo de la referencia `modern-minimal` en el playground al cerrar HU-025 (Slider)** — no por checklist de componentes entregados. Ese prototipo y la HU-040 de esta épica **apuntan al mismo artefacto**: la vista del template dentro de `apps/playground`.

Para no duplicar trabajo, la regla es:

1. El prototipo de D-023 se construye cuando cierra [HU-025](../EP-002-kit-componentes/HU-025-slider.md) y **es la primera entrega de HU-040**, no un artefacto paralelo. Su objetivo ahí es acotado: probar que el kit cubre la referencia de punta a punta.
2. Lo que HU-040 agrega después es la evolución de esa vista hacia el template real (contenido propio, más pantallas, uso del theme `modern-minimal` renombrado por HU-037).
3. Si el prototipo de D-023 descubre huecos del kit, esos huecos son la entrada de HU-039 y salen como HUs de EP-002.

Consecuencia práctica: **HU-040 no se refina antes de que cierre HU-025**, porque hasta entonces su alcance está definido por D-023 y no por esta épica.

## Preguntas abiertas

1. ¿Template-lume vive dentro de este monorepo o en un repo aparte? Determina si HU-040 es la entrega final o solo el prototipo de validación. **Bloquea a HU-040** (no a HU-037).
2. ¿El theme `modern-minimal` debe además ajustar su paleta para acercarse a la referencia, o el rename es solo de nombre? HU-037 asume **solo el nombre**; el ajuste de valores sería una HU aparte, alimentada por HU-038. **Bloquea a HU-038** en su alcance final.
3. ¿Qué pasa con `brand-b` una vez que `brand-a` deja de ser una etiqueta opaca? Queda con nomenclatura inconsistente. No bloquea nada hoy.

## Orden sugerido de implementación

1. **HU-037** (rename del theme) primero: es la única con decisión tomada y es independiente del resto — no espera research ni prototipo, y fija el nombre que todo lo demás usa.
2. **HU-038** (research) después: produce el insumo que el resto necesita, y su resultado puede cambiar el alcance de HU-039 y HU-040.
3. **HU-039** (inventario) una vez cerrada la tanda 3 de EP-002: hacerlo antes mide contra un kit incompleto y genera ruido.
4. **HU-040** (web-page) al final, y no antes de que cierre HU-025 — arranca como el prototipo de verificación de H1 (D-023) y crece desde ahí.
