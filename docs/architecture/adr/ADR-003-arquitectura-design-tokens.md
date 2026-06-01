# ADR-003 — Arquitectura de design tokens

- **Fecha**: 2026-05-31
- **Estado**: Aceptado
- **Dominio**: frontend / tokens
- **ADRs relacionados**: [ADR-001](ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](ADR-002-conventional-commits-changesets.md)

## Contexto

`@romanmartinidev/tokens` distribuye los design tokens del sistema de diseño y va a ser consumido por al menos `@romanmartinidev/components` (Fase 3) y `apps/playground` (Fase 4). Una decisión consistente sobre **cómo se organizan los tokens, qué herramienta los compila, y cómo se aplican los themes** evita acoplamiento accidental y deuda técnica río abajo.

Restricciones contextuales:

- El repo ya tenía Style Dictionary 4.x configurado y funcionando (heredado del repo de investigación).
- Los tokens existentes tienen estructura `primitives/semantic/component/theme/` y prefix CSS `--ds-*`.
- La auditoría de Fase 2 encontró bugs (border jerarquía, falta de shadow.focus) que se corrigen en la misma fase pero confirman que la estructura base es sana.
- Pre-1.0 — la API puede evolucionar, pero cambios en el prefix o la jerarquía son one-way door que merecen su propia decisión documentada.

Esta decisión afecta ≥2 packages (todos los que consumen tokens) y es one-way door en su núcleo (prefix CSS, jerarquía). Cumple los criterios de ADR obligatorio.

## Opciones consideradas

### Opción A — Style Dictionary 4 (status quo, formalizado)

Mantener Style Dictionary 4 como build tool, formalizar la jerarquía actual `primitives → semantic → component → theme`, y mantener prefix `--ds-*`.

- **Pros**:
  - Maduro, adoptado por Adobe Spectrum, Atlassian, Microsoft Fluent, Salesforce.
  - Soporta los outputs que necesitamos: CSS root + CSS por theme + JS + TS declarations.
  - Ya integrado y funcionando.
  - Ecosistema de transforms y formats configurables.
- **Contras**:
  - Lock-in moderado: cambiar a otro tool implica reescribir `sd.config.mjs` y eventualmente la fuente si el formato JSON difiere.
  - El formato JSON propio de Style Dictionary no es exactamente el del [W3C Design Tokens Format Module](https://www.w3.org/community/design-tokens/) (sd lo soporta opcionalmente desde 4.x, pero no de forma nativa total).

### Opción B — Terrazzo (ex Cobalt)

[Terrazzo](https://github.com/terrazzoapp/terrazzo) es un build tool más nuevo, basado en el draft del W3C Design Tokens.

- **Pros**:
  - Formato estándar W3C (potencialmente futuro-prueba).
  - API más limpia, configuración menos verbosa.
- **Contras**:
  - Menos maduro, ecosistema más chico.
  - Requeriría migrar el formato JSON existente (semánticamente equivalente, sintácticamente distinto: `$value` vs `value`, `$type` vs ausente).
  - Switching cost a esta escala no se justifica.

### Opción C — Script custom TS + json2css

Reemplazar Style Dictionary con un script propio que transforme los JSON a CSS/JS/TS.

- **Pros**:
  - Máximo control, sin dependencia externa.
  - Posibilidad de outputs muy customizados.
- **Contras**:
  - Mantener un compilador de design tokens es trabajo recurrente que no agrega valor de producto.
  - Reescribir features que SD trae listas (transforms, formats, watchers).
  - Viola "buenas prácticas": preferir herramientas probadas del ecosistema.

### Opción D — Cambiar la jerarquía (ej. adoptar Token Studio nomenclature)

Reorganizar a una jerarquía distinta (`core/alias/component` o similar).

- **Pros**:
  - Posibilidad de alinear con herramientas tipo Token Studio para Figma.
- **Contras**:
  - Refactor mayor sin beneficio inmediato.
  - La jerarquía actual (primitives/semantic/component/theme) es coherente y bien entendida.
  - Mejor postergar a un ADR posterior si aparece motivación concreta (ej. sync bidireccional con Figma).

## Decisión

Se adopta la **Opción A**, formalizada en cuatro decisiones explícitas:

### 1. Build tool: **Style Dictionary 4.x**

Configuración en `packages/tokens/sd.config.mjs`. Pinneada a `^4.3.0` en `devDependencies`. Evaluación de migración a Terrazzo (u otro) queda como ADR futuro si aparece necesidad real (multi-plataforma iOS/Android, sync W3C bidireccional con Figma).

### 2. Jerarquía: **primitives → semantic → component → theme**

Niveles y reglas:

| Nivel      | Carpeta           | Qué contiene                                                                                            | Puede referenciar               |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| primitives | `src/primitives/` | Valores crudos sin semántica de uso (escalas de color, dimension, opacity, motion, shadow, typography). | — (sin referencias entrantes)   |
| semantic   | `src/semantic/`   | Tokens con intención (`bg.primary`, `text.muted`, `border.default`, `space.md`, `shadow.focus`).        | primitives                      |
| component  | `src/component/`  | Tokens específicos de un componente (`button.bg`, `modal.shadow`, etc.).                                | semantic, primitives (no theme) |
| theme      | `src/theme/`      | Overrides de tokens **semantic** (no introduce nuevos).                                                 | primitives                      |

**Invariantes**:

- Ningún nivel referencia a sí mismo en forma circular.
- `theme` solo redefine tokens existentes en `semantic`.
- `primitives` no depende de nada del repo.

### 3. Prefix de variables CSS: **`--ds-*`**

Prefix corto, legible, ya consolidado. Queda parte del contrato API público del package: cambiarlo es BREAKING y requiere un ADR que reemplace al ADR-003.

Justificación frente a alternativas (`--rmd-*`, `--rm-*`): la decisión se tomó en el kickoff de Fase 2 evaluando concisión vs unicidad. El riesgo de colisión con otro DS es bajo (los consumidores controlan su propio bundle); el costo de tipear el prefix más largo es real y recurrente.

### 4. Modelo de theming: **CSS variables + atributos HTML**

- Tokens semantic emiten en `:root` (default).
- Cada theme override aplica un selector de atributo (ej. `[data-theme="dark"]`, `[data-brand="a"]`).
- Combinaciones (theme + brand) funcionan por cascada CSS estándar sin código adicional.
- Activación = setear atributo en cualquier elemento contenedor (típicamente `<html>`); todo el subárbol hereda los overrides.

Implicancias para `sd.config.mjs`:

- Build base emite CSS en `:root` con todos los semantics y primitives.
- Cada theme buildea como un CSS aparte que solo contiene los overrides bajo el selector de su atributo.
- Tree-shaking implícito: el consumidor que no usa dark no importa `themes/dark.css`.

## Consecuencias

### Positivas

- **Mantenibilidad**: estructura predecible. Un dev nuevo encuentra rápido dónde definir un token.
- **Escalabilidad**: sumar un theme nuevo = agregar JSON en `theme/` + entry en `exports` + entry en `sd.config.mjs`. Sumar un componente nuevo = JSON en `component/`. Sin tocar primitives ni semantics existentes.
- **Tree-shakeable**: themes opt-in vía sub-paths del `exports`. Una app que no usa brand-b no carga `brand-b.css`.
- **Combinable**: theme + brand funcionan sin código adicional (cascada CSS).
- **Estándar de industria**: Style Dictionary 4 es la opción defecto en design systems frontend serios.
- **Contrato testable**: la jerarquía y reglas de referencia están formalizadas en la spec `design-tokens-package` (testables por scenarios).

### Negativas / trade-offs aceptados

- **Lock-in moderado en Style Dictionary**: cambiar implica reescribir build config y eventualmente el formato JSON.
- **Prefix `--ds-*` queda BREAKING si se cambia**: una decisión futura de scope-rename obliga a major bump del package y migración por parte de consumidores.
- **Agregar un theme no es 100% automático**: requiere también update de `exports` en `package.json` y entry en `sd.config.mjs`. Documentado en README.
- **El formato JSON propio de SD no es 100% W3C compatible**: si alguna vez queremos sync bidireccional con Figma vía Tokens Studio (formato W3C), habrá un costo de transformación.
- **Jerarquía rígida**: si en el futuro aparece necesidad de un nivel "alias" entre primitive y semantic (común en algunos DS), requeriría otro ADR. No es bloqueante hoy.

### Acciones de seguimiento

- Documentar en README del package cómo agregar un theme nuevo y cómo consumir. ✅ ya hecho en Fase 2.
- Pinnear `style-dictionary` en `^4.3.0` y monitorear breaking changes en `4.x`. ✅ ya pinneado.
- Si aparece motivación real (multi-plataforma, sync Figma, fricción operativa), evaluar Terrazzo en ADR futuro.
- Política definitiva de versionado pre-1.0 → 1.0 — se decide al primer release (igual que en ADR-002).
