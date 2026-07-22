---
estado: 'Identificada | En refinamiento | Refinada | En desarrollo (detalle corto) | Hecha'
actor: Dev consumidor | Diseñador | Mantenedor
---

<!-- Copiar a docs/product/epics/EP-XXX-nombre-corto/EP-XXX-nombre-corto.md
     (documento homónimo a la carpeta) y completar.
     Las HUs de la épica viven en esa misma carpeta.
     Agregar la fila correspondiente al índice de docs/product/README.md.

     Metadata (ver docs/product/README.md § Metadata en frontmatter):
     - Toda la metadata vive en el frontmatter de arriba, con IDs pelados (sin links).
     - `estado` admite un paréntesis corto con el detalle (tandas, fechas, disparadores);
       el detalle largo va al cuerpo (Contexto o tabla de HUs), no al frontmatter.
     - `actor` — actor(es) principal(es); si son varios, separar con `·`.
     - En el cuerpo, las referencias siguen siendo links markdown (estilo del repo). -->

# EP-XXX — Título de la épica

## Contexto

> Resumir el requerimiento en una o dos líneas: qué problema resuelve y para qué actores.

## Alcance

Qué problema resuelve, para qué actores, y qué queda explícitamente afuera de la épica.

## Historias de usuario

| HU                               | Título | Actor | Estado       |
| -------------------------------- | ------ | ----- | ------------ |
| [HU-XXX](HU-XXX-nombre-corto.md) | …      | …     | Identificada |

## Decisiones aplicables

Enlazar los D-XXX de [decisiones.md](../../decisiones.md) que gobiernan esta épica. No copiar el texto de la decisión.

## Preguntas abiertas

Numeradas. Indicar qué HU bloquea cada una. Cuando se resuelven, se convierten en D-XXX y se borran de acá.

## Orden sugerido de implementación

Secuencia de HUs y el racional (dependencias, riesgo). **Omitir esta sección si la épica tiene una sola HU.**
