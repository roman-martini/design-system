---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

Corrección de Angular Package Format y del empaquetado publicable (aaa-038).

- **`components` se compila en partial mode.** El `0.2.0` publicado salió en *full compilation mode*, con instrucciones de Ivy atadas a la versión exacta de Angular usada al compilar: rompía a consumidores en otras versiones de 21.x y habría roto seguro en Angular 22. La causa era el flag `-c tsconfig.lib.json`, que reemplaza el tsconfig interno de ng-packagr en vez de extenderlo y perdía su `compilationMode: "partial"`. El FESM ahora emite `ɵɵngDeclareComponent`, como exige APF para librerías publicadas.
- **`components` se publica desde su `dist/`** (`publishConfig.directory`): el manifest generado por ng-packagr pasa a ser la fuente única del contrato publicado, en lugar de una copia manual mantenida en paralelo. El tarball incluye ahora el mini-manifest `router/package.json` del entry point secundario.
- **Ambos packages incluyen `LICENSE` y `CHANGELOG.md` en el tarball.** El texto de la licencia MIT no viajaba: npm solo auto-incluye el `LICENSE` del directorio del propio package, y el del monorepo no se hereda.
- **`exports` incorpora `"./package.json"`** en ambos packages: con `exports` cerrado, el tooling que resuelve el manifest (schematics, bundlers, analizadores) fallaba con `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Se retira `engines` de los packages publicables.** `node >=22.12` y `pnpm >=9` son requisitos del monorepo, no del consumidor, y provocaban fallos de instalación con `engine-strict` o warnings de engine no soportado.
- **`tokens` aborta la publicación sin build** mediante un `prepublishOnly` que verifica que cada path declarado en `exports` exista en disco.
