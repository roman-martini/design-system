---
blueprint: ng-components
version: 1.1.0
schema: 1
updated: 2026-06-08
---

# Blueprint: NG Components — Calidad de componentes Angular (familia `ng-`)

## Cómo usar este blueprint

**Prerrequisitos**: Claude Code instalado globalmente. El repo destino es un **proyecto Angular ya existente** (v20+, ideal v22). Este grupo no scaffoldea un proyecto Angular: su unidad de trabajo es el componente y su entorno inmediato (template, estilos, test, estado local).

1. Abrí Claude Code en el directorio raíz del proyecto Angular destino.
2. Ejecutá: `/as-project-scaffolder .claude/blueprints/ng-components.md`
3. El scaffolder creará: 4 agentes (`ng-router`, `ng-component`, `ng-review`, `ng-sync`), 1 skill (`ng-change`), 5 comandos namespaced en `commands/ng/` (`ask.md`, `component.md`, `review.md`, `change.md`, `sync.md`), 2 knowledge files (`ng-best-practices.md`, `ng-stack-profile.md`), 1 rule (`ng-constraints.md`) y `settings.json`.
4. El scaffolder actualizará el `CLAUDE.md` del repo destino con la sección "Componentes Angular (familia `ng-`)".
5. La primera vez, antes de generar o revisar componentes, completá el **perfil del stack** del proyecto en `.claude/knowledge/ng-stack-profile.md` (versión de Angular, motor de estilos, framework de testing, design system). Los agentes lo leen como primer paso; sin él, `ng-component` y `ng-review` paran.
6. Verificá el resultado contra la sección "Criterios de calidad del scaffold".

> Si el repo destino ya tiene `.claude/` con otro scaffold, `as-project-scaffolder` reporta los archivos en conflicto antes de escribir y pide confirmación.

> **Relación con `web-angular.md`**: este blueprint es **nuevo e independiente**. `web-angular.md` queda **deprecado**; no es base ni dependencia de este grupo.

---

## Agentes y skills incluidos

| Pieza | Tipo | Invocación | Rol | Model | Tools |
|---|---|---|---|---|---|
| `ng-router` | Agente (router) | `/ng:ask` | Clasifica la intención (crear / revisar / proponer cambio / sincronizar) y deriva a la pieza correcta; resuelve casos triviales | haiku | Read, Glob, Grep |
| `ng-component` | Agente | `/ng:component` | Genera componentes Angular aplicando el knowledge `ng-best-practices.md` y el `ng-stack-profile.md` | sonnet | Read, Write, Edit, Glob, Grep |
| `ng-review` | Agente | `/ng:review` | Audita uno o varios componentes contra el knowledge; produce un artefacto de review con hallazgos, severidad y `archivo:línea` | sonnet | Read, Glob, Grep, Write |
| `ng-change` | Skill | `/ng:change` | Convierte un review grande en **un único Markdown autocontenido** (propuesta + diseño + tareas), implementable sin contexto adicional | — | Read, Write, Glob |
| `ng-sync` | Agente (web) | `/ng:sync` | Recorre las URLs canónicas de angular.dev, detecta prácticas nuevas/cambiadas vs. el knowledge, propone actualizarlo y reporta componentes desalineados | opus | Read, Write, Glob, Grep, WebFetch, WebSearch |

> **Convención de comandos**: todas las piezas del grupo se invocan namespaced por subdirectorio `.claude/commands/ng/<verbo>.md`, que Claude Code expone como `/ng:ask` (router), `/ng:component`, `/ng:review`, `/ng:change`, `/ng:sync` (mismo patrón que `/bl:*` en `backlog.md`). **No hay comando pelado `/ng` en la raíz**: el router es una pieza más del namespace (`/ng:ask`), lo que mantiene el grupo uniforme y evita el archivo suelto en la raíz de `commands/`. Cada comando es un wrapper fino que delega en el agente o skill.

### Por qué cada pieza es agente o skill (decisión por pieza)

La regla de corte: **autonomía / razonamiento / acceso web → agente**; **transformación determinística sobre un input ya producido, invocación puntual → skill**.

- **`ng-router` → agente (router).** Clasifica intención mirando el pedido y, si hace falta, el repo (qué componentes hay, qué se pidió). Es razonamiento ligero pero contextual, no una transformación fija. Router obligatorio porque hay ≥3 piezas en el mismo dominio. Haiku: clasificar y derivar es exactamente su perfil.
- **`ng-component` → agente.** Generar un componente que respete 9 categorías de buenas prácticas (signals, control flow, OnPush/zoneless, a11y, test) exige criterio de diseño sostenido, no un molde. Autonomía + razonamiento → agente. Sonnet: producción de código de calidad.
- **`ng-review` → agente.** Auditar exige juzgar severidad, distinguir un anti-patrón real de una excepción justificada por consistencia del archivo, y ubicar cada hallazgo en `archivo:línea`. Es juicio, no checklist mecánico → agente. Sonnet.
- **`ng-change` → skill.** Su input ya existe (el review de `ng-review`) y su trabajo es una **transformación determinística con estructura fija**: review → un Markdown autocontenido con secciones canónicas (propuesta, diseño, tareas). Invocación puntual sobre un artefacto dado, sin exploración ni decisiones abiertas → encaja mejor como skill. Mantiene el formato del artefacto estable y versionado en el `SKILL.md`.
- **`ng-sync` → agente (obligatorio).** Es la **única pieza con acceso a Internet** (`WebFetch`/`WebSearch`): recorre la tabla de URLs canónicas, compara contra el knowledge (fecha de extracción) y razona sobre qué cambió y qué quedó desalineado. Acceso web + razonamiento sobre diffs → agente sin alternativa. Opus: la decisión de qué práctica cambió y cómo impacta al código es de alto valor y baja frecuencia.

Total: **4 agentes + 1 skill = 5 piezas**, una por capacidad, dentro del máximo razonable.

---

## Dominio

Grupo `ng-*` de agentes y un skill para **asegurar la calidad de componentes Angular** sobre un proyecto ya existente: crearlos bien desde el inicio, auditarlos contra un set de buenas prácticas extraído de angular.dev, producir —cuando el arreglo es grande— un artefacto de cambio autocontenido que cualquier otro agente pueda implementar, y mantener las buenas prácticas al día revisando periódicamente la documentación oficial.

El objetivo de calidad no es "que el componente compile": es que cada componente siga el Angular moderno (standalone, signals-first, control flow nativo, OnPush/zoneless, a11y nativa, TypeScript estricto) de forma **verificable ítem por ítem**, y que las desviaciones se detecten con su ubicación exacta y su severidad. El grupo es **autocontenido**: no conoce ni depende de ninguna herramienta externa (incluido OpenSpec). Que su artefacto de cambio pueda servir de input a una herramienta externa es una consecuencia deseable, no una dependencia.

---

## Stack

Angular moderno como base de todas las buenas prácticas. Lo **fijo** del blueprint es la postura (Angular v20+, signals-first); lo **variable por proyecto** se declara en `ng-stack-profile.md`.

**Fijo (todas las buenas prácticas asumen esto):**
- **Standalone por defecto** — cero `NgModule` en código nuevo.
- **Signals-first** — `signal()`, `computed()`, `effect()` (solo APIs no reactivas), `linkedSignal()`.
- **Inputs/outputs signal-based** — `input()` / `input.required()`, `output()`, `model()` para two-way.
- **Signal queries** — `viewChild()`, `viewChildren()`, `contentChild()`.
- **Control flow nativo** — `@if`, `@for` (con `track` obligatorio), `@switch`, `@let`, `@defer`.
- **`inject()`** sobre inyección por constructor.
- **`ChangeDetectionStrategy.OnPush`** siempre; **zoneless** como objetivo.
- **RxJS solo en los límites async**, convertido a signals con `toSignal()` / `rxResource()` / `resource()`.
- **TypeScript estricto** (`strict: true`, cero `any`).

**Variable por proyecto (en `ng-stack-profile.md`):**
- `angular_version` — versión exacta del repo (ej. `20.1.0`, `22.0.0`).
- `style_engine` — `scss` | `css` | `less` | `tailwind` (o combinación, ej. `scss + tailwind`).
- `test_framework` — `jest` | `vitest` | `karma` | `web-test-runner`.
- `design_system` — `angular-material` | `cdk-only` | `primeng` | `custom` | `none` + librería de componentes si aplica.
- `selector_prefix` — prefijo de selectores de la app (ej. `app`, `acme`).

Las buenas prácticas valen para **cualquier combinación** de las variables. Los agentes leen el perfil al inicio y adaptan el output (sintaxis de estilos, imports de test, componentes del design system) sin cambiar la postura de calidad.

---

## Estructura de archivos del proyecto

Estructura **fija que instala el scaffolder** dentro de `.claude/`:

```
<repo-angular>/
├── CLAUDE.md                                   # actualizado por scaffolder con sección "Componentes Angular (ng-)"
└── .claude/
    ├── settings.json
    ├── skills/
    │   └── ng-change/SKILL.md                  # review grande → un Markdown autocontenido (propuesta + diseño + tareas)
    ├── agents/
    │   ├── ng-router.md                         # router
    │   ├── ng-component.md                      # creación
    │   ├── ng-review.md                         # auditoría
    │   └── ng-sync.md                           # sincronización (web)
    ├── commands/
    │   └── ng/                                  # comandos namespaced /ng:* (incluido el router)
    │       ├── ask.md                           # /ng:ask — router
    │       ├── component.md                     # /ng:component
    │       ├── review.md                        # /ng:review
    │       ├── change.md                        # /ng:change → skill
    │       └── sync.md                          # /ng:sync
    ├── knowledge/
    │   ├── ng-best-practices.md                # buenas prácticas + tabla de URLs canónicas (base de ng-sync)
    │   └── ng-stack-profile.md                  # perfil variable del proyecto (relevamiento)
    └── rules/
        └── ng-constraints.md                    # scope, prefijo, sin dependencias externas
```

> El artefacto de review (`ng-review`) y el artefacto de cambio (`ng-change`) **no tienen ubicación fija impuesta por el blueprint**: se escriben en el path que el invocador indique (default: junto al componente revisado o en un directorio que el usuario pase). El grupo no asume ninguna estructura de carpetas del proyecto destino más allá de `.claude/`.

---

## Filosofía de diseño

**Angular moderno no es una opción de estilo: es el estándar contra el que se mide.**
Este grupo no acepta "funciona igual con `*ngIf`". El estándar es el Angular de v20+/v22 — standalone, signals, control flow nativo, OnPush/zoneless — y todo lo legacy (`NgModule` en código nuevo, `*ngFor` sin `track`, inyección por constructor, `effect()` para derivar estado) es un hallazgo, no una preferencia. La postura es deliberada: el costo de mantener código mezcla-de-épocas supera el de modernizarlo.

**El knowledge es la única fuente de verdad, y se mantiene vivo.**
Las buenas prácticas no viven en la cabeza de los agentes ni se reinventan de memoria: viven en `ng-best-practices.md`, cada una con su URL de angular.dev. Por eso el grupo incluye `ng-sync`: a medida que Angular publica versiones, las prácticas cambian, y re-evaluar el knowledge contra la fuente oficial es una capacidad de primera clase, no un trabajo manual. Un componente "correcto" hoy puede quedar desalineado mañana; `ng-sync` lo detecta.

**Crear bien y revisar usan el mismo rasero.**
`ng-component` genera aplicando exactamente las mismas reglas que `ng-review` audita. No hay un estándar para escribir y otro para revisar. Si `ng-review` marcaría algo como hallazgo, `ng-component` no lo produce. Esa simetría es lo que hace que el review sea predecible.

**Cada hallazgo es binario y ubicado, o no es un hallazgo.**
El review no dice "el componente podría mejorarse". Dice "`user-profile.ts:42` usa `*ngFor` sin `track` — severidad alta — categoría Control flow". Sin `archivo:línea` y sin severidad, un hallazgo no entra al artefacto. La consistencia dentro de un archivo existente puede justificar una excepción, pero la excepción se declara, no se omite.

**El review grande produce un solo archivo, portable y sin dependencias.**
Cuando el arreglo es grande, el output es **un único Markdown autocontenido** que cualquier agente puede implementar sin más contexto: propuesta, diseño y tareas en el mismo archivo. El grupo no conoce ninguna herramienta externa —ni OpenSpec, ni formatos propietarios, ni imports—. Que ese Markdown luego *pueda* alimentar una herramienta externa es consecuencia, no requisito. El diseño se mantiene agnóstico y portable a propósito.

**Fallar rápido sobre adivinar el stack.**
Antes de generar o auditar, los agentes leen `ng-stack-profile.md`. Si la versión de Angular, el motor de estilos, el framework de testing o el design system no están declarados, paran y los piden — no inventan que el proyecto usa Jest o SCSS. Un componente generado contra un stack adivinado es peor que un agente que pregunta.

---

## Estándares de calidad

Todos los estándares derivan de `ng-best-practices.md` (extraído de angular.dev, v22). Cada ítem es **binario** (cumple / no cumple) y verificable por `ng-review`.

### 1. Naming y organización
- Nombres de archivo en kebab-case con guiones: `user-profile.ts`; el nombre refleja la clase principal.
- TS, template y estilos comparten el mismo nombre base; tests terminan en `.spec.ts`.
- Componente + template + test agrupados en el mismo directorio; organización por **feature**, no por tipo (`components/`, `services/`).
- Un concepto por archivo.

### 2. Autoría de componentes
- **Standalone** — dependencias en `imports`; **cero `NgModule`** en código nuevo (hallazgo si aparece).
- Template y estilos en archivos separados (`templateUrl` / `styleUrl`).
- Selector con el `selector_prefix` del perfil; atributos en camelCase.
- Miembros Angular (inputs, outputs, queries, dependencias) **antes** de los métodos.
- `protected` para miembros usados solo por el template; `readonly` para lo que Angular setea (`input`, `model`, `output`, queries).
- Event handlers nombrados por la **acción** (`saveUserData()`), no por el evento (`handleClick()`).
- Lifecycle hooks simples; implementan su interfaz (`OnInit`, etc.).
- Lógica compleja fuera del template; `computed()` para complejidad moderada.

### 3. DI y sintaxis moderna
- **`inject()`** sobre inyección por constructor (hallazgo si hay inyección por parámetros en código nuevo).
- Bindings directos `[class]` / `[style]` sobre `NgClass` / `NgStyle`.
- Ante conflicto con el estilo de un archivo existente, prima la **consistencia del archivo** (excepción declarada).

### 4. Signals
- Estado mutable con `signal()`; derivado con `computed()` (no `.set()` sobre un `computed`).
- `effect()` **solo** para sincronizar con APIs externas no reactivas; **nunca** para derivar estado (usar `computed()` / `linkedSignal()`) — hallazgo de severidad alta.
- Inputs con `input()` / `input.required()`; two-way con `model()`; eventos con `output()`.
- Queries con `viewChild()` / `viewChildren()` / `contentChild()`.
- Leer signals **antes** de un `await` (el contexto reactivo se pierde tras async).
- RxJS convertido con `toSignal()` / `rxResource()` / `resource()` en el límite async.
- Estado de solo lectura expuesto con `.asReadonly()`.

### 5. Control flow en templates
- **`@if` / `@for` / `@switch` nativos**; `*ngIf` / `*ngFor` legacy son hallazgo.
- **`@for` siempre con `track`** por identificador único (no `$index` salvo colección estática, nunca por referencia) — hallazgo de severidad alta si falta.
- `@empty` tras `@for` para colección vacía; `@let` para variables locales.
- `@switch` con comparación estricta; `@default never;` para chequeo exhaustivo de uniones.

### 6. Performance
- `ChangeDetectionStrategy.OnPush` en todo componente (hallazgo si falta).
- **Zoneless** como objetivo; sin operaciones async que fuercen change detection innecesario (zone pollution).
- `@defer` con triggers explícitos para bloques below-the-fold.
- `NgOptimizedImage` (`<img ngSrc>`); `width`/`height` y `priority` en la imagen LCP.
- Sin expresiones pesadas en templates (se recalculan cada ciclo) — mover a `computed()`.

### 7. Seguridad
- Sin bindear datos de usuario a `innerHTML` sin sanitización; interpolación por defecto (escapa).
- `bypassSecurityTrust*` solo tras inspección y construido lo más cerca posible del dato — **auditar todo uso** (hallazgo si no está justificado).
- Sin APIs del DOM directas (`document`, `ElementRef.nativeElement`) para manipular contenido — preferir templates.
- Nunca generar templates concatenando input de usuario.

### 8. Accesibilidad
- Reutilizar elementos nativos (`<button>`, `<a>`) antes que custom.
- ARIA dinámico con attribute binding (`[attr.role]`, `[attr.aria-label]`); estático como atributo normal.
- Tras navegación, foco al contenido principal; `RouterLinkActive` con `ariaCurrentWhenActive="page"`.
- Bloques `@defer` envueltos en regiones `aria-live` cuando cargan contenido dinámico.
- Reglas a11y enforzadas con `@angular-eslint/template` (si el repo lo tiene configurado).

### 9. Principios transversales
- Composición sobre herencia; responsabilidad única; flujo de datos unidireccional.
- **Inmutabilidad de inputs** — nunca mutar un input (hallazgo de severidad alta).
- Componentes presentacionales puros sin servicios de dominio.
- **TypeScript estricto, cero `any`** salvo comentario que lo justifique.
- Testing de **comportamiento**, no de implementación; queries por rol/label, no por selectores CSS.

### Severidades para el review
- **Alta**: rompe la reactividad o la corrección — `effect()` para derivar estado, `@for` sin `track`, mutar un input, `NgModule` en código nuevo, `any` sin justificar, `bypassSecurityTrust*` sin auditar.
- **Media**: legacy o subóptimo pero funcional — `*ngIf`/`*ngFor`, inyección por constructor, falta de `OnPush`, `NgClass`/`NgStyle`, expresión pesada en template.
- **Baja**: estilo y organización — naming, orden de miembros, `protected`/`readonly` faltantes, handler nombrado por evento.

---

## Relevamiento obligatorio antes de generar o auditar

Los agentes `ng-component` y `ng-review` leen `ng-stack-profile.md` como primer paso. Si falta cualquiera de estos campos, paran y los piden por `campo + por qué bloquea`:

1. **`angular_version`** — versión exacta del repo. Bloquea: define qué APIs existen (`linkedSignal`, `rxResource`, `@let`, `@defer` triggers) y qué prácticas aplican.
2. **`style_engine`** — `scss` / `css` / `less` / `tailwind` (o combinación). Bloquea: `ng-component` no sabe en qué sintaxis escribir los estilos del componente.
3. **`test_framework`** — `jest` / `vitest` / `karma` / `web-test-runner`. Bloquea: `ng-component` no sabe qué imports y matchers usar en el `.spec.ts`.
4. **`design_system`** — `angular-material` / `cdk-only` / `primeng` / `custom` / `none`. Bloquea: define si el componente reutiliza primitivas existentes o las construye, y qué a11y ya viene resuelta.
5. **`selector_prefix`** — prefijo de selectores de la app. Bloquea: el selector del componente generado debe respetarlo.

**Condicional:**
6. Si `design_system: custom` → ¿hay un directorio de primitivas/tokens que el componente debe reutilizar? (path).
7. Si `style_engine` incluye `tailwind` → ¿se permiten clases utilitarias en el template o se restringe a un layer de componentes?
8. Para `ng-review` con scope amplio → ¿qué componentes auditar? (paths o glob). Sin scope, audita el o los archivos pasados como argumento.

> Este relevamiento aplica al **comportamiento en cada invocación**, no a la instalación del scaffold. El scaffolder crea `ng-stack-profile.md` con los campos vacíos y una nota para completarlos antes del primer uso.

---

## Reglas de entrega

- **Sin dependencias externas**: el grupo no conoce OpenSpec ni ninguna herramienta de terceros. El artefacto de cambio no tiene imports, formatos propietarios ni supuestos sobre tooling externo. Es Markdown plano, autocontenido y portable.
- **El artefacto de cambio es un solo archivo Markdown** con tres secciones obligatorias: **propuesta de cambios**, **diseño**, **tareas**. Detalle suficiente para que otro agente lo implemente sin contexto adicional (sin `TODO:` sin resolver, sin "ver el review" — el contexto necesario se transcribe).
- **`ng-component`** escribe solo los archivos del componente y su entorno inmediato (TS, template, estilos, `.spec.ts`) en el path que el invocador indique. No toca routing global, módulos compartidos ni configuración del proyecto salvo que se pida explícitamente.
- **`ng-review`** no modifica código — solo produce el artefacto de review. Si los hallazgos son pocos y de bajo riesgo, el review alcanza para aplicar el cambio directo; si son muchos o complejos, se invoca `/ng:change`.
- **`ng-change`** lee un review existente y escribe un único Markdown; no modifica código ni el review original.
- **`ng-sync`** propone cambios a `ng-best-practices.md` (con diff explícito y URL fuente) y reporta componentes desalineados, pero **no edita componentes** — solo el knowledge, y solo tras mostrar el diff. Actualiza la fecha de extracción del knowledge al confirmarse.
- Ningún `ng-*` escribe fuera de los archivos del componente trabajado, del artefacto de review/cambio en el path indicado, y `ng-sync` del knowledge `ng-best-practices.md`.

---

## Checklist de auto-revisión

### Checklist de sesión — creación (`/ng:component`)
- [ ] Se leyó `ng-stack-profile.md`; si faltaba un campo, el agente paró y lo pidió (N/A si todos presentes)
- [ ] El componente es **standalone** (cero `NgModule`) con `ChangeDetectionStrategy.OnPush`
- [ ] Inputs con `input()`/`input.required()`, outputs con `output()`, two-way con `model()`; queries con `viewChild()`/`contentChild()`
- [ ] Estado con `signal()`/`computed()`; sin `effect()` para derivar estado; RxJS solo en el límite async con `toSignal()`/`rxResource()`
- [ ] Template con control flow nativo (`@if`/`@for`/`@switch`); todo `@for` con `track` por id único
- [ ] `inject()` para DI; selector con el `selector_prefix` del perfil; estilos en la sintaxis del `style_engine`
- [ ] `.spec.ts` con los imports/matchers del `test_framework`; tests de comportamiento (queries por rol/label)
- [ ] A11y: elementos nativos reutilizados, ARIA correcta, sin `innerHTML` con datos de usuario
- [ ] TypeScript estricto, cero `any` sin justificar; input nunca mutado

### Checklist de sesión — review (`/ng:review`)
- [ ] Se leyeron `ng-best-practices.md` y `ng-stack-profile.md` antes de auditar
- [ ] Cada hallazgo tiene `archivo:línea`, categoría (1–9) y severidad (alta/media/baja)
- [ ] Las excepciones por consistencia del archivo existente están declaradas, no omitidas
- [ ] El review indica si el arreglo es **chico** (aplicar directo) o **grande** (derivar a `/ng:change`)
- [ ] El review no modificó código

### Checklist de sesión — cambio (`/ng:change`)
- [ ] El input fue un review existente; el output es **un solo** archivo Markdown
- [ ] El Markdown tiene las 3 secciones: propuesta, diseño, tareas
- [ ] El archivo es autocontenido: un agente lo implementa sin leer nada más
- [ ] Cero referencias a herramientas externas (OpenSpec u otras); cero imports/formatos propietarios

### Checklist de sesión — sync (`/ng:sync`)
- [ ] Se recorrieron las URLs de la tabla canónica de `ng-best-practices.md`
- [ ] Cada práctica nueva/cambiada se reportó con su URL fuente y un diff propuesto al knowledge
- [ ] Se listaron los componentes desalineados con la versión nueva (con `archivo:línea` donde aplique)
- [ ] La fecha de extracción del knowledge se actualizó solo tras confirmar los cambios
- [ ] No se editó ningún componente

### Criterios de calidad del scaffold (verifica la instalación)
- [ ] Existen los 4 agentes en `.claude/agents/`: `ng-router.md`, `ng-component.md`, `ng-review.md`, `ng-sync.md`
- [ ] Existe el skill `.claude/skills/ng-change/SKILL.md` (`name: ng-change`)
- [ ] Existen los 5 comandos namespaced en `.claude/commands/ng/`: `ask.md`, `component.md`, `review.md`, `change.md`, `sync.md` (`/ng:ask`, `/ng:component`, `/ng:review`, `/ng:change`, `/ng:sync`); no hay `ng.md` en la raíz de `commands/`
- [ ] Existen los 2 knowledge en `.claude/knowledge/`: `ng-best-practices.md` (con la tabla de URLs canónicas intacta) y `ng-stack-profile.md`
- [ ] Existe la rule `.claude/rules/ng-constraints.md`
- [ ] `ng-sync` es el único con `WebFetch`/`WebSearch` en sus tools; ningún otro `ng-*` tiene acceso web
- [ ] El `CLAUDE.md` tiene la sección "Componentes Angular (ng-)" con la tabla de comandos `/ng:*`

---

## Agentes a crear

> **Convención de proceso**: el primer paso de todo agente es leer sus knowledge files declarados. Si alguno falta, el agente lo notifica y detiene la ejecución (fail fast). Orden canónico de secciones: `# Rol` → `# Cuándo se te invoca` → `# Proceso` → `# Restricciones` → `# Formato de salida`.

### `ng-router`
- **Rol**: Router del grupo. Clasifica la intención del pedido (crear componente / revisar / generar artefacto de cambio / sincronizar prácticas) y deriva a la pieza correcta; resuelve consultas triviales él mismo sin delegar. Objetivo medible: para cada pedido, produce una decisión de ruteo (`→ ng-component` | `→ ng-review` | `→ ng-change` | `→ ng-sync` | resuelto inline) con la razón.
- **Trigger**: `/ng:ask`, "creá/revisá/proponé cambios/sincronizá un componente Angular" sin saber a qué pieza ir, pedidos ambiguos del dominio `ng`.
- **Tools**: Read, Glob, Grep. (Sin escritura: el router no ejecuta, deriva.)
- **Model**: haiku.
- **Knowledge**: `ng-best-practices.md` (para entender el dominio), `ng-stack-profile.md`.
- **Estructura del cuerpo**: `# Rol` (objetivo medible) → `# Cuándo se te invoca` (triggers excluyentes con los especialistas) → `# Proceso` fijo (1. leer knowledge; 2. clasificar intención por palabras clave y, si hace falta, mirar el repo con Glob/Grep; 3. si es trivial, resolver inline; si no, derivar a la pieza con la razón) → `# Restricciones` (NO genera ni audita código; NO escribe archivos; deriva, no ejecuta la tarea del especialista) → `# Formato de salida` (`## Intención detectada`, `## Pieza destino` + razón, `## Qué pasarle`).

### `ng-component`
- **Rol**: Genera componentes Angular modernos aplicando `ng-best-practices.md` y adaptándose al `ng-stack-profile.md`. Objetivo medible: produce el set de archivos del componente (TS standalone OnPush, template con control flow nativo, estilos en la sintaxis del perfil, `.spec.ts` con el framework del perfil) que pasarían el review de `ng-review` sin hallazgos de severidad alta o media.
- **Trigger**: `/ng:component`, "creá un componente", "generá el componente X con estos inputs", cuando `ng-router` deriva la creación.
- **Tools**: Read, Write, Edit, Glob, Grep.
- **Model**: sonnet.
- **Knowledge**: `ng-best-practices.md`, `ng-stack-profile.md`.
- **Estructura del cuerpo**: `# Rol` (objetivo medible) → `# Cuándo se te invoca` → `# Proceso` fijo (1. leer ambos knowledge; fallar si falta el perfil o un campo crítico, pidiéndolo; 2. resolver requisitos del componente — nombre, inputs/outputs, estado, secciones del template; 3. generar TS standalone + OnPush + signals + `inject()`; 4. template con `@if`/`@for` (track)/`@switch` + a11y nativa; 5. estilos en `style_engine`; 6. `.spec.ts` con `test_framework`, tests de comportamiento; 7. escribir archivos) → `# Restricciones` (NO `NgModule`, NO `*ngIf`/`*ngFor`, NO `effect()` para derivar, NO mutar inputs, NO `any` sin justificar, NO escribir fuera del entorno del componente, NO adivinar el stack) → `# Formato de salida` (`## Componente generado` con archivos y paths, `## Decisiones de diseño`, `## Cómo se usa el componente`).

### `ng-review`
- **Rol**: Audita uno o varios componentes contra `ng-best-practices.md` y el perfil del stack. Objetivo medible: produce un artefacto de review con cada hallazgo en `archivo:línea` + categoría (1–9) + severidad (alta/media/baja), y un veredicto de tamaño (arreglo chico → aplicar directo / grande → derivar a `ng-change`).
- **Trigger**: `/ng:review`, "revisá este componente", "auditá los componentes de X", cuando `ng-router` deriva la auditoría.
- **Tools**: Read, Glob, Grep, Write.
- **Model**: sonnet.
- **Knowledge**: `ng-best-practices.md`, `ng-stack-profile.md`.
- **Estructura del cuerpo**: `# Rol` (objetivo medible) → `# Cuándo se te invoca` → `# Proceso` fijo (1. leer ambos knowledge; fallar si faltan; 2. resolver el scope — archivos o glob pasados; 3. leer cada componente; 4. evaluar cada categoría 1–9 como binario; 5. registrar hallazgos con `archivo:línea` + categoría + severidad; declarar excepciones por consistencia; 6. clasificar tamaño del arreglo; 7. escribir el artefacto de review en el path indicado) → `# Restricciones` (NO modifica código; NO inventa hallazgos sin `archivo:línea`; NO omite excepciones — las declara; NO mezcla severidades) → `# Formato de salida` (`## Resumen` con conteo por severidad, `## Hallazgos` por componente, `## Veredicto` chico/grande, `## Próximo paso` aplicar directo o `/ng:change`).

### `ng-sync`
- **Rol**: Sincroniza `ng-best-practices.md` con la documentación oficial de angular.dev. Recorre las URLs canónicas, detecta prácticas nuevas o cambiadas respecto de la fecha de extracción del knowledge, propone el diff al knowledge y reporta qué componentes del proyecto quedaron desalineados con la versión nueva. Objetivo medible: produce un reporte con (a) prácticas nuevas/cambiadas con su URL fuente y diff propuesto, (b) lista de componentes desalineados con `archivo:línea`, (c) fecha de extracción sugerida.
- **Trigger**: `/ng:sync`, "sincronizá las buenas prácticas de Angular", "salió Angular vN, actualizá el knowledge", revisión periódica del knowledge.
- **Tools**: Read, Write, Glob, Grep, WebFetch, WebSearch.
- **Model**: opus.
- **Knowledge**: `ng-best-practices.md` (su input principal — la tabla de URLs es su entrada), `ng-stack-profile.md`.
- **Proceso**: **dinámico (ReAct)** — la exploración web no tiene pasos predecibles. Objetivo + condición de parada: leer el knowledge y su tabla de URLs; recorrer cada URL con `WebFetch` (y `WebSearch` para roadmap/novedades de versión); comparar cada práctica contra el knowledge; antes de cada fetch, explicar en una línea qué busca; terminar cuando recorrió todas las URLs canónicas y comparó todas las prácticas. Lo no verificable se marca "No determinado". Tras la comparación, hacer `Glob`/`Grep` sobre el repo para detectar componentes desalineados con las prácticas cambiadas. Proponer el diff al knowledge (no aplicarlo sin confirmar).
- **Estructura del cuerpo**: `# Rol` (objetivo medible) → `# Cuándo se te invoca` → `# Proceso` (dinámico, como arriba) → `# Restricciones` (NO edita componentes; NO aplica cambios al knowledge sin mostrar el diff y confirmar; NO inventa prácticas — toda afirmación con URL fuente; es la única pieza con web — el resto del grupo no accede a Internet) → `# Formato de salida` (`## Prácticas nuevas/cambiadas` con URL + diff, `## Componentes desalineados` con `archivo:línea`, `## Diff propuesto al knowledge`, `## Fecha de extracción sugerida`).

---

## Skill a crear

> **Extensión del formato canónico**: `as-blueprint-patterns.md` no incluye "Skills a crear". Se agrega porque `ng-change` es una transformación determinística sobre un input ya producido, que encaja mejor como skill (mismo criterio que `backlog.md` con su skill `bl-backlog`). El scaffolder crea el `SKILL.md` con Write.

### `ng-change`
- **Archivo**: `.claude/skills/ng-change/SKILL.md`
- **Invocación**: `/ng:change`; auto-invocable por su `name`. Toma un review (de `ng-review`) y lo transforma en un único Markdown autocontenido.
- **Frontmatter**:
  ```yaml
  ---
  name: ng-change
  description: Convierte un review grande de componentes Angular en un único archivo Markdown autocontenido (propuesta de cambios + diseño + tareas), implementable por cualquier agente sin contexto adicional. Sin dependencias de herramientas externas. Invocado por /ng:change o por intención.
  allowed-tools: Read, Write, Glob
  metadata:
    family: ng
    version: "1.0"
  ---
  ```
- **Precondición**: el input es un artefacto de review existente (path pasado como argumento) o el contenido de un review en contexto. Si no hay review, pedirlo o sugerir correr `/ng:review` primero.
- **Operación**: leer el review; transcribir el contexto necesario (no referenciar "ver el review" — el archivo es autocontenido); estructurar la salida en **tres secciones canónicas**:
  1. **Propuesta de cambios** — qué se cambia y por qué, derivado de los hallazgos del review (con su severidad).
  2. **Diseño** — cómo queda el componente (estado en signals, control flow, OnPush/zoneless, a11y), con el detalle suficiente para implementar sin adivinar.
  3. **Tareas** — checklist de pasos concretos (`- [ ]`), cada uno accionable y verificable, en orden de implementación.
  Escribir **un solo archivo Markdown** en el path indicado por el invocador (default: junto al review o al componente).
- **Guardrails**: cero referencias a herramientas externas (OpenSpec u otras); cero imports/formatos propietarios; un solo archivo de salida; no modifica el review original ni el código; el archivo resultante es legible y ejecutable por sí mismo.

---

## Settings requeridos

```json
{
  "permissions": {
    "allow": [
      "WebFetch",
      "WebSearch"
    ]
  }
}
```

> `WebFetch`/`WebSearch` los usa **solo** `ng-sync` (la única pieza con acceso a Internet). El resto del grupo (`ng-router`, `ng-component`, `ng-review`, `ng-change`) trabaja leyendo y escribiendo archivos con sus tools nativas (`Read`, `Write`, `Edit`, `Glob`, `Grep`), que no requieren permisos adicionales — por eso no se declara ningún permiso de `Bash`. Si más adelante querés que `ng-component` corra `ng lint`/`eslint` sobre el componente generado, agregá `Bash` a sus tools en el agente y los permisos `Bash(ng lint *)` / `Bash(npx eslint *)` acá; mientras no exista esa tool, esos permisos serían inertes.

---

## Knowledge a crear

### `ng-best-practices.md`
- **Ruta**: `.claude/knowledge/ng-best-practices.md`
- **Origen**: contenido **embebido abajo, verbatim** (extraído de angular.dev, v22, fecha de extracción 2026-06-07). El scaffolder escribe exactamente este bloque a `.claude/knowledge/ng-best-practices.md` — no lo reinventa de memoria ni lo resume. Es la única fuente de verdad de las buenas prácticas y la base de `ng-sync`; conservá intacta la tabla de URLs canónicas y la fecha de extracción (que `ng-sync` actualiza).

> Nota sobre fechas: la **`fecha de extracción`** del knowledge (2026-06-07) es independiente del campo `updated` del frontmatter del blueprint. `ng-sync` la usa como línea base para detectar drift contra angular.dev, no como fecha de modificación del blueprint.

**Contenido a escribir (verbatim):**

````markdown
# Buenas prácticas de componentes Angular — extraídas de angular.dev

> **Fuente**: documentación oficial de Angular (angular.dev). **Versión de referencia**: Angular v22
> (válido para v20+). **Fecha de extracción**: 2026-06-07.
>
> Este archivo es el **knowledge base** que alimenta al grupo de agentes `ng-*`.
> Cada práctica lleva la URL fuente para trazabilidad y para que el agente de sincronización
> (`ng-sync`) pueda re-verificarla cuando Angular publique versiones nuevas.

---

## Lista de URLs canónicas vigiladas

El agente de sincronización recorre estas URLs para detectar prácticas nuevas o cambiadas:

| # | Tema | URL |
|---|------|-----|
| 1 | Style guide | https://angular.dev/style-guide |
| 2 | Componentes (authoring) | https://angular.dev/guide/components |
| 3 | Signals | https://angular.dev/guide/signals |
| 4 | Control flow en templates | https://angular.dev/guide/templates/control-flow |
| 5 | Zoneless | https://angular.dev/guide/zoneless |
| 6 | Runtime performance | https://angular.dev/best-practices/runtime-performance |
| 7 | Skipping subtrees (OnPush) | https://angular.dev/best-practices/skipping-subtrees |
| 8 | Zone pollution | https://angular.dev/best-practices/zone-pollution |
| 9 | Slow computations | https://angular.dev/best-practices/slow-computations |
| 10 | Security | https://angular.dev/best-practices/security |
| 11 | Accessibility (a11y) | https://angular.dev/best-practices/a11y |
| 12 | Server-side rendering | https://angular.dev/best-practices/performance/ssr |

> Roadmap y novedades de versión: https://angular.dev/roadmap y https://blog.angular.dev/.

---

## 1. Naming y organización de archivos
_Fuente: https://angular.dev/style-guide_

- Separar palabras en nombres de archivo con guiones: `user-profile.ts`.
- El nombre del archivo refleja la clase/componente principal que contiene.
- TS, template y estilos del componente comparten el mismo nombre base.
- Tests terminan en `.spec.ts`.
- Agrupar archivos estrechamente relacionados en el mismo directorio (componente + template + test juntos).
- Organizar por **áreas de feature**, no por tipo de código (evitar carpetas `components/`, `directives/`, `services/`).
- Un concepto por archivo; dividir cuando un directorio se vuelve inmanejable.
- Todo el código de UI vive bajo `src/`; bootstrap en `src/main.ts`.

## 2. Autoría de componentes
_Fuente: https://angular.dev/guide/components y https://angular.dev/style-guide_

- **Standalone por defecto** (default desde v19+): agregar dependencias directo al array `imports`; cero `NgModule` en código nuevo.
- Todo componente tiene: clase TS con comportamiento, template HTML y un selector CSS.
- Separar template y estilos en archivos (`templateUrl` / `styleUrl`) para claridad.
- Selector con prefijo específico de la app; selectores de atributo en camelCase.
- Agrupar miembros Angular (inputs, outputs, queries, dependencias inyectadas) **antes** de los métodos.
- `protected` para miembros usados solo por el template; `readonly` para lo que Angular setea (`input`, `model`, `output`, queries).
- Nombrar event handlers por la **acción** que realizan, no por el evento: `saveUserData()`, no `handleClick()`.
- Mantener lifecycle hooks simples; extraer la lógica a métodos auxiliares bien nombrados.
- Implementar las interfaces de lifecycle (`OnInit`, etc.) para garantizar nombres correctos.
- Mantener el componente enfocado en presentación; sacar validaciones/transformaciones complejas afuera.
- Evitar lógica compleja en templates; usar `computed()` para complejidad moderada.

## 3. Inyección de dependencias y sintaxis moderna
_Fuente: https://angular.dev/style-guide_

- Preferir la función `inject()` sobre inyección por parámetros de constructor.
- Preferir bindings directos `[class]` y `[style]` sobre `NgClass` / `NgStyle` (legibilidad y performance).
- Ante conflicto de reglas con el estilo de un archivo existente, priorizar la **consistencia** dentro del archivo.

## 4. Signals (modelo reactivo por defecto)
_Fuente: https://angular.dev/guide/signals_

- Estado mutable con `signal(initialValue)`; leer con el getter `miSignal()`.
- Preferir `.update(v => ...)` para cambios derivados; `.set()` para asignación directa.
- Exponer estado de solo lectura con `.asReadonly()`.
- Igualdad custom con `{ equal: isEqual }` para evitar actualizaciones innecesarias.
- Estado derivado con `computed()`: lazy, memoizado, seguro para operaciones costosas (filtros, etc.).
- Un `computed` **no es escribible** (`.set()` da error de compilación).
- Solo se trackean las signals **realmente leídas** durante la derivación (lecturas condicionales optimizan dependencias).
- `untracked()` para leer una signal sin crear dependencia.
- El contexto reactivo se pierde tras un `await`: leer las signals **antes** de la llamada async.
- `effect()` **solo** para sincronizar con APIs externas no reactivas. **No** usar `effect()` para derivar estado: usar `computed()` o `linkedSignal()`.
- `linkedSignal()` para estado escribible derivado de otras signals.
- `resource()` / `rxResource()` para datos async integrados a signals con acceso síncrono.
- **Signal inputs**: `input()` / `input.required()` para props reactivas.
- `model()` para two-way binding; `output()` para emitir eventos.
- **Signal queries**: `viewChild()`, `viewChildren()`, `contentChild()`.
- Interop RxJS: convertir observables con `toSignal()` o `rxResource()` en el límite async.
- Helpers de runtime: `isSignal()`, `isWritableSignal()`.

## 5. Control flow en templates
_Fuente: https://angular.dev/guide/templates/control-flow_

- Usar control flow nativo `@if` / `@else if` / `@else`, `@for`, `@switch`; reemplazan a `*ngIf` / `*ngFor` (legacy) con mejor performance.
- `@if (cond; as value)` para guardar el resultado de la condición.
- **`@for` siempre con `track`**; trackear por identificador único (`id`/`uuid`), no por índice ni por referencia.
- `track $index` solo para colecciones estáticas; `track item` (referencia) provoca updates mucho más lentos.
- Variables de contexto en `@for`: `$count`, `$index`, `$first`, `$last`, `$even`, `$odd`; aliasar con `let` en loops anidados.
- `@empty` inmediatamente después del `@for` para colección vacía.
- `@switch` con comparación estricta (`===`), sin fallthrough; `@default` opcional; `@default never;` para chequeo exhaustivo de uniones.
- `@let` para variables locales en el template.

## 6. Performance en runtime
_Fuente: https://angular.dev/best-practices/runtime-performance, /skipping-subtrees, /zone-pollution, /slow-computations_

- `ChangeDetectionStrategy.OnPush` para saltar subárboles que no cambiaron.
- **Zoneless** como objetivo: elimina el overhead de Zone.js.
- Evitar **zone pollution**: no disparar operaciones async innecesarias que fuerzan change detection.
- `@defer` con triggers explícitos para cargar secciones del template solo cuando se necesitan.
- `NgOptimizedImage` (`<img ngSrc>`) para imágenes; `width`/`height` y `priority` en la imagen LCP.
- Evitar expresiones pesadas en templates (se recalculan en cada ciclo de CD); mover a `computed()`.
- Identificar y refactorizar **slow computations**.
- Medir con Angular DevTools / Chrome DevTools antes y después de optimizar.

## 7. Seguridad
_Fuente: https://angular.dev/best-practices/security_

- Angular trata todos los valores como **no confiables** por defecto y los sanitiza al insertarlos en el DOM.
- La interpolación escapa automáticamente; no interpreta HTML.
- Bindear datos del usuario a `innerHTML` es riesgo de XSS sin sanitización.
- `DomSanitizer.sanitize()` con el `SecurityContext` correcto para manipulación directa del DOM.
- `bypassSecurityTrust*` solo tras inspección; construir el `SafeValue` lo más cerca posible del dato de entrada (auditoría más fácil).
- Compilador **AOT** por defecto: previene inyección en templates. Nunca generar templates concatenando input de usuario, ni en el servidor con un motor de plantillas.
- **CSP**: baseline `default-src 'self'`; `style-src`/`script-src` basados en nonce único por request (no predecible). Nonce vía `autoCsp`, atributo `ngCspNonce` o token `CSP_NONCE`.
- **Trusted Types** para reforzar a nivel DOM; configurar headers CSP en producción.
- **XSRF/CSRF**: `HttpClient` lee cookie `XSRF-TOKEN` y setea header `X-XSRF-TOKEN` en requests mutantes; configurable con `withXsrfConfiguration()`.
- **XSSI**: `HttpClient` quita el prefijo `")]}',\n"` de respuestas JSON (el server debe agregarlo).
- No usar APIs del DOM directamente (`document`, `ElementRef.nativeElement`) — no tienen sanitización automática; preferir templates.
- Mantener Angular actualizado (parches de seguridad); no usar forks privados; auditar usos de `bypassSecurityTrust*` en review.
- **SSRF** (SSR): validar con allowlist los headers `Host`/`X-Forwarded-*`; configurar `security.allowedHosts` en `angular.json`; evitar wildcard `*`.

## 8. Accesibilidad
_Fuente: https://angular.dev/best-practices/a11y_

- Reutilizar elementos nativos (`<button>`, `<a>`) antes que implementaciones custom.
- Usar content projection (componente contenedor) cuando hay que envolver un elemento nativo.
- ARIA dinámico con attribute binding: `[attr.role]`, `[aria-label]`; ARIA estático como atributo HTML normal.
- Angular CDK a11y: `LiveAnnouncer` (regiones `aria-live`), `cdkTrapFocus` para modales.
- Angular Aria (directivas headless): accordion, combobox, listbox, menu, tabs, toolbar con teclado y foco resueltos.
- Tras navegación, mover el foco al contenido principal (escuchando `NavigationEnd`).
- `RouterLinkActive` con `ariaCurrentWhenActive="page"` para indicar la ruta activa.
- Envolver bloques `@defer` en regiones `aria-live` para anunciar contenido cargado dinámicamente.
- Enforzar reglas de a11y con Angular ESLint (`@angular-eslint/template`).

## 9. Principios transversales de frontend (agnósticos de Angular)

- Composición sobre herencia; responsabilidad única; separación de incumbencias.
- Flujo de datos unidireccional; inmutabilidad de inputs (nunca mutar un input).
- Frontera clara entre lógica de dominio y UI (presentacionales puros, sin servicios de dominio).
- TypeScript estricto (`strict: true`), cero `any`.
- Nombres reveladores; DRY sin sobre-abstraer.
- Testing de comportamiento, no de implementación; queries por rol/label, no por selectores CSS.

---

## Cómo se usa este knowledge

- **`ng-component` (builder)**: genera componentes aplicando §1–§9.
- **`ng-review` (reviewer)**: audita cada componente contra §1–§9; cada ítem es verificable (sí/no).
- **`ng-sync` (sincronizador)**: recorre la *Lista de URLs canónicas vigiladas*, detecta prácticas
  nuevas/cambiadas respecto de este archivo (fecha de extracción), y reporta qué hay que actualizar
  acá y qué del código quedó desalineado con la versión nueva de Angular.
````

### `ng-stack-profile.md`
- **Ruta**: `.claude/knowledge/ng-stack-profile.md`
- **Contenido**: el **perfil variable del proyecto destino**, creado por el scaffolder con los campos vacíos y una nota: "Completar antes del primer uso de `/ng:component` y `/ng:review`". Campos:
  - `angular_version` — versión exacta del repo (ej. `22.0.1`).
  - `style_engine` — `scss` | `css` | `less` | `tailwind` (o combinación).
  - `test_framework` — `jest` | `vitest` | `karma` | `web-test-runner`.
  - `design_system` — `angular-material` | `cdk-only` | `primeng` | `custom` | `none` (+ path de primitivas si `custom`).
  - `selector_prefix` — prefijo de selectores de la app.
  - Notas condicionales: tokens/primitivas si `custom`, política de Tailwind si aplica.
- **Regla**: los agentes lo leen como primer paso; si falta un campo crítico, paran y lo piden.

---

## Rule a crear

### `ng-constraints.md`
- **Paths**: `.claude/agents/ng-*.md`, `.claude/skills/ng-change/**`, `.claude/commands/ng/**`, `.claude/knowledge/ng-*.md`.
- **Contenido**:
  - **Prefijo `ng-`**: todos los artefactos (agentes, skill, knowledge, rule) llevan el prefijo. Comandos: todos namespaced en `commands/ng/` — `/ng:ask` (router), `/ng:component`, `/ng:review`, `/ng:change`, `/ng:sync`.
  - **Leer el knowledge primero**: todo `ng-*` lee `ng-best-practices.md` y `ng-stack-profile.md` antes de operar; falla rápido si faltan.
  - **Knowledge como fuente única**: las buenas prácticas no se reinventan de memoria; viven en `ng-best-practices.md` con su URL. Solo `ng-sync` lo modifica, y solo tras mostrar el diff.
  - **Web solo en `ng-sync`**: es la única pieza con `WebFetch`/`WebSearch`. Ningún otro `ng-*` accede a Internet.
  - **Sin dependencias externas**: el grupo no conoce OpenSpec ni ninguna herramienta de terceros. El artefacto de cambio es Markdown autocontenido, sin imports ni formatos propietarios.
  - **Artefacto de cambio = un solo archivo**: `ng-change` produce un único Markdown con propuesta + diseño + tareas, implementable sin contexto adicional.
  - **Crear y revisar con el mismo rasero**: lo que `ng-review` marcaría como hallazgo, `ng-component` no lo produce.
  - **Scope de escritura**: `ng-component` escribe solo el entorno del componente; `ng-review`/`ng-change` el artefacto en el path indicado; `ng-sync` solo el knowledge `ng-best-practices.md`. Ningún `ng-*` toca configuración global del proyecto sin pedido explícito.
  - **Angular moderno es el estándar**: standalone, signals-first, control flow nativo, OnPush/zoneless, `inject()`, TS estricto. Legacy es hallazgo, no preferencia.

---

## Comandos a crear

> **Convención**: todas las piezas del grupo viven en `.claude/commands/ng/<verbo>.md` y Claude Code las expone namespaced como `/ng:<verbo>`, **incluido el router** (`/ng:ask`). No hay comando pelado `/ng` en la raíz de `commands/`. Cada comando es un wrapper fino que delega en el agente o skill con `$ARGUMENTS`, en el estilo minimalista del ecosistema.

### `/ng:ask` (router)
- **Archivo**: `.claude/commands/ng/ask.md`
```markdown
Usá el sub-agent `ng-router` para clasificar el pedido (crear / revisar / proponer cambio / sincronizar) y derivar a la pieza correcta (ng-component / ng-review / ng-change / ng-sync), o resolverlo si es trivial.

$ARGUMENTS
```

### `/ng:component`
- **Archivo**: `.claude/commands/ng/component.md`
```markdown
Usá el sub-agent `ng-component` para generar un componente Angular moderno (standalone, OnPush, signals, control flow nativo, a11y, test) aplicando `ng-best-practices.md` y adaptándose a `ng-stack-profile.md`.

$ARGUMENTS
```

### `/ng:review`
- **Archivo**: `.claude/commands/ng/review.md`
```markdown
Usá el sub-agent `ng-review` para auditar los componentes pasados contra `ng-best-practices.md`. Produce un artefacto de review con hallazgos (archivo:línea + categoría + severidad) y un veredicto de tamaño.

$ARGUMENTS
```

### `/ng:change`
- **Archivo**: `.claude/commands/ng/change.md`
```markdown
Usá la skill `ng-change` para transformar un review existente en un único archivo Markdown autocontenido (propuesta de cambios + diseño + tareas), implementable sin contexto adicional.

$ARGUMENTS
```

### `/ng:sync`
- **Archivo**: `.claude/commands/ng/sync.md`
```markdown
Usá el sub-agent `ng-sync` para recorrer las URLs canónicas de `ng-best-practices.md`, detectar prácticas nuevas o cambiadas vs. la fecha de extracción, proponer el diff al knowledge y listar componentes desalineados. Es la única pieza con acceso web.

$ARGUMENTS
```

---

## CLAUDE.md a generar

El scaffolder agrega al `CLAUDE.md` del repo Angular (sin pisar lo existente) una sección "Componentes Angular (familia `ng-`)" con:

- **Qué es**: grupo `ng-*` para asegurar la calidad de componentes Angular sobre el proyecto existente — crear, revisar, proponer cambio grande, y mantener las buenas prácticas al día.
- **Perfil del stack**: el comportamiento se adapta a `.claude/knowledge/ng-stack-profile.md` (versión de Angular, motor de estilos, framework de testing, design system, prefijo de selector). **Completarlo antes del primer uso.**
- **Knowledge vivo**: las buenas prácticas viven en `.claude/knowledge/ng-best-practices.md` (extraídas de angular.dev, con su tabla de URLs fuente). `/ng:sync` las mantiene al día.
- Tabla de comandos:

  | Comando | Qué hace |
  |---|---|
  | `/ng:ask` | Clasifica la intención y deriva a la pieza correcta |
  | `/ng:component <nombre>` | Genera un componente moderno (standalone, OnPush, signals, control flow nativo, a11y, test) |
  | `/ng:review <archivo\|glob>` | Audita componentes; hallazgos con `archivo:línea` y severidad |
  | `/ng:change <review>` | Convierte un review grande en un único Markdown autocontenido (propuesta + diseño + tareas) |
  | `/ng:sync` | Sincroniza el knowledge con angular.dev y reporta componentes desalineados |

- **Flujo**: `/ng:component` para crear → `/ng:review` para auditar → si el arreglo es chico, aplicar directo; si es grande, `/ng:change` produce el artefacto autocontenido → periódicamente, `/ng:sync` mantiene el knowledge al día.
- **Convenciones críticas (máx 5)**:
  - Angular moderno es el estándar (standalone, signals-first, control flow nativo, OnPush/zoneless); legacy es hallazgo.
  - El knowledge `ng-best-practices.md` es la única fuente de verdad; solo `ng-sync` lo modifica.
  - `ng-sync` es la única pieza con acceso web.
  - El artefacto de cambio es un solo Markdown autocontenido, sin dependencias externas.
  - Los agentes leen `ng-stack-profile.md` primero; sin él, paran.
