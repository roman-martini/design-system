# monorepo-structure — delta de ci-coverage-typecheck-gates

## ADDED Requirements

### Requirement: Scripts de test y typecheck uniformes por workspace

Todo workspace del monorepo que tenga tests SHALL exponer el mismo juego de scripts con semántica idéntica:

| Script          | Semántica                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| `test`          | corre la suite **una vez** y retorna exit code; nunca queda en modo watch |
| `test:watch`    | corre la suite en modo watch, para desarrollo local                       |
| `test:coverage` | corre la suite una vez recolectando cobertura                             |
| `typecheck`     | typechequea sin emitir los archivos excluidos del build de la librería    |

El root SHALL agregar estos scripts de forma recursiva, de modo que el comando documentado en `CLAUDE.md` se comporte igual en local que en CI.

`test` SHALL retornar control al terminar en cualquier entorno: un script que entra en watch cuando corre en una terminal interactiva NO satisface este requirement, porque bloquea la ejecución recursiva desde el root.

#### Scenario: pnpm test del root termina en local

- **GIVEN** una terminal interactiva en la raíz del monorepo
- **WHEN** se ejecuta `pnpm test`
- **THEN** SHALL correr la suite de los tres workspaces
- **AND** SHALL retornar el control con un exit code, sin quedar en watch

#### Scenario: cada workspace expone el mismo juego de scripts

- **GIVEN** los `package.json` de `packages/tokens`, `packages/components` y `apps/playground`
- **WHEN** se inspeccionan sus scripts
- **THEN** los cuatro nombres SHALL estar presentes en los tres
- **AND** SHALL tener la misma semántica en todos

#### Scenario: typecheck recursivo desde el root

- **GIVEN** la raíz del monorepo
- **WHEN** se ejecuta `pnpm typecheck`
- **THEN** SHALL ejecutar el `typecheck` de cada workspace
- **AND** SHALL fallar si cualquiera de ellos reporta un error de tipos
