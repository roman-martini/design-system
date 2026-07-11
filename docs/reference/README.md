# docs/reference — Material de referencia (no normativo)

Material de investigación y consulta traído de otros repos donde se exploraron arquitecturas. **No es normativo**: las decisiones del repo viven en [`docs/architecture/`](../architecture/) (ADRs + decisiones de arquitectura del repo actual) y los contratos en [`openspec/specs/`](../../openspec/specs/) (testables).

Este directorio sirve como **base de conocimiento histórica e inspiracional**:

- Para entender patrones generales de arquitectura cuando aparece una decisión nueva.
- Para reusar definiciones, ejemplos o comparaciones en futuros ADRs.
- Para consultar al pensar en proyectos futuros con stacks distintos.

## Contenido

| Archivo / carpeta | Tema |
|-------------------|------|
| [`taxonomias_arq_software.md`](taxonomias_arq_software.md) | Taxonomía general de arquitecturas de software (sistema, aplicación, frontend, backend, datos, infra, seguridad). Mapa de referencia. |
| [`arquitectura_frontend/`](arquitectura_frontend/) | Material específico sobre arquitectura frontend: estilos CSS architecture, design systems, comparativa industria. |

## Convención

- **No editar para reflejar el repo actual** — este material captura conocimiento de otros contextos. Si una idea acá necesita aplicarse al repo, se trabaja como ADR/spec en [`docs/architecture/`](../architecture/) o [`openspec/`](../../openspec/) con el contexto correcto.
- **Sumar material nuevo de referencia es OK**, mientras quede claro que es referencia (no contrato del repo actual).
- Para evitar drift: si una decisión del repo coincide con un patrón documentado acá, el ADR del repo SHALL referenciar este material como inspiración (ej. "Adopta `<patrón>` documentado en [reference/taxonomias_arq_software.md § X](taxonomias_arq_software.md)").

## Ver también

- [`docs/architecture/README.md`](../architecture/README.md) — síntesis arquitectónica del repo actual (fuente de verdad).
- [`docs/architecture/PLAYBOOK.md`](../architecture/PLAYBOOK.md) — cómo replicar esta arquitectura en otro repo.
- [`docs/backlog/FUTURE-WORK.md`](../backlog/FUTURE-WORK.md) — backlog del DS (componentes y tokens futuros).
