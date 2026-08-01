# docs/architecture — guía del directorio

Fuente de verdad arquitectónica del repo. Este README describe **qué vive acá y cómo se mantiene**; el contenido en sí está en los artefactos.

> **¿Buscás la arquitectura?** → [**ARCHITECTURE.md**](ARCHITECTURE.md) — la síntesis técnica completa (visión, stack, principios, arquitectura por package, pipeline).

## Artefactos

Cada archivo responde **una** pregunta. No mezclarlos:

| Artefacto                            | Qué pregunta responde                                   | Naturaleza                                                        |
| ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)   | ¿Cómo es la arquitectura del repo y por qué esta forma? | Síntesis agregada, estable; linkea a ADRs y specs para el detalle |
| [catalog.md](catalog.md)             | ¿Qué specs y changes existen? (inventario histórico)    | Índice; crece una fila por change archivado                       |
| [decisions-log.md](decisions-log.md) | ¿Qué se decidió, cuándo y con qué ADR?                  | Índice cronológico de decisiones (con o sin ADR)                  |
| [adr/](adr/)                         | ¿Por qué se decidió X? (opciones evaluadas)             | ADRs en formato MADR, inmutables                                  |

## Reglas del directorio

- **Los ADRs son inmutables** una vez aceptados. Para revertir una decisión, se crea un ADR nuevo que referencia al anterior — nunca se edita el original. Formato y criterios de obligatoriedad: [adr/README.md](adr/README.md).
- **Toda decisión arquitectónica agrega una fila** a [decisions-log.md](decisions-log.md), tenga ADR o no.
- **Al archivar un change de OpenSpec** se agrega su fila al [catálogo de changes](catalog.md#catálogo-de-changes) (y al de specs, si introdujo alguna). Es un paso del [checklist de archive](../product/README.md#checklist-de-archive).
- **ARCHITECTURE.md no duplica specs ni índices**: da contexto (diagramas, principios, mapa) y linkea. Las reglas testables viven en `openspec/specs/`; los inventarios, en `catalog.md` y `decisions-log.md`.
- **Los links markdown relativos sí se usan acá** — estos archivos no se mueven, a diferencia de los artefactos de change (ver [openspec/README.md](../../openspec/README.md)).

## Material de referencia (no normativo)

[`docs/reference/`](../reference/) contiene material de investigación traído de otros repos (taxonomías de arquitectura, arquitectura frontend, design systems industry). **No es normativo**: la fuente de verdad son los ADRs y specs.
