# ADRs — Architecture Decision Records

Decisiones arquitectónicas inmutables del repo en formato MADR.

## Cuándo crear un ADR

**Obligatorio:**

- Toda decisión **one-way door** (irreversible o muy costosa de revertir).
- Toda decisión que afecta **≥2 packages** o el monorepo entero.
- Toda decisión que cambia o reemplaza un ADR previo.

**No crear ADR para:**

- Decisiones de implementación local (nombres de variables, estructura interna de un módulo).
- Elecciones triviales y reversibles sin impacto en otros componentes.

## Naming

`ADR-NNN-<slug-en-kebab-case>.md`

Ej.: `ADR-001-monorepo-pnpm-workspaces.md`, `ADR-002-conventional-commits-changesets.md`.

Los IDs son **permanentes**. Si un ADR es reemplazado, su ID queda en el archivo original (marcado como "Reemplazado por ADR-NNN") y el nuevo toma el siguiente ID disponible.

## Formato MADR

Cada ADR contiene los siguientes campos obligatorios:

```markdown
# ADR-NNN — <Título descriptivo>

- **Fecha**: YYYY-MM-DD
- **Estado**: Propuesto | Aceptado | Reemplazado por ADR-NNN | Descartado
- **Dominio**: frontend | tokens | components | build | ci | transversal
- **ADRs relacionados**: (opcional)

## Contexto

<Por qué surge esta decisión, qué problema resuelve, qué restricciones aplican.>

## Opciones consideradas

### Opción A — <nombre>

- Pros: …
- Contras: …

### Opción B — <nombre>

- Pros: …
- Contras: …

(≥2 opciones siempre. Una opción siempre debe ser "no hacer nada" o "status quo" si es realista.)

## Decisión

<Opción elegida + criterio explícito de selección. Justificar contra las prioridades del repo: buenas prácticas / escalabilidad / mantenibilidad.>

## Consecuencias

### Positivas

- …

### Negativas / trade-offs aceptados

- …

### Acciones de seguimiento (opcional)

- …
```

## Inmutabilidad

Los ADRs son **inmutables una vez aceptados**. Para cambiar una decisión:

1. Crear un nuevo ADR con el siguiente ID disponible.
2. En el nuevo ADR, referenciar el reemplazado en "ADRs relacionados".
3. Actualizar el ADR original: cambiar estado a `Reemplazado por ADR-NNN`.
4. **Nunca borrar ni editar el contenido** de un ADR aceptado.

## Diagramas

Embebidos como **Mermaid** dentro del ADR. Sin imágenes binarias salvo justificación explícita.

Tipos permitidos: `flowchart`, `sequenceDiagram`, `erDiagram`, `C4Context`, `C4Container`, `gitGraph`.

Si Mermaid no alcanza, los diagramas exportados van en [`../diagrams/`](../diagrams/).
