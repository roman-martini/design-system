---
name: backlog-auto
description: Ejecuta en automático los items Now del backlog operativo (docs/backlog/BACKLOG.md), respetando los límites de decisión del PO. Use when the user wants to work through the backlog autonomously ("/ds:auto", "trabajá el backlog", "ejecutá el backlog automático", "avanzá con lo que está listo").
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "1.0"
---

# backlog-auto

Recorre la sección **Now** de `docs/backlog/BACKLOG.md` y ejecuta cada item de punta a punta (OpenSpec o commit directo según su tipo), sin pedir indicaciones por trabajo que el repo ya define. El principio rector: **automatizar la ejecución, nunca las decisiones del PO**.

**Esta skill corre siempre en la sesión principal, nunca en un sub-agent**: necesita invocar otras skills (`opsx:*`) e interactuar con el usuario según la configuración.

---

## Configuración (argumentos de invocación)

Dos parámetros, ambos opcionales:

| Parámetro | Valores | Default | Efecto |
|---|---|---|---|
| `commit` | `ask` \| `auto` \| `none` | `ask` | `ask`: al cerrar cada item muestra el mensaje de commit propuesto y espera OK explícito. `auto`: commitea sin preguntar siguiendo las convenciones del repo y reporta todo al final. `none`: no commitea nada; deja los cambios en el working tree. |
| `decisiones` | `defer` \| `inline` | `defer` | `defer`: item que requiere una decisión del PO se saltea; las decisiones se acumulan y se presentan juntas en el reporte final. `inline`: la corrida se frena y pregunta en el momento (AskUserQuestion); con respuesta, el item continúa. |

Ejemplos: `/ds:auto` (ask + defer), `/ds:auto commit=auto`, `/ds:auto commit=none decisiones=inline`.

**Restricción de `commit=none`**: en este modo se procesa **un solo item** (el primero de la cola). Mezclar varios items sin commitear en el mismo working tree impide revisarlos y commitearlos por separado.

Al arrancar, anunciar en una línea la configuración efectiva de la corrida.

---

## Workflow

### 1. Precondiciones

- `git status --short` → si el working tree tiene cambios sin commitear, **parar y reportar**: no se mezcla trabajo en curso con una corrida automática. Ofrecer opciones (commitear/stashear primero) y terminar.
- Leer en paralelo:
  - `docs/backlog/BACKLOG.md` → cola Now (y títulos de Next para el paso 5).
  - `openspec/README.md` → próximo ID de change disponible.
  - `openspec/changes/` (directorios ≠ `archive/`) → changes activos.
  - `git log --oneline -10` → contexto reciente.

### 2. Construir la cola de ejecución

Solo items de **§ Now**. Reglas:

- Respetar el **orden sugerido** si algún item lo declara; si no, orden de aparición en el archivo.
- Item con **"Bloqueado por"** no resuelto → se saltea y se reporta.
- **Verificar vigencia antes de ejecutar**: si el entregable del item ya existe en el repo (ej. la skill ya fue creada, el componente ya está), el item no se ejecuta — se marca como *cerrado pendiente de grooming* y se propone su eliminación del backlog en el reporte.
- Item cuyo alcance declara **"Decisiones pendientes"** → tratamiento según `decisiones` (paso 3.1).

Si la cola queda vacía, reportarlo y pasar directo al paso 5.

### 3. Ejecutar cada item

#### 3.1 Compuerta de decisiones

Antes de tocar código, evaluar si el item exige una elección que es del PO: decisiones de producto (D-XXX), elecciones one-way door o entre alternativas con trade-offs reales (material de ADR), publicar, gastar dinero, o cualquier "Decisiones pendientes" listada en el item.

- `decisiones=defer` → saltear el item, registrar la pregunta concreta con sus opciones para el reporte final, seguir con el próximo.
- `decisiones=inline` → frenar y preguntar con AskUserQuestion (opciones evaluadas con pros/contras y recomendación, como manda CLAUDE.md). Con respuesta, continuar el item.

Si la decisión **emerge a mitad de un item** (no estaba declarada), aplicar la misma regla; con `defer`, revertir lo avanzado de ese item para no dejar trabajo a medias.

#### 3.2 Ejecución según tipo

- **Tipo OpenSpec** → flujo completo con las skills `opsx:*`: propose → apply → verify → archive. El ID sale de `openspec/README.md`. Respetar el patrón establecido de 2 commits por change (implementación + archive).
- **Tipo commit directo** (tooling/docs/housekeeping) → implementar directo siguiendo CLAUDE.md, los ADRs aceptados y las convenciones del área (ej. commands `/ds:*` = wrapper thin + skill rica, actualizar el README de commands).

#### 3.3 Gates de calidad (no negociables)

Un item no se considera cerrado hasta que:

- Build, tests y lint del área afectada pasan (`pnpm -F <pkg> build/test`, `pnpm lint`).
- Si afecta una lib publicable, tiene su changeset.
- La documentación que el propio item exige está actualizada.

Si un gate falla y no se resuelve razonablemente, el item queda abierto, se revierte o aísla lo hecho, y se reporta con el detalle del fallo.

#### 3.4 Commit según modo

- `ask` → mostrar el mensaje propuesto (Conventional Commits, subject + cuerpo ≤10 líneas + Refs) y **esperar OK explícito** antes de commitear y seguir.
- `auto` → commitear directo con las mismas convenciones. Stagear **solo los archivos del item** (nunca `git add -A`).
- `none` → no commitear; describir en el reporte qué archivos quedaron y qué mensaje corresponde.

#### 3.5 Grooming post-item

Al cerrar cada item (en OpenSpec, como parte del archive): eliminarlo de `BACKLOG.md`, reevaluar disparadores de Next/Later, actualizar catálogo de changes y `openspec/README.md` si corresponde. El grooming forma parte del commit del item (o del commit de archive).

### 4. Límites duros (independientes de la configuración)

- **Nunca** ejecutar items de Next/Later: esperan disparador o decisión del PO por definición.
- **Nunca** decidir producto (D-XXX), publicar en npm, hacer `git push`, ni gastar dinero.
- **Nunca** tomar decisiones one-way door: se difieren o preguntan; si ameritan ADR, se propone el ADR, no se decide en silencio.
- **Nunca** modificar ADRs aceptados.
- **Nunca** inventar items: solo se ejecuta lo que está escrito en § Now.

### 5. Reporte final

Estructura fija:

```markdown
## Corrida /ds:auto — <YYYY-MM-DD> (commit=<modo>, decisiones=<modo>)

### Completados
- <item> — <qué se hizo>, commits: <shas o "propuesto, esperando OK" o "sin commitear">

### Salteados
- <item> — <motivo: bloqueado / decisión pendiente / gate fallido / ya resuelto (grooming)>

### Decisiones que te esperan
- <pregunta concreta con opciones y recomendación> (una por decisión diferida)

### Disparadores de Next posiblemente activados
- <item de Next cuyo disparador parece cumplido, con la evidencia> — no ejecutado, solo se propone promoverlo

### Estado del backlog
<qué queda en Now tras la corrida>
```

Omitir secciones vacías. Si todo Now se completó, decirlo explícitamente.

---

## Restricciones

- Nunca ejecutar en sub-agent (pierde acceso a skills `opsx:*` y a la interacción con el usuario).
- El working tree debe estar limpio al arrancar; la skill no trabaja sobre cambios ajenos a la corrida.
- Las reglas de commit del repo (mensaje corto, sin `Co-Authored-By`, español) aplican en todos los modos.
- Esta skill no reemplaza el grooming manual ni las decisiones de producto: los reporta, no los resuelve.
