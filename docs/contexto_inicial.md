# Contexto inicial

Este proyecto nace de otro repo donde investigo arquitecturas. Estaba investigando Arquitecturas Frontend y crecio mucho, no solo eso que empecé a ponerlo en practica en una libs `packages/tokens/`, y un proyecto de prueba `angular-app/` así que decidí abrir este proyecto

Necesito que me ayudes a organizar y estructurar este repo. También ayudame a tomar algunas deciciones basandonos en buenas practicas, estandares y convenciones.

- Este proyecto lo voy a utilizar para desarrollar librerias.
- Las librerías solo van a tener alncance de arquitecturas frontend.
- La prioridad:
  - Aplicar buenas practicas.
  - Aplicar Diseños y Arquitecturas que permitan escalar ordenado.
  - Facil de mantener. Con esto me refiero a seguir estandares y convenciones para que se pueda entender.
- en la carpeta `docs/` me traje unos archivos de otro repo donde investigo arquitecturas. esa documentación no quiere decir que es la arquitectura de estas librerias o las reglas y conveciones a seguir. Pero si son de referencia para aplciar toda la buena practica que ahí se defina. También se utilizará como fuente de conocimiento para armar el propio archivo de arquitectura de cada libs, o del proyecto en general, o de la decicion que se tome de como gestionar y mantener este proyecto. El archivo de arquitectura que es importante porque es donde estará la funente de la verdad con las conveciones que se deben seguir. Aqui debemos analizar cual es la mejor alternativa: Si uno general y uno para cada libs.

## Librerísa actuales

- `packages/tokens`: es un sistema de diseñol que utilizar alguna de las arquitectuas que estan en los archivos de documentacion.
- `package/components`: debe ser una libraría de componentes agnular, estos componentes utilizaran la librería `packages/tokens`. La prioridad siempre la misma:
  - Aplicar buenas practicas.
  - Aplicar Diseños y Arquitecturas que permitan escalar ordenado.
  - Facil de mantener. Con esto me refiero a seguir estandares y convenciones para que se pueda entender.

## Una App para probar los componetes.

- Implementa los componentes de la libs `package/components`, se va a utilizar como laboratorio para probarlos, también se va a usar para crear prototipos de casos de usos reales. La idea es que estos prototpos luego se puedan sacar e implementar en otro proyecto.
- Vamos a utilizar Angular.
- Actualmente tengo `/angular-app`, que lo traje del repo donde investigo arquitecturas. Vamos a rescatar de acá lo que nos sirva, si lo que tomamos no sigue buena practica, lo refactorizamos.

## Herramientas

- Vamos a trabajar con OpenSpec. Te dejo la URL para que tengas contexto, entrá y analiza todo lo que necesites para entender mejor: https://openspec.dev/

Este es el contexto inicial, probablemente me esté olvidando de muchas cosas, así que debes preguntarme cuando identifiques que estoy pasando algo por alto, si estoy aplicando una mala practica debes hacermelo saber y proponerme una alternativa que pririce buenas practicas. La prioridad: Aplicar buenas practicas.
