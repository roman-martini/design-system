# ci-cd-pipeline — delta de a11y-testing-gates

## ADDED Requirements

### Requirement: Build de Storybook como smoke en CI

El workflow `pr.yml` SHALL ejecutar el build de Storybook como step bloqueante, después del build recursivo de los workspaces (las stories consumen el artefacto de las librerías). Storybook es la vitrina de calidad del kit: sin este step, una configuración rota o un import inexistente pasan verde y la herramienta se degrada en silencio.

**El alcance del smoke SHALL entenderse por lo que efectivamente detecta**, medido el 2026-07-31:

| Clase de rotura                                             | ¿La detecta?                              |
| ----------------------------------------------------------- | ----------------------------------------- |
| Import inexistente en un `*.stories.ts`                     | **Sí**                                    |
| Configuración de Storybook o addon rotos                    | **Sí**                                    |
| Error de tipos en una story                                 | Sí, pero ya lo cubre el step de typecheck |
| **Template de una story desactualizado** (input renombrado) | **No**                                    |

La última fila NO SHALL considerarse cubierta por este step ni por el typecheck: los templates de las stories son **strings evaluados en runtime** por el renderer de Angular, así que ni webpack ni `tsc` los analizan. Cerrar esa brecha requiere ejecutar las stories en un navegador — interaction tests con el test-runner de Storybook, que es trabajo de otra capacidad. Mientras esa brecha siga abierta, la documentación del pipeline NO SHALL afirmar que "una story rota falla el PR" sin esta distinción.

#### Scenario: un import inexistente en una story falla el PR

- **GIVEN** un PR con un `*.stories.ts` que importa un módulo inexistente
- **WHEN** corre el workflow de PR
- **THEN** el step de build de Storybook SHALL fallar con exit distinto de 0
- **AND** el PR SHALL quedar en rojo aunque el build de las librerías sea exitoso

#### Scenario: el smoke corre sobre las librerías ya construidas

- **WHEN** se inspecciona el orden de steps de `pr.yml`
- **THEN** el build de Storybook SHALL ubicarse después del build recursivo de los workspaces

#### Scenario: la brecha de los templates queda declarada, no supuesta

- **WHEN** se inspecciona el step en `pr.yml`
- **THEN** SHALL documentar qué clase de rotura cubre y cuál no
- **AND** la brecha de los templates evaluados en runtime SHALL quedar asignada a la capa que sí puede cubrirla (ejecución de stories en navegador)
