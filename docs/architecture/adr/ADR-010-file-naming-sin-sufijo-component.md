# ADR-010 — Convención de file naming sin sufijo `.component`

- **Fecha**: 2026-07-03
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-007](ADR-007-naming-prefijos.md) (resuelve su open question y evoluciona su fila "Folder y file naming"), [ADR-004](ADR-004-arquitectura-components.md)

## Contexto

ADR-007 unificó los identificadores del DS (`DsButton`, `ds-button`, `--ds-*`, sin sufijo `Component` en la clase) pero **postergó deliberadamente** el file naming: los archivos siguieron `<name>.component.{ts,html,css,spec.ts}`, con la open question explícita _"¿Migrar también el folder/file naming a la convención Angular 21 moderna (`button.ts` sin `.component`)? Postergado. Si aparece motivación, va en CHG separado."_

La motivación apareció por tres vías:

1. El **style-guide moderno de Angular (v20+)** recomienda nombres de archivo sin sufijo de rol (`radio.ts`, no `radio.component.ts`); el repo corre Angular 21.
2. El grupo de agentes `ng-*` adoptó esa convención moderna como estándar en `.claude/knowledge/ng-best-practices.md`, forzando a declarar la divergencia del repo como **excepción por consistencia** en `ng-stack-profile.md` — deuda viva que cada componente nuevo perpetuaba.
3. El propio playground ya usaba el naming moderno (`app.ts`, generado por `ng new` de Angular 21), evidenciando la inconsistencia interna.

Ventana óptima: 4 componentes (16 archivos), package en `0.x`, sin consumidores externos (el único consumidor, `apps/playground`, importa vía barrel). El costo del rename crecía con cada componente nuevo.

La decisión es de **convención transversal del package** (afecta a todos los componentes presentes y futuros y al perfil de los agentes generadores) → ADR. La ejecución fue el change [`aaa-010 components-drop-component-suffix`](../../../openspec/changes/archive/aaa-010-components-drop-component-suffix/) (rename mecánico, reversible, sin cambio de comportamiento).

## Opciones consideradas

### Opción A — Mantener `.component.ts` (status quo)

- **Pros**: cero churn; consistencia con los 4 componentes existentes tal como estaban.
- **Contras**: perpetúa la divergencia con el style-guide oficial vigente; el `ng-stack-profile.md` arrastra la excepción para siempre; cada componente nuevo agranda el costo de una migración futura; inconsistencia interna con el playground (ya moderno).

### Opción B — Migrar a `<name>.ts` sin sufijo (elegida)

- **Pros**: alinea con el style-guide Angular v20+; cierra la open question de ADR-007; elimina la excepción del perfil `ng-*`; ventana óptima (4 componentes, sin consumidores externos); refactor mecánico cubierto por la suite existente.
- **Contras**: rename de 16 archivos + ajuste de imports/URLs + sync de specs y docs. Mitigado: cambio mecánico validado con `build` + `test` + `npm pack` sin diferencias de comportamiento.

### Opción C — Migrar archivos + reorganizar carpetas en el mismo paso

- **Pros**: "un solo refactor grande".
- **Contras**: ADR-004 §2 fijó arquitectura flat; mezclar reorganización con rename acopla decisiones independientes (el mismo argumento con el que ADR-007 postergó este cambio). Descartada.

## Decisión

Se adopta la **Opción B**. La convención de file naming del package `@romanmartinidev/components` queda:

| Pieza          | Convención                       | Ejemplo             |
| -------------- | -------------------------------- | ------------------- |
| Carpeta        | kebab-case                       | `button/`           |
| Entry point    | `<name>.ts` (sin sufijo de rol)  | `button.ts`         |
| Template       | `<name>.html`                    | `button.html`       |
| Estilos        | `<name>.css`                     | `button.css`        |
| Tests          | `<name>.spec.ts`                 | `button.spec.ts`    |
| Stories        | `<name>.stories.ts` (sin cambio) | `button.stories.ts` |
| Barrel interno | `index.ts` (sin cambio)          | `index.ts`          |

Esta tabla **evoluciona la fila "Folder y file naming" de ADR-007** (que decía "sin cambios, el archivo sigue `<name>.component.ts`"). El resto de ADR-007 (identificadores `Ds`/`ds-`/`--ds-*`) permanece intacto.

Los criterios de selección, contra las prioridades del repo: (1) **buenas prácticas** — seguir el style-guide oficial vigente; (2) **escalar ordenado** — una sola convención sin excepciones para todos los componentes futuros; (3) **mantenibilidad** — se elimina la divergencia declarada en el perfil de los agentes `ng-*`.

## Consecuencias

### Positivas

- Convención de naming del DS 100% alineada con Angular moderno — identificadores (ADR-007) y archivos (este ADR) cierran el tema.
- `ng-stack-profile.md` sin excepciones: `ng-component` genera y `ng-review` audita con el estándar del style-guide sin reglas especiales.
- Consistencia interna repo-completa: components y playground usan el mismo patrón.
- Cero impacto en consumidores: la API pública (barrel, FESM2022, types, selectores) no cambió — changeset **patch**.
- Specs `components-package` y `playground-app` sincronizadas con la realidad (el change además sanó drift preexistente de la spec del playground).

### Negativas / trade-offs aceptados

- Historia git de los 16 archivos requiere `--follow` para cruzar el rename (mitigado con `git mv` explícito).
- Material histórico (ADRs previos, changes archivados) conserva referencias a `.component.ts` — correcto por inmutabilidad, pero exige leer con fecha en mano.
- Tooling externo que asuma el sufijo `.component` (schematics default de Angular CLI antiguos, snippets) necesita configuración — irrelevante hoy: los componentes se generan vía `ng-component` que ya sigue el perfil.

### Acciones de seguimiento

- Ninguna pendiente: docs (`architecture/README.md`, `FUTURE-WORK.md`), config (`openspec/config.yaml`) y perfil (`ng-stack-profile.md`) se sincronizaron en el mismo change.
