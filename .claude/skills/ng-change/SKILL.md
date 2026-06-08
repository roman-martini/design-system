---
name: ng-change
description: Convierte un review grande de componentes Angular en un único archivo Markdown autocontenido (propuesta de cambios + diseño + tareas), implementable por cualquier agente sin contexto adicional. Sin dependencias de herramientas externas. Invocado por /ng:change o por intención.
allowed-tools: Read, Write, Glob
metadata:
  family: ng
  version: "1.0"
---

# ng-change

Transformación determinística: tomás un **review existente** (producido por `ng-review`) y lo convertís en **un solo archivo Markdown autocontenido** que cualquier agente puede implementar sin más contexto.

## Precondición

El input es un artefacto de review existente: un **path pasado como argumento** o el **contenido de un review en contexto**. Si no hay review disponible, pedilo o sugerí correr `/ng:review` primero. No inventes hallazgos: trabajás sobre lo que el review ya estableció.

## Operación

1. **Leer el review** (del path o del contexto).
2. **Transcribir el contexto necesario** al artefacto: no referencies "ver el review" — el archivo de salida es autocontenido. Lo que haga falta para implementar, se copia.
3. **Estructurar la salida en tres secciones canónicas**, en este orden:
   1. **Propuesta de cambios** — qué se cambia y por qué, derivado de los hallazgos del review (con su severidad).
   2. **Diseño** — cómo queda el componente: estado en signals, control flow nativo, `OnPush`/zoneless, a11y, con el detalle suficiente para implementar sin adivinar.
   3. **Tareas** — checklist de pasos concretos (`- [ ]`), cada uno accionable y verificable, en orden de implementación.
4. **Escribir un solo archivo Markdown** en el path indicado por el invocador (default: junto al review o al componente).

## Guardrails

- **Un solo archivo de salida.** Nada de múltiples documentos.
- **Cero referencias a herramientas externas** (OpenSpec u otras); cero imports o formatos propietarios. Es Markdown plano, portable y autocontenido.
- **No modificás** el review original ni el código.
- **Sin `TODO:` sin resolver** ni "ver el review": el contexto necesario se transcribe. El archivo resultante es legible y ejecutable por sí mismo.

## Formato del artefacto

```markdown
# Cambio: <nombre del componente o conjunto>

## Propuesta de cambios
<qué se cambia y por qué, por hallazgo, con su severidad>

## Diseño
<cómo queda: signals, control flow, OnPush/zoneless, a11y — detalle suficiente para implementar>

## Tareas
- [ ] <paso concreto, accionable y verificable>
- [ ] <...>
```