# Design — components-fix-apf-packaging

Diseño técnico del fix de Angular Package Format y del modelo de publicación. Las decisiones one-way door se promueven a ADR-021 al archivar.

## 1. Fix de compilation mode

`packages/components/package.json` invoca `ng-packagr -p ng-package.json -c tsconfig.lib.json`. El flag `-c` **reemplaza** el tsconfig interno de ng-packagr en vez de extenderlo, y ese tsconfig interno es el que traía `compilationMode: "partial"`. Al declarar uno propio sin ese campo, el compilador cayó al default `full`.

```jsonc
// packages/components/tsconfig.lib.json
"angularCompilerOptions": {
  "compilationMode": "partial",   // <- APF: obligatorio en librerías publicadas
  "strictTemplates": true,
  ...
}
```

**Por qué partial**: el modo full emite instrucciones de Ivy (`ɵɵdefineComponent`) resueltas contra la versión exacta del compilador. El modo partial emite declaraciones estables (`ɵɵngDeclareComponent`) que el _linker_ de la app consumidora traduce a las instrucciones de **su** versión de Angular. Es lo que hace que una lib compilada con 21.0 funcione en 21.5 o en 22.

**Verificación binaria**: tras el rebuild, `dist/fesm2022/*.mjs` debe tener 0 `ɵɵdefineComponent` y >0 `ɵɵngDeclareComponent`, y `dist/package.json` no debe traer `scripts.prepublishOnly` (ng-packagr solo lo escribe cuando detecta full mode). Ambas condiciones quedan automatizadas en §4.

## 2. Modelo de publicación: dist para components, root para tokens

### El problema estructural

Publicar desde el root con `files: ["dist"]` produce un tarball con **dos manifests**: el raíz (escrito a mano) que npm usa como contrato, y `dist/package.json` (generado por ng-packagr) que queda adentro como archivo inerte. Todo lo que ng-packagr calcula correctamente — `exports` de ambos entry points, `sideEffects`, el guard de compilation mode — se descarta a favor de una copia manual que hay que mantener sincronizada. Ese es el drift que ADR-017 aceptó "mitigado con el gate de `npm pack --dry-run`", gate que nunca se escribió.

### La decisión

**`components` publica su `dist/`** vía `publishConfig.directory`.

Verificado leyendo `@changesets/cli@2.31.0` (`internalPublish`), el mecanismo difiere según el package manager detectado:

- **con pnpm** (nuestro caso): changesets ejecuta `pnpm publish` con `cwd` en el **root del package** y deja que **pnpm** resuelva `publishConfig.directory`. El `publishDir` que changesets calcula no se usa en esta rama.
- **con npm**: changesets pasa la ruta explícita — `npm publish <publishDir>`.

Dos consecuencias que condicionan el diseño:

1. **No hay doble redirección.** ng-packagr copia `publishConfig` al manifest generado, así que `dist/package.json` también dirá `directory: "dist"`. Es inocuo: pnpm lee ese campo del manifest **raíz**, nunca del publicado, y no encadena.
2. **El `prepublishOnly` de ng-packagr no corre.** Bajo `pnpm publish` los lifecycle scripts se ejecutan en el package, no en el directorio publicado. El guard que ng-packagr escribe ante full mode queda inerte igual que hoy. **La red efectiva contra la regresión es el gate de §4**, que corre en cada PR — no un script dentro del tarball. Que ng-packagr ya no escriba ese script pasa a ser una _señal_ verificable de que el build salió en partial, no una protección en sí.

```jsonc
// packages/components/package.json
"publishConfig": {
  "access": "public",
  "directory": "dist",
  "provenance": true
}
```

**`tokens` sigue publicando desde el root.** Style Dictionary no emite un `package.json`; escribir un generador propio sería introducir lógica nuestra en el camino de publicación para ganar simetría cosmética. Publica con `files` explícito y un guard propio.

### Qué se saca del manifest raíz de components y por qué

| Campo             | Acción                    | Motivo                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files`           | **reescribir** hacia dist | ng-packagr lo copia **tal cual**: `["dist","README.md"]` dentro de dist apunta a un `dist/dist` inexistente y el tarball saldría con solo README. Pasa a `["fesm2022","types","router","README.md","LICENSE","CHANGELOG.md"]` — rutas del contenido de dist (ver abajo por qué no alcanza con quitarlo). |
| `main`            | **quitar**                | Apunta a `./dist/fesm2022/…`, ruta inválida ya dentro de dist. APF v21 es ESM-only: `module` + `typings` + `exports` alcanzan.                                                                                                                                                                           |
| `engines`         | **quitar**                | `pnpm >=9` y el piso de Node son requisitos del monorepo, no del consumidor [release-npm-10].                                                                                                                                                                                                            |
| `module`, `types` | conservar                 | ng-packagr los **reescribe** con rutas relativas a dist al generar el manifest; en el raíz sirven para la resolución local.                                                                                                                                                                              |
| `exports`         | conservar                 | Idem: reescrito en dist. En el raíz es lo que resuelve el package para playground y Storybook (ver abajo).                                                                                                                                                                                               |

**Por qué `files` se reescribe en vez de eliminarse** (verificado empíricamente): sin `files`, `npm-packlist` recorre el árbol con sus reglas por defecto y **omite los subdirectorios que tienen `package.json` propio**, tratándolos como packages anidados. Eso deja fuera del tarball a `dist/router/package.json`, el mini-manifest que APF emite como fallback de resolución del entry point secundario para consumidores sin soporte de `exports`. Con el `files` reescrito, el tarball pasa de 12 a 13 archivos y recupera ese fallback.

El costo es un `files` en el manifest raíz que describe la estructura de `dist/`, no la del propio directorio — contraintuitivo al leerlo. Se acepta porque es el único punto de control sobre el manifest generado, y tiene un efecto lateral favorable: un `npm publish` accidental desde el root produciría un tarball vacío (esos directorios no existen ahí), que es un fallo **ruidoso** en vez de publicar el repositorio entero.

**Nota sobre `exports` y ng-packagr**: el sub-path `"./package.json"` debe declararse en forma de objeto (`{ "default": "./package.json" }`). Con la forma de string plano, ng-packagr aborta el build con `Cannot create property 'default' on string` al generar el manifest.

**Por qué el `exports` raíz se conserva**: no hay `paths` de tsconfig en el monorepo — `apps/playground` declara `"@romanmartinidev/components": "workspace:*"` y pnpm enlaza el **directorio del package**, así que la resolución local sale del manifest raíz. Sacarlo rompería playground y Storybook. Lo que cambia es su **naturaleza**: deja de ser el contrato publicado y pasa a ser detalle de resolución interna. Un desalineo ahora rompe el build local de forma inmediata y ruidosa, en vez de viajar en silencio a npm.

**Riesgo residual asumido**: sin `files`, un `npm publish` corrido a mano desde el root del package subiría el directorio completo — npm nativo **no** soporta `publishConfig.directory`, así que ahí la redirección no protege. Se acepta porque (a) el publish del repo pasa siempre por pnpm vía changesets, (b) el publish manual ya está prohibido por ADR-006 y denegado en `.claude/settings.json`, y (c) el gate de §4 inspecciona el tarball real en cada PR.

## 3. LICENSE y CHANGELOG en los tarballs

npm solo auto-incluye el `LICENSE` que vive **en el directorio del propio package**; el del root del monorepo no se hereda. Hoy ambos packages publican `"license": "MIT"` sin el texto ni el copyright notice, que es lo que MIT exige conservar junto al software distribuido — y lo que marcan los escáneres de compliance.

**Mecanismo elegido: copia trackeada en git.** `LICENSE` se copia a `packages/tokens/` y `packages/components/`, versionado como cualquier otro archivo. Es lo que hacen Angular, React y Babel en sus monorepos: cero mecanismo, cero fragilidad, funciona con o sin build previo.

Se descartó sincronizarlo por script en build-time (agrega un paso que puede no correr y deja archivos generados sin trackear) y el symlink (no sobrevive al empaquetado y es frágil en Windows, plataforma primaria del PO).

Contra el drift entre las tres copias, el script de §4 verifica que sean **byte a byte idénticas** al `LICENSE` del root.

Ruta al tarball:

- **components** → `ng-package.json` suma `"LICENSE"` y `"CHANGELOG.md"` a `assets`, que ng-packagr copia a `dist/` (ya lo hace con `README.md`).
- **tokens** → `files` pasa a `["dist", "README.md", "LICENSE", "CHANGELOG.md"]`.

## 4. Gate de packaging (`scripts/verify-packaging.mjs`)

Un único script Node, invocable como `pnpm verify:packaging`, que corre **igual en local y en CI** (post-build). La lógica vive en el repo y no en YAML: se puede depurar, testear y correr antes de pushear.

Verifica, por package:

1. **Compilation mode** (solo components): ningún `dist/fesm2022/*.mjs` contiene `ɵɵdefineComponent`; al menos uno contiene `ɵɵngDeclareComponent`.
2. **Manifest sin envenenar**: ningún `package.json` bajo `dist/` declara `scripts.prepublishOnly` (la firma del guard de ng-packagr en full mode).
3. **Contenido del tarball**: corre `npm pack --dry-run --json` sobre el **directorio de publicación real** de cada package (`dist/` para components, el root para tokens) y valida presencia de `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, los FESM y los `.d.ts` de **ambos** entry points; y ausencia de `src/`, `*.spec.ts`, `*.stories.ts`, `tsconfig*.json`, `ng-package.json`, `vitest.config.ts`.
4. **`exports` resolubles**: cada path declarado en el `exports` del manifest publicado existe dentro del tarball. Esto es lo que ADR-017 prometió.
5. **LICENSE sin drift**: las copias por package son idénticas al `LICENSE` del root.

Exit 1 con el detalle de cada fallo. Se agrega como step de `pr.yml` después de `Build (recursive)`.

**Nota sobre `npm pack --dry-run`**: se usa `npm` y no `pnpm pack` a propósito — npm es quien arma el tarball en el publish real, así que su cálculo de contenido es el que importa.

## 5. Metadata restante

| Ítem                           | Cambio                                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"./package.json"`             | Se agrega al `exports` de tokens y al raíz de components. Sin él, `require.resolve('@romanmartinidev/tokens/package.json')` falla con `ERR_PACKAGE_PATH_NOT_EXPORTED` (schematics, bundlers). |
| `engines`                      | Se elimina de ambos publicables. Queda en el `package.json` root, que es privado y sí gobierna al equipo del repo.                                                                            |
| `@changesets/changelog-github` | Reemplaza al generador default: las 15 entradas del próximo release enlazan commit, PR y autor en vez de mostrar un hash pelado.                                                              |
| Provenance                     | `id-token: write` en `release.yml` + `publishConfig.provenance: true` en ambos packages, por D-018(c). Queda **latente**: no publica ni cambia el flujo.                                      |

## 6. Estrategia de verificación

El fix se prueba sobre el **artefacto emitido**, no sobre la configuración: que `tsconfig.lib.json` diga `partial` no prueba que el FESM salga en partial (justamente el bug fue confiar en la configuración). Todas las condiciones de §1 y §4 se verifican leyendo `dist/`, y el mismo script corre en CI para que la regresión sea imposible de mergear.

`npm pack --dry-run` no publica nada ni contacta al registry — es seguro bajo el pipeline actual.

## 7. Fuera de alcance

- **El publish en sí.** El veto fue levantado por el PO (D-028) con destino **0.3.0 con los changesets acumulados**, pero el pipeline sigue bloqueado por [ci-cd-01] (el enforcement de changesets rompe el PR que crea `changesets/action`), cuyo arreglo es la **Parte E**. Este change deja el artefacto sano; no dispara ningún release.
- **El environment `npm-publish` con required reviewer** (D-018(b)): es Parte E, junto al resto del hardening de workflows.
- **`0.2.1` correctivo**: no es ejecutable — los 15 changesets acumulados son todos `minor`, así que `changeset version` produce `0.3.0`, y el repo no tiene tags desde donde armar un branch de patch. El PO optó por corregir vía 0.3.0.
