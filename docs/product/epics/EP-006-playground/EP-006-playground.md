---
estado: En desarrollo (HU-011 Hecha 2026-07-19; próximas HUs con disparador propio)
actor: Dev consumidor
---

# EP-006 — Playground

## Contexto / historia original

> Page de casos de usos de cada componente. En otros proyectos lo llamo showcase […] en esta page se debe poder navegar por un sidebar y seleccionar el componente del cual quiero ver los ejemplos de uso. (PO, 2026-07-18, TASK.md)

`apps/playground` nació en el bootstrap ([aaa-004](../../../../openspec/changes/archive/aaa-004-bootstrap-fase-4-playground/)) como app de prueba de las libs y plataforma de prototipado (contexto inicial del proyecto). Con el kit en 9 componentes + 1 directiva + 1 service, la página única y larga dejó de escalar: encontrar los casos de uso de un componente exige scrollear todo. Esta épica trata al playground como **producto interno con identidad propia**: los componentes del kit siguen siendo de [EP-002](../EP-002-kit-componentes/EP-002-kit-componentes.md); acá vive la evolución de la app que los exhibe y ejercita (decisión del PO, 2026-07-18).

## Alcance

La app `apps/playground` como vitrina y laboratorio del DS: navegación por componente (showcase), demos de casos de uso con su código, y los futuros del propio playground (prototipos de flujos reales, switcher de themes, etc.). Actor principal: el dev consumidor que evalúa cómo usar cada pieza; secundario: el mantenedor que valida integración real.

Queda afuera: Storybook (laboratorio interno por stories, por componente aislado — convive sin reemplazarse), los READMEs de los packages (quickstart de consumo) y todo cambio a los componentes en sí (EP-002).

## Historias de usuario

| HU                                              | Título                                            | Actor          | Estado                      |
| ----------------------------------------------- | ------------------------------------------------- | -------------- | --------------------------- |
| [HU-011](HU-011-showcase-componentes.md)        | Showcase navegable de casos de uso por componente | Dev consumidor | Hecha (2026-07-19, aaa-022) |
| [HU-035](HU-035-interaction-tests-storybook.md) | Interaction tests de overlays en Storybook        | Dev consumidor | Refinada (2026-07-26)       |
| [HU-036](HU-036-docs-tokens-storybook.md)       | Documentación de tokens en Storybook              | Dev consumidor | Refinada (2026-07-26)       |

HU-035 y HU-036 nacen de la [review integral del 2026-07-26](../../../reviews/2026-07-26-review-integral/plan-de-accion.md) y se ejecutan en su Parte L. Ambas amplían el alcance de esta épica hacia Storybook: hasta ahora quedaba explícitamente afuera (ver § Alcance), pero al volverse el soporte de los gates de calidad de [EP-005](../EP-005-calidad-profesional/EP-005-calidad-profesional.md) —interaction tests, a11y en navegador, publicación en GitHub Pages— dejó de ser un laboratorio aislado.

### Candidatas sin archivo

| Candidata                             | Estado                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme/brand switcher en el playground | En [BACKLOG § Next](../../../backlog/BACKLOG.md); se ejecuta ampliado en la Parte K del plan                                                       |
| Prototipos de flujos reales           | Absorbido por [EP-007](../EP-007-template-lume/EP-007-template-lume.md) y por [D-023](../../decisiones.md) (prototipo de verificación del hito H1) |

## Decisiones aplicables

[D-015, D-021, D-022](../../decisiones.md) — cada evolución del playground entra con caso de uso real o por decisión del PO; el gate visual del PO previo al archive (D-022) convierte al playground y a Storybook en herramientas de trabajo, no solo en vitrina.

## Preguntas abiertas

(ninguna — las del showcase se resolvieron en el refinamiento de HU-011)

## Orden sugerido de implementación

HU-011 primero (hecha: reestructuró la app y absorbió las demos existentes). Después el theme switcher (Parte K), que habilita el QA visual multi-theme del que depende el gate del PO. HU-035 y HU-036 van al final, en la Parte L: la de tokens conviene **después** de la migración a formato DTCG ([D-024](../../decisiones.md)), para generar las páginas desde el output ya migrado y no dos veces.
