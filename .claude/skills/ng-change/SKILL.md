---
name: ng-change
description: Convierte un review grande de componentes Angular en un único archivo Markdown autocontenido (propuesta de cambios + diseño + tareas), implementable por cualquier agente sin contexto adicional. Sin dependencias de herramientas externas. Invocado por /ng:change o por intención.
disable-model-invocation: false  # requiere razonar: derivar diseño, transcribir contexto, ordenar tareas
allowed-tools: Read, Write, Glob
metadata:
  family: ng
  version: "1.0"
---

# ng-change

Transformás un review de `ng-review` en **un único Markdown autocontenido** que cualquier agente puede implementar sin más contexto. Es una transformación determinística con estructura fija: review → un archivo con tres secciones canónicas.

## Precondición

El input es un artefacto de review existente (path en `$ARGUMENTS`/`$1`) o el contenido de un review presente en el contexto. **Si no hay ninguno de los dos, pará y pedí el path del review; si el usuario no tiene uno, sugerile correr `/ng:review` primero.** No inventes hallazgos ni completes un review faltante: el único insumo válido es un review existente.

## Operación

1. **Leer el review** (path del argumento o contenido en contexto).
2. **Leer el perfil del stack** (`.claude/knowledge/ng-stack-profile.md`) para describir el diseño en la sintaxis correcta (estilos, test, design system). Si falta, no bloquees: derivá el stack del review y marcá los supuestos como "según el review".
3. **Transcribir el contexto necesario.** El archivo de salida es autocontenido: nunca escribas "ver el review" — copiá el contexto que haga falta (hallazgos relevantes, `archivo:línea`, severidad).
4. **Estructurar la salida en tres secciones canónicas:**
   1. **Propuesta de cambios** — qué se cambia y por qué, derivado de los hallazgos del review (con su severidad).
   2. **Diseño** — cómo queda el componente: estado en signals, control flow nativo, OnPush/zoneless, a11y, sintaxis de estilos y test según el perfil. Con el detalle suficiente para implementar sin adivinar.
   3. **Tareas** — checklist de pasos concretos (`- [ ]`), cada uno accionable y verificable, en orden de implementación.
5. **Escribir un solo archivo Markdown** en el path indicado por el invocador (default: junto al review o al componente).

## Estructura del archivo de salida

```markdown
# Cambio: <título del componente o feature>

## Propuesta de cambios
<qué se cambia y por qué — derivado de los hallazgos del review, con severidad>

## Diseño
<cómo queda el componente: estado en signals, control flow nativo, OnPush/zoneless, a11y, sintaxis de estilos y test según el stack — detalle suficiente para implementar sin adivinar>

## Tareas
- [ ] <paso concreto, accionable y verificable>
- [ ] <...en orden de implementación>
```

## Argumentos

- `$ARGUMENTS` / `$1` — path al artefacto de review a transformar (lo pasa `/ng:change <review>`). Si está vacío, usá el review presente en el contexto de la conversación.
- Path de salida — opcional (`$2`); si no se pasa, escribí junto al review (mismo directorio) o, si no hay path de review, junto al componente auditado.

## Guardrails

- **Cero referencias a herramientas externas** (OpenSpec u otras); cero imports o formatos propietarios.
- **Un solo archivo de salida**, en Markdown plano.
- **No modifica** el review original ni el código.
- El archivo resultante es **legible y ejecutable por sí mismo**: un agente lo implementa sin leer nada más (sin `TODO:` sin resolver, sin "ver el review").

## Checklist de auto-revisión

- [ ] El input fue un review existente; el output es **un solo** archivo Markdown
- [ ] Tiene las 3 secciones: propuesta, diseño, tareas
- [ ] Es autocontenido: un agente lo implementa sin leer nada más
- [ ] Cero referencias a herramientas externas; cero imports/formatos propietarios
