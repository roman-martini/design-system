# ADR-021 — Estrategia de publicación por tipo de package: dist para components, root para tokens

- **Fecha**: 2026-07-28
- **Estado**: Aceptado
- **Dominio**: build / ci / transversal
- **ADRs relacionados**: [ADR-006](ADR-006-estrategia-ci-cd.md) (publish solo vía `release.yml`), [ADR-015](ADR-015-versionado-lockstep.md) (lockstep del par), [ADR-017](ADR-017-secondary-entry-points.md) (**matizado**: su regla 4 — mantener el `exports` manual alineado con el generado — deja de aplicar al artefacto publicado de components; su mitigación por gate de `npm pack` se materializa acá)

## Contexto

`@romanmartinidev/components@0.2.0` se publicó **violando Angular Package Format**: el FESM salió en _full compilation mode_ (36 `ɵɵdefineComponent`, cero `ɵɵngDeclareComponent`), embebiendo instrucciones de Ivy atadas a la versión exacta de Angular usada al compilar. ng-packagr **detectó la falla y escribió el guard** — un `prepublishOnly` en `dist/package.json` que aborta el publish con un error explícito — pero ese guard nunca se ejecutó: el publish se hacía **desde el root del package** (`files: ["dist"]`), no desde `dist/`, así que el script viajó adentro del tarball como carga muerta.

El bypass no fue un accidente aislado: es la consecuencia estructural del modelo de publicación. Publicar desde el root produce un tarball con **dos manifests** — el raíz escrito a mano, que npm usa como contrato, y el generado por ng-packagr, que queda adentro como archivo inerte. Todo lo que ng-packagr calcula bien (los `exports` de ambos entry points, `sideEffects`, el guard de compilación) se descarta a favor de una copia manual que hay que mantener sincronizada a mano. [ADR-017](ADR-017-secondary-entry-points.md) aceptó explícitamente ese riesgo "mitigado con el gate de `npm pack --dry-run`" — gate que nunca se implementó, y cuyo riesgo ya se había materializado (al `exports` manual le faltaba `"./package.json"`, que el generado sí traía).

Cómo se empaqueta lo que se publica define el contrato con todo consumidor externo y es caro de revertir una vez que hay versiones en npm → one-way door que amerita ADR.

## Opciones consideradas

### Opción A — Publish-from-root en ambos packages, con guards escritos a mano

Mantener `files: ["dist"]` y agregar `prepublishOnly` propios que verifiquen dist presente, dist fresco y ausencia del script envenenado de ng-packagr.

- **Pros**: simetría total entre los dos packages, un solo modelo mental; cambio mínimo sobre lo existente.
- **Contras**: deja vivo el `exports` manual duplicado —la fuente de drift que originó el problema—, sigue publicando un tarball con doble manifest, y obliga a reimplementar a mano una protección que ng-packagr ya entrega. Es la opción de menor cambio, no la de mejor estructura. Descartada.

### Opción B — `publishConfig.directory: "dist"` en ambos packages

Publicar el dist de components y, para tokens, generar un `package.json` de dist desde el build de Style Dictionary.

- **Contras**: Style Dictionary no emite manifest, así que habría que escribir y mantener un generador propio — lógica nuestra, sin upstream que la respalde, en el camino crítico de publicación. La simetría se pagaría con código propio en el punto donde menos conviene tenerlo. Descartada.

### Opción C — Publish-from-dist en components, publish-from-root en tokens (elegida)

Cada package usa el estándar de su categoría.

- **Pros**: el manifest publicado de components pasa a ser el **generado**, eliminando la clase entera de drift en lugar de vigilarla; es el patrón del ecosistema Angular (lo que hace `ng build <lib>` + publicar el dist); tokens conserva el modelo estándar de cualquier lib JS/CSS con manifest escrito a mano, sin agregar mecanismo.
- **Contras**: los dos packages del monorepo se publican distinto, lo que hay que documentar y explicar (este ADR).

## Decisión

**El modelo de publicación se elige por tipo de artefacto, no por uniformidad del monorepo.** Un package con manifest **generado** por su herramienta de build publica ese output; un package con manifest **escrito a mano** publica desde su root.

Reglas:

1. **`@romanmartinidev/components` publica su `dist/`** vía `publishConfig.directory: "dist"`. El `dist/package.json` de ng-packagr es la **fuente única** del contrato publicado (`exports`, `module`, `typings`).
2. **El `exports` del manifest raíz de components se conserva, pero cambia de naturaleza**: deja de ser contrato público y pasa a ser **detalle de resolución interna del monorepo** — es lo que resuelve el package para playground y Storybook, ya que no hay `paths` de tsconfig y pnpm enlaza el directorio del package. Un desalineo ahora rompe el build local de forma ruidosa, en vez de llegar en silencio a npm.
3. **El `files` del manifest raíz de components declara las rutas del contenido de `dist/`** (`fesm2022`, `types`, `router`, `README.md`, `LICENSE`, `CHANGELOG.md`), no del propio directorio, porque ng-packagr lo copia sin reescribir. Omitirlo no es opción: sin `files`, `npm-packlist` descarta `dist/router/package.json` —el mini-manifest de fallback del entry point secundario— al tratar ese subdirectorio como package anidado.
4. **`@romanmartinidev/tokens` publica desde su root** con `files` explícito y un `prepublishOnly` que aborta si algún path declarado en `exports` no existe en disco.
5. **Los packages publicables no declaran `engines`**: Node y pnpm son requisitos del monorepo y viven en el `package.json` root privado. Publicarlos rompe instalaciones con `engine-strict` sin proteger nada real.
6. **Ambos packages llevan su propio `LICENSE`** (copia trackeada, idéntica a la del root): npm solo auto-incluye el `LICENSE` del directorio del package, y MIT exige conservar el copyright notice junto al software distribuido.
7. **El contrato se verifica sobre el artefacto emitido, nunca sobre la configuración**, mediante `scripts/verify-packaging.mjs` en cada PR: compilation mode del FESM, ausencia del guard de ng-packagr, contenido del tarball real (`npm pack --dry-run --json` sobre el directorio de publicación de cada package), resolubilidad de cada path de `exports` dentro del tarball, y no-drift de los LICENSE. Esto **materializa la mitigación prometida por ADR-017 regla 4**.

## Consecuencias

### Positivas

- Desaparece la clase de defecto que produjo el `0.2.0` roto: el contrato publicado ya no se mantiene a mano.
- El gate corre local y en CI con el mismo comando, y está probado contra la regresión real (quitar `compilationMode` lo hace fallar por cuatro vías independientes).
- Los tarballs cumplen la atribución de licencia MIT y dejan de imponer requisitos de entorno falsos.

### Negativas / trade-offs aceptados

- **Asimetría entre los dos packages publicables**, que hay que conocer al tocar packaging. Se acepta porque refleja una diferencia real de artefacto; la alternativa era código propio de generación de manifest.
- **El `files` raíz de components describe la estructura de `dist/`**, lo que es contraintuitivo al leerlo aislado. Efecto lateral favorable: un `npm publish` accidental desde el root produce un tarball vacío —fallo ruidoso— en vez de publicar el repositorio entero.
- **El `prepublishOnly` de ng-packagr sigue sin ejecutarse**: bajo `pnpm publish` los lifecycle scripts corren en el package, no en el directorio publicado. Ya no se lo considera una protección; su **ausencia** en el manifest generado es la señal verificable de que el build salió en partial, y la red efectiva es el gate de la regla 7.
- **npm nativo no soporta `publishConfig.directory`** (es una feature de pnpm; changesets solo pasa la ruta explícita en su rama de npm). El repo publica con pnpm vía changesets, y el publish manual ya está prohibido por ADR-006 y denegado en `.claude/settings.json`.

### Acciones de seguimiento

- Un package publicable nuevo elige su modelo por la regla de arriba (¿su manifest lo genera una herramienta?) y se suma a `PACKAGES` en `verify-packaging.mjs`; si no encaja en ninguna categoría, ADR nuevo.
- Si ng-packagr incorpora la gestión automática del `exports` del manifest raíz, revisar la regla 2 (el `exports` local podría pasar a generarse).
- El gate de la regla 7 es el lugar donde se agregan verificaciones futuras de packaging (bundle size budget de EP-005, atribución de licencias de terceros).
