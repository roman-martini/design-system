# Design — repo-release-lockstep

Las decisiones técnicas de este change viven en [ADR-015](../../../docs/architecture/adr/ADR-015-versionado-lockstep.md) (opciones evaluadas, trade-offs y la mecánica `fixed` + `workspace:^`). Este design no duplica ese contenido.

Única nota operativa: el change **no publica**. Deja el repo listo (config + peer + specs + registros); la ejecución del release sigue el pipeline de aaa-005 y requiere pasos del PO fuera del repo (crear el repo GitHub, configurar `NPM_TOKEN`, push) — documentados en tasks.md §3 como checklist, con la verificación post-publicación (CA-002.2/002.3 de HU-002) como cierre.
