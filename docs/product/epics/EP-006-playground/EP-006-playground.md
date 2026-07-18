# EP-006 — Playground

**Estado**: En refinamiento (creada 2026-07-18; HU-011 refinada)

## Contexto / historia original

> Page de casos de usos de cada componente. En otros proyectos lo llamo showcase […] en esta page se debe poder navegar por un sidebar y seleccionar el componente del cual quiero ver los ejemplos de uso. (PO, 2026-07-18, TASK.md)

`apps/playground` nació en el bootstrap ([aaa-004](../../../../openspec/changes/archive/aaa-004-bootstrap-fase-4-playground/)) como app de prueba de las libs y plataforma de prototipado (contexto inicial del proyecto). Con el kit en 9 componentes + 1 directiva + 1 service, la página única y larga dejó de escalar: encontrar los casos de uso de un componente exige scrollear todo. Esta épica trata al playground como **producto interno con identidad propia**: los componentes del kit siguen siendo de [EP-002](../EP-002-kit-componentes/EP-002-kit-componentes.md); acá vive la evolución de la app que los exhibe y ejercita (decisión del PO, 2026-07-18).

## Alcance

La app `apps/playground` como vitrina y laboratorio del DS: navegación por componente (showcase), demos de casos de uso con su código, y los futuros del propio playground (prototipos de flujos reales, switcher de themes, etc.). Actor principal: el dev consumidor que evalúa cómo usar cada pieza; secundario: el mantenedor que valida integración real.

Queda afuera: Storybook (laboratorio interno por stories, por componente aislado — convive sin reemplazarse), los READMEs de los packages (quickstart de consumo) y todo cambio a los componentes en sí (EP-002).

## Historias de usuario

| HU                                       | Título                                            | Actor          | Estado                |
| ---------------------------------------- | ------------------------------------------------- | -------------- | --------------------- |
| [HU-011](HU-011-showcase-componentes.md) | Showcase navegable de casos de uso por componente | Dev consumidor | Refinada (2026-07-18) |

## Decisiones aplicables

[D-005](../../decisiones.md) (sin features hipotéticas — cada evolución del playground entra con caso de uso real).

## Preguntas abiertas

(ninguna — las del showcase se resolvieron en el refinamiento de HU-011)

## Orden sugerido de implementación

HU-011 primero (reestructura la app y absorbe las demos existentes); prototipos de flujos reales y theming switcher como candidatas futuras, cuando tengan disparador.
