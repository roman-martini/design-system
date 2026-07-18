---
name: session-handoff
description: Guarda el estado de la sesión actual en un archivo de handoff antes de un /clear, o retoma el trabajo leyéndolo después. Use when the user wants to clear the session but continue working later ("guardá el estado", "voy a hacer /clear", "/ds:handoff") or to resume from a saved handoff ("/ds:resume", "retomemos donde quedamos").
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "1.0"
---

# session-handoff

Permite limpiar la sesión (`/clear`) sin perder el hilo de trabajo. Dos modos:

- **`save`** — sintetiza el estado de la sesión actual y lo escribe en `.claude/session-handoff.md` (gitignored, efímero, se sobrescribe en cada save).
- **`resume`** — lee ese archivo, verifica que el repo no cambió por fuera, y retoma el trabajo.

El primer argumento indica el modo. Sin argumento → `save`.

**Esta skill corre siempre en la sesión principal, nunca en un sub-agent.** El valor del modo `save` es capturar contexto que solo existe en la conversación (decisiones, pausas, reglas acordadas); un sub-agent no lo tiene.

---

## Modo `save`

### 1. Recolectar estado verificable del repo

Ejecutar y leer (en paralelo lo que se pueda):

- `git log --oneline -10` y `git status --short` → HEAD, últimos movimientos, working tree limpio o no.
- `openspec/changes/` (directorios ≠ `archive/`) → changes activos y su estado.
- `openspec/README.md` → próximo ID de change disponible.
- `docs/backlog/BACKLOG.md` → secciones Now / Next (solo los títulos con su disparador, no el detalle).
- `.changeset/*.md` → changesets acumulados sin publicar.

### 2. Sintetizar contexto de la sesión (lo que el repo NO registra)

Repasar la conversación actual y extraer:

- **Decisiones del usuario** tomadas en la sesión que no quedaron escritas en ningún artefacto (ej. "aaa-012 en pausa, no retomarlo salvo pedido explícito").
- **Reglas de trabajo acordadas** en sesión que complementan CLAUDE.md y las memorias (staging, flujo de commits, archivos que no se tocan).
- **Trabajo a medias**: si hay algo empezado y sin commitear, describir exactamente en qué punto quedó.

Si la sesión fue corta o puramente de lectura, esta sección puede quedar vacía — no inventar contexto.

### 3. Definir el punto de arranque

Si el usuario pasó argumentos después del modo (ej. `/ds:handoff empezar por HU-003`), usarlos como "EMPEZÁ POR". Si no, proponerle 1-2 opciones concretas derivadas del backlog y preguntarle, o —si no responde o pidió no ser interrumpido— dejar `[decidir al retomar]`.

### 4. Escribir `.claude/session-handoff.md`

Sobrescribir el archivo con esta plantilla (adaptar contenido, no estructura):

```markdown
# Handoff de sesión — <YYYY-MM-DD>

Retomamos el repo design-system (design system @romanmartinidev).

## CONTEXTO RÁPIDO — leé primero, en este orden
1. docs/backlog/BACKLOG.md   → cola operativa Now/Next/Later
2. docs/product/README.md    → producto: épicas, HUs, decisiones D-XXX
3. openspec/README.md        → próximo ID de change disponible
4. git log --oneline -10     → últimos movimientos

## ESTADO AL CIERRE (<fecha>, HEAD <sha corto>, working tree <limpio|sucio: detalle>)
- <estado del kit: componentes, tests>
- <changes archivados / activos / en pausa>
- <ADRs, próximo ID de change>
- <changesets pendientes>

## DECISIONES Y CONTEXTO DE LA SESIÓN (no está en el repo)
- <decisión o pausa dictada por el usuario, con su condición de reactivación>
- <trabajo a medias y punto exacto donde quedó>
(omitir la sección si no hay nada)

## BACKLOG § NOW
- <ítems listos para arrancar, con disparador>

## § NEXT (esperan decisión del usuario)
- <ítems>

## REGLAS DE TRABAJO (además de CLAUDE.md y memorias)
- <solo reglas acordadas en sesión que no estén ya en CLAUDE.md/memoria>
(omitir la sección si no hay nada)

## EMPEZÁ POR
<instrucción concreta o "[decidir al retomar]">
```

Reglas de redacción:

- **Solo hechos verificados en el paso 1 o dichos por el usuario.** Nada de memoria de sesiones anteriores sin verificar.
- **No duplicar CLAUDE.md ni las memorias persistentes** — el handoff cubre el delta de esta sesión, no el contrato permanente del repo.
- Conciso: el archivo completo debería rondar 30-50 líneas.

### 5. Cerrar

Confirmarle al usuario en 2-3 líneas qué se guardó y recordarle el flujo:

> Handoff guardado en `.claude/session-handoff.md`. Podés hacer `/clear`; en la sesión nueva corré `/ds:resume` para retomar.

**No commitear el archivo** (está gitignored a propósito: es estado efímero, no documentación del repo).

---

## Modo `resume`

1. Leer `.claude/session-handoff.md`. Si no existe, decirlo y ofrecer reconstruir contexto desde las fuentes del "CONTEXTO RÁPIDO" directamente.
2. Verificar frescura: comparar el HEAD registrado con `git log --oneline -1` actual. Si difieren, avisar que el repo avanzó desde el handoff y revisar `git log` entre ambos puntos antes de confiar en el estado descripto.
3. Leer las fuentes del "CONTEXTO RÁPIDO" en el orden indicado.
4. Respetar las secciones "DECISIONES Y CONTEXTO DE LA SESIÓN" y "REGLAS DE TRABAJO" como instrucciones vigentes del usuario.
5. Arrancar por lo que diga "EMPEZÁ POR". Si dice `[decidir al retomar]`, proponer 1-2 opciones desde el § NOW y preguntar.

---

## Restricciones

- Nunca ejecutar en sub-agent (pierde el contexto conversacional que es la razón de ser del modo `save`).
- `save` no modifica nada fuera de `.claude/session-handoff.md`.
- `resume` no modifica nada: solo lee y retoma; el trabajo posterior sigue las reglas normales del repo.
- No usar el handoff como sustituto de artefactos formales: si en la sesión hubo una decisión arquitectónica, corresponde ADR/decisions-log, no solo handoff — marcarlo como pendiente si quedó sin registrar.
