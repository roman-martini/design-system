## Context

ADR-007 cerró la convención de identificadores (`DsButton`, `ds-button`, `--ds-*`) pero postergó deliberadamente el file naming: los archivos siguen `<name>.component.{ts,html,css,spec.ts}`. El style-guide moderno de Angular (v20+) omite el sufijo de rol, el repo corre Angular 21, y `.claude/knowledge/ng-stack-profile.md` arrastra la divergencia como excepción declarada. Este change ejecuta la migración que ADR-007 anticipó como "CHG separado".

Estado verificado al activar:

- 4 componentes (`button`, `checkbox`, `radio`, `radio-group`), 16 archivos `<name>.component.*`.
- Referencias internas al path `.component`: los 4 `index.ts`, los 4 `*.spec.ts`, 3 `*.stories.ts`, y el import cruzado `radio-group.component.spec.ts` → `../radio/radio.component`. `public-api.ts` re-exporta desde `./lib/<name>` (carpeta) — **no cambia**.
- `apps/playground` importa solo del barrel `@romanmartinidev/components` y sus propios archivos **ya usan** naming sin sufijo (`app.ts`, `app.html`, `app.css`, `app.spec.ts`) — cero migración de consumidor.
- La spec `components-package` fija `.component.ts` como contrato SHALL (Requirements de estructura, naming y scenarios de Checkbox/Radio/RadioGroup) → requiere deltas MODIFIED.
- La spec `playground-app` referencia `app.component.ts`/`app.component.spec.ts` que **no existen** (drift preexistente desde el `ng new` de Angular 21) → se sana en el mismo delta temático.

Es un refactor **mecánico y reversible**: cero cambio de clases, selectores, types, CSS vars ni comportamiento. No hay ambigüedad técnica de fondo; este design existe porque el schema lo requiere antes de `tasks` y para dejar registradas tres decisiones operativas.

## Goals / Non-Goals

**Goals:**

- Renombrar los 16 archivos a `<name>.{ts,html,css,spec.ts}` preservando historia git.
- Actualizar `templateUrl`/`styleUrl` e imports internos afectados.
- Sincronizar las specs `components-package` y `playground-app` vía deltas MODIFIED.
- Sincronizar docs/config que fijan la convención (`openspec/config.yaml`, `docs/architecture/README.md`, `ng-stack-profile.md`, `FUTURE-WORK.md` §nomenclatura).
- Suite completa verde sin cambios de comportamiento (`build` + `test` + `npm pack` equivalente).

**Non-Goals:**

- NO tocar clases, selectores, type exports ni CSS custom properties (cerrado por ADR-007).
- NO reorganizar carpetas (arquitectura flat de ADR-004 §2 intacta — Opción C descartada en proposal).
- NO renombrar `*.stories.ts` ni `index.ts` (no llevan sufijo de rol).
- NO tocar `apps/playground/src/app/*` (ya alineado); solo la spec que lo describe.
- NO changeset **major**: los paths internos no son superficie pública (consumo vía barrel).

## Decisions

### 1. `git mv` para preservar historia

Renombrar con `git mv` (no delete+create) para que `git log --follow` conserve la historia por archivo.

- **Alternativa**: rename del filesystem y dejar que git detecte similitud. Funciona en general, pero `git mv` hace la intención explícita y evita falsos negativos de detección cuando rename + edición de contenido van en el mismo commit (acá los `.ts` cambian imports además del nombre).

### 2. Orden de operaciones: por componente, hojas primero

Migrar componente por componente en orden de dependencia inversa: `button` → `checkbox` → `radio-group` → `radio` (radio importa radio-group vía spec de radio-group; el import cruzado real es `radio-group.spec.ts` → `radio`). En cada componente: rename de los 4 archivos → ajustar `templateUrl`/`styleUrl` → ajustar imports (`index.ts`, `spec`, `stories`) → correr tests del package.

- **Alternativa**: rename masivo de los 16 archivos + fix global de imports en un paso. Menos commits intermedios, pero si algo falla el bisect es peor. Con 4 componentes el costo de ir por partes es trivial y cada paso deja la suite verde.
- Los 4 renames van en **un solo commit final** de todos modos (el paso a paso es orden de trabajo, no granularidad de commit) — commitlint/lint-staged corre una vez.

### 3. Sync de specs como MODIFIED quirúrgico (sin reescribir requirements)

Los deltas tocan **solo las menciones del patrón de archivo** dentro de cada Requirement afectado, manteniendo intactos título, semántica y el resto de scenarios. En `components-package`: estructura por componente, naming, scenarios de Checkbox/RadioGroup/Radio y la referencia en el scenario de Vitest. En `playground-app`: los 2 scenarios que citan `app.component.*`.

- **Alternativa**: reescribir el Requirement de naming completo aprovechando el paso. Descartada — mezcla decisiones y dificulta el review del delta; el cambio es un patrón de string, el delta debe leerse igual de chico.

### 4. Docs/config sincronizados en el mismo change (no follow-up)

`openspec/config.yaml` (línea "Folder y file kebab-case"), `docs/architecture/README.md` (árbol + tabla naming), `.claude/knowledge/ng-stack-profile.md` (quitar la excepción), `docs/architecture/FUTURE-WORK.md` (cerrar la sección "nomenclatura de archivos"). Dejarlos para después recrearía el mismo drift que este change sana en `playground-app`.

### 5. Changeset **patch**

El rename no altera la superficie pública del package (barrel, FESM, types). Un consumidor hipotético con deep imports a paths internos no está soportado (exports vía barrel es el contrato, ADR-004). `patch` de `@romanmartinidev/components` con nota de "internal file rename".

- **Alternativa**: `minor` por prudencia. Descartada: no hay feature ni cambio observable; pre-1.0 el patch comunica mejor "sin impacto".

## Risks / Trade-offs

- [`git mv` + edición simultánea confunde el rename detection en el PR] → `git mv` explícito + revisar el diff con `--find-renames`; los 16 archivos cambian de path pero solo los `.ts` cambian contenido (imports/URLs).
- [Algún path `.component` residual queda colgado (config de Vitest/Storybook/ng-packagr con globs o entradas explícitas)] → grep final `\.component\.` sobre `packages/`, `apps/`, configs de raíz; los globs por extensión (`*.spec.ts`, `*.stories.ts`) no se ven afectados.
- [El tarball cambia nombres de archivos internos (FESM chunks se regeneran)] → `npm pack --dry-run` antes/después: el contenido del APF se genera desde `public-api.ts`, los nombres públicos (`fesm2022/`, `index.d.ts`) no dependen de los nombres fuente.
- [aaa-011 (accessible-disabled) toca los mismos componentes] → este change va primero; verificado que su `design.md` no referencia paths `.component`.

## Migration Plan

No aplica migración de consumidores: no hay externos y playground consume vía barrel. Rollback = revert del commit (rename mecánico, sin estado).

## Open Questions

Ninguna — las tres decisiones operativas quedaron cerradas arriba; el resto es ejecución mecánica.
