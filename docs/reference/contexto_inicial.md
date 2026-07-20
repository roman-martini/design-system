# Contexto inicial del proyecto

> Pedido original del PO (2026-05-29) que dio origen a este repositorio. Es **material histórico no normativo**, conservado por trazabilidad (lo referencian [D-001](../product/decisiones.md) y [docs/product/README.md § Origen](../product/README.md)). Al moverlo a `docs/reference/` (2026-07-20) se corrigió redacción y formato sin alterar el contenido. Las convenciones vigentes viven en `CLAUDE.md` y `docs/architecture/`.

Este proyecto nace de otro repo donde investigo arquitecturas. Estaba investigando arquitecturas frontend y creció mucho — no solo la documentación: empecé a ponerla en práctica en una lib (`packages/tokens/`) y un proyecto de prueba (`angular-app/`), así que decidí abrir este proyecto.

Necesito ayuda para organizar y estructurar este repo, y para tomar algunas decisiones basadas en buenas prácticas, estándares y convenciones.

- Este proyecto lo voy a utilizar para desarrollar librerías.
- Las librerías solo van a tener alcance de arquitecturas frontend.
- La prioridad:
  1. Aplicar buenas prácticas.
  2. Aplicar diseños y arquitecturas que permitan escalar ordenado.
  3. Fácil de mantener: seguir estándares y convenciones para que se pueda entender.
- En la carpeta `docs/` traje unos archivos de otro repo donde investigo arquitecturas. Esa documentación **no** define la arquitectura de estas librerías ni las reglas y convenciones a seguir, pero sí es referencia para aplicar las buenas prácticas que allí se definen. También se utilizará como fuente de conocimiento para armar el archivo de arquitectura propio de cada lib, del proyecto en general, o de la decisión que se tome sobre cómo gestionar y mantener este proyecto. El archivo de arquitectura es importante porque será la fuente de la verdad con las convenciones que se deben seguir. Acá debemos analizar cuál es la mejor alternativa: uno general o uno por lib.

## Librerías actuales

- `packages/tokens`: un sistema de diseño que utiliza alguna de las arquitecturas descriptas en los archivos de documentación.
- `packages/components`: una librería de componentes Angular; estos componentes utilizarán la librería `packages/tokens`. La prioridad es siempre la misma:
  1. Aplicar buenas prácticas.
  2. Aplicar diseños y arquitecturas que permitan escalar ordenado.
  3. Fácil de mantener: seguir estándares y convenciones para que se pueda entender.

## Una app para probar los componentes

- Implementa los componentes de la lib `packages/components`. Se va a utilizar como laboratorio para probarlos y también para crear prototipos de casos de uso reales. La idea es que estos prototipos luego se puedan sacar e implementar en otro proyecto.
- Vamos a utilizar Angular.
- Actualmente tengo `/angular-app`, que lo traje del repo donde investigo arquitecturas. Vamos a rescatar de acá lo que nos sirva; si lo que tomamos no sigue buenas prácticas, lo refactorizamos.

## Herramientas

- Vamos a trabajar con OpenSpec. URL para contexto: <https://openspec.dev/>

Este es el contexto inicial. Probablemente me esté olvidando de muchas cosas, así que debés preguntarme cuando identifiques que estoy pasando algo por alto. Si estoy aplicando una mala práctica, debés hacérmelo saber y proponerme una alternativa que priorice buenas prácticas. La prioridad: aplicar buenas prácticas.
