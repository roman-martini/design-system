---
id: aaa-038
name: components-fix-apf-packaging
type: change
status: archived
archived: 2026-07-28
modifies-specs:
  - components-package
  - design-tokens-package
  - ci-cd-pipeline
related-adrs:
  - ADR-006
  - ADR-015
  - ADR-017
  - ADR-021
related-decisions:
  - D-018
  - D-028
---

# Proposal — components-fix-apf-packaging

# Why

`@romanmartinidev/components@0.2.0` **está publicado en npm violando Angular Package Format**. El FESM emitido contiene 36 `ɵɵdefineComponent` y cero `ɵɵngDeclareComponent`: la librería se compiló en _full compilation mode_, que embebe instrucciones privadas de Ivy atadas a la versión exacta de Angular usada al compilar. Los consumidores en otra 21.x pueden romper en runtime y en Angular 22 rompen seguro, porque el código no pasa por el linker [release-npm-01].

ng-packagr **detectó la falla y plantó el guard** — un `prepublishOnly` en `dist/package.json` que aborta el publish con "Trying to publish a package that has been compiled in full compilation mode". Ese guard nunca corrió: se publica desde el root del package (`files: ["dist"]`), no desde `dist/`, así que el script quedó adentro del tarball como carga muerta en vez de frenar la publicación [release-npm-07].

La causa es el `-c tsconfig.lib.json` del script de build, que reemplaza el tsconfig interno de ng-packagr sin declarar `compilationMode: "partial"` en `angularCompilerOptions`.

El mismo bypass explica por qué el resto del packaging quedó sin red: el gate de `npm pack --dry-run` que ADR-017 declaró como mitigación del `exports` manual **nunca se implementó** [release-npm-06], y el riesgo que ese ADR aceptó ya se materializó — al `exports` del manifest raíz le falta `"./package.json"`, que el generado por ng-packagr sí trae [release-npm-03]. Los tarballs de ambos packages se publican además **sin el texto de la licencia MIT** (el `LICENSE` vive solo en el root del monorepo y npm no lo hereda) y sin CHANGELOG [release-npm-04, tokens-12, tooling-repo-03], y arrastran un `engines` con `pnpm >=9` que es requisito del monorepo, no del consumidor [release-npm-10, tooling-repo-14].

Es el defecto más grave del repo y el frente 1 de la review integral 2026-07-26 (`docs/reviews/2026-07-26-review-integral/plan-de-accion.md`) (Parte D).

# What Changes

- **Fix APF**: `compilationMode: "partial"` en `angularCompilerOptions` de `tsconfig.lib.json`; el FESM pasa a emitir `ɵɵngDeclareComponent` y ng-packagr deja de escribir el `prepublishOnly` de error.
- **Modelo de publicación por tipo de package** (ADR-021, nuevo): `components` publica **su `dist/`** (`publishConfig.directory`), dejando el manifest generado por ng-packagr como fuente única del contrato publicado; `tokens` sigue publicando desde el root (no tiene generador de manifest) con un **guard propio** que verifica dist presente y completo. Matiza ADR-017: el `exports` manual de components sale del artefacto publicado.
- **LICENSE y CHANGELOG en los tarballs** de ambos packages, con un check que verifica que las copias por package no derivan del `LICENSE` del root.
- **`"./package.json"` en el `exports`** del manifest de tokens y del raíz de components (resolución de tooling).
- **`engines` fuera de los publicables**: queda solo en el `package.json` root (privado).
- **Dos gates de CI nuevos**, en un script Node único (`scripts/verify-packaging.mjs`, corre igual local y en CI): (1) anti full-mode — falla si aparece `ɵɵdefineComponent` en un FESM o el `prepublishOnly` de ng-packagr en un manifest; (2) contenido del tarball vía `npm pack --dry-run --json` sobre el directorio de publicación real de cada package — el gate que ADR-017 prometió.
- **Changelog y procedencia**: `@changesets/changelog-github` para que las entradas enlacen commit/PR/autor [release-npm-09]; `id-token: write` + `publishConfig.provenance` preparados sin publicar nada, según D-018(c) [release-npm-05].
- Changesets: **patch** de components y de tokens (lockstep ADR-015) — el fix de compilación cambia el artefacto emitido, no la API.

# Capabilities

## Modified Capabilities

- `components-package`: el requirement de build APF pasa a exigir partial compilation mode **verificable en el artefacto**; el de identidad publicable se reescribe sobre el modelo publish-from-dist (el tarball ya no lleva `files` ni `exports` manuales) y suma LICENSE y CHANGELOG.
- `design-tokens-package`: el contenido publicable suma LICENSE y CHANGELOG, `exports` suma `"./package.json"`, y se agrega el guard de dist presente.
- `ci-cd-pipeline`: nuevo requirement de verificación de packaging en cada PR (anti full-mode + contenido de tarball), y el workflow de release declara `id-token: write`.

# Alternativas evaluadas

Decisión del PO en sesión (2026-07-28), sobre las tres opciones de [release-npm-07]:

1. **Publish-from-root en ambos packages con guards escritos a mano** — descartada. Mantiene vivo el `exports` manual duplicado (el drift que ADR-017 aceptó bajo una mitigación que nunca existió), publica un tarball con doble manifest, y obliga a reimplementar a mano una protección que ng-packagr ya entrega gratis. Es la opción de menor cambio, no la de mejor estructura.
2. **`publishConfig.directory: "dist"` en ambos packages** — descartada. Exigiría escribir y mantener un generador de manifest propio para tokens (Style Dictionary no emite `package.json`): lógica nuestra, sin upstream que la respalde, dentro del change más crítico del plan. La simetría se pagaría con código propio en el camino de publicación.
3. **Publish-from-dist en components, publish-from-root en tokens** — **elegida**. La asimetría no es arbitraria: refleja que son dos tipos de artefacto distintos. Un package Angular compilado con ng-packagr _tiene_ un manifest generado y el ecosistema publica ese dist (es lo que hace `ng build <lib>`); un package de CSS + constantes JS publica desde el root como cualquier lib JS. Cada uno usa el estándar de su categoría.

Sobre el `exports` del manifest raíz de components: **se conserva** aunque no se publique, porque es lo que resuelve `@romanmartinidev/components` para el playground y Storybook dentro del monorepo (no hay `paths` de tsconfig; pnpm enlaza el directorio del package). Su naturaleza cambia: pasa de contrato público a detalle de resolución interna, y un desalineo rompe el build local de forma ruidosa en vez de llegar en silencio a npm.

# Impact

- **Código**: `packages/components/{tsconfig.lib.json, package.json, ng-package.json, LICENSE}`, `packages/tokens/{package.json, LICENSE}`, `scripts/verify-packaging.mjs`, `.changeset/config.json`, `.github/workflows/{pr.yml, release.yml}`, `package.json` root (script `verify:packaging`).
- **Consumidores**: ninguno rompe. El contrato de imports (`.` y `./router`) no cambia; cambia cómo se empaqueta.
- **Riesgo controlado**: publicar desde `dist/` cambia la raíz del tarball. El gate de pack verifica el contenido real antes de cada merge — y es la única red efectiva, porque bajo `pnpm publish` los lifecycle scripts corren en el package y no en el directorio publicado, así que el `prepublishOnly` de ng-packagr no se ejecuta (ver design §2).
- **Veto npm**: **levantado por el PO el 2026-07-28** (D-028). Este change **no publica**: el destino acordado es un **0.3.0** con los changesets acumulados, y el pipeline sigue bloqueado por [ci-cd-01] hasta la Parte E.
- **ADR**: genera **ADR-021** (estrategia de publicación por package) y anota el matiz sobre ADR-017.
