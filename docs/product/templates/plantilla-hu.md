---
epica: EP-XXX
actor: Dev consumidor | Diseñador | Mantenedor
estado: 'Identificada | Bloqueada (motivo) | Refinada (YYYY-MM-DD) | En desarrollo (change <nombre>) | Hecha (YYYY-MM-DD, aaa-NNN; genera ADR-XXX/D-XXX si aplica)'
decisiones: [D-XXX, D-YYY]
adrs: [ADR-XXX]
---

<!-- Copiar a docs/product/epics/EP-XXX-nombre-corto/HU-XXX-nombre-corto.md
     (la misma carpeta que el documento EP-XXX-nombre-corto.md de su épica) y completar.
     Agregar la fila correspondiente a la tabla de la épica.

     Metadata (ver docs/product/README.md § Metadata en frontmatter):
     - Toda la metadata vive en el frontmatter de arriba, con IDs pelados (sin links).
     - `estado` admite un paréntesis corto con fecha/change/artefactos generados.
     - `decisiones` = D-XXX de producto que gobiernan la HU; `adrs` = ADRs técnicos
       directamente aplicables (omitir la clave si no hay).
     - En el cuerpo, las referencias siguen siendo links markdown (estilo del repo). -->

# HU-XXX — Título corto (actor)

**COMO** actor en cierta condición
**QUIERO** capacidad concreta
**PARA** el beneficio que la justifica.

## Decisiones de refinamiento

<!-- Solo al refinar (borrar si la HU sigue Identificada). Ambigüedades resueltas con el PO
     en el refinamiento que NO ameritan D-XXX propia (si la decisión es de producto/negocio
     y trasciende esta HU → va a decisiones.md y acá solo se enlaza). Numerar y fechar. -->

1. **Tema** — qué se decidió y por qué (PO, YYYY-MM-DD).

## Criterios de aceptación

<!-- Binarios: se responden con sí/no sin interpretación. Uno por comportamiento.
     El título corto entre paréntesis hace la lista escaneable; el ID CA-XXX.Y es lo
     referenciable (se vuelve scenario de spec al implementar). Incluir siempre al menos
     un caso de error/validación. -->

- [ ] **CA-XXX.1 (título corto)** — Dado que …, cuando …, entonces …
- [ ] **CA-XXX.2 (caso de error)** — Dado que …, cuando falla …, entonces …

## Dependencias

- [HU-YYY](HU-YYY-nombre-corto.md): por qué depende.
- Decisiones o definiciones externas pendientes, si las hay (→ estado Bloqueada).

## Fuera de alcance

- Todo lo que alguien podría suponer incluido y no lo está. Los candidatos a futuro, decirlo.

## Notas

- Contexto de implementación, riesgos, aclaraciones que no son CAs.
