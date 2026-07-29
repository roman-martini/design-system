---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

Gates de cobertura y typecheck en CI (aaa-040). Sin cambios en la API pública ni en el artefacto publicado: el change toca configuración de tests, tsconfigs y scripts.

- **Cobertura medida con piso que falla el build.** Los tres workspaces recolectan cobertura con provider `v8`; `components` arranca con un piso de 93/76/96/93 (statements/branches/functions/lines), fijado en la cobertura realmente medida menos 1 punto de margen. El piso es un trinquete: solo sube. `tokens` queda sin umbrales a propósito — no expone módulos TypeScript, así que un umbral ahí no podría fallar nunca; su contrato se verifica sobre el artefacto emitido.
- **Specs y stories ahora se typechequean.** El build de las librerías excluye `*.spec.ts` y `*.stories.ts` por exigencia del Angular Package Format y el runner de tests los transpila sin verificar tipos: un rename de input dejaba stories rotas con CI en verde. Se agrega un script `typecheck` por workspace, cableado como step bloqueante del PR.
- **12 errores de tipos preexistentes corregidos** en archivos de test, que el gate nuevo expuso: 8 en specs de `components` (type arguments sobre `fixture.nativeElement`, que es `any`) y 4 en `tokens` (indexado de un JSON de claves literales). No se tocó la lógica de ningún test ni el código de ningún componente.
- **`packages/tokens` estrena `tsconfig.json` y `typescript`**, que no tenía pese a llevar specs en `.ts`.
- **Scripts unificados** en los tres workspaces: `test` (una corrida), `test:watch`, `test:coverage` y `typecheck`. `pnpm test` desde el root ya no queda colgado en modo watch al llegar a `components`.
