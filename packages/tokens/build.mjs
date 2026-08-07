// Módulo de EJECUCIÓN del build de tokens (aaa-052): importa la definición
// de sd.config.mjs y corre las plataformas, base primero y cada theme después
// (el orden preserva el output byte-a-byte del build previo al split).
import { sdBase, themeBuilds } from './sd.config.mjs';

await sdBase.buildAllPlatforms();
for (const build of themeBuilds) {
  await build.buildAllPlatforms();
}
