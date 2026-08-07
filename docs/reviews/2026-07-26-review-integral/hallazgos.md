# Hallazgos — Review integral del repo (2026-07-26)

> Artefacto de evidencia de la review integral pedida por el PO (TASK.md §3). **No normativo**: los contratos siguen viviendo en specs/ADRs. El plan ejecutable derivado de estos hallazgos está en [plan-de-accion.md](plan-de-accion.md).

## Metodología

- **12 auditores** en paralelo (uno por dimensión), cada uno con lectura real de archivos y evidencia citada (workflow multi-agente, Fable 5).
- **Verificación adversarial**: un verificador escéptico por dimensión reabrió los archivos citados y confirmó/ajustó/refutó cada hallazgo. Por cortes de sesión, 5 dimensiones quedaron con pasada completa (testing, ci-cd, openspec, producto-hus, playground); en las otras 7, los 18 hallazgos de severidad **alta** se verificaron inline en sesión (todos confirmados) y los media/baja quedan marcados "sin verificación adversarial".
- **0 hallazgos refutados** en las pasadas completadas.

**Totales**: 140 hallazgos — 28 alta · 74 media · 38 baja.

## Índice

| Dimensión                                                  | Hallazgos | Alta |
| ---------------------------------------------------------- | --------- | ---- |
| [Release-readiness y packaging npm](#release-npm)          | 10        | 2    |
| [Arquitectura de design tokens](#tokens)                   | 13        | 4    |
| [Calidad de código de componentes](#components)            | 15        | 3    |
| [Estrategia de testing](#testing)                          | 9         | 3    |
| [CI/CD y hooks](#ci-cd)                                    | 14        | 2    |
| [Docs de arquitectura y raíz](#docs-arquitectura)          | 14        | 4    |
| [Higiene de OpenSpec](#openspec)                           | 6         | 1    |
| [Producto: épicas, HUs y decisiones](#producto-hus)        | 11        | 1    |
| [Backlog operativo y TASK.md](#backlog)                    | 9         | 3    |
| [Ecosistema .claude/](#claude-ecosystem)                   | 12        | 1    |
| [Playground y Storybook](#playground)                      | 13        | 3    |
| [Tooling raíz y gobernanza de repo público](#tooling-repo) | 14        | 1    |

Leyenda de campos: **severidad** (alta/media/baja) · **tamaño** (S/M/L) · **ejecución** (openspec-change / commit-directo / refinamiento-hu / hu-nueva / decision-po) · **effort sugerido** para ejecutar el arreglo (low/medium/high/ultra).

---

<a id="release-npm"></a>

## Release-readiness y packaging npm (`release-npm`)

**Evaluación general**: La base de packaging es sólida: metadata npm completa en ambos packages (repository/directory, homepage, bugs, keywords, publishConfig.access), lockstep ADR-015 implementado exactamente como se decidió (fixed + peer `>=0.1.0 <1.0.0` + flag experimental), dist de tokens alineado 1:1 con sus exports, y 15 changesets pendientes consistentes (todos minor, descripciones útiles). Pero hay un defecto crítico de release-readiness: el bundle de components está compilado en full compilation mode (viola Angular Package Format) y el guard prepublishOnly que ng-packagr planta para impedir publicarlo queda bypasseado porque se publica desde el root del package, no desde dist/ — el 0.2.0 en npm muy probablemente salió así. Además, el README de components (la página de docs en npmjs) quedó 12 componentes atrás y no documenta el entry point /router, y faltan piezas estándar de un release profesional: LICENSE en los tarballs, npm provenance, el gate de `npm pack --dry-run` prometido por ADR-017, y un CHANGELOG monolingüe.

### release-npm-01 — components se compila en full compilation mode (viola APF) y el guard de ng-packagr queda bypasseado

- **Archivo**: `packages/components/tsconfig.lib.json:24` · **Producto**: HU-002
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Confirmado (verificación inline en sesión)

El FESM emitido contiene 35 ocurrencias de `ɵɵdefineComponent` y cero `ɵɵngDeclareComponent`: la librería se compila en full compilation mode, no en partial como exige Angular Package Format para librerías publicadas. ng-packagr lo detectó y plantó en dist/package.json un prepublishOnly que aborta el publish con "ERROR: Trying to publish a package that has been compiled in full compilation mode. This is not allowed." — pero ese guard nunca corre porque el publish se hace desde el root del package (files: ["dist"]), no desde dist/. La causa probable es el `-c tsconfig.lib.json` (introducido en el change de tabs, según CHANGELOG 0360740) que reemplaza el tsconfig de ng-packagr sin declarar `compilationMode: partial` en angularCompilerOptions. El 0.2.0 publicado muy probablemente salió así.

**Evidencia**: `"angularCompilerOptions": { "strictTemplates": true, ... } (sin "compilationMode": "partial")`

**Impacto**: El código full-mode embebe instrucciones privadas de Ivy atadas a la versión exacta de Angular usada al compilar: los consumidores en otra versión de Angular 21.x pueden romper en runtime y en Angular 22 rompe seguro (no pasa por el linker). Es exactamente el escenario que APF y el guard de ng-packagr existen para impedir; hoy el kit no es consumible de forma confiable fuera del monorepo, que es la vara del producto.

**Recomendación**: Agregar `"compilationMode": "partial"` a angularCompilerOptions de tsconfig.lib.json, rebuild y verificar que el FESM emita `ɵɵngDeclareComponent` y que dist/package.json ya no traiga el prepublishOnly de error; sumar un gate en CI que falle si aparece (grep del script o de ɵɵdefineComponent). Escalar al PO si corresponde un 0.2.1 correctivo (publicar está vetado hasta su orden).

**Nota de verificación**: Verificado en sesión: FESM con 35 ɵɵdefineComponent y 0 ɵɵngDeclareComponent; dist/package.json contiene el prepublishOnly de error de ng-packagr; tsconfig.lib.json sin compilationMode.

### release-npm-02 — README de components (doc de consumo en npm) desactualizado: lista 10 de 22 componentes y omite el entry point /router

- **Archivo**: `packages/components/README.md:113` · **Producto**: HU-002
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

La tabla "Componentes disponibles" lista 10 componentes (hasta Toast) y remite Spinner/Skeleton al futuro, pero src/public-api.ts exporta 22 módulos (accordion, avatar, badge, breadcrumbs, card, menu, pagination, progress, skeleton, spinner, switch, textarea…) que ya tienen changeset y saldrán en 0.3.0. El secondary entry point `@romanmartinidev/components/router` (DsBreadcrumbsRouter, ADR-017) no aparece en ningún lado del README, y la sección de instalación dice "pnpm add @angular/core @angular/common" omitiendo `@angular/forms`, que es peerDependency dura desde Checkbox.

**Evidencia**: `Más componentes en changes futuros (Spinner, Skeleton, etc. — ver backlog).`

**Impacto**: Este README es la página del package en npmjs.com y se copia a dist/ en cada build (ng-package.json assets): con el release 0.3.0 se publica una doc que oculta la mitad del kit, no explica la integración router (con su peer opcional) y da instrucciones de instalación incompletas que fallan con strict-peer-dependencies. Golpea directo la vara de "usable en proyectos profesionales".

**Recomendación**: Actualizar la tabla con los 22 componentes/familias, agregar sección del entry point `/router` (uso + `@angular/router` como peer opcional) y completar la instalación con `@angular/forms`. Considerar un check de release que compare la tabla contra public-api.ts.

**Nota de verificación**: Verificado en sesión: public-api.ts con 23 líneas de export; tabla del README desactualizada.

### release-npm-03 — exports del package.json raíz desalineado del manifest generado por ng-packagr: falta "./package.json"

- **Archivo**: `packages/components/package.json:41` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El dist/package.json que emite ng-packagr incluye `"./package.json": { "default": "./package.json" }` en exports; el package.json raíz publicado no lo tiene (tampoco el de tokens). ADR-017 regla 4 pide explícitamente "alinear con el dist/package.json generado tras el primer build" y ya hay drift en el primer entry point.

**Evidencia**: `"exports": { ".": { "types": "./dist/types/romanmartinidev-components.d.ts",`

**Impacto**: Con exports declarado, todo subpath no listado queda encapsulado: cualquier tooling que resuelva `@romanmartinidev/components/package.json` (schematics/ng-add, bundlers, herramientas de análisis de versiones) falla con ERR_PACKAGE_PATH_NOT_EXPORTED. Además el drift silencioso entre manifest manual y generado es exactamente el riesgo que ADR-017 aceptó solo bajo mitigación con gate.

**Recomendación**: Agregar `"./package.json": "./package.json"` al exports de ambos packages y documentar la comparación manifest manual vs dist/package.json como paso del gate de pack (ver hallazgo del gate ADR-017).

### release-npm-04 — Los tarballs publicados no incluyen LICENSE (ni CHANGELOG)

- **Archivo**: `packages/components/package.json:34` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

`files` es ["dist", "README.md"] en ambos packages y no existe LICENSE dentro de packages/tokens/ ni packages/components/ (solo en el root del monorepo, verificado por ls). npm solo auto-incluye el LICENSE que vive en el directorio del propio package, así que los tarballs se publican declarando `"license": "MIT"` sin el texto de la licencia ni el copyright notice. CHANGELOG.md tampoco entra al tarball.

**Evidencia**: `"files": [ ⏎     "dist", ⏎     "README.md" ⏎   ],`

**Impacto**: MIT exige conservar el copyright notice junto al software distribuido; publicar sin él es un incumplimiento formal que los escáneres de compliance de empresas consumidoras marcan (bloquea adopción profesional). Sin CHANGELOG en el tarball, el consumidor offline no tiene historial de versiones.

**Recomendación**: Copiar LICENSE a cada package (script de build o paso de release que lo sincronice desde el root) y agregar "CHANGELOG.md" a files. Verificarlo en el gate de `npm pack --dry-run`.

### release-npm-05 — Release sin npm provenance: falta id-token en el workflow y publishConfig.provenance en los packages

- **Archivo**: `.github/workflows/release.yml:11` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El workflow de release declara solo `contents: write` y `pull-requests: write`; no hay `id-token: write` ni configuración de provenance en ningún lado (grep de "provenance" en .github/, .npmrc y los tres package.json: cero hits). Publicando desde GitHub Actions con changesets, habilitar provenance es agregar el permiso y `publishConfig.provenance: true` (o NPM_CONFIG_PROVENANCE=true).

**Evidencia**: `permissions: ⏎   contents: write ⏎   pull-requests: write`

**Impacto**: Sin provenance los packages publican sin attestation verificable de origen (sigstore), el estándar actual de supply-chain para packages públicos: npmjs no muestra el badge de procedencia y los consumidores con políticas de verificación no pueden validar que el tarball salió de este repo y este workflow. Es una mejora de bajo costo alineada con la prioridad 1 (buenas prácticas de la industria desde el inicio).

**Recomendación**: Agregar `id-token: write` a permissions del job de release y `"provenance": true` dentro de publishConfig en tokens y components. Queda latente hasta que el PO habilite el próximo publish (veto vigente).

### release-npm-06 — El gate de `npm pack --dry-run` prometido como mitigación en ADR-017 no existe

- **Archivo**: `docs/architecture/adr/ADR-017-secondary-entry-points.md:49` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

ADR-017 acepta el riesgo de desalineación del exports manual "mitigado con el gate de `npm pack --dry-run` que verifica los bundles del entry point", pero no hay ningún paso de pack en pr.yml, release.yml ni en los scripts de los package.json (grep de "pack --dry-run|npm pack|pnpm pack" en .github/, package.json y packages/: cero hits). El riesgo que ese gate mitigaba ya se materializó (exports desalineado, hallazgo 3) y el guard de compilation mode bypasseado (hallazgo 1) también lo habría detectado un gate sobre el tarball.

**Evidencia**: `mitigado con el gate de `npm pack --dry-run` que verifica los bundles del entry point`

**Impacto**: La consecuencia negativa aceptada por el ADR quedó sin su mitigación: cada release puede salir con exports rotos, archivos faltantes o dist envenenado sin que nada lo frene. Incoherencia entre decisión arquitectónica y realidad del repo (prioridades 1 y 3).

**Recomendación**: Agregar a pr.yml (post-build) un step que corra `npm pack --dry-run --json` en ambos packages y valide: presencia de fesm2022/types de ambos entry points, LICENSE/README/CHANGELOG, ausencia del prepublishOnly de ng-packagr, y que cada path de exports exista en el tarball.

### release-npm-07 — Publicar desde el root del package anula los guards de dist y no valida dist fresco

- **Archivo**: `.github/workflows/release.yml:38` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

`changeset publish` empaqueta el root de cada package con `files: ["dist"]`. Eso deja el manifest publicado duplicado (el raíz manual + dist/package.json generado dentro del tarball), anula el prepublishOnly que ng-packagr escribe en dist/ (hallazgo 1) y no verifica que dist exista o esté fresco: tokens no tiene ningún guard propio, y un publish local con dist viejo/vacío publicaría silenciosamente (CONTRIBUTING confía en que "El mantenedor NO publica manualmente", sin guard técnico).

**Evidencia**: `publish: pnpm changeset publish`

**Impacto**: El modelo de publicación actual depende de disciplina en vez de estructura: el 0.2.0 con full compilation salió justamente por este bypass. Para components, el patrón APF canónico es publicar el dist (publishConfig.directory), que además elimina el mantenimiento manual del exports.

**Recomendación**: Evaluar en un change: (a) `publishConfig.directory: "dist"` en components (changesets lo soporta) dejando el manifest generado por ng-packagr como fuente única, vs (b) mantener publish-from-root agregando prepublishOnly guards propios en ambos packages (dist presente + sin poison script). Opción (a) alinea con el ecosistema Angular; requiere ajustar cómo entran LICENSE/README/CHANGELOG a dist.

### release-npm-08 — El CHANGELOG 0.3.0 saldrá bilingüe: historial 0.2.0 en inglés, los 15 changesets pendientes en español

- **Archivo**: `packages/tokens/CHANGELOG.md:7` · **Producto**: HU-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Todas las entradas publicadas del 0.2.0 están en inglés ("feat(select): new `component.select.*` tokens…") mientras que los 15 changesets acumulados en .changeset/ están en español ("`DsToastService` (HU-008): sistema de toasts…"). Al versionar, el mismo archivo CHANGELOG quedará mezclado inglés/español.

**Evidencia**: `df00efa: feat(select): new `component.select.\*` tokens (trigger sizes/colors, listbox, option states)`

**Impacto**: El CHANGELOG es doc de consumo del package público: un historial bilingüe se ve poco profesional y complica a consumidores externos (la audiencia de npm por defecto lee inglés). Es una decisión de producto (idioma del package público) que conviene fijar antes del próximo release, mientras los changesets todavía son editables.

**Recomendación**: Decisión del PO: idioma canónico de artefactos publicados (README + CHANGELOG + changesets). Si se elige inglés, traducir los 15 changesets pendientes antes de versionar; si español, aceptar el 0.2.0 en inglés como histórico y documentar la convención en CONTRIBUTING.

### release-npm-09 — Changelog generator default sin links a commits/PRs (no usa @changesets/changelog-github)

- **Archivo**: `.changeset/config.json:3` · **Producto**: HU-002
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El config usa el generador default `@changesets/cli/changelog`, que produce entradas planas con hash corto sin link ("- df00efa: feat(select)…"). El estándar en design systems publicados desde GitHub es `@changesets/changelog-github`, que enlaza commit/PR/autor en cada entrada.

**Evidencia**: `"changelog": "@changesets/cli/changelog",`

**Impacto**: Los CHANGELOGs pierden trazabilidad para el consumidor: no puede saltar del changelog al diff/PR que introdujo el cambio. Mejora barata de mantenibilidad y de imagen profesional del package, con 15 entradas por escribirse en el próximo release.

**Recomendación**: Agregar `@changesets/changelog-github` como devDependency y configurar `"changelog": ["@changesets/changelog-github", { "repo": "roman-martini/design-system" }]` antes de versionar 0.3.0.

### release-npm-10 — engines del tooling del monorepo (pnpm >=9, node >=22.12) publicados en los manifests de consumo

- **Archivo**: `packages/tokens/package.json:24` · **Producto**: HU-002
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Ambos packages publican `engines: { node: ">=22.12.0", pnpm: ">=9.0.0" }`. Son restricciones del entorno de desarrollo del monorepo (donde .npmrc tiene engine-strict=true), no requisitos de runtime del consumidor: tokens es CSS + constantes JS y components corre en browser; ninguno exige pnpm ni un Node específico para consumirse.

**Evidencia**: `"engines": { ⏎     "node": ">=22.12.0", ⏎     "pnpm": ">=9.0.0" ⏎   },`

**Impacto**: Consumidores con pnpm y engine-strict fallan la instalación si usan pnpm 8, y los que estén en Node LTS anterior reciben warnings de unsupported engine — fricción de adopción artificial que no protege nada real. El engines del root (privado) ya cubre al equipo del repo.

**Recomendación**: Quitar el bloque engines de los package.json publicables (o dejar solo un node realista si algún tooling del consumidor lo requiere); mantenerlo únicamente en el package.json root privado.

---

<a id="tokens"></a>

## Arquitectura de design tokens (`tokens`)

**Evaluación general**: La arquitectura primitives → semantic → component → theme es sólida y se cumple casi sin excepciones en los 30+ archivos fuente: no hay referencias component→theme, los themes solo redefinen tokens semantic existentes y los valores crudos en component están documentados con comment. Los problemas reales están en los bordes: un bug de coherencia de focus ring en brands (ring azul en brand verde/violeta), un mismatch API/doc en el output JS publicado, y la ausencia total de gates automáticos — las reglas de jerarquía y el contraste AA que el spec declara como verificables solo se sostienen por revisión manual. Además, la ventana pre-1.0 para decisiones one-way door (formato DTCG en fuente, taxonomía de nombres CSS) se está cerrando con 0.2.0 ya publicado.

### tokens-01 — Focus ring queda azul en brand-a/brand-b: los brands no overridean semantic.shadow.focus

- **Archivo**: `packages/tokens/src/primitives/shadow.json:10`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

El primitive shadow.focus embebe el color de marca azul: '0 0 0 3px {color.blue.500}'. dark.json sí overridea semantic.shadow.focus (a blue.400), pero brand-a.json y brand-b.json solo overridean semantic.color.focus-ring (a green.200/purple.200). Resultado verificado en dist/themes/brand-a.css (línea 14: solo --ds-semantic-color-focus-ring): cualquier consumidor que siga el patrón del README ('.button:focus-visible { box-shadow: var(--ds-semantic-shadow-focus); }', README líneas 33-35) muestra un ring AZUL sobre una marca verde o violeta. Causa raíz: hay dos mecanismos de focus paralelos (semantic.color.focus-ring como color y semantic.shadow.focus como composite cuyo color vive en un primitive), y cada theme debe recordar sincronizar ambos.

**Evidencia**: `"focus": { "value": "0 0 0 3px {color.blue.500}" }`

**Impacto**: Bug de coherencia visual de theming publicado en 0.2.0: la promesa central del modelo de brands (ADR-003 §4, 'zero component code changes') se rompe para el estado de foco, que además es el indicador de accesibilidad WCAG 2.4.7. Cada theme nuevo repetirá el error porque la estructura lo invita.

**Recomendación**: Corto plazo: agregar el override de semantic.shadow.focus en brand-a.json y brand-b.json. Estructural: recomponer el composite en el nivel semantic a partir del color semántico (ej. semantic.shadow.focus = '0 0 0 3px {semantic.color.focus-ring}') para que los themes solo tengan que redefinir focus-ring; requiere delta del spec porque el scenario 'token shadow.focus existe en primitives' (spec líneas 169-172) fija la forma actual con el color crudo en el primitive.

**Nota de verificación**: Verificado en sesión: brand-a.json solo overridea semantic.color.\* (incl. focus-ring); no overridea semantic.shadow.focus.

**Cierre (2026-08-07, `aaa-052`)**: ejecutado por la vía estructural (composite desde `semantic.color.focus-ring`), con una corrección a la evidencia: la discrepancia token↔render existía **en los cuatro scopes**, no solo en las marcas — `focus-ring` declaraba tonos `200` pálidos (y `blue.700` en dark) que nunca se pintaron; leen como el halo de un anillo de dos capas jamás implementado. Hubo que **realinear los valores al render** (blue.500/400; marcas a green.600/purple.500, fijadas por gate) además de recomponer. La causa de que el bug sobreviviera: `contrast-pairs.json` no tenía ningún par de focus ring — se agregó con umbral `ui` en todos los scopes. El anillo bajó además a 2px (feedback del PO en el gate). Derivado: el gate destapó en vivo la familia hermana de este bug —dark+marca sin variante oscura— que se modeló como matriz brand × scheme en `aaa-054`.

### tokens-02 — README documenta tokens.DsColorBlue500 pero el build exporta ColorBlue500 (plataforma JS sin prefix)

- **Archivo**: `packages/tokens/README.md:63`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

El README promete 'console.log(tokens.DsColorBlue500); // "#3b82f6"', pero dist/tokens.js (línea 22) exporta 'export const ColorBlue500 = "#3b82f6"'. En sd.config.mjs el prefix 'ds' está solo en la plataforma css (línea 14); la plataforma js (líneas 24-31) no lo declara. El ejemplo documentado del único export JS del package falla en runtime (undefined). Esto está publicado en npm 0.2.0.

**Evidencia**: `console.log(tokens.DsColorBlue500); // "#3b82f6"`

**Impacto**: Contrato público roto en la documentación del package publicado: el primer contacto de un consumidor JS con la librería falla. Además deja al descubierto una inconsistencia de API: el namespace Ds/ds- es contractual en CSS y componentes pero no existe en JS, donde el riesgo de colisión de nombres genéricos (ColorBlue500) en el scope del consumidor es mayor.

**Recomendación**: Decisión del PO entre dos caminos: (a) agregar prefix 'ds' a la plataforma js para alinear con el contrato --ds-\* (rename de todos los exports JS: breaking pre-1.0, minor bump + changeset con nota de migración), o (b) corregir el README a ColorBlue500 y aceptar el namespace sin prefix como contrato. Recomendado (a) mientras la superficie JS tenga pocos consumidores; documentar en el changeset.

**Nota de verificación**: Verificado en sesión: README:63 documenta tokens.DsColorBlue500; sd.config.mjs declara prefix "ds" solo en plataformas css.

### tokens-03 — Las reglas de jerarquía de referencias no tienen ningún gate automático (solo revisión manual)

- **Archivo**: `openspec/specs/design-tokens-package/spec.md:105`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

El spec exige para cada regla de jerarquía que 'el build SHALL fallar o el revisor SHALL rechazarlo', pero hoy solo existe el revisor humano: sd.config.mjs no tiene preprocessor ni validación, y los 3 tests de packages/tokens/test/ cubren únicamente z-index, overlay-motion y effect (3 categorías semantic de ~30 archivos fuente). Nada verifica automáticamente que primitives no referencien otros niveles, que component no referencie theme, que theme solo redefina claves existentes de semantic (verificado a mano en esta auditoría: hoy se cumple), ni detecta tokens huérfanos (color.neutral.0 y color.black no tienen ninguna referencia en src/, y color.white duplica el valor #ffffff de neutral.0).

**Evidencia**: `el build SHALL fallar o el revisor SHALL rechazarlo (los primitives no dependen de semantics)`

**Impacto**: Con 20 archivos component, 3 themes y crecimiento constante (un componente nuevo por change), la garantía de la invariante arquitectónica central del package depende de que cada review humano la recuerde. Una violación silenciosa (theme que introduce un token nuevo, component que duplica un valor semantic) rompe el modelo de theming sin que CI lo note.

**Recomendación**: Agregar un spec de Vitest de validación estructural que parsee src/\*_/_.json y afirme: (1) primitives sin referencias salientes salvo intra-primitives documentadas, (2) semantic referencia solo primitives (+aliases intra-nivel no circulares), (3) component referencia solo semantic|primitives, (4) claves de theme ⊆ claves de semantic, (5) sin ciclos, (6) reporte de huérfanos en semantic/component. Corre en el 'pnpm -r test' que CI ya ejecuta (pr.yml línea 35), costo cero de infra nueva.

**Nota de verificación**: Corroborado con testing-09 (confirmado): la suite de tokens son 3 specs de src/semantic; nada valida jerarquía.

### tokens-04 — El requirement de contraste WCAG AA no tiene gate en CI: el script existe pero solo corre on-demand

- **Archivo**: `openspec/specs/design-tokens-package/spec.md:287`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

El requirement 'Contraste WCAG AA de tokens interactivos' exige verificación 'por cálculo (script check-a11y/scripts/contrast.mjs u otro determinístico), no por estimación visual', con pares y umbrales concretos (text.inverse/bg.primary ≥4.5:1, borders ≥3:1, cadena hover/active) en todos los themes. El script existe en .claude/skills/check-a11y/scripts/contrast.mjs pero solo se ejecuta cuando alguien invoca la skill; .github/workflows/pr.yml corre 'pnpm -r test', que solo ejecuta los 3 specs actuales (ninguno de contraste). Un ajuste de theme (ej. aclarar bg.primary de dark) puede romper AA y mergear en verde.

**Evidencia**: `La verificación SHALL ser por cálculo (script `check-a11y/scripts/contrast.mjs` u otro determinístico), no por estimación visual`

**Impacto**: El contrato de accesibilidad más importante del package es el único requirement del spec con scenarios cuantitativos que no está cubierto por el pipeline. La regresión es silenciosa y afecta a todos los consumidores en todos los themes; verifiqué manualmente que hoy los pares del spec pasan (ej. white sobre blue.600 ≈ 5.17:1), pero nada impide que dejen de hacerlo.

**Recomendación**: Portar los pares del requirement a un packages/tokens/test/contrast.spec.ts que lea dist/tokens.css + dist/themes/\*.css (o reutilice la lógica de contrast.mjs) y falle bajo umbral. Al vivir en test/, entra gratis al gate de CI existente. Mantener la skill check-a11y para auditorías amplias de componentes.

**Nota de verificación**: Idéntico al hallazgo testing-01, confirmado por verificador adversarial.

### tokens-05 — Fuente de tokens en formato legacy de Style Dictionary (value sin $type): la ventana pre-1.0 para migrar a DTCG se cierra

- **Archivo**: `docs/architecture/adr/ADR-003-arquitectura-design-tokens.md:131`
- **Severidad**: media · **Tamaño**: L · **Ejecución**: decision-po · **Effort**: high
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Los 30+ JSON de src/ usan el formato propio de SD ('value', sin '$type' en ningún archivo — verificado con grep: cero ocurrencias de $value/$type). ADR-003 lo aceptó como trade-off ('El formato JSON propio de SD no es 100% W3C compatible') y el change activo aaa-012 agrega un OUTPUT DTCG para Figma, pero la FUENTE sigue legacy: sin $type, la tipificación de tokens depende de heurísticas de path/transform, y el target DTCG de aaa-012 tendrá que inferir tipos en vez de leerlos. Style Dictionary 4 soporta DTCG ($value/$type/$description) de forma nativa en la fuente.

**Evidencia**: `El formato JSON propio de SD no es 100% W3C compatible`

**Impacto**: Migrar la fuente hoy es un find/replace mecánico + $type por grupo; con más tokens, más themes y el pipeline de Figma construido encima del formato actual, el costo crece de forma no lineal. Es exactamente el tipo de decisión one-way door que las prioridades del repo dicen tomar temprano: DTCG es la dirección de la industria (Figma Variables, Tokens Studio, Terrazzo) y $description habilita además documentación generada.

**Recomendación**: Decisión del PO (nuevo ADR que matice el trade-off de ADR-003, sin cambiar build tool ni jerarquía): migrar src/ a $value/$type antes o junto con aaa-012, aprovechando que el output CSS/JS no cambia (verificable byte-a-byte contra dist/ actual como test de la migración). Coordinar con aaa-012 para que el export a Figma lea $type real en vez de inferirlo.

### tokens-06 — Taxonomía del output CSS inconsistente entre niveles y con fuga de conceptos de componente al nivel semantic

- **Archivo**: `packages/tokens/src/semantic/typography.json:23`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: high
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Dos inconsistencias de naming estructural: (1) los primitives emiten sin namespace de nivel (--ds-color-blue-500, --ds-shadow-md) mientras semantic y component sí lo llevan (--ds-semantic-_, --ds-component-_) — el nivel es información inconsistentemente codificada en el nombre, y los primitives quedan tan públicos como los semantic sin marca que desaliente su uso directo; (2) semantic/typography.json define claves específicas de un componente dentro del nivel semantic ('button-sm', 'button-md', 'button-lg' en font.size), cuando el nivel semantic debería ser agnóstico de componentes — esos tamaños pertenecen a component/button.json. Además el segmento 'semantic' hace los nombres más largos que el estándar de la industria (--ds-semantic-color-bg-primary vs --ds-color-bg-primary de Salesforce/Adobe/Carbon).

**Evidencia**: `"button-sm": { "value": "{font.size.sm}" },`

**Impacto**: El naming del output CSS es contrato público ya publicado en 0.2.0: cada release que pasa hace más caro corregirlo (todo cambio es breaking). La fuga button-\* en semantic degrada la separación de niveles que es el argumento central de la arquitectura; la asimetría de namespaces complica reglas de lint futuras ('los consumidores no deberían usar primitives directo').

**Recomendación**: Decisión del PO pre-1.0, documentada en ADR: (a) mover font.size.button-\* a component/button.json (cambio chico, breaking acotado), y (b) decidir si el namespace de niveles se normaliza (acortar 'semantic' o marcar primitives) o se congela el naming actual como contrato definitivo en 1.0. Ejecutar antes del próximo release para minimizar consumidores afectados.

### tokens-07 — El theme dark no overridea las sombras de elevación: rgba(0,0,0,0.1) es casi invisible sobre fondos oscuros

- **Archivo**: `packages/tokens/src/theme/dark.json:68`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

dark.json solo overridea semantic.shadow.focus; las demás sombras semánticas (card, card-hover, dropdown, modal, toast, input definidas en semantic/shadow.json líneas 4-10) heredan primitives calibrados para light (rgba(0,0,0,0.05-0.25)). Sobre bg.surface neutral.900 (#171717) una sombra negra al 10% es imperceptible: cards, dropdowns y modales pierden su jerarquía de elevación en dark. La cobertura de color de dark sí es completa (verifiqué clave por clave contra semantic/color.json: 100% overrideado), el hueco es específicamente la elevación.

**Evidencia**: `"shadow": { ⏎       "focus": { "value": "0 0 0 3px {color.blue.400}" } ⏎     }`

**Impacto**: Los overlays (modal, dropdown, toast) y las cards dependen de la sombra para separarse del fondo; en dark el sistema pierde ese canal visual y los componentes se aplanan. Material, Radix y Carbon ajustan elevación en dark (sombras más opacas y/o bordes reforzados); es el estándar que la vara profesional del repo pide.

**Recomendación**: Decisión de diseño del PO sobre la estrategia (sombras más opacas en dark vs reforzar con border.subtle en superficies elevadas — bg.elevated ya existe y ayuda); luego agregar los overrides de semantic.shadow.\* a dark.json. Considerar incluir el par en los tests de theme-coverage del gate de jerarquía.

**Cierre (2026-08-07, `aaa-052`)**: hecho según [D-025] (sombras más opacas, 0.1→0.4, en card/card-hover/dropdown/modal/toast; `input` y `focus` fuera por no ser elevación). El "test de theme-coverage" sugerido se materializó como `elevation.spec.ts`: paridad de geometría entre scopes + opacidad estrictamente mayor en dark. OK visual del PO en el gate.

### tokens-08 — Componentes referencian tipografía de primitives salteando el nivel semantic, de forma inconsistente entre sí

- **Archivo**: `packages/tokens/src/component/alert.json:10`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

alert usa '{font.size.sm}' y '{font.weight.semibold}' directo de primitives cuando existen equivalentes semantic (semantic.font.size.body-sm = font.size.sm; semantic.font.weight.subhead = semibold); lo mismo tooltip (font-size: {font.size.xs}) e input (font-size sm/md/lg y helper.font-size desde primitives). En contraste, button referencia {semantic.font.size.button-\*} y {semantic.font.weight.button}. Es legal según la regla ('component puede referenciar semantic o primitives') pero viola su espíritu: 'cuando un valor ya existe como token semantic, el token component SHALL referenciarlo' (spec línea 92).

**Evidencia**: `"title-font-size":    { "value": "{font.size.sm}" },`

**Impacto**: Todo lo que se referencia desde primitives queda fuera del alcance del theming: un theme que ajuste la tipografía semantic (ej. escala densa) re-tematiza button pero no alert/tooltip/input. La inconsistencia entre componentes además vuelve impredecible dónde tocar para un cambio tipográfico global.

**Recomendación**: Normalizar las referencias tipográficas de component a los tokens semantic existentes (alert→body-sm/subhead, tooltip→body-xs, input→body-_/label-_). El CSS emitido cambia solo el var() intermedio (mismo valor computado): patch changeset. Documentar el criterio 'semantic primero, primitive solo si no existe equivalente' en el README del package.

**Cierre parcial (2026-08-07, `aaa-052`)**: la evidencia se quedaba corta — el bypass real son **28 referencias en 11 componentes** (avatar, checkbox, menu, radio, select, slider, switch, tabs, accordion, breadcrumbs, pagination, además de los 3 citados), y **no todas son mapeables**: las iniciales del avatar usan `font.size.*` como escala dimensional sin rol semantic (su alias de igual valor para `xl` sería `heading-4` — absurdo). Una regla automática "existe alias → falla" daba falsos positivos o forzaba mapeos arbitrarios. Resolución (criterio de recomendación de CLAUDE.md): **trinquete** — tooltip/input remapeados por rol + baseline `LEGACY_FONT_REFS` congelado en `hierarchy.spec.ts` (referencia nueva falla; el baseline solo se achica). Alert lo salda `aaa-053` al retirar el archivo; el resto es el ítem "burn-down del legado tipográfico" (Later, BACKLOG).

### tokens-09 — semantic/motion.json duplica valores de primitives como strings crudos en vez de interpolar referencias

- **Archivo**: `packages/tokens/src/semantic/motion.json:5`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Las 6 transitions componen duration+easing con literales: '100ms cubic-bezier(0, 0, 0.2, 1)' duplica exactamente motion.duration.fast (100ms) y motion.easing.ease-out (mismo bezier) de primitives/motion.json. Style Dictionary 4 soporta interpolación de referencias dentro de strings ('{motion.duration.fast} {motion.easing.ease-out}'), como ya se hace en shadow.focus ('0 0 0 3px {color.blue.500}').

**Evidencia**: `"fast":          { "value": "100ms cubic-bezier(0, 0, 0.2, 1)" },`

**Impacto**: Si se retunea un easing o duration primitive, las 6 transitions semantic derivan silenciosamente (el mismo bug de drift que la jerarquía existe para prevenir). También es una violación del principio del spec de no duplicar valores que ya existen como token.

**Recomendación**: Reescribir los values como composición de referencias a primitives. Nota: con referencias parciales SD emite el valor resuelto (no var()), así que el CSS final no cambia; los tests existentes de overlay-motion (formato '<n>ms cubic-bezier') deben pasar sin cambios contra dist en vez de contra src, o validar el valor resuelto.

**Cierre (2026-08-07, `aaa-052`)**: hecho, con una corrección al "el CSS final no cambia": `overlay-enter` (250 ms) y `overlay-exit` (150 ms) **no existían en la escala primitiva** (100/200/300/500) — el hallazgo era también un defecto de escala, no solo de duplicación. Se alinearon a `duration.normal`/`duration.fast` (200/100 ms) en vez de agregar peldaños innombrables entre los existentes: **cambio visual acotado**, aprobado por el PO en el gate. `overlay-motion.spec.ts` valida ahora el valor resuelto siguiendo referencias + la regla "ningún preset es literal".

### tokens-10 — semantic.space.negative referencia tokens del propio nivel semantic: la regla escrita en ADR-003/spec quedó desactualizada

- **Archivo**: `packages/tokens/src/semantic/space.json:13`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: openspec-change · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Los 6 tokens de space.negative usan 'calc(-1 _ {semantic.space._})' — referencias intra-nivel semantic→semantic. La tabla de ADR-003 (línea 86) y las reglas del spec (línea 91) solo autorizan semantic→primitives; ninguna contempla aliases dentro del mismo nivel. La práctica es sana (alias no circular, evita duplicar la escala) y ya se publicó vía aaa-037 (avatar.group.overlap la consume), pero la letra de la gobernanza no la cubre: un gate automático estricto (hallazgo del gate de jerarquía) la marcaría como violación.

**Evidencia**: `"2xs": { "value": "calc(-1 * {semantic.space.2xs})" },`

**Impacto**: Drift entre la realidad del código y las dos fuentes de verdad normativas (spec testable y ADR). Sin resolverlo, el gate de jerarquía no puede escribirse sin decidir ad-hoc qué es legal, y el próximo revisor puede rechazar (o aceptar) referencias intra-nivel arbitrariamente.

**Recomendación**: Delta chico del spec design-tokens-package: autorizar explícitamente referencias intra-nivel no circulares en semantic (y decidir si también en component), manteniendo la prohibición de ciclos. ADR-003 es inmutable: dejar constancia en el proposal del change que la tabla del ADR queda matizada por el spec.

**Cierre (2026-08-07, sin trabajo)**: **ya estaba resuelto por `aaa-041`** (2026-07-30, Parte F1-b): la regla "se admiten aliases intra-`semantic` no circulares" entró a la spec en ese change y `hierarchy.spec.ts` la verifica desde entonces. El hallazgo era correcto al escribirse; la fila del plan quedó desactualizada al no tacharse cuando F1-b la cerró de pasada.

### tokens-11 — Tooltip usa text.primary como fondo: falta el concepto bg.inverse en el nivel semantic

- **Archivo**: `packages/tokens/src/component/tooltip.json:4`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

tooltip.bg = '{semantic.color.text.primary}' y tooltip.text = '{semantic.color.bg.surface}': un token de TEXTO como fondo y uno de FONDO como texto. Funciona (produce el tooltip invertido clásico y se auto-invierte en dark), pero es un hack semántico: el rol 'superficie invertida' no existe en la taxonomía. DS maduros modelan esto con bg.inverse / text.on-inverse (Carbon, Atlassian, Polaris).

**Evidencia**: `"bg":        { "value": "{semantic.color.text.primary}" },`

**Impacto**: El próximo componente con superficie invertida (toast oscuro, badge invertido, popover de onboarding) repetirá el hack o inventará otro; ajustar text.primary por razones tipográficas arrastraría los fondos de tooltips. Rompe la legibilidad de la capa semantic como vocabulario de intenciones.

**Recomendación**: Agregar semantic.color.bg.inverse y semantic.color.text.on-inverse (referenciando los mismos primitives que hoy resuelven text.primary/bg.surface, para no cambiar el render) y repuntar tooltip. Overridear ambos en dark.json. Cambio aditivo + patch de tooltip: changeset minor.

**Cierre (2026-08-07, `aaa-052`)**: hecho **sin `text.on-inverse`** — `semantic.color.text.inverse` ya existía con exactamente ese significado (white en light, neutral.900 en dark); crear el segundo era un sinónimo con costo de migración. Se agregó solo `bg.inverse`, el tooltip se repuntó al par y el par entró al gate de contraste (4.5:1 en todos los scopes). Render idéntico, como preveía la recomendación.

### tokens-12 — El tarball publicado no incluye LICENSE: files solo declara dist y README, y no hay LICENSE en el directorio del package

- **Archivo**: `packages/tokens/package.json:46`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

'files': ['dist', 'README.md'] y no existe packages/tokens/LICENSE (verificado; el LICENSE vive solo en el root del repo). npm incluye automáticamente un LICENSE solo si está en el directorio del package, así que el tarball 0.2.0 declara 'license: MIT' sin el texto de la licencia. Además el README del package (línea 115) linkea '[MIT](../../LICENSE)', path relativo que no resuelve en npmjs.com ni dentro del tarball. La propia spec lo contempla: 'el listado SHALL contener ... LICENSE (si existe)' (spec línea 77).

**Evidencia**: `"files": [ ⏎     "dist", ⏎     "README.md" ⏎   ],`

**Impacto**: Distribuir bajo MIT requiere incluir el texto de la licencia con la copia; los escáneres de compliance de consumidores corporativos (el público objetivo de 'proyectos profesionales') marcan packages sin LICENSE en el tarball. Aplica igual a @romanmartinidev/components.

**Recomendación**: Copiar LICENSE a cada package publicable (o script prepack que lo copie desde el root) y agregarlo a 'files'. Corregir el link del README a la URL absoluta del repo. Entra en el próximo release ya vetado-pendiente; no requiere publicar ahora.

### tokens-13 — sd.config.mjs es un script de build con nombre de config: mezcla definición y ejecución

- **Archivo**: `packages/tokens/sd.config.mjs:77`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El archivo llamado 'config' ejecuta el build con top-level await al importarse ('await sdBase.buildAllPlatforms()', líneas 77-80) y package.json lo corre con 'node sd.config.mjs'. No es consumible como configuración: ni el CLI de Style Dictionary ni un test pueden importar la definición (sources, plataformas, themes) sin disparar el build completo con efectos en dist/.

**Evidencia**: `await sdBase.buildAllPlatforms();`

**Impacto**: Bloquea reutilizar la definición para los gates pendientes (el validador de jerarquía y el test de contraste se beneficiarían de importar la lista de themes/selectors en vez de duplicarla) y para el target DTCG de aaa-012, que va a necesitar extender esta misma estructura. Costo de mantenibilidad menor hoy, pero es el momento barato de separarlo porque aaa-012 ya lo va a tocar.

**Recomendación**: Separar en sd.config.mjs (exporta la definición: base, themes, plataformas) y build.mjs (importa y ejecuta), actualizando los scripts build/watch. Aprovechar el paso por aaa-012 para hacerlo en el mismo change y que el target DTCG nazca sobre la estructura limpia.

**Cierre (2026-08-07, `aaa-052`)**: hecho tal cual (sin esperar a `aaa-012`, que sigue pausado por [D-027]): `sd.config.mjs` exporta `sdBase`/`themes`/`themeBuilds` sin efectos de import y `build.mjs` ejecuta; `dist` verificado byte-a-byte idéntico. El beneficio ya se cobró en el mismo change: los tests importan la definición sin disparar escrituras.

---

<a id="components"></a>

## Calidad de código de componentes (`components`)

**Evaluación general**: Calidad de base muy alta: Angular moderno consistente (standalone, signals, OnPush, control flow nativo), a11y trabajada con criterio APG, tokens --ds-\* aplicados de forma casi total y cleanup de listeners/timers correcto en general. Los gaps principales son transversales: cero guardas SSR en los componentes que tocan document/window (crítico para una lib publicada), un bug real de hover-timer en el menú, dos huecos de contrato de forms (touched en Select) y duplicación de scaffolding de overlays que ya alcanzó el umbral de extracción que ADR-016 fijó. El resto son mejoras de nivel profesional (type submit en Button, typeahead en Select, i18n del avatar-group) y limpiezas menores de consistencia.

### components-01 — Sin compatibilidad SSR: uso directo de document/window sin guarda en modal, toast, tooltip, select y menú

- **Archivo**: `packages/components/src/lib/modal/modal.ts:26`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Confirmado (verificación inline en sesión)

Ningún componente del kit inyecta DOCUMENT ni guarda con isPlatformBrowser/afterNextRender (solo breadcrumbs usa afterNextRender). Dos rutas explotan en servidor: (1) el effect de DsModal corre durante el render SSR y con open=true ejecuta dialog.showModal() y lockBodyScroll() que toca document.body (modal.ts:26-27, 66-70) — en Node `document` no existe como global → ReferenceError; (2) DsToastService.show() llamado durante SSR ejecuta document.body.appendChild (toast.ts:138). Tooltip/select/menú usan window/document solo en rutas event-driven (menos crítico) pero también sin guarda (tooltip.ts:168-170, select.ts:223-224, menu.ts:96-97). Una lib de componentes profesional debe ser SSR-safe: es requisito de Angular Universal/hydration y está en el propio knowledge (§ 'Server-side rendering' de la lista vigilada).

**Evidencia**: `previousBodyOverflow = document.body.style.overflow;`

**Impacto**: Cualquier app con @angular/ssr que renderice un ds-modal abierto o dispare un toast en el arranque crashea el server render. Bloquea la adopción del kit en proyectos profesionales con SSR/hydration — la vara declarada del repo.

**Recomendación**: Change transversal: inyectar DOCUMENT (DI) en vez del global, guardar las rutas no event-driven con isPlatformBrowser o afterNextRender (el sync del dialog en DsModal, ensureContainer en DsToastService), y declarar el soporte SSR en el spec de cada componente. Patrón único documentado (candidato a ADR corto) para que todo componente futuro nazca SSR-safe.

**Nota de verificación**: Verificado en sesión: grep de isPlatformBrowser/PLATFORM_ID/inject(DOCUMENT → solo breadcrumbs usa afterNextRender; document.body directo en modal.ts:26-35, toast.ts:138, tooltip.ts:194.

### components-02 — DsMenuItem: hover-timer de submenú sin cancelación en mouseleave ni al cerrar el menú (abre submenús huérfanos y roba foco)

- **Archivo**: `packages/components/src/lib/menu/menu-item.ts:119` · **Producto**: HU-012
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

onMouseEnter arma un setTimeout de ~150ms que llama openSubmenu(false), pero el host solo bindea click/keydown/mouseenter (líneas 34-37): no hay mouseleave que cancele el timer, y close() del menú tampoco lo cancela. Secuencias reales: (a) hover sobre item A con submenú → mover a item B antes de 150ms → el timer de A dispara igual: abre el submenú de A y ejecuta this.hostElement().focus() (línea 149) robando el foco a B mientras el mouse está sobre B; (b) hover sobre A → Escape cierra el menú → el timer dispara openFromAnchor sobre un menú ya cerrado → submenú popover huérfano visible en pantalla.

**Evidencia**: `this.hoverTimer = setTimeout(() => this.openSubmenu(false), this.resolveHoverDelay());`

**Impacto**: Bug de interacción observable en uso normal del menú con submenús: foco robado (a11y) y paneles huérfanos en el top layer. Contradice el estándar APG que el propio componente cita.

**Recomendación**: Agregar '(mouseleave)': cancelar hoverTimer; y en DsMenu.close()/closeOpenSubmenus() pedir a cada item que cancele su timer pendiente (extender DsMenuItemRegistration con cancelPendingOpen() o cancelar dentro de closeOwnSubmenu). Test de regresión para ambas secuencias.

**Nota de verificación**: Verificado en sesión: host de menu-item.ts solo bindea mouseenter (línea 36), setTimeout en :119; existe clearTimeout (:170-172) pero ningún mouseleave lo invoca.

### components-03 — DsSelect no marca touched en blur: onTouched solo se llama al cerrar el listbox

- **Archivo**: `packages/components/src/lib/select/select.ts:234` · **Producto**: HU-003
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificación inline en sesión)

El único llamado a this.onTouched() está dentro de closeList() (línea 234). select.html no tiene handler (blur) en el trigger. Si el usuario enfoca el select y tabula sin abrirlo (o el foco pasa de largo), el control jamás pasa a touched — el patrón estándar 'invalid && touched' de las apps consumidoras nunca muestra el error de un select requerido no tocado. DsFieldBase sí implementa onBlur() → onTouched() (field-base.ts:123-125): el contrato de forms del kit es inconsistente entre sus propios controles.

**Evidencia**: `this.detachRepositionListeners(); ⏎     this.onTouched();`

**Impacto**: Rompe silenciosamente el contrato de Reactive Forms que cualquier app profesional asume; la validación de un select requerido no se visibiliza con el flujo normal de foco.

**Recomendación**: Agregar (blur) en el trigger que llame onTouched() cuando el listbox no está abierto (evitar marcar touched al mover foco por apertura), con test: focus + tab sin abrir → control.touched === true.

**Nota de verificación**: Verificado en sesión: onTouched() solo se llama en select.ts:234 (closeList); ningún handler blur en select/.

### components-04 — Live region de toasts creada lazy en el primer show(): el primer toast puede no anunciarse en screen readers

- **Archivo**: `packages/components/src/lib/toast/toast.ts:129` · **Producto**: HU-008
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

ensureContainer() crea el contenedor recién en el primer show(), y el role status/alert viaja en el host del item que se inserta en ese mismo ciclo (toast-item.ts:36). Es una limitación conocida de los screen readers: una live region insertada simultáneamente con su contenido frecuentemente no se anuncia — las regiones aria-live deben preexistir en el DOM. Los DS de referencia (Material, Spectrum) mantienen la región viva persistente.

**Evidencia**: `// Creación perezosa al primer toast; el elemento queda vivo entre ráfagas.`

**Impacto**: El primer toast de la sesión (a menudo el más importante: confirmación o error inicial) puede ser invisible para usuarios de screen reader — socava el trabajo a11y ya invertido en el componente (WCAG 2.2.1, roles por variante).

**Recomendación**: Crear el contenedor (o al menos la región live vacía) de forma eager en el constructor del service guardado por isPlatformBrowser (sinergia con el finding SSR), o exponerlo en provideDsToasts vía ENVIRONMENT_INITIALIZER.

### components-05 — Scaffolding de overlays triplicado (select/menú/tooltip): el umbral del 'tercer caso' de ADR-016 ya se alcanzó

- **Archivo**: `packages/components/src/lib/select/select.ts:223`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

ADR-016 regla 3 difiere la extracción 'hasta que un tercer caso repita el mismo modo'. El cálculo de placement es legítimamente distinto por overlay, pero el esquema común ya está copiado 3 veces idéntico: attach/detach de repositionListener en scroll/resize con capture+passive (select.ts:223-224/299-302, menu.ts:96-97/308-311, tooltip.ts:169-170/294-298), sync del estado con el toggle nativo (select.ts:209-215, menu.ts:149-157) y la marca anti doble-toggle wasOpenOnPointerdown duplicada en DsSelect (líneas 85-86, 139-151) y DsMenuTrigger (líneas 31-46). Todo overlay futuro (popover genérico, datepicker) copiaría una cuarta vez.

**Evidencia**: `window.addEventListener('scroll', this.repositionListener, { capture: true, passive: true });`

**Impacto**: Deriva asegurada: un fix en el ciclo de vida de un overlay (p.ej. la guarda SSR, o un leak en un edge case de listeners) hay que replicarlo a mano en 3+ lugares. Mismo argumento con el que ADR-020 justificó DsFieldBase.

**Recomendación**: Change que extraiga la infraestructura común (no el cálculo de placement, que sigue local por ADR-016): helper interno tipo DsOverlayScaffold con open/close (showPopover/hidePopover + toggle-sync + listeners + marca pointerdown), consumido por select, menú y tooltip. Citar ADR-014/016; la extracción está prevista por el propio ADR, no lo contradice.

### components-06 — DsButton no soporta type='submit': inutilizable como botón de envío de formularios

- **Archivo**: `packages/components/src/lib/button/button.html:2`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El template fija type="button" sin input para cambiarlo. Un kit cuyo Input/Textarea/Select/Checkbox están pensados para Reactive Forms no ofrece el botón que dispara el submit nativo (Enter en un campo incluido). ADR-011 ya dejó anotado el trade-off: 'Si aparece un botón submit, la guarda en el click + no propagar cubre el caso — a documentar en su momento'. Ese momento es ahora: la familia de forms está completa (aaa-036/ADR-020) y el caso de uso es inmediato en cualquier app real.

**Evidencia**: `type="button"`

**Impacto**: Los consumidores deben usar <button> nativo para el submit y pierden variantes/loading/disabledReason del DS justo en el botón más importante del formulario — fricción directa contra la vara 'usable en proyectos profesionales'.

**Recomendación**: Input type: 'button' | 'submit' | 'reset' = 'button'. Con aria-disabled + submit, la guarda debe además prevenir el submit nativo (event.preventDefault() cuando disabled/loading), como ADR-011 anticipa; cubrir con tests. Feature aditiva → changeset minor (sin publicar, veto vigente).

### components-07 — DsSelect sin typeahead por caracteres imprimibles (el patrón APG select-only lo incluye y DsMenu ya lo implementa)

- **Archivo**: `packages/components/src/lib/select/select.ts:165` · **Producto**: HU-003
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

onTriggerKeydown maneja flechas, Home/End, Enter/Space y Escape, pero ignora caracteres imprimibles. El patrón APG 'Select-Only Combobox' que el componente sigue (role=combobox + aria-activedescendant) especifica typeahead: tipear salta a la opción que empieza con esos caracteres, con y sin listbox abierto. DsMenu ya tiene la implementación completa con buffer y reset de 500ms (menu.ts:231-249) — la paridad interna del kit quedó rota: el menú es navegable por tipeo y el select, donde más rinde (listas largas de opciones), no.

**Evidencia**: `if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {`

**Impacto**: Accesibilidad y eficiencia de teclado por debajo del estándar del propio kit y del APG en el componente con listas potencialmente largas; inconsistencia de comportamiento entre componentes hermanos.

**Recomendación**: Portar el typeahead de DsMenu a DsSelect (buffer + TYPEAHEAD_RESET_MS) usando labelText() de las opciones registradas; ideal extraer el helper de typeahead compartido (sinergia con el finding de scaffolding).

### components-08 — DsModal sin nombre accesible cuando no hay heading (falta alias aria-label que el resto del kit ya estandarizó)

- **Archivo**: `packages/components/src/lib/modal/modal.ts:56`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

labelledBy devuelve null si heading está vacío y no existe input aria-label: un modal sin heading queda como dialog sin nombre accesible (violación de WCAG 4.1.2 / regla dialog-name de axe). DsSelect (select.ts:56-57) y DsFieldBase (field-base.ts:39-40) ya establecieron el patrón de aliases 'aria-label'/'aria-labelledby' para exactamente este caso; el modal no lo adoptó.

**Evidencia**: `protected readonly labelledBy = computed(() => (this.heading() ? this.headingId : null));`

**Impacto**: Un screen reader anuncia 'diálogo' sin contexto en modales sin título (p.ej. confirmaciones custom con contenido proyectado); inconsistencia de API frente al patrón ya establecido en el kit.

**Recomendación**: Sumar los aliases aria-label/aria-labelledby al DsModal (mismo patrón que select/field) y aplicar aria-label al <dialog> cuando no hay heading; test de que siempre hay nombre accesible por una de las dos vías.

### components-09 — DsAvatarGroup hardcodea el texto '+N' accesible en español sin posibilidad de override (i18n)

- **Archivo**: `packages/components/src/lib/avatar/avatar-group.ts:46` · **Producto**: HU-022
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

moreLabel se computa como `y ${overflowCount()} más` sin input para personalizarlo. El resto de los strings por defecto del kit son overridables (closeLabel del modal, dismissLabel de provideDsToasts, label del spinner); este es el único texto anunciado por screen reader que un consumidor no puede traducir ni ajustar. Para una lib publicada que apunta a proyectos profesionales, todo texto expuesto a AT debe ser configurable.

**Evidencia**: `protected readonly moreLabel = computed(() => `y ${this.overflowCount()} más`);`

**Impacto**: Apps en otro idioma anuncian el overflow del grupo en español sí o sí — bloqueo de i18n en la superficie a11y y ruptura de la convención propia del kit (defaults overridables).

**Recomendación**: Input moreLabel de tipo (count: number) => string (o string con placeholder) con el default actual. Aprovechar para documentar la convención 'todo string anunciado por AT es overridable' en el spec de componentes.

### components-10 — Contadores de ID a nivel módulo duplicados en 7+ componentes, con riesgo de colisión de IDs entre apps en la misma página

- **Archivo**: `packages/components/src/lib/button/button.ts:15`
- **Severidad**: baja · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El patrón `let nextXId = 0` está copiado en button (nextReasonId), select (nextSelectId:31), option (nextOptionId:13), menu (nextMenuId:24), modal (nextHeadingId:17), field-base (nextFieldId:15) y toast (nextId). Además de la duplicación, dos apps Angular en un mismo documento (micro-frontends, embeds) cargan copias independientes del módulo y generan los mismos IDs (`ds-field-0`, `ds-button-reason-0`), rompiendo la unicidad de id del documento y con ella aria-describedby/labelledby y label[for] pueden resolver al elemento equivocado.

**Evidencia**: `let nextReasonId = 0;`

**Impacto**: Mantenibilidad (7 copias del mismo mecanismo) y a11y frágil en escenarios multi-app reales; también es la pieza que habría que tocar para garantizar estabilidad de IDs en hydration SSR.

**Recomendación**: Util interna compartida (lib/internal/uid.ts) tipo createDsId(prefix) que incorpore APP_ID (inject) al prefijo para desambiguar entre apps; migración mecánica de los 7 usos sin cambiar el formato visible salvo el scope.

### components-11 — Parser de CSS vars numéricas (s/ms) duplicado en 4 archivos

- **Archivo**: `packages/components/src/lib/tooltip/tooltip.ts:243`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La lógica getComputedStyle → getPropertyValue → parseFloat + conversión '0.5s'→500 con fallback jsdom está copiada cuatro veces: tooltip.readCssNumber (243-254), menu.readCssNumber (302-306), menu-item.resolveHoverDelay (157-167) y toast-item.resolveDefaultDuration (120-133), con variaciones sutiles entre sí (la de menu.ts ni siquiera convierte s→ms: un token '--ds-component-menu-submenu-offset' expresado en otra unidad se interpretaría distinto que en menu-item).

**Evidencia**: `private readCssNumber(name: string, fallback: number): number {`

**Impacto**: Cuatro puntos de deriva para el mismo contrato 'leer token de duración/offset desde CSS'; las variaciones ya existentes son bugs latentes ante un cambio de unidad en tokens.

**Recomendación**: Extraer readCssNumber/readCssDuration a una util interna compartida (lib/internal/) con tests propios de parsing; migrar los 4 usos.

### components-12 — Border-width hardcodeado en 1px en button.css y modal.css mientras el resto del kit lo tokeniza

- **Archivo**: `packages/components/src/lib/button/button.css:11`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

button.css usa `border: 1px solid transparent` (línea 11) y modal.css `border: 1px solid var(--ds-component-modal-border)` (línea 4), mientras select (--ds-component-select-trigger-border-width), input/field (--ds-component-input-border-width), toast (--ds-component-toast-border-width) y menú (--ds-dimension-1, menu.css:13) tokenizan el ancho de borde. Es el único valor dimensional hardcodeado que encontré en los CSS auditados.

**Evidencia**: `border: 1px solid transparent;`

**Impacto**: Rompe la regla 'todo valor visual sale de var(--ds-\*)': un theme que engrose bordes (accesibilidad de bajo contraste) no alcanza a button ni modal.

**Recomendación**: Reemplazar por var(--ds-dimension-1) (como menu.css) o introducir component.button.border-width / component.modal.border-width si se quiere override por componente.

### components-13 — Gap de posicionamiento hardcodeado en JS (4px) en select y menú raíz, mientras submenú y tooltip lo tokenizan

- **Archivo**: `packages/components/src/lib/select/select.ts:284`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

select.position() usa `const gap = 4` (línea 284) y menu.ts define ROOT_GAP_PX = 4 como constante (línea 32) usada sin leer token, mientras el offset del submenú se lee de --ds-component-menu-submenu-offset (menu.ts:280-284) y el del tooltip de --ds-component-tooltip-offset (tooltip.ts:265). El mismo concepto (separación trigger↔panel) tiene dos mecanismos: tokenizado en dos overlays, mágico en los otros dos.

**Evidencia**: `const gap = 4;`

**Impacto**: Un rediseño del espaciado de overlays no llega a select ni al menú raíz vía tokens; inconsistencia interna del patrón ADR-014/016 que confunde al próximo overlay.

**Recomendación**: Tokenizar component.select.listbox.offset y component.menu.panel.offset y leerlos con la util readCssNumber compartida (mismo mecanismo que submenu-offset), manteniendo el fallback jsdom.

### components-14 — menu/index.ts usa export \* mientras el resto del kit cura la superficie pública con named exports

- **Archivo**: `packages/components/src/lib/menu/index.ts:1` · **Producto**: HU-012
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

public-api.ts declara 'Only re-export what should be part of the contract' y todos los index auditados (button, select, avatar, toast, modal, textarea) usan named exports deliberados. menu/index.ts hace `export *` de sus 4 archivos: cualquier símbolo futuro exportado de menu.ts (p.ej. contratos internos como DsMenuItemRegistration, que hoy ya sale público sin decisión explícita) entra al contrato semver automáticamente.

**Evidencia**: `export * from './menu';`

**Impacto**: Superficie API que crece por accidente en una lib ya publicada (0.2.0): quitar después algo que se filtró es breaking. Inconsistencia con la convención del propio package.

**Recomendación**: Pasar a named exports decidiendo explícitamente si DsMenuItemRegistration/DsMenuItemRegistration quedan públicos (DsOptionRegistration sí se exporta a propósito en select/index.ts — usar el mismo criterio y documentarlo).

### components-15 — Naming divergente para el mismo concepto: closeLabel (modal) vs dismissLabel (toast)

- **Archivo**: `packages/components/src/lib/modal/modal.ts:51`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El aria-label del botón X de cierre se llama closeLabel en DsModal (modal.ts:51, default 'Cerrar') y dismissLabel en DsToastConfig (toast.ts:41-42, default 'Cerrar'). Es exactamente el mismo concepto con dos nombres; el próximo componente con botón de cierre (drawer, banner, alert) no tiene una convención única que seguir.

**Evidencia**: `readonly closeLabel = input<string>('Cerrar');`

**Impacto**: Erosión de la predictibilidad de la API del kit — el tipo de detalle que separa a un DS profesional de una colección de componentes. Unificar después de 1.0 sería breaking; ahora es barato.

**Recomendación**: Decisión del PO: elegir un nombre canónico (sugerencia: closeLabel, alineado con closeOnEscape/closeOnOverlay del modal) y deprecar/renombrar el otro en pre-1.0 (0.x permite el cambio con changeset minor documentado). Registrar la convención para componentes futuros.

---

<a id="testing"></a>

## Estrategia de testing (`testing`)

**Evaluación general**: La base de tests unitarios es genuinamente profunda: button/select/modal/avatar cubren comportamiento, ARIA, teclado, CVA y edge cases con trazabilidad CA-XXX, y CI corre build+tests recursivos en cada PR. Sin embargo, la cadena de calidad carece de los gates estándar de la industria para un design system publicado: cero coverage (sin provider, thresholds ni reporters), cero a11y automatizada (axe en ninguna capa pese a addon-a11y instalado), y el gate de contraste AA que las specs citan como normativo vive en un skill de Claude fuera de CI. Además hay scenarios Given/When/Then sin test correspondiente (select size/tokens, modal tokens/public-api, button CA-017.7), el playground zoneless se testea bajo zone.js, y los comportamientos de plataforma (focus trap, top layer, reposicionamiento) quedan sin ninguna capa browser que los verifique.

### testing-01 — El gate de contraste AA que las specs declaran normativo no corre en CI

- **Archivo**: `openspec/specs/component-button/spec.md:89`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Varias specs delegan la verificación WCAG AA a un 'gate por script' (button CA-020.2, avatar CA-022.2 'verificado por gate en los 4 themes'), pero la única implementación de ese gate es .claude/skills/check-a11y/scripts/contrast.mjs — un script de un skill de Claude que solo corre cuando un humano invoca /ds:check-a11y. El workflow .github/workflows/pr.yml (Format check, Lint, Build, Test, OpenSpec validate, Changeset enforcement) no tiene ningún step de contraste. Un cambio de tokens de color puede mergear rompiendo AA sin que nada falle, contradiciendo el contrato testable de las specs.

**Evidencia**: `el par texto/fondo SHALL cumplir ≥4.5:1 en los 4 themes (gate por script)`

**Impacto**: Prioridad 1 (buenas prácticas): un requirement normativo de las specs no tiene enforcement automático; el contrato es papel mojado. Prioridad 3: la garantía AA depende de disciplina manual, que no escala con más componentes/themes.

**Recomendación**: Promover contrast.mjs (o un port como vitest spec en packages/tokens/test/) al repo productivo con un pairs.json versionado por componente, exponerlo como script `test:contrast` en @romanmartinidev/tokens y agregar el step a pr.yml. El skill puede seguir consumiendo el mismo script.

**Nota de verificación**: Evidencia exacta: button spec L89 ('gate por script') y avatar spec L35 ('verificado por gate en los 4 themes'); la única implementación es .claude/skills/check-a11y/scripts/contrast.mjs (invocación manual vía /ds:check-a11y) y ni pr.yml ni release.yml tienen step de contraste. Un requirement normativo de specs sin enforcement automático justifica severidad alta; la recomendación (promover el script a packages/tokens + step en CI) es coherente con que contrast.mjs ya parsea dist/.

### testing-02 — Cero coverage: sin provider, thresholds ni reporters en ningún vitest.config

- **Archivo**: `packages/components/vitest.config.ts:15`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Los tres vitest.config (components, tokens, playground) definen solo globals/environment/setupFiles/include; no existe bloque coverage, no hay @vitest/coverage-v8 en ninguna devDependency, y pr.yml corre 'pnpm -r test' sin recolectar ni publicar cobertura ni reporters para CI (junit/github-actions). Para una librería publicada en npm (0.2.0) el estándar de la industria es coverage medido con thresholds que impidan regresiones silenciosas de cobertura al crecer el kit.

**Evidencia**: `test: { ⏎     globals: true, ⏎     environment: 'jsdom',`

**Impacto**: Prioridad 1: coverage con thresholds es práctica base de librerías publicadas. Prioridad 3: hoy nadie sabe qué porcentaje del kit está cubierto; un componente nuevo con tests superficiales pasa CI igual que uno bien cubierto.

**Recomendación**: Agregar @vitest/coverage-v8 y bloque coverage (provider v8, reporter text + lcov, thresholds iniciales realistas p.ej. lines/branches 80% en components y tokens) en los vitest.config, script `test` con --coverage en CI, y step/artefacto de coverage en pr.yml. Documentar la política en CONTRIBUTING.

**Nota de verificación**: Verificado: los tres vitest.config (components L15-20, tokens, playground) no tienen bloque coverage; @vitest/coverage-v8 no aparece en ningún package.json ni en pnpm-lock más allá de lo transitivo; pr.yml corre 'pnpm -r test' sin reporters ni artefactos. A diferencia de a11y-CI (deferral consciente en ADR-006), coverage no figura como follow-up documentado en ningún ADR ni en el backlog, así que es un gap no decidido. Severidad alta razonable para libs publicadas en npm (0.2.0, D-010).

### testing-03 — Sin a11y automatizada (axe) en ninguna capa, pese a addon-a11y instalado

- **Archivo**: `apps/playground/package.json:38`
- **Severidad**: alta · **Tamaño**: L · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Confirmado (verificador adversarial)

El único tooling a11y es @storybook/addon-a11y (inspección manual en dev). No hay vitest-axe/axe-core en los unit tests jsdom ni @storybook/test-runner + axe-playwright en CI. El backlog ya lo lista como 'Calidad profesional (nivel 2)': 'A11y en CI: @storybook/test-runner + axe-playwright — violaciones WCAG AA fallan el build' (docs/backlog/BACKLOG.md línea 114) y ADR-006 lo reconoce como follow-up ('Sin a11y/bundle/visual regression', línea 153), pero no tiene disparador. Los tests actuales asertan ARIA a mano (excelente), pero axe detecta clases de violaciones que nadie está asertando (roles anidados, nombres accesibles calculados, etc.). Nota: playwright ^1.60 ya es devDependency del root.

**Evidencia**: `"@storybook/addon-a11y": "^10",`

**Impacto**: Prioridad 1: todo DS profesional publicado (Carbon, Spectrum, Material) corre axe automatizado; el repo declara WCAG AA (D-007) sin gate que lo respalde. Prioridad 2: con 23 componentes, la auditoría manual por skill ya no escala.

**Recomendación**: Fase 1 (barata): vitest-axe en los specs jsdom existentes — un helper compartido `expectNoAxeViolations(fixture)` por componente. Fase 2: @storybook/test-runner + axe-playwright como step de CI sobre el build de Storybook, cumpliendo el item ya escrito en el backlog.

**Nota de verificación**: Evidencia exacta: playground package.json L38 (addon-a11y ^10), BACKLOG.md L114 (item en Cantera, sin disparador), ADR-006-estrategia-ci-cd.md L153 ('Sin a11y/bundle/visual regression... Follow-ups documentados'), playwright ^1.60 en root (aunque hoy lo usa el skill research-design-system, no testing). Grep confirma cero axe/vitest-axe en el repo. El hallazgo ya reconoce el deferral documentado; dado que D-007/D-008 declaran AA como valor del producto, severidad alta se sostiene para la vara 'publicable'.

### testing-04 — Sin capa browser para el comportamiento de plataforma que jsdom no cubre

- **Archivo**: `packages/components/src/test-setup.ts:13`
- **Severidad**: media · **Tamaño**: L · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Ajustado (verificador adversarial — ver nota)

El test-setup polyfillea HTMLDialogElement y la Popover API y declara explícitamente que 'el focus trap y el top layer son de la plataforma (no testeables acá)'. Consecuencia: los scenarios de plataforma de las specs quedan sin verificación en ninguna capa — modal 'a11y de diálogo modal provista por la plataforma' (focus trap, fondo inerte, restauración de foco), select 'listado en top layer sin clipping', y el reposicionamiento del listbox en resize (select.ts registra window.addEventListener('resize', …) en línea 224 y ningún test lo ejercita). Vitest 4 tiene Browser Mode estable y playwright ya está en el root; el costo de una capa browser para los 4-5 componentes overlay es acotado.

**Evidencia**: `// El focus trap y el top layer son de la plataforma (no testeables acá).`

**Impacto**: Prioridad 1: los contratos más críticos de a11y de los overlays (focus trap, inert, restauración de foco) hoy solo los garantiza la fe en la plataforma más revisión manual. Prioridad 2: cada overlay nuevo (tooltip, menu, toast ya existen) agranda la superficie no verificada.

**Recomendación**: Adoptar Vitest Browser Mode (provider playwright, chromium) con un segundo config `vitest.browser.config.ts` en components que corra specs \*.browser.spec.ts solo para overlays (modal focus trap/restauración, select top-layer y reposicionamiento). Cablearlo como job aparte en pr.yml.

**Nota de verificación**: El gap es real y la evidencia existe (comentario en test-setup.ts L13-15; select.ts L224 registra resize listener y ningún test lo ejercita; los scenarios SHALL de modal spec L70-75 no se verifican en ninguna capa). Pero el hallazgo omite que esto es una decisión arquitectónica aceptada: ADR-013 §6 (L39) dice explícitamente 'el trap/top-layer no se testean (son de la plataforma), se testea el cableado propio'. Adoptar Browser Mode revisita un ADR aceptado y por las reglas del repo requiere un ADR nuevo, no solo un openspec-change. Además, testear el focus trap nativo de <dialog> verifica al browser más que al código propio — la parte más fuerte del hallazgo es el cableado propio sin test (reposicionamiento en resize). Severidad media OK.

### testing-05 — Scenarios Given/When/Then sin test: select size/tokens/public-api, modal tokens/public-api, button CA-017.7

- **Archivo**: `openspec/specs/component-select/spec.md:18`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Comparando specs contra tests: (1) select declara `size` ('sm'|'md'|'lg', default 'md') en el requirement y select.ts línea 52 lo implementa, pero select.spec.ts no lo menciona ni una vez; (2) los scenarios 'estilos exclusivamente por tokens' (SHALL NO existir hex codes) y 'animación con tokens y reduced motion' de select no tienen assertion sobre el CSS fuente, mientras button.spec y avatar.spec sí lo hacen con readFileSync (criterio aaa-023); (3) modal: los scenarios 'sizes consumen los tokens component.modal.size' (el test solo aserta data-size, no el var()), 'animación con tokens de overlay', 'backdrop con tokens' y 'exportado desde public-api.ts' no tienen test (avatar.spec sí testea su export en public-api); (4) button CA-017.7 (tokens del estado loading en CSS) tampoco. El patrón de test ya existe en el repo — es aplicarlo parejo.

**Evidencia**: ``size` (`'sm' | 'md' | 'lg'`, default `'md'`)`

**Impacto**: Prioridad 1: la regla del repo es que los scenarios de spec sean contratos testables; hoy hay contrato sin test, y la asimetría entre componentes (avatar/button asertan CSS y public-api, select/modal no) erosiona la convención. Prioridad 3: una regresión de tokens en select.css o un export borrado de public-api pasan CI.

**Recomendación**: Completar en select.spec.ts (data-size + assertions de CSS fuente: no-hex, tokens de motion overlay, bloque prefers-reduced-motion, export en public-api), modal.spec.ts (CSS fuente: var(--ds-component-modal-size-\*), backdrop, transitions overlay-enter/exit, export public-api) y button.spec.ts (tokens del bloque loading). Extraer el helper de lectura de CSS fuente duplicado en button/avatar a un util de test compartido.

**Nota de verificación**: Los cuatro sub-claims verificados: (1) select spec L18 declara size, select.ts L52 lo implementa, select.spec.ts no lo menciona (grep: 0 matches); (2) select spec tiene scenarios de tokens (L71-75, L92-96) y public-api (L98-102) sin readFileSync ni import de public-api en su spec; (3) modal spec L64/84/90/111 — modal.spec.ts solo aserta data-size (L169), sin CSS fuente ni public-api; (4) button CA-017.7 (spec L62-66) sin cobertura — las assertions de buttonCss (L117-153) solo cubren CA-020.x. avatar.spec sí hace ambos (readFileSync L1-13, public-api L146). Severidad media y commit-directo adecuados: el patrón ya existe en el repo.

### testing-06 — Script test en watch mode: components y playground usan `vitest`, tokens usa `vitest run`

- **Archivo**: `packages/components/package.json:54`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Ajustado (verificador adversarial — ver nota)

components y playground definen "test": "vitest" (watch mode por default en TTY) mientras tokens define "test": "vitest run". En CI no rompe (vitest detecta CI y corre una vez), pero el `pnpm test` del root (`pnpm -r test`, documentado en CLAUDE.md como comando esencial) queda bloqueado localmente en watch al llegar a components. Además el scenario de spec dice 'WHEN se ejecuta pnpm -F @romanmartinidev/components test THEN … SHALL retornar exit 0' — en local nunca retorna.

**Evidencia**: `"test": "vitest"`

**Impacto**: Prioridad 3: convención inconsistente entre packages para el mismo comando; el flujo documentado (pnpm test) no se comporta igual en local que en CI. Prioridad 1: el estándar es `test: vitest run` + `test:watch: vitest`.

**Recomendación**: Unificar en los tres packages: "test": "vitest run" y "test:watch": "vitest". Un solo commit de tooling.

**Nota de verificación**: La inconsistencia es real y exacta (components package.json L54 y playground L15 'vitest' vs tokens L53 'vitest run') y el scenario de spec existe (component-button spec L121-124: 'pnpm -F @romanmartinidev/components test... SHALL retornar exit 0'), que en TTY local nunca retorna. Pero la afirmación de que el 'pnpm test' del root queda bloqueado en watch es dudosa: en modo recursivo pnpm pipea el stdio de los hijos (output con prefijo) y Vitest deshabilita watch cuando stdin no es TTY (default watch = !CI && stdin.isTTY) — el bloqueo real ocurre con 'pnpm -F <pkg> test' directo, no con 'pnpm -r test'. Corregir ese alcance en la descripción; la recomendación (unificar en 'vitest run' + 'test:watch') y el tamaño S se sostienen; severidad media es el techo, baja también sería defendible.

### testing-07 — El playground zoneless se testea con zone.js: fidelidad runtime rota

- **Archivo**: `apps/playground/src/test-setup.ts:7`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

La app playground corre en producción con provideZonelessChangeDetection() (apps/playground/src/app/app.config.ts línea 13) y su package.json la describe como 'App Angular 21 zoneless — laboratorio interno', pero su test-setup importa setup-zone y configura setupTestBed({ zoneless: false }). Los tests validan la app bajo un scheduler de change detection distinto al real: bugs específicos de zoneless (CD no disparada por falta de señal/markForCheck) no pueden surgir en tests. Siendo el playground justamente el laboratorio que valida que las libs funcionan en condiciones reales (zoneless), es la app donde más importa la fidelidad. Aplica igual a components: kit signals-first que se consume desde una app zoneless pero se testea solo bajo zone.

**Evidencia**: `setupTestBed({ zoneless: false });`

**Impacto**: Prioridad 1: testear bajo la misma configuración de CD que producción es práctica base en Angular moderno; el propio CLAUDE.md declara zoneless como estándar y legacy como hallazgo. Prioridad 3: regresiones de CD zoneless en los componentes solo se detectarían manualmente en el navegador.

**Recomendación**: Cambiar el test-setup del playground a la variante zoneless de @analogjs/vitest-angular (setupTestBed({ zoneless: true }) sin setup-zone) y corregir los tests que dependan de zone. Evaluar lo mismo para packages/components (los componentes son signals-first; no deberían necesitar zone).

**Nota de verificación**: Evidencia exacta: app.config.ts L13 provideZonelessChangeDetection(), test-setup.ts L1 importa setup-zone y L7 setupTestBed({ zoneless: false }), descripción 'App Angular 21 zoneless' en package.json. Además los TestBed de app.spec.ts no aplican los providers de appConfig, así que ningún test corre bajo el scheduler zoneless real. También verificado para components: setup-zone + zoneless: false + zone.js ^0.16.2 como devDep de un kit signals-first. Severidad media y la recomendación (variante zoneless de @analogjs/vitest-angular, cuya opción ya existe en la API usada) son razonables.

### testing-08 — Smoke tests del showcase cubren 2 de 23 rutas lazy

- **Archivo**: `apps/playground/src/app/app.spec.ts:18`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

app.spec.ts testea bien el shell (sidebar accesible, aria-current, redirects), pero solo renderiza dos vistas lazy: /button y /select. El registro SHOWCASE_ENTRIES tiene 23 entradas; las otras 21 vistas showcase nunca se montan en ningún test — un error de template o de runtime en cualquiera de ellas (el tipo de bug que ng build no atrapa) pasa CI. El registro ya es la fuente de verdad tipada, así que el test parametrizado es trivial: iterar SHOWCASE_ENTRIES y asertar que cada RouterTestingHarness.create('/'+slug) monta sin lanzar.

**Evidencia**: `it('/button renderiza la vista del Button (ruta lazy)', async () => {`

**Impacto**: Prioridad 3: el playground es la validación 'en condiciones reales' de las libs; con 91% de las vistas sin smoke test, esa validación es en la práctica manual. Prioridad 2: el patrón parametrizado escala solo al agregar componentes (cero mantenimiento por entrada nueva).

**Recomendación**: Reemplazar los dos its puntuales por un it.each sobre SHOWCASE_ENTRIES que cree el harness por slug y aserte que la vista montó (p.ej. routeNativeElement no vacío y sin throw). Mantener los asserts específicos de button/select como tests aparte si aportan.

**Nota de verificación**: Verificado: SHOWCASE_ENTRIES tiene exactamente 23 entradas (registry.ts L18-138); app.spec.ts monta solo /button (L18-23) y /select (L25-28); el único otro spec del playground (showcase-case.spec.ts) testea el wrapper UI, no las vistas — 21 vistas lazy jamás se montan en ningún test. La recomendación (it.each sobre el registro, que ya es fuente de verdad tipada) es de bajo costo y escala sola. Severidad media adecuada para el rol declarado del playground como validación en condiciones reales.

### testing-09 — Tests de tokens solo validan 3 JSON fuente; nada verifica el build ni la paridad de themes

- **Archivo**: `packages/tokens/vitest.config.ts:7`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

La suite de tokens son 3 specs (overlay-motion, effect, z-index) que importan JSON fuente de src/semantic/ y asertan estructura. Ningún test toca el output de Style Dictionary (dist/tokens.css, dist/themes/\*.css, dist/tokens.js): no se verifica que el build emita el prefijo --ds-, que las referencias resuelvan, ni — el test clásico de un DS multi-theme — que los 4 themes declaren exactamente el mismo set de custom properties que el scope default (una variable faltante en dark.css produce fallback silencioso al valor default en producción). El script contrast.mjs del skill ya parsea dist con una regex de custom properties: la mecánica existe.

**Evidencia**: `include: ['test/**/*.spec.ts'],`

**Impacto**: Prioridad 1: theme parity y validación del artefacto publicado son estándar en pipelines de tokens (el .css de dist es literalmente lo que consume el usuario del package). Prioridad 3: hoy un drift entre themes solo se descubre visualmente.

**Recomendación**: Agregar en packages/tokens/test/ un build.spec.ts que (tras pnpm build, que CI ya ejecuta antes de test) parsee dist/tokens.css y dist/themes/\*.css y aserte: prefijo --ds- universal, cero referencias sin resolver ({...} literales), y paridad de claves entre default y cada theme para los subsets semantic/component.

**Nota de verificación**: Verificado: la suite de tokens son exactamente 3 specs (overlay-motion, effect, z-index) que importan solo JSON de src/semantic/ — ningún test toca dist/tokens.css, dist/themes/\*.css ni dist/tokens.js; no hay verificación de prefijo --ds-, referencias resueltas ni paridad de custom properties entre default y los 4 themes (el fallback silencioso descrito es correcto: una var no sobreescrita en dark.css hereda el valor default sin error). La mecánica propuesta es viable: pr.yml corre build antes de test y contrast.mjs ya parsea dist con regex de custom properties. Severidad media y commit-directo adecuados.

---

<a id="ci-cd"></a>

## CI/CD y hooks (`ci-cd`)

**Evaluación general**: El pipeline implementa fielmente el núcleo de ADR-006 (dos workflows, composite action, cache pnpm, Node desde .nvmrc, concurrency correcta) y los hooks locales están bien armados. Los problemas graves se concentran en el step de changeset enforcement: la excepción para el PR autogenerado de release que ADR-006 documenta no está implementada (el PR "Version Packages" falla el gate y bloquea el flujo de release bajo branch protection) y la detección se basa en grepear output decorado del CLI con `|| true` que traga errores de git. Además faltan prácticas de hardening hoy estándar (permissions mínimos, pinning por SHA, timeout-minutes, dependabot, versión pineada de openspec en CI) y quedan gaps de calidad profesional documentados como follow-ups pero nunca activados (coverage gate, a11y CI, bundle budget, Storybook deploy, provenance, commitlint en CI).

### ci-cd-01 — El changeset enforcement rompe el PR de release y se apoya en un grep frágil del output del CLI

- **Archivo**: `.github/workflows/pr.yml:63`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Confirmado (verificador adversarial)

El step tiene tres defectos encadenados. (1) El PR autogenerado "chore(repo): version packages" bumpea `packages/*/package.json` — la exclusión de la línea 50 solo filtra `(README|CHANGELOG)\.md`, así que PKG_CHANGES queda no-vacío; en esa rama los changesets ya fueron consumidos, `pnpm changeset status --since=origin/main` sale con exit 1, y por `set -euo pipefail` el `if` de la línea 63 evalúa falso → el step falla. Con branch protection exigiendo el check `Validate` (CONTRIBUTING.md línea 192), el PR de release no puede mergearse sin bypass de admin — contradice ADR-006 §6 que declara "Excepciones documentadas: ... PRs autogenerados por `changesets/action`" y el scenario de la spec (líneas 75-79). (2) La detección positiva grepea output decorado del CLI (`^🦋|---.*\.md$|changeset.*found`) — verifiqué localmente que hasta el caso "NO packages to be bumped" imprime líneas que empiezan con 🦋 y separadores `---`; solo pipefail evita el falso positivo, y `grep -q` que corta el pipe temprano puede provocar EPIPE/SIGPIPE intermitente en el CLI → fallos flaky. (3) El `|| true` de la línea 51 cubre todo el pipeline: si `git diff origin/main...HEAD` falla por cualquier razón (ref ausente, shallow), PKG_CHANGES queda vacío y el step pasa en silencio → bypass. Extra: el scenario de la spec (línea 73) exige que el output aclare la excepción "solo README de package" y el mensaje actual es genérico.

**Evidencia**: `if pnpm changeset status --since=origin/main 2>&1 | grep -qE '^🦋|---.*\.md$|changeset.*found'; then`

**Impacto**: Viola la prioridad 1 (el gate central del versionado o bloquea el release o es bypasseable en silencio) y la 3 (la spec ci-cd-pipeline y ADR-006 prometen un comportamiento que el código no implementa — drift en la fuente de verdad testable).

**Recomendación**: Reescribir el step sin parsear output decorado: detectar changesets con `git diff --name-only origin/main...HEAD -- '.changeset/*.md' | grep -v README` (basado en archivos, determinista), agregar excepción explícita para el PR de release (`github.head_ref == 'changeset-release/main'` o exclusión de bumps package.json+CHANGELOG conjuntos), acotar el `|| true` solo al grep de exclusión, y emitir el mensaje de excepción README que la spec exige. Acompañar con delta de spec en ci-cd-pipeline (nuevo scenario para el PR de release).

**Nota de verificación**: Todo verificado: pr.yml:49-51 excluye solo (README|CHANGELOG).md, línea 63 grepea output decorado, y el run local de `pnpm changeset status` confirma que hasta el caso 'NO packages to be bumped' imprime líneas '🦋' y separadores '---' — solo pipefail (exit 1 del CLI) evita el falso positivo. ADR-006 §6 (línea 118) documenta la excepción para PRs de changesets/action que el código no implementa, y el scenario de la spec (líneas 75-79) exige que pase. Único matiz que no cambia la conclusión: el PR de release creado con GITHUB_TOKEN normalmente ni dispara pr.yml (GitHub suprime workflows sobre eventos del GITHUB_TOKEN), así que el modo de falla práctico es 'check requerido Validate nunca reporta' en vez de 'step falla' — el resultado es el mismo: PR de release inmergeable sin bypass. El `|| true` de la línea 51 traga errores de git tal como se describe. Severidad alta razonable.

### ci-cd-02 — El publish a npm no tiene gate de aprobación pese al veto explícito del PO

- **Archivo**: `.github/workflows/release.yml:38`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

release.yml corre en cada `push` a main y, cuando el PR "Version Packages" se mergea, ejecuta `pnpm changeset publish` inmediatamente. El veto vigente ("no publicar a npm sin orden del PO", con changesets acumulándose a propósito) está sostenido solo por proceso humano: un merge accidental del PR de release —que queda abierto y actualizándose indefinidamente mientras se acumulan changesets— publica a npm sin ninguna confirmación adicional. La práctica estándar es proteger el job/step de publish con un GitHub Environment (ej. `npm-publish`) con required reviewers, que además restringe el secret NPM_TOKEN a ese environment.

**Evidencia**: `publish: pnpm changeset publish`

**Impacto**: Prioridad 1: un deploy irreversible (npm no permite republicar versiones) sin gate de aprobación es el riesgo operativo más alto del pipeline; hoy el único control es acordarse del veto. Prioridad 2: environments escalan a más packages sin rediseño.

**Recomendación**: Decisión del PO: crear environment `npm-publish` con required reviewer (el PO), mover NPM_TOKEN a secrets del environment y separar el publish a un job con `environment: npm-publish` (o condicionar el publish a un `workflow_dispatch` manual). Documentar en CONTRIBUTING.md y, por tocar el modelo de release de ADR-006, registrar en un ADR nuevo.

**Nota de verificación**: release.yml no tiene `environment:` ni gate alguno sobre el publish; el veto está documentado (memoria del PO + BACKLOG.md línea 30, hoy 15 changesets acumulados) y el camino de publish está probado en vivo (HU-002: 0.2.0 publicado 2026-07-18 por el pipeline tras mergear el PR #1 de versionado). Matiz: hoy existe mitigación incidental (el bug del hallazgo 0 bloquea el PR de release bajo branch protection, y solo el mantenedor puede mergear), pero ninguna es un control diseñado y la primera desaparece al arreglar el hallazgo 0 — lo que refuerza la necesidad del environment gate. Recomendación y tipo (decision-po) correctos.

### ci-cd-03 — Sin permissions mínimos en pr.yml ni timeout-minutes en ningún job

- **Archivo**: `.github/workflows/pr.yml:14`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

pr.yml no declara bloque `permissions` (líneas 1-14: va directo de `concurrency` a `jobs.validate.runs-on`), por lo que el GITHUB_TOKEN hereda el default del repo en vez de declarar least-privilege explícito (`permissions: contents: read` le alcanza: solo hace checkout, fetch y corre scripts). release.yml sí declara permissions pero a nivel workflow, no job. Ningún job de ninguno de los dos workflows tiene `timeout-minutes` — el default de GitHub es 360 minutos: un test colgado o un install en loop consume 6 horas de runner.

**Evidencia**: `runs-on: ubuntu-latest`

**Impacto**: Prioridad 1: permissions explícitos por workflow/job es la práctica base de hardening de GitHub Actions (OpenSSF Scorecard la audita); timeouts acotados evitan quemar minutos y detectan cuelgues. Costo de adopción casi nulo.

**Recomendación**: Agregar `permissions: contents: read` a nivel workflow en pr.yml, y `timeout-minutes: 15` en el job `validate` y `timeout-minutes: 20` en el job `release`. Opcional: bajar los permissions de release.yml al nivel del job.

**Nota de verificación**: Verificado: pr.yml no declara `permissions` en ninguna parte (líneas 1-14 van de concurrency a jobs), release.yml lo declara a nivel workflow (líneas 11-13: contents: write, pull-requests: write), y ningún job de ninguno de los dos workflows tiene `timeout-minutes` (default GitHub: 360 min). Severidad media y fix trivial correctos.

### ci-cd-04 — Actions de terceros pineadas por tag mutable en vez de SHA

- **Archivo**: `.github/workflows/pr.yml:17`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

Las cuatro actions externas usan tags mutables: `actions/checkout@v4` (pr.yml:17, release.yml:21), `actions/setup-node@v4` (.github/actions/setup/action.yml:12), `pnpm/action-setup@v4` (action.yml:8) y `changesets/action@v1` (release.yml:33). Un tag major puede ser re-apuntado si la action se compromete (el incidente tj-actions/changed-files de 2025 explotó exactamente esto). Es especialmente sensible en release.yml, donde `changesets/action` corre con `contents: write` y acceso a NPM_TOKEN. ADR-006 ya reconoce el riesgo ("changesets/action puede tener breaking changes en patches... Monitorear releases") pero eligió mitigación manual.

**Evidencia**: `uses: actions/checkout@v4`

**Impacto**: Prioridad 1: pinning por SHA de commit completo es la recomendación oficial de GitHub y OpenSSF para supply chain de workflows, crítica en un repo que publica packages a npm con token en secrets.

**Recomendación**: Pinear las cuatro actions por SHA completo con el tag como comentario (`uses: actions/checkout@<sha> # v4.x.y`), y combinar con Dependabot para `github-actions` (hallazgo aparte) para que los bumps de SHA lleguen como PRs revisables.

**Nota de verificación**: Las cuatro referencias verificadas exactamente donde se citan: actions/checkout@v4 (pr.yml:17, release.yml:21), pnpm/action-setup@v4 (action.yml:8), actions/setup-node@v4 (action.yml:12), changesets/action@v1 (release.yml:33). ADR-006 línea 155 confirma la mitigación manual elegida ('pinear @v1... Monitorear releases'). El énfasis en release.yml (contents: write + NPM_TOKEN) es correcto. Severidad media razonable.

### ci-cd-05 — openspec se ejecuta en CI sin versión pineada vía npx --yes

- **Archivo**: `.github/workflows/pr.yml:38`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El step de validación OpenSpec corre `npx --yes openspec validate --all`: descarga y ejecuta la última versión publicada del package `openspec` en cada run, fuera del lockfile. Cualquier release upstream (con cambios de reglas de validación o, peor, comprometido) cambia el comportamiento del CI de un día para otro sin ningún commit en el repo — el mismo PR puede pasar hoy y fallar mañana.

**Evidencia**: `run: npx --yes openspec validate --all`

**Impacto**: Prioridad 1 (reproducibilidad del CI: todas las demás herramientas del pipeline están bajo lockfile congelado, esta no) y supply chain (npx --yes ejecuta código arbitrario de npm sin pin ni integridad).

**Recomendación**: Agregar `openspec` como devDependency del root (queda bajo `pnpm install --frozen-lockfile` y lo actualiza Dependabot/Renovate) y cambiar el step a `pnpm exec openspec validate --all`; alternativa mínima: pinear `npx --yes openspec@<x.y.z>`.

**Nota de verificación**: pr.yml:38 dice exactamente `run: npx --yes openspec validate --all` y `openspec` no aparece como dependencia en ningún package.json del repo (grep sin matches) — es la única herramienta del pipeline fuera del lockfile. Recomendación (devDependency + pnpm exec) correcta y de bajo costo.

**Corrección (2026-07-28, al ejecutar la Parte E)**: el hallazgo **subestima el problema**. El package `openspec` del registry de npm **no es el CLI de OpenSpec**: es un placeholder de `openspecio/openspec` (2019, autor `akerust`), con una única versión `0.0.0` y **sin campo `bin`**. `npx` no puede determinar un ejecutable, así que el step **falla en todo run de CI** — nunca validó una sola spec. Localmente parecía funcionar porque el mantenedor tiene `@fission-ai/openspec@1.3.1` instalado global y `npx` resuelve primero el PATH. El CLI real es **`@fission-ai/openspec`**. No es "falta pinear la versión": es el package equivocado. Resuelto en `aaa-039` pinneando `@fission-ai/openspec@1.6.0` como devDependency (verificado: valida el repo con 27 passed, 0 failed, idéntico al global 1.3.1).

### ci-cd-06 — Conventional Commits no se valida en CI: commitlint solo vive en el hook local

- **Archivo**: `.husky/commit-msg:1`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La única validación de Conventional Commits es el hook local (`pnpm exec commitlint --edit $1`). ADR-006 usa como argumento contra la opción "solo hooks" que "Los hooks locales NO se aplican si alguien usa `git commit --no-verify`" (línea 29), pero el pipeline elegido tampoco valida mensajes en CI, y el follow-up `ci-pr-title-validation` (ADR-006 línea 137) nunca se activó. Con "Require linear history" recomendado en CONTRIBUTING.md (los commits del PR llegan a main tal cual por rebase), un commit malformado que esquivó el hook entra al historial y ensucia changelogs y trazabilidad.

**Evidencia**: `pnpm exec commitlint --edit $1`

**Impacto**: Prioridad 1 y 3: la convención de commits es contrato del repo (commitlint + Changesets dependen de ella) pero su enforcement real es bypasseable con un flag; el gap está reconocido por el propio ADR.

**Recomendación**: Agregar step en pr.yml que corra `pnpm exec commitlint --from origin/main --to HEAD` (reutiliza la config y deps ya instaladas, sin action externa). Si en el futuro se pasa a squash-merge, complementar con validación del título del PR.

**Nota de verificación**: Verificado: .husky/commit-msg es la única validación (`pnpm exec commitlint --edit $1`), pr.yml no tiene step de commitlint, ADR-006 usa el argumento del --no-verify contra la opción A (línea 28) y el follow-up ci-pr-title-validation (línea 137) nunca se activó. CONTRIBUTING.md línea 193 recomienda linear history, así que los commits llegan a main tal cual. Recomendación (commitlint --from origin/main en pr.yml) reutiliza deps existentes. Severidad media correcta.

### ci-cd-07 — Sin Dependabot ni Renovate: actualización de deps y actions 100% manual

- **Archivo**: `.github/workflows/release.yml:33`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

No existe `.github/dependabot.yml` ni config de Renovate (bajo `.github/` solo hay `workflows/pr.yml`, `workflows/release.yml` y `actions/setup/action.yml`; grep de dependabot/renovate solo aparece en docs). ADR-006 asume vigilancia manual ("pinear `@v1` (major). Monitorear releases") que en la práctica no ocurre. Consecuencias concretas ya visibles: `packageManager: "pnpm@9.0.0"` sigue clavado en el .0 inicial de abril 2024 y las actions no reciben bumps. Para un monorepo que publica packages, recibir parches de seguridad de la cadena de deps como PRs (que además pasan por pr.yml) es práctica base.

**Evidencia**: `uses: changesets/action@v1`

**Impacto**: Prioridad 1 (gestión de vulnerabilidades automatizada, estándar en cualquier repo npm publicado) y 3 (el 'monitoreo manual' prometido por ADR-006 no es sostenible ni verificable).

**Recomendación**: Agregar `.github/dependabot.yml` con ecosistemas `github-actions` y `npm` (weekly, con groups para minor/patch) — o Renovate si se prefiere agrupamiento más fino. Habilita además el flujo de bumps de SHA del hallazgo de pinning.

**Nota de verificación**: Verificado: bajo .github/ solo existen los 3 archivos citados, sin dependabot.yml ni config de Renovate; de hecho mi grep repo-completo de dependabot/renovate da CERO matches (ni siquiera en docs, contra lo que dice el hallazgo — detalle inmaterial que agranda el gap). `packageManager: "pnpm@9.0.0"` confirmado en package.json:13 (release de abril 2024). Severidad media y recomendación correctas.

### ci-cd-08 — Tests corren en CI sin gate de coverage

- **Archivo**: `.github/workflows/pr.yml:35`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El pipeline corre `pnpm -r test` pero no hay configuración de coverage en ningún package (grep de 'coverage' bajo packages/ no devuelve archivos): ni reporte, ni thresholds, ni tendencia. Para librerías publicadas es estándar de la industria fijar un piso de coverage (Vitest lo trae integrado vía `--coverage` + `coverage.thresholds`) para que el kit no pueda perder cobertura silenciosamente a medida que crecen los componentes.

**Evidencia**: `run: pnpm -r test`

**Impacto**: Prioridad 1 (calidad verificable de packages publicados) y 2 (el gate escala solo: cada componente nuevo entra con la vara puesta, sin depender de disciplina del reviewer).

**Recomendación**: Habilitar `@vitest/coverage-v8` en tokens y components con thresholds razonables (arrancar en el nivel actual medido, no en 100), correr `pnpm -r test -- --coverage` en pr.yml y fallar bajo threshold. Documentar la política en CONTRIBUTING.md.

**Nota de verificación**: Verificado: pr.yml:35 corre `pnpm -r test` y el grep de 'coverage' bajo packages/ no devuelve ningún archivo — sin reporte, thresholds ni @vitest/coverage-v8 en las devDeps de tokens/components. Para librerías publicadas en npm el piso de coverage es práctica estándar; severidad media y la recomendación de arrancar en el nivel medido (no 100) son razonables.

### ci-cd-09 — Storybook sin deploy: el DS publicado no tiene documentación navegable

- **Archivo**: `docs/architecture/adr/ADR-006-estrategia-ci-cd.md:152`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Ajustado (verificador adversarial — ver nota)

ADR-006 difirió el deploy de Storybook como follow-up (`playground-storybook-deploy`, línea 132) y nunca se activó: "los devs deben correr Storybook localmente". Con 0.2.0 ya publicado en npm, cualquier consumidor externo del scope @romanmartinidev no tiene forma de ver componentes, props ni ejemplos sin clonar el monorepo. Un DS sin docs desplegadas no cumple la vara de "usable en proyectos profesionales": la doc navegable es la interfaz pública de un design system.

**Evidencia**: `**Sin Storybook deploy en esta fase**: los devs deben correr Storybook localmente. Diferido a follow-up.`

**Impacto**: Prioridad 1 (docs públicas son práctica base de todo DS publicado — Carbon, Material, Atlassian) y 3 (el playground ya tiene `build-storybook`; solo falta el workflow de publicación).

**Recomendación**: Decisión del PO entre GitHub Pages (gratis, workflow `deploy-pages` sobre `pnpm storybook:build`) y Chromatic (suma visual regression del ítem de Cantera). Recomendación: GH Pages ya — costo casi nulo — y evaluar Chromatic aparte. Ejecutar como openspec-change al aprobarse.

**Nota de verificación**: El gap es real y la evidencia existe (ADR-006 línea 152 textual, follow-up playground-storybook-deploy línea 132 nunca activado, ningún workflow de deploy en .github/, 0.2.0 realmente publicado el 2026-07-18 según HU-002, script storybook:build ya presente). Ajuste de alcance: 'no tiene forma de ver componentes, props ni ejemplos sin clonar el monorepo' está sobredimensionado — el README de packages/components viaja en el tarball y en npmjs con instalación y ejemplos de uso por componente (Button, Checkbox, RadioGroup, etc.). Lo que falta es doc navegable/interactiva (Storybook desplegado), que sigue siendo la vara de un DS publicado; severidad media se sostiene con ese encuadre.

### ci-cd-10 — A11y automatizada ausente del pipeline pese a ser compromiso del DS

- **Archivo**: `docs/backlog/BACKLOG.md:114` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: high
- **Verificación**: Confirmado (verificador adversarial)

El gate de accesibilidad en CI está en Cantera sin disparador ("A11y en CI: `@storybook/test-runner` + `axe-playwright` — violaciones WCAG AA fallan el build") y ADR-006 lo difirió como `ci-a11y-checks` (línea 44: "Sin a11y CI... (todos follow-ups)"). Hoy la a11y depende de auditorías manuales del skill /ds:check-a11y — que ya encontró hallazgos reales (hardcodes en Checkbox/Radio, BACKLOG línea 76) — y nada impide que una regresión WCAG entre por PR. Para un DS con compromiso AA declarado (D-007), el enforcement automatizado es práctica base de la industria.

**Evidencia**: `- **A11y en CI**: `@storybook/test-runner`+`axe-playwright` — violaciones WCAG AA fallan el build.`

**Impacto**: Prioridad 1 (WCAG AA declarado sin gate que lo defienda es promesa sin enforcement) y 2 (cada componente nuevo del kit multiplica la superficie de regresión; el costo de auditar manualmente crece lineal).

**Recomendación**: Proponer al PO promover el ítem de Cantera (per D-015 requiere su decisión): change `ci-a11y-checks` con axe sobre las stories existentes (test-runner de Storybook o vitest + axe-core en los specs de componentes), fallando el build en violaciones AA.

**Nota de verificación**: Verificado: BACKLOG.md línea 114 (ítem de Cantera textual), ADR-006 líneas 44 y 133 (diferido como ci-a11y-checks), D-007 existe como compromiso a11y del producto (referenciado por EP-002/EP-005 y las HUs), y el precedente de hallazgos reales de la auditoría manual está en BACKLOG línea 76 (hardcode white en Checkbox/Radio). Ningún gate a11y en pr.yml. Tipo decision-po correcto (la Cantera requiere promoción del PO per D-015). Severidad media razonable.

### ci-cd-11 — Sin npm provenance ni trusted publishing: release depende de token de larga vida

- **Archivo**: `docs/architecture/adr/ADR-006-estrategia-ci-cd.md:163`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Ajustado (verificador adversarial — ver nota)

ADR-006 difirió provenance ("Reevaluar `provenance: true` para supply chain security en un ADR futuro si el repo crece a uso público amplio") — pero el disparador ya ocurrió: 0.2.0 está publicado con `access: public`. El publish actual autentica con un NPM_TOKEN de larga vida que CONTRIBUTING.md además enseña a generar sin restricción de IP (`npm token create --read-only=false --cidr=0.0.0.0/0`, línea 208). npm ofrece hoy trusted publishing vía OIDC de GitHub Actions (elimina el token) y provenance attestations (badge verificable en npmjs.com de qué workflow/commit produjo el tarball) — ambos GA y recomendados para packages públicos.

**Evidencia**: `Reevaluar `provenance: true` para supply chain security en un ADR futuro si el repo crece a uso público amplio.`

**Impacto**: Prioridad 1: provenance + OIDC son el estándar actual de supply chain para packages npm públicos; un token publish sin CIDR ni expiración en secrets es el eslabón más débil de la cadena de release.

**Recomendación**: Decisión del PO (requiere config en npmjs.com y el ADR que el propio ADR-006 pide): configurar trusted publisher para el repo/workflow, agregar `id-token: write` y `NPM_CONFIG_PROVENANCE: true` en release.yml, retirar NPM_TOKEN. Se puede dejar preparado ahora — no implica publicar (el veto sigue).

**Nota de verificación**: La evidencia literal existe (ADR-006:163, CONTRIBUTING.md:208 enseña `npm token create --read-only=false --cidr=0.0.0.0/0`, packages publicados con access public el 2026-07-18) y el fondo del hallazgo (token de larga vida sin restricción como eslabón débil; OIDC/provenance estándar actual para packages públicos) es válido con severidad media. Ajuste: 'el disparador ya ocurrió' sobreinterpreta la condición del ADR — 'si el repo crece a uso público amplio' habla de adopción/uso, no de la mera publicación de un 0.2.0 sin consumidores conocidos. La recomendación (dejar preparado sin publicar, respetando el veto) es correcta igual, pero como propuesta al PO, no como incumplimiento del ADR.

### ci-cd-12 — Drift spec/CONTRIBUTING vs release.yml: el publish documentado como `pnpm release` no es lo que corre

- **Archivo**: `openspec/specs/ci-cd-pipeline/spec.md:101`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La spec exige "el workflow SHALL ejecutar `pnpm release` (que internamente corre `pnpm -r build && changeset publish`)" y CONTRIBUTING.md repite "El workflow ejecuta `pnpm release` (build + publish)" (línea 145) — pero release.yml corre un step `pnpm -r build` separado y `publish: pnpm changeset publish` (líneas 30 y 38), sin usar el script `release` que sigue definido en package.json (línea 31). El resultado es equivalente, pero la spec es contrato testable y hoy no describe la implementación, y el script `release` queda como camino muerto que alguien puede correr localmente creyendo que es el flujo oficial (violaría el veto de publicación).

**Evidencia**: `el workflow SHALL ejecutar `pnpm release`(que internamente corre`pnpm -r build && changeset publish`)`

**Impacto**: Prioridad 3: la spec es fuente de verdad del pipeline; el drift erosiona la confianza en la gobernanza OpenSpec del repo. Menor pero de arreglo trivial.

**Recomendación**: Alinear en la dirección de la implementación: actualizar el requirement/scenario de la spec y CONTRIBUTING.md para describir build separado + `changeset publish`, y evaluar remover (o renombrar con guard) el script `release` del root para que no exista un publish manual de un comando.

**Nota de verificación**: Drift verificado en las cuatro puntas: spec ci-cd-pipeline:101 y CONTRIBUTING.md:145 prometen `pnpm release`; release.yml corre build separado (línea 30) + `publish: pnpm changeset publish` (línea 38); el script `release` sigue vivo en package.json:31 como camino de publish manual de un comando (riesgo real frente al veto). Extra que refuerza: docs/architecture/README.md líneas 364 y 412 repiten el mismo `pnpm release` desactualizado. Severidad baja y fix trivial correctos.

### ci-cd-13 — actionlint es requirement de la spec pero no corre en CI

- **Archivo**: `CONTRIBUTING.md:228`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La spec ci-cd-pipeline declara "Los workflows SHALL pasar `actionlint .github/workflows/*.yml` sin errores" (línea 149), pero CONTRIBUTING.md lo documenta como opcional y admite el gap: "No es obligatorio (no está en el workflow CI)". Un SHALL sin enforcement es aspiracional: un error de sintaxis o de expresión en un workflow solo se descubre cuando el workflow ya corrió (o no arrancó). Los hallazgos de hardening de esta auditoría implican tocar los YAML — el momento ideal para sumar el guard.

**Evidencia**: `No es obligatorio (no está en el workflow CI), pero evita errores de sintaxis YAML antes del push.`

**Impacto**: Prioridades 1 y 3: convierte un requirement declarado en verificación automática, con costo mínimo (un step condicionado a cambios en .github/).

**Recomendación**: Agregar step en pr.yml que corra actionlint (binario descargado pineado por versión/checksum, o `docker run rhysd/actionlint`); opcional sumar `zizmor` para auditoría de seguridad de workflows. Actualizar CONTRIBUTING.md quitando el 'no es obligatorio'.

**Nota de verificación**: Verificado: la spec (línea 149) declara 'Los workflows SHALL pasar actionlint... sin errores' y CONTRIBUTING.md:228 admite textualmente 'No es obligatorio (no está en el workflow CI)'. Matiz menor que no cambia el veredicto: el scenario de la spec contempla solo el uso local, así que es un gap de enforcement de un SHALL (como el hallazgo mismo lo encuadra), no un drift spec/implementación. Severidad baja y recomendación correctas.

### ci-cd-14 — Sin bundle size budget para los packages publicados

- **Archivo**: `docs/backlog/BACKLOG.md:118` · **Producto**: EP-005
- **Severidad**: baja · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El ítem está en Cantera ("Bundle size budget: `size-limit` en CI por PR") y ADR-006 lo difirió como `ci-bundle-budget` (línea 134), pero nada mide hoy el peso de lo que se publica: una dependencia accidental o un import barrel en components puede engordar el tarball sin que ningún check lo note hasta que un consumidor lo sufra. Con el kit creciendo (Avatar recién sumado, HU-022), el momento de fijar la línea base es ahora que los números son chicos.

**Evidencia**: `- **Bundle size budget**: `size-limit` en CI por PR.`

**Impacto**: Prioridad 1 (presupuesto de tamaño es práctica estándar de librerías front publicadas) y 2 (el gate previene degradación acumulativa a medida que el kit escala).

**Recomendación**: Proponer al PO promover el ítem de Cantera: `size-limit` (o `pnpm pack` + medición del tarball) sobre dist de tokens y components, con budget por entrypoint y step en pr.yml que falle al excederlo.

**Nota de verificación**: Verificado: BACKLOG.md línea 118 (ítem de Cantera textual), ADR-006 línea 134 (diferido como ci-bundle-budget), y size-limit/bundlesize/bundlewatch solo aparecen en docs y en la propuesta archivada aaa-005 — no hay ninguna config ni medición real del peso publicado. Avatar recién sumado (aaa-037/HU-022 en los últimos commits) confirma que el kit crece. Severidad baja, tipo decision-po y el argumento de fijar línea base temprano son correctos.

---

<a id="docs-arquitectura"></a>

## Docs de arquitectura y raíz (`docs-arquitectura`)

**Evaluación general**: El núcleo de gobernanza está sano: los 20 ADRs cumplen MADR completo (Fecha/Estado/Dominio + Contexto/Opciones/Decisión/Consecuencias verificados por grep), el decisions-log tiene filas para ADR-001..020 incluido el estado Propuesto de ADR-009, y openspec/README mantiene próximo ID (aaa-038) e IDs en vuelo al día. El drift se concentra en los docs de síntesis y onboarding, que quedaron congelados en la era bootstrap mientras se archivaban 37 changes: architecture/README describe un playground sin router que hoy tiene showcase con routing, su Catálogo de ADRs corta en ADR-008, el README root dice 'a crear en Fase 3/4' con URL de clone incorrecta, y el PLAYBOOK enseña el naming `<Name>Component`/`.component.ts` que ADR-007/ADR-010 abolieron. Además CLAUDE.md documenta `pnpm -r publish` como comando de publicación, un flujo que contradice ADR-006/ADR-015 y el veto vigente de publicación del PO.

### docs-arquitectura-01 — CLAUDE.md documenta `pnpm -r publish` como comando de publicación, contradiciendo el flujo real y el veto del PO

- **Archivo**: `CLAUDE.md:163`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificación inline en sesión)

La sección 'Comandos esenciales' lista `pnpm -r publish` bajo el comentario '# Publicar (en release)'. El flujo real del repo es `pnpm release` (`pnpm -r build && changeset publish`, package.json:31), orquestado exclusivamente por `release.yml` según ADR-006 y CONTRIBUTING ('El mantenedor NO publica manualmente'). `pnpm -r publish` publicaría saltando Changesets (sin CHANGELOG, sin tags, sin reescritura de workspace:\*) y además existe un veto explícito de publicación hasta orden del PO.

**Evidencia**: `# Publicar (en release) ⏎ pnpm -r publish`

**Impacto**: Un dev o agente que siga CLAUDE.md al pie de la letra puede ejecutar una publicación manual rota (sin changeset flow) violando ADR-006/ADR-015 y el veto vigente. Es el drift más peligroso operativamente: CLAUDE.md es el contrato que los agentes obedecen literalmente.

**Recomendación**: Reemplazar el bloque por los scripts reales del root package.json: `pnpm changeset` / `pnpm version` / `pnpm release`, con nota explícita de que el publish pasa solo por release.yml y de que la publicación está vetada hasta orden del PO.

**Nota de verificación**: Verificado en sesión: CLAUDE.md § Comandos esenciales lista "# Publicar (en release) / pnpm -r publish".

### docs-arquitectura-02 — architecture/README describe el playground como 'single page sin routing' pero desde aaa-022 tiene showcase con router

- **Archivo**: `docs/architecture/README.md:341` · **Producto**: EP-006 (aaa-022 playground-showcase)
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

La sección 'Single page sin routing, sin SSR' afirma que el playground no tiene provideRouter ni router-outlet, y el snippet de app.config.ts (líneas 321-330) muestra providers sin router. La realidad: apps/playground/src/app/app.config.ts:14 tiene `provideRouter(routes)` y app.html:28 tiene `<router-outlet />` (introducidos por aaa-022 playground-showcase, archivado 2026-07-19, listado en el propio catálogo de este archivo como 'showcase con router, EP-006').

**Evidencia**: ``AppComponent` standalone, sin `provideRouter`, sin `<router-outlet>`. Foco en demos.`

**Impacto**: El archivo se autodenomina 'fuente única de verdad agregada' y contradice frontalmente el código y su propio catálogo de changes. Cualquier dev o agente que lea la síntesis antes de tocar el playground parte de una arquitectura falsa.

**Recomendación**: Reescribir la subsección de playground para reflejar el showcase con router (lazy routes, estructura actual), alineada con la spec playground-app post-aaa-022, y actualizar el snippet de app.config.ts.

**Nota de verificación**: Verificado en sesión: architecture/README § playground afirma "sin provideRouter, sin router-outlet"; el repo tiene app.routes.ts + showcase con 23 rutas.

### docs-arquitectura-03 — El 'Catálogo de ADRs' de architecture/README corta en ADR-008: faltan 12 de los 20 ADRs

- **Archivo**: `docs/architecture/README.md:431`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificación inline en sesión)

La tabla 'Catálogo de ADRs' (líneas 422-431) lista solo ADR-001..008. En docs/architecture/adr/ existen 20 ADRs (verificado por Glob: ADR-001..ADR-020), todos con fila en decisions-log.md. El catálogo de changes del mismo archivo sí está al día (hasta aaa-037), lo que hace más notoria la asimetría.

**Evidencia**: `| [ADR-008](adr/ADR-008-convencion-ids-openspec.md)         | Convención de IDs de OpenSpec (aaa-NNN, specs sin ID) | transversal/openspec | Aceptado |`

**Impacto**: Decisiones estructurales clave para consumir el sistema (ADR-013/014 overlays, ADR-015 lockstep, ADR-017 secondary entry points, ADR-018 specs por componente, ADR-020 field base) son invisibles desde la síntesis que se declara fuente única agregada. Viola directamente la prioridad 3 (mantenibilidad).

**Recomendación**: Completar la tabla con ADR-009..020 (con estado real: ADR-009 Propuesto) o convertirla en link único a decisions-log.md para eliminar la duplicación que ya demostró desincronizarse.

**Nota de verificación**: Verificado en sesión: la tabla corta en ADR-008; docs/architecture/adr/ contiene ADR-001..ADR-020.

### docs-arquitectura-04 — El PLAYBOOK manda como convención portable el naming `<Name>Component` + `<name>.component.ts` abolido por ADR-007/ADR-010

- **Archivo**: `docs/architecture/PLAYBOOK.md:572`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

La sección 'Convenciones operativas que se mantienen al portar' — explícitamente normativa para replicar la arquitectura — instruye `<Name>Component` clase + `<name>.component.ts` archivo. ADR-007 (2026-06-01) estableció `Ds<Name>` sin sufijo Component, y ADR-010 (2026-07-03) abolió el sufijo de rol en archivos (`button.ts`, no `button.component.ts`). La Fase 3 del mismo playbook (línea 404) también instruye crear `button.component.ts`, y el checklist final (línea 600) pide 'Specs base 001-004 promovidas' usando IDs de specs eliminados por ADR-008.

**Evidencia**: `- **Naming components Angular**: `<Name>Component`clase +`<name>.component.ts`archivo +`<org>-<name>` selector.`

**Impacto**: El playbook propaga a repos nuevos exactamente la deuda que este repo pagó con dos ADRs (colisión de class names en libs publicables, naming legacy). Contradice la prioridad 1 (buenas prácticas) y confunde a quien contraste playbook contra ADRs vigentes.

**Recomendación**: Actualizar la convención a `Ds<Name>` + `<name>.ts` + `ds-<name>` citando ADR-007/ADR-010, corregir el ejemplo de Fase 3 y el ítem del checklist con IDs de specs abolidos.

**Nota de verificación**: Verificado en sesión: PLAYBOOK.md:404 y :572 usan button.component.ts / <Name>Component (abolidos por ADR-007/ADR-010).

### docs-arquitectura-05 — URL de clone del README root apunta a una org inexistente (romanmartinidev vs roman-martini)

- **Archivo**: `README.md:42`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El Quickstart instruye clonar `https://github.com/romanmartinidev/design-system.git`, pero el remote real es `git@github.com:roman-martini/design-system.git` (verificado con `git remote -v`) y package.json:10 declara `https://github.com/roman-martini/design-system.git`.

**Evidencia**: `git clone https://github.com/romanmartinidev/design-system.git`

**Impacto**: El primer comando que ejecuta un dev nuevo falla con 404. Para un producto que aspira a uso profesional, un quickstart roto en la puerta de entrada es un fallo de vara directo contra la prioridad 3.

**Recomendación**: Corregir la URL a `https://github.com/roman-martini/design-system.git` (coherente con package.json y el remote real).

### docs-arquitectura-06 — README root: árbol con '(a crear en Fase 3/4)' contradice su propio 'Bootstrap completo' y la tabla de scripts está incompleta

- **Archivo**: `README.md:21`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El árbol de estructura marca components '(a crear en Fase 3)' y playground '(a crear en Fase 4)', pero la línea 94 del mismo archivo declara 'Bootstrap **completo** (Fases 0–5)' y ambos workspaces existen con 21 componentes publicados en 0.2.0. Además la tabla 'Scripts útiles' (líneas 61-70) omite `pnpm dev`/`start`/`storybook`/`storybook:build`, que existen en package.json:19-22.

**Evidencia**: `│   └── components/    @romanmartinidev/components  (a crear en Fase 3)`

**Impacto**: Contradicción interna en el punto de entrada del repo: transmite un proyecto a medio bootstrappear cuando ya hubo release npm. Erosiona la credibilidad profesional y la utilidad del quickstart.

**Recomendación**: Eliminar las anotaciones '(a crear...)', completar la tabla de scripts con dev/start/storybook/storybook:build y reflejar el estado actual (21 componentes, release 0.2.0).

### docs-arquitectura-07 — PLAYBOOK Fase 5 dice 'aún no está implementada en el repo de referencia' cuando el CI real existe desde aaa-005

- **Archivo**: `docs/architecture/PLAYBOOK.md:525`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

La Fase 5 se presenta como 'Plan tentativo', pero `.github/workflows/pr.yml` y `release.yml` + composite action `.github/actions/setup/` existen (verificado por ls y lectura de pr.yml) desde aaa-005/ADR-006 (2026-06-01). El YAML de ejemplo del playbook además difiere del real: omite format:check, changeset enforcement, la composite action y el `openspec validate` con `--yes`.

**Evidencia**: `> Esta fase aún no está implementada en el repo de referencia. Plan tentativo:`

**Impacto**: Quien replique la arquitectura bootstrappea un CI inferior al real (sin changeset enforcement ni format check), y el playbook pierde credibilidad como instructable — su única razón de existir.

**Recomendación**: Reescribir la Fase 5 a partir de los workflows reales (pr.yml con sus 6 gates, release.yml con changesets/action, composite action) y quitar la nota de 'no implementada'.

**Nota de verificación**: Verificado en sesión: PLAYBOOK.md:404 y :572 usan button.component.ts / <Name>Component (abolidos por ADR-007/ADR-010).

### docs-arquitectura-08 — ADR-007 no tiene nota de supersede tras ADR-010: su tabla de Decisión sigue mandando `button.component.ts`

- **Archivo**: `docs/architecture/adr/ADR-007-naming-prefijos.md:65`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La fila 'Folder y file naming | sin cambios | `src/lib/button/button.component.ts`' de la Decisión de ADR-007 quedó superseded por ADR-010 (file naming sin sufijo de rol, aaa-010), pero un grep de 'ADR-010|superseded' sobre ADR-007 no devuelve nada. El propio repo estableció el patrón correcto: ADR-004 sí recibió la nota fechada 'las siguientes secciones de este ADR fueron superseded por ADR-007' (ADR-004:161).

**Evidencia**: `| Folder y file naming  | sin cambios                                     | `src/lib/button/button.component.ts`                |`

**Impacto**: Un lector de ADR-007 aislado concluye que el file naming vigente es `.component.ts` — exactamente el problema de lectura cruzada que la mitigación de ADR-007 §Negativas prometía evitar con notas explícitas. Rompe la trazabilidad del sistema de ADRs inmutables.

**Recomendación**: Agregar al final de ADR-007 una nota fechada análoga a la de ADR-004: la fila de folder/file naming y la open question #3 quedaron resueltas/superseded por ADR-010 (no viola inmutabilidad: es el mecanismo documentado en adr/README §Inmutabilidad paso 3).

### docs-arquitectura-09 — Residuo de aaa-013 en openspec/changes/: el dir components-decide-icon-library/ con HU.md quedó fuera del archive

- **Archivo**: `openspec/changes/components-decide-icon-library/HU.md`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

openspec/changes/ contiene dos directorios no archivados: tokens-figma-export/ (aaa-012, el único change legítimamente activo) y components-decide-icon-library/, que solo contiene un HU.md con 'Estado: pendiente' pese a que el change fue archivado como aaa-013-components-decide-icon-library el 2026-07-03 (verificado en archive/) y su resultado (ADR-012, Lucide) está implementado hace semanas.

**Evidencia**: `**Estado**: pendiente.`

**Impacto**: Rompe el invariante documentado 'changes/ = propuestas activas' (CLAUDE.md tabla de fuentes de verdad): el repo aparenta 2 changes en vuelo cuando hay 1, y el HU.md desactualizado ('ADR-009 ya tomado') puede confundir a agentes que enumeran changes activos.

**Recomendación**: Mover HU.md a archive/aaa-013-components-decide-icon-library/ (o a docs/product si es artefacto de producto) y eliminar el directorio residual de changes/.

### docs-arquitectura-10 — ADR-009 lleva 7 semanas en 'Propuesto' con aaa-012 en vuelo mientras 25 changes posteriores se archivaron

- **Archivo**: `docs/architecture/adr/ADR-009-figma-tokens-export.md:4`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

ADR-009 (Figma tokens export) está 'Propuesto' desde 2026-06-09 y su change aaa-012 tokens-figma-export sigue activo en openspec/changes/ (openspec/README:30: 'aaa-012 asignado a tokens-figma-export (status proposed; genera ADR-009)'). Entretanto se propusieron, implementaron y archivaron aaa-013..aaa-037. No hay registro de si sigue vigente, está pausado o fue descartado de facto.

**Evidencia**: `- **Estado**: Propuesto`

**Impacto**: Un change zombie degrada la señal del sistema de gobernanza: 'changes/ = qué está en curso' deja de ser confiable, y el ADR en limbo no puede citarse ni descartarse. A escala, los changes eternos son el principal modo de fallo de OpenSpec.

**Recomendación**: Decisión del PO: (a) retomar aaa-012 y ejecutarlo, (b) moverlo explícitamente a backlog Later con disparador y anotar la pausa en el proposal, o (c) descartarlo — ADR-009 pasa a 'Descartado' y el ID queda quemado según convención.

### docs-arquitectura-11 — CLAUDE.md conserva anotaciones de la era bootstrap: '.changeset/ (a crear en Fase 1)', 'post-Fase 1' y Compodoc no instalado

- **Archivo**: `CLAUDE.md:34`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El árbol marca `.changeset/` como '(a crear en Fase 1)' cuando existe y ya se consumieron changesets en el release 0.2.0; el título 'Comandos esenciales (post-Fase 1)' y la nota 'Los comandos se completan a medida que avanzan las fases del bootstrap' (línea 166) presuponen un bootstrap en curso que el README root declara completo; y el stack lista 'Docs componentes: Compodoc (en apps/playground/ si se mantiene)' pero Compodoc no está en las devDependencies de apps/playground/package.json (verificado) y el PLAYBOOK configura Storybook con `compodoc: false`.

**Evidencia**: `├── .changeset/                  # Versionado con Changesets (a crear en Fase 1)`

**Impacto**: CLAUDE.md es el contrato que los agentes siguen literalmente; anotaciones de estado falsas inducen a re-verificar o re-crear cosas existentes y a documentar tooling fantasma. Costo de mantenibilidad directo en cada sesión.

**Recomendación**: Quitar '(a crear en Fase 1)' y la nota de fases, renombrar la sección a 'Comandos esenciales', y eliminar Compodoc del stack o decidir formalmente su adopción.

### docs-arquitectura-12 — El árbol de architecture/README omite docs/product, docs/backlog, docs/design, scripts/ y .github/

- **Archivo**: `docs/architecture/README.md:90`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El árbol 'Estructura del monorepo' (líneas 77-107) muestra bajo docs/ solo architecture/ y reference/, cuando el filesystem real (verificado con ls) tiene además product/, backlog/ y design/ (con a11y/ y research/). Tampoco aparecen scripts/ (contiene new-github-repo.ps1) ni .github/ (workflows + composite action que la propia sección 'Pipeline de releases' describe), aunque sí lista .husky/.

**Evidencia**: `│   └── reference/                # Material de investigación (no normativo)`

**Impacto**: La síntesis arquitectónica presenta un mapa del repo incompleto: capas enteras de gobernanza (producto, backlog, research de diseño) y de automatización quedan fuera del 'mapa mental' que el archivo dice ser.

**Recomendación**: Actualizar el árbol con docs/product, docs/backlog, docs/design, scripts/ y .github/, con su one-liner de propósito cada uno.

### docs-arquitectura-13 — docs/design/ y scripts/ son invisibles en CLAUDE.md: ni en el árbol ni en la tabla de fuentes de verdad

- **Archivo**: `CLAUDE.md`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

docs/design/ existe con contenido operativo real (a11y/2026-07-11-audit.md generado por /ds:check-a11y; research/atlassian-design.md y polymer-co.md citados por otros artefactos, ej. el HU.md de icon-library cita 'docs/design/research/atlassian-design.md §1.8'), pero el árbol de CLAUDE.md termina docs/ en reference/ y la tabla '¿Fuentes de verdad?' no tiene fila que responda '¿dónde van los reportes de a11y y research de diseño?'. scripts/ (new-github-repo.ps1) tampoco aparece en el árbol.

**Evidencia**: `│   └── reference/               # Material de referencia (no normativo, otros repos)`

**Impacto**: Artefactos que los skills del repo producen y consumen no tienen ubicación gobernada: el próximo reporte de a11y o research puede aterrizar en cualquier lado, exactamente el tipo de entropía que la tabla de fuentes de verdad existe para prevenir.

**Recomendación**: Agregar docs/design/ y scripts/ al árbol de CLAUDE.md y una fila en la tabla de fuentes de verdad para reportes de a11y y research de diseño (naturaleza: evidencia fechada, no normativa).

### docs-arquitectura-14 — CONTRIBUTING duplica el how-to de changesets en dos secciones y no refleja el lockstep de ADR-015

- **Archivo**: `CONTRIBUTING.md:170`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El flujo del CLI de changesets está documentado dos veces con el mismo contenido: '### Crear un changeset' (líneas 88-100) y '### Cómo agregar un changeset' (líneas 168-183) — duplicación que viola la regla 'no mezclar/duplicar' de CLAUDE.md dentro del mismo doc. Además, ninguna de las dos menciona que desde ADR-015 tokens+components versionan en lockstep (`fixed` de Changesets, versión única del par), por lo que 'Tipo de bump por package' describe una semántica que ya no aplica tal cual.

**Evidencia**: `### Cómo agregar un changeset`

**Impacto**: Dos copias del mismo instructivo garantizan drift futuro (una ya empieza a divergir en detalle de bumps), y un contribuidor elige bumps por package sin saber que el par versiona junto — fricción evitable en el flujo de PR.

**Recomendación**: Consolidar en una sola sección de changesets, linkear desde 'CI / Release', y agregar una nota del lockstep ADR-015 (también ausente en architecture/README § 'Versionado con Changesets').

---

<a id="openspec"></a>

## Higiene de OpenSpec (`openspec`)

**Evaluación general**: El sistema OpenSpec está en muy buen estado: el próximo ID (aaa-038) es correcto, la lista de IDs en vuelo es exacta (solo aaa-012), el frontmatter de las 26 specs base y de los 8 changes archivados muestreados es consistente con la convención, las specs leídas (component-avatar, component-button, component-modal, component-card, components-package) tienen scenarios binarios y testables de calidad profesional, y en 6 requirements verificados contra el código real no encontré drift (variantes/loading de DsButton, peer dep @lucide/angular, files dist+README, exports de avatar, space.negative, estructura de modal). Los hallazgos son de higiene: la validación de CI corre `npx --yes openspec` sin pinnear versión (y los comandos `pnpm openspec` documentados no funcionan), un directorio huérfano pre-aaa-013 sigue en changes/, el Purpose de components-package conserva el prefijo histórico `rmd-`, la pausa del PO sobre aaa-012 es invisible dentro de openspec/, y hay dos inconsistencias menores de convención (.openspec.yaml y el campo related-decisions).

### openspec-01 — CI valida OpenSpec con npx sin pinnear versión y los comandos pnpm openspec documentados no funcionan

- **Archivo**: `.github/workflows/pr.yml:38`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El gate de PR corre `npx --yes openspec validate --all`, que descarga la última versión publicada del CLI en cada run. `openspec` no aparece en package.json ni en pnpm-lock.yaml (grep sin matches), por lo que los comandos documentados en openspec/README.md líneas 102-103 (`pnpm openspec new change`, `pnpm openspec validate --changes`) y en CONTRIBUTING.md línea 124 (correrlo localmente) fallan tal cual están escritos salvo instalación global no documentada.

**Evidencia**: `run: npx --yes openspec validate --all`

**Impacto**: Un release upstream del CLI con breaking change o validación más estricta bloquea todos los PRs sin cambio alguno en el repo (build no reproducible, riesgo supply-chain en un gate obligatorio), y el workflow operativo documentado está roto para un dev nuevo — contra buenas prácticas (prioridad 1) y mantenibilidad (prioridad 3).

**Recomendación**: Agregar `openspec` como devDependency pinneada en el root, exponer script `"openspec": "openspec"` (o usar `pnpm exec`), cambiar el step de pr.yml a `pnpm openspec validate --all`, y alinear CONTRIBUTING.md y openspec/README.md con el comando real.

**Nota de verificación**: Toda la evidencia existe: pr.yml:38 corre `npx --yes openspec validate --all`; `openspec` no aparece en package.json (ni en deps ni en scripts) ni en pnpm-lock.yaml; openspec/README.md:102-103 documenta `pnpm openspec new change` y `pnpm openspec validate --changes`, que fallan porque no hay script `openspec` ni el paquete instalado; CONTRIBUTING.md:124 manda correr `openspec validate --all` localmente sin documentar instalación. Severidad alta razonable para la vara del repo: CLI de terceros sin pinnear ejecutándose en un gate obligatorio de PR (build no reproducible + exposición supply-chain) y workflow documentado roto para un dev nuevo.

**Corrección (2026-07-28, al ejecutar la Parte E)**: ver la corrección en [ci-cd-05]. El package `openspec` de npm es un placeholder sin `bin` — no el CLI. El step no corría una versión "no pinneada": **no corría en absoluto**, y el gate de OpenSpec de CI nunca validó nada. Resuelto en `aaa-039` con `@fission-ai/openspec@1.6.0` bajo lockfile.

### openspec-02 — Directorio huérfano changes/components-decide-icon-library/ con nota obsoleta de un change ya archivado

- **Archivo**: `openspec/changes/components-decide-icon-library/HU.md:27`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

En changes/ (reservado a changes activos) sobrevive un directorio que contiene solo HU.md, una nota pre-propuesta del change aaa-013 que ya fue archivado el 2026-07-03 en archive/aaa-013-components-decide-icon-library/ (con ADR-012 iconografía Lucide generado y ejecutado: DsModal usa LucideX y @lucide/angular ya es peerDependency). La nota dice que la decisión está pendiente y que su disparador es components-add-modal (aaa-014, archivado 2026-07-10). No tiene frontmatter ni proposal.md, violando la convención de paths del README (línea 52: change activo = `openspec/changes/<kebab-name>/` con proposal).

**Evidencia**: `**Estado**: pendiente.`

**Impacto**: Cualquier lector o agente que liste changes/ ve dos changes "activos" cuando hay uno solo, y el contenido afirma como pendiente una decisión tomada y ejecutada hace 3 semanas — desinformación directa en la fuente de verdad de cambios en curso (prioridades 1 y 3).

**Recomendación**: Borrar el directorio completo: la decisión vive en archive/aaa-013 y ADR-012, y la historia del archivo queda en git (fue tocado por el commit d36b800 de aaa-014). Si algo del texto se considera valioso, va a la Cantera del BACKLOG, no a changes/.

**Nota de verificación**: El directorio huérfano existe en changes/ con solo HU.md, sin frontmatter ni proposal.md, y afirma '**Estado**: pendiente.' (está en la línea 26, no 27 — off-by-one trivial). La decisión ya fue tomada y ejecutada: archive/aaa-013-components-decide-icon-library/ (archived: 2026-07-03), ADR-012-iconografia-lucide.md existe, modal.ts importa LucideX y @lucide/angular es peerDependency ^1.23.0; aaa-014 archivado 2026-07-10; el commit d36b800 tocó el HU.md, así que la historia queda en git. Severidad media y recomendación de borrado correctas.

### openspec-03 — El Purpose de la spec components-package conserva el prefijo histórico rmd-

- **Archivo**: `openspec/specs/components-package/spec.md:12`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El Purpose declara "selector prefix `rmd-`" mientras que el Requirement "Selector prefix fijo" de la misma spec (línea 87) exige `ds-` (ADR-007) y su propio scenario (línea 101) rechaza explícitamente `rmd-button`. Contradice además la regla de config.yaml línea 80: "Naming siempre con prefijos actuales `Ds<Name>` y `ds-<name>`, no históricos".

**Evidencia**: `contrato de componentes (standalone + signals), selector prefix `rmd-``

**Impacto**: La spec transversal más importante del kit se contradice a sí misma en su resumen: un lector que solo lea el Purpose adopta el prefijo equivocado, y el repo viola su propia regla de redacción de specs (prioridad 1 y 3).

**Recomendación**: Actualizar el Purpose a `ds-` (y releer el párrafo completo por otros restos históricos). Es corrección editorial de drift interno, no cambio de contrato: no requiere change OpenSpec.

**Nota de verificación**: Verificado literal: el Purpose (spec.md línea 12) dice 'selector prefix `rmd-`', el Requirement 'Selector prefix fijo' (línea 85-87) exige `ds-` citando ADR-007, el scenario de la línea 99-101 rechaza explícitamente `rmd-button`, y config.yaml:80 ordena 'Naming siempre con prefijos actuales `Ds<Name>` y `ds-<name>`, no históricos'. Auto-contradicción real en la spec transversal del kit; severidad media y la recomendación de corrección editorial sin change OpenSpec son razonables.

### openspec-04 — La pausa del PO sobre aaa-012 es invisible dentro de openspec/

- **Archivo**: `openspec/README.md:30` · **Producto**: HU-001 (EP-004)
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El change tokens-figma-export está "Pausado por el PO (2026-07-03)" según docs/backlog/BACKLOG.md línea 62 y los docs de producto (EP-004/HU-001), pero dentro de openspec/ nada lo refleja: el frontmatter de proposal.md dice `status: proposed` (línea 5), la línea de IDs en vuelo solo dice "status `proposed`; genera ADR-009", y el vocabulario de status de la convención (línea 67: `active | proposed | archived | deprecated`) no puede expresar una pausa. Las tasks están 0/29 y el BACKLOG lo describe como "listo para apply".

**Evidencia**: `> `aaa-012`asignado a`tokens-figma-export`(status`proposed`; genera ADR-009).`

**Impacto**: Un agente o dev que opere solo sobre openspec/ (el flujo apply arranca ahí) ve un change con 4/4 artefactos listo para implementar y puede ejecutarlo contra la decisión explícita del PO — el estado real del único change en vuelo vive fuera de su fuente de verdad (prioridades 1 y 3).

**Recomendación**: Anotar la pausa y su condición de reactivación en la línea de IDs en vuelo del README (y opcionalmente una nota al tope de proposal.md). Si el PO quiere un estado formal, extender el vocabulario con `paused` en la convención de frontmatter; eso sí requiere su OK.

**Nota de verificación**: Verificado: proposal.md línea 5 dice `status: proposed`; la línea de IDs en vuelo (openspec/README.md:30) solo dice 'status proposed; genera ADR-009' sin mención de pausa; el vocabulario de status (línea 67: active | proposed | archived | deprecated) no puede expresar pausa; BACKLOG.md líneas 58/62 dicen 'EN PAUSA', 'Pausado por el PO (2026-07-03)' y 'listo para apply'; tasks.md tiene 29 tareas sin marcar y 0 marcadas. El riesgo de que un agente operando solo sobre openspec/ ejecute el apply contra la decisión del PO es real; severidad media adecuada.

### openspec-05 — Campo related-decisions usado en 7 changes pero ausente del template de frontmatter documentado

- **Archivo**: `openspec/README.md:73`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

Los proposals de aaa-031 a aaa-037 declaran `related-decisions:` (D-XXX de producto) en su frontmatter — p. ej. aaa-037 lista D-014 y D-015 — pero el template canónico de la convención (§ Frontmatter, líneas 62-75) solo documenta id, name, type, status, archived, modifies-specs, introduces-specs y related-adrs. La práctica real ya evolucionó y la convención quedó atrás.

**Evidencia**: `related-decisions: ⏎   - D-014 ⏎   - D-015`

**Impacto**: El README es la fuente de verdad operativa del frontmatter: si no documenta un campo que 7 changes ya usan, futuros changes lo omitirán o lo escribirán distinto (related-d, decisions, etc.), degradando la trazabilidad producto↔change que el campo justamente aporta (prioridad 3).

**Recomendación**: Agregar `related-decisions:` (opcional, lista de D-XXX) al template de frontmatter de change en openspec/README.md, con una línea que explique que enlaza decisiones de producto de docs/product/.

**Nota de verificación**: Verificado: exactamente 7 proposals archivados (aaa-031 a aaa-037) declaran `related-decisions:` en frontmatter; aaa-037 lista D-014 y D-015 tal como cita la evidencia; el template canónico de openspec/README.md (líneas 62-75) solo documenta id, name, type, status, archived, modifies-specs, introduces-specs y related-adrs. Práctica real adelantada a la convención documentada; severidad baja y recomendación correctas.

### openspec-06 — .openspec.yaml presente en 24 de 37 changes archivados y ausente en todos los recientes

- **Archivo**: `openspec/changes/archive`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Ajustado (verificador adversarial — ver nota)

El marker `.openspec.yaml` (contenido: `schema: spec-driven` + `created: YYYY-MM-DD`) existe en 24 archivados pero falta en 13: aaa-001, 010, 011, 013, 014, 025 y toda la tanda reciente aaa-031..037; el change activo tokens-figma-export tampoco lo tiene. El patrón indica que el workflow actual crea los changes a mano en vez de con el scaffold `openspec new change` (que lo genera, según .claude/skills/openspec-propose/SKILL.md línea 40). Las skills de archive ordenan "Preserve .openspec.yaml when moving to archive" (openspec-archive-change/SKILL.md línea 111), pero la convención operativa de openspec/README.md nunca menciona el archivo, así que nadie sabe si es requerido.

**Evidencia**: `schema: spec-driven ⏎ created: 2026-07-20`

**Impacto**: Inconsistencia estructural silenciosa en el histórico de gobernanza: si el CLI openspec llega a usar el marker para descubrir/validar changes, los 13 sin archivo quedan fuera; y el drift CLI-scaffold vs creación manual señala que la convención documentada y la práctica real divergieron (prioridades 1 y 3).

**Recomendación**: Decidir el rol del archivo y documentarlo en openspec/README.md: o es requerido (backfillear los 13 + el activo con `created` tomado del frontmatter/git — trivial) o es un artefacto interno del CLI que se declara opcional. Verificar antes si `openspec validate --all` lo consume.

**Nota de verificación**: El hallazgo es real pero los números están mal: hay 36 changes archivados (no 37) y el marker .openspec.yaml está presente en 23 (no 24). La lista de 13 faltantes es exacta (aaa-001, 010, 011, 013, 014, 025 y aaa-031..037), el change activo tokens-figma-export tampoco lo tiene, el contenido del marker coincide (`schema: spec-driven` + `created`), las referencias a skills existen (openspec-propose/SKILL.md:40, openspec-archive-change/SKILL.md:111, además openspec-bulk-archive-change/SKILL.md:244) y openspec/README.md efectivamente nunca lo menciona. Severidad baja y recomendación se sostienen; solo corregir '24 de 37' por '23 de 36'.

---

<a id="producto-hus"></a>

## Producto: épicas, HUs y decisiones (`producto-hus`)

**Evaluación general**: La gobernanza de producto es sólida en lo estructural: las HU-019..024 están Hechas con CAs binarios tildados y estado con change/gate, la trazabilidad HU↔change↔spec es bidireccional y completa (specs component-\* existen para todo lo entregado; aaa-037 referencia HU-022/HU-018 y viceversa), los próximos IDs libres (EP-007/HU-026/D-018) son correctos contra decisiones.md (última: D-017), y HU-025 (Identificada, próximo Now) es consistente con el backlog. El defecto principal es staleness sistémico del README de producto (refleja el 2026-07-22: 'Última entrega HU-017', tanda 3 'EN COLA' — 6 changes atrás) con causa raíz en un checklist de archive que no lo cubre, más EP-002/EP-001 parcialmente viejas. El gap proactivo más importante: EP-005 (calidad profesional) no tiene HUs ni vía de entrada de trabajo pese a que D-017 elevó la ambición a 'grado profesional' y la Cantera acumula las prácticas estándar de un DS publicado (a11y en CI, visual regression, stylelint de tokens) sin dueño.

### producto-hus-01 — README de producto desactualizado: refleja el estado del 2026-07-22, seis entregas atrás

- **Archivo**: `docs/product/README.md:97` · **Producto**: EP-002
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La 'Foto táctica' dice que la tanda 3 está 'EN COLA (2026-07-22)' y que 'arranca components-add-card'; el índice de épicas dice EP-002 'tanda 3 D-014 en cola' (línea 58); y 'Última entrega' declara HU-017/aaa-031 con '16 componentes + 3 directivas + 1 service'. En realidad aaa-032..037 (Card, Button variants, Badge, Switch, Textarea, Avatar) están archivados según el catálogo de changes, HU-019..024 están Hechas con CAs tildados, y solo falta HU-025 (6/7 de la tanda). El BACKLOG delega explícitamente la dirección en este archivo ('la dirección... vive en docs/product/README.md § Roadmap').

**Evidencia**: `Última entrega: HU-017 (Button loading) Hecha — aaa-031 archivado el 2026-07-22 (genera D-013, refinamiento visual del botón); el kit mantiene 16 componentes`

**Impacto**: Prioridad 3 (mantenibilidad): la fuente declarada de dirección del producto miente por 6 changes; el actor Mantenedor ('retomar tras semanas sin contexto') leería un estado falso del roadmap.

**Recomendación**: Actualizar el índice de épicas (fila EP-002), la Foto táctica y 'Última entrega' al estado real post-aaa-037: tanda 3 en 6/7 (HU-019..024 Hechas, fechas y changes aaa-032..037), próximo components-add-slider, y el conteo real del kit (~22 componentes).

**Nota de verificación**: Verificado línea por línea: docs/product/README.md:58 ('tanda 3 D-014 en cola'), :86-88 ('EN COLA (2026-07-22)... arranca components-add-card') y :97 ('Última entrega HU-017... 16 componentes') contra openspec/changes/archive/ que contiene aaa-032..037 y EP-002 con HU-019..024 Hechas (solo HU-025 pendiente, en Now). El BACKLOG:5 delega explícitamente la dirección en ese README, lo que justifica la severidad alta para la prioridad de mantenibilidad.

### producto-hus-02 — Causa raíz: el checklist de archive no cubre el README de producto (y aaa-037 tildó 'EP-002 al día' sin estarlo)

- **Archivo**: `openspec/changes/archive/aaa-037-components-add-avatar/tasks.md:55` · **Producto**: EP-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La tarea 7.3 de aaa-037 enumera los registros a actualizar al archivar (openspec/README, catálogos, BACKLOG, HU, épica) y se marcó [x] declarando 'EP-002 al día' — pero EP-002 quedó en '4/7' y docs/product/README.md ni figura en la lista. La regla de grooming del BACKLOG (§4 'al archivar cada change se revisita este archivo... catálogo y openspec/README.md') tampoco menciona el README de producto. El drift es sistémico: ocurrió en aaa-036 y aaa-037.

**Evidencia**: `- [x] 7.3 Registros: `openspec/README.md`, catálogos en `docs/architecture/README.md`, grooming del BACKLOG (Avatar sale; `components-add-slider` promovido — último de la tanda), HU-022 → Hecha, EP-002 al día.`

**Impacto**: Prioridad 3: sin el paso explícito en el checklist, la Foto táctica y las épicas se pudren en cada archive — el fix puntual (hallazgo 1) reincidirá.

**Recomendación**: Agregar 'docs/product/README.md (índice + Foto táctica + Última entrega) y el doc de la épica (frontmatter + Valor entregado)' al checklist estándar de cierre (regla de grooming del BACKLOG §4 y/o plantilla de tasks de los changes); alternativa: eliminar la duplicación haciendo la Foto táctica más corta y derivada de las tablas de épicas.

**Nota de verificación**: Cita exacta en aaa-037/tasks.md:55 (tarea [x] con 'EP-002 al día' siendo falso: frontmatter quedó en 4/7). El patrón se repite en aaa-036/tasks.md:55 con la misma redacción. Verificado que ningún checklist cubre docs/product/README.md: la regla de grooming del BACKLOG (§4, línea 24) solo menciona 'catálogo y openspec/README.md', y el skill add-component no referencia producto. Causa raíz correctamente identificada.

### producto-hus-03 — EP-002 internamente inconsistente: frontmatter en 4/7 y 'Valor entregado' sin Textarea/Avatar

- **Archivo**: `docs/product/epics/EP-002-kit-componentes/EP-002-kit-componentes.md:2` · **Producto**: EP-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El frontmatter quedó en 'en curso 4/7... sigue Textarea' aunque aaa-036 (Textarea) y aaa-037 (Avatar) están archivados y sus HUs figuran Hechas en la tabla del mismo archivo (líneas 61 y 63). La tabla 'Valor entregado' termina en DsSwitch (aaa-035) sin filas para DsTextarea/DsFieldBase (aaa-036) ni DsAvatar/DsAvatarGroup (aaa-037). Además 'Decisiones aplicables' (línea 70) lista [D-001, D-002, D-007, D-009, D-015] omitiendo D-011 (tanda 2), D-014 (tanda 3) y D-017, que gobiernan la épica.

**Evidencia**: `estado: En desarrollo (tandas 1-2 completas + Button loading aaa-031; tanda 3 D-014 en curso 4/7 -- Card/Button variants/Badge/Switch entregados (aaa-032..035), sigue Textarea)`

**Impacto**: Prioridad 3: el mismo archivo se contradice (tabla de HUs al día, frontmatter y valor entregado no) — la metadata frontmatter, que la convención define como fuente consultable, es la parte falsa.

**Recomendación**: Actualizar frontmatter a 6/7 (sigue Slider), agregar las dos filas de Valor entregado (aaa-036 con enlace, aaa-037 con enlace) y completar Decisiones aplicables con D-011, D-014 y D-017.

**Nota de verificación**: Frontmatter (línea 2) dice '4/7... sigue Textarea' mientras la tabla del mismo archivo tiene HU-022 Hecha 2026-07-26/aaa-037 (línea 61) y HU-024 Hecha 2026-07-26/aaa-036 (línea 63). 'Valor entregado' termina en DsSwitch/aaa-035 (línea 39), sin filas para aaa-036/aaa-037. 'Decisiones aplicables' (línea 70) lista [D-001, D-002, D-007, D-009, D-015] omitiendo D-011 (aprobó la tanda 2), D-014 (tanda 3) y D-017 — las tres existen en decisiones.md y gobiernan HUs de esta épica (ej. HU-021 las cita en su frontmatter).

### producto-hus-04 — EP-005 (calidad profesional) sin HUs ni vía de entrada de trabajo pese a D-017

- **Archivo**: `docs/product/epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md:18` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Es la única épica sin HUs: su trabajo se delega a 3 items del BACKLOG, congelados desde 2026-07-11 (2 Hechos, 1 pendiente). Mientras tanto D-017 (2026-07-22) elevó la ambición a 'kit grado profesional, sin medias tintas' y la Cantera acumula sin dueño las prácticas estándar de la industria para un DS publicado: a11y en CI (axe-playwright, violaciones AA fallan el build), visual regression, Stylelint para forzar tokens, bundle size budget, docs de tokens en Storybook. El alcance de EP-005 ('son skills de tooling /ds:\*') ni siquiera contempla ese tipo de items, así que la épica no puede absorberlos tal como está escrita.

**Evidencia**: `Sin HUs con archivo aún — los tres items viven en [docs/backlog/BACKLOG.md](../../../backlog/BACKLOG.md) con sus disparadores`

**Impacto**: Prioridad 1 (buenas prácticas): un DS con 0.2.0 en npm y ~22 componentes cuya a11y (D-007, feature declarada) y consistencia de tokens dependen de auditorías manuales; la épica creada para esto no tiene mecanismo para recibir trabajo, y por la regla del repo las buenas prácticas de industria se proponen aunque no haya disparador.

**Recomendación**: Decisión del PO: ampliar el alcance de EP-005 (calidad verificada automáticamente, no solo skills) y promover 1-2 items de la Cantera 'Calidad profesional' como HUs con archivo — empezando por a11y en CI, que materializa D-007/D-017 y protege lo ya entregado en cada PR futuro. Registrar la decisión como D-018.

**Nota de verificación**: EP-005:18 exacto ('Sin HUs con archivo aún'); alcance (línea 14) limitado a 'skills de tooling (/ds:\*)' — no puede absorber a11y en CI/visual regression/stylelint/bundle budget, que están en Cantera (BACKLOG:112-118) sin dueño. D-017 (2026-07-22, 'grado profesional, sin medias tintas') y 0.2.0 en npm (D-010) verificados. El impacto no está sobredimensionado: el gate de contraste es un script manual del skill check-a11y (.claude/skills/check-a11y/scripts/contrast.mjs) ejecutado por tarea de cada change, no CI; nada falla el build automáticamente. decision-po es el tipo correcto.

### producto-hus-05 — Disparador de /ds:audit-tokens marcado como 'posiblemente activado' hace 15 días, sin confirmación registrada

- **Archivo**: `docs/backlog/BACKLOG.md:76` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

Desde 2026-07-11 el BACKLOG, EP-005 y la Foto táctica del README registran que el primer drift de tokens (hardcode `white` en Checkbox/Radio) podría activar `/ds:audit-tokens`, con la nota explícita 'confirmar con el PO'. No hay confirmación ni D-XXX registrada 15 días después, y en el medio la tanda 3 sumó 6 sets de tokens `component.*` nuevos (card, badge, switch, textarea, avatar, button variants) que agrandan la superficie sin auditar.

**Evidencia**: `el disparador podría considerarse activado (`components-fix-a11y-minor` ya cerrado por commit directo); confirmar con el PO`

**Impacto**: Prioridades 1 y 3: la consistencia de tokens es el contrato central del DS; una pregunta abierta de 15 días sin resolución contradice el flujo declarado ('cada ambigüedad se resuelve con el product owner y se registra').

**Recomendación**: Llevar la pregunta al PO en la próxima sesión y registrar el resultado: activar el item como Now (tooling por commit directo según EP-005) o redefinir el disparador; en ambos casos actualizar BACKLOG, EP-005 y la Foto táctica.

**Nota de verificación**: Cita exacta en BACKLOG:76; la nota data del 2026-07-11 (15 días al 2026-07-26) y el eco existe en EP-005:24 y README Foto táctica:92. Sin D-XXX que la resuelva en decisiones.md (última: D-017). Detalle menor que no cambia severidad ni recomendación: los '6 sets component.\* nuevos' son en realidad 4 archivos nuevos (card, badge, switch, textarea) + avatar.json reelaborado del bootstrap + button.json extendido por variants — la sustancia (superficie de tokens creció sin auditar) se sostiene.

### producto-hus-06 — H1 sin mecanismo de verificación definido justo cuando la tanda 3 está por completar el kit

- **Archivo**: `docs/product/README.md:72` · **Producto**: EP-002
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El hito principal del roadmap (H1 — 'Kit mínimo viable para una app real') tiene su condición de salida pendiente de una decisión del PO desde el cierre de la tanda 2 (2026-07-20). La tanda 3 —la última expansión aprobada hacia ese criterio— queda a un componente de cerrarse (HU-025 Slider, ya en Now). No existe HU ni D-XXX que capture cómo se verificará 'una app real se construye 100% con el DS'.

**Evidencia**: `condición de salida pendiente: construir una app real 100% con el DS (decisión del PO sobre cómo verificarla)`

**Impacto**: Prioridad 2 (dirección que escala ordenado): sin la verificación definida, el roadmap no puede declarar H1 cumplido al cerrar la tanda 3 y el siguiente objetivo de producto queda sin disparador — riesgo de deriva post-tanda.

**Recomendación**: Resolver con el PO al cerrar HU-025: candidato natural es un prototipo de las vistas de la referencia moder-minimal en el playground (EP-006 ya es 'plataforma de prototipado' por D-001, y D-014 declaró esas vistas como criterio). Registrar como D-XXX y, si genera trabajo, como HU de EP-006.

**Nota de verificación**: Cita exacta en README:72 ('condición de salida pendiente... decisión del PO sobre cómo verificarla', fechada al cierre de tanda 2, 2026-07-20). Verificado en decisiones.md que ninguna D-001..D-017 define el mecanismo de verificación, y que HU-025 (último de la tanda 3) ya está en Now (BACKLOG:32-38). La recomendación es coherente con D-001 (playground como plataforma de prototipado) y D-014 (vistas de la referencia moder-minimal como criterio declarado).

### producto-hus-07 — plantilla-requerimiento.md referencia infraestructura inexistente (intake/, preguntas-abiertas.md, OQ-XXX)

- **Archivo**: `docs/product/templates/plantilla-requerimiento.md:6`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La plantilla instruye guardar intakes en `docs/product/intake/` y registrar preguntas como OQ-XXX en `docs/product/preguntas-abiertas.md`; ninguno de los dos existe en el repo (verificado por glob de docs/product/). El README de producto no menciona la plantilla ni el flujo intake (su § Estructura lista solo README, decisiones.md, templates/ y epics/), y su § Flujo de trabajo dice lo contrario: las ideas crudas van a la Cantera del BACKLOG y 'no generan artefactos acá'.

**Evidencia**: `<!-- Requerimiento SIN ID. Guardar como docs/product/intake/nombre-corto.md.`

**Impacto**: Prioridad 3: dos flujos de entrada contradictorios documentados en el mismo espacio; un colaborador o agente que siga la plantilla crea artefactos fuera de la convención (directorio nuevo, registro OQ-XXX inexistente).

**Recomendación**: Decisión del PO: adoptar formalmente el flujo intake (crear `docs/product/intake/` + `preguntas-abiertas.md`, documentarlo en README § Estructura y § Flujo) o eliminar la plantilla — hoy la Cantera del BACKLOG cumple ese rol y la plantilla es letra muerta.

**Nota de verificación**: Cita exacta en plantilla-requerimiento.md:6. Verificado por glob que docs/product/intake/ y docs/product/preguntas-abiertas.md no existen, y por grep que ningún otro archivo del repo referencia OQ-XXX, preguntas-abiertas ni el flujo intake — solo la propia plantilla. El README de producto (§ Estructura, líneas 27-36; § Flujo, línea 141: las ideas crudas 'no generan artefactos acá') documenta el flujo contrario. Contradicción real entre dos flujos de entrada en el mismo espacio; decision-po correcto.

### producto-hus-08 — Clave `adrs` ausente en el frontmatter de las HUs viejas que sí tienen ADRs aplicables

- **Archivo**: `docs/product/epics/EP-002-kit-componentes/HU-003-select-formularios.md:4` · **Producto**: HU-003
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La convención del README dice: 'adrs (ADRs técnicos directamente aplicables; la clave se omite si no hay)'. HU-001..HU-016 no llevan la clave pese a tenerlos: HU-003 genera ADR-014 (lo dice su propio estado) y aplica ADR-011/012/013; HU-012 genera ADR-016; HU-014 genera ADR-017; HU-005/HU-006/HU-007 citan ADR-011/012/014 en sus CAs. Las HUs desde HU-017 en adelante sí la llevan — la convención se aplica solo a la mitad nueva del corpus.

**Evidencia**: `estado: Hecha (2026-07-11, aaa-016 components-add-select; genera ADR-014)`

**Impacto**: Prioridad 3: la metadata deja de ser consultable de forma uniforme — un grep por `adrs:` da falsos negativos en ~14 HUs, exactamente lo que el frontmatter con IDs pelados quería evitar.

**Recomendación**: Backfill mecánico de la clave `adrs:` en HU-001..HU-016 con los ADRs ya citados en sus estados y cuerpos (sin cambiar nada más).

**Nota de verificación**: Verificado por grep: la clave 'adrs:' solo existe en la plantilla, HU-017..HU-025 y HU-018 — ninguna de HU-001..HU-016 la lleva. HU-003:4 exacto ('genera ADR-014') con CAs que citan ADR-011/012 y dependencias que citan ADR-013; HU-012 dice 'genera ADR-016' en su estado sin clave adrs; HU-006 cita ADR-011 en CA-006.6. La convención (README:121) declara la clave como parte del contrato de metadata. Severidad baja y backfill mecánico razonables.

### producto-hus-09 — EP-001 no registra el cierre parcial de HU-018 (space.negative entregado por aaa-037)

- **Archivo**: `docs/product/epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md:30` · **Producto**: HU-018
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La tabla de HUs de EP-001 mantiene a HU-018 como 'Identificada (Later; sin disparador activo — un change por token)' y el párrafo de candidatas dice que los tres aditivos siguen 'cada uno esperando su disparador'. Pero CA-018.3 (`space.negative.*`) se entregó el 2026-07-26 vía aaa-037: la propia HU-018 ya registra 'cierre parcial 1/3' en su frontmatter y el BACKLOG ya tachó `tokens-add-negative-space`. La tabla 'Valor entregado' de la épica tampoco suma esta entrega de tokens.

**Evidencia**: `Identificada (Later; sin disparador activo — un change por token)`

**Impacto**: Prioridad 3: estados divergentes entre la HU (al día) y su épica (vieja) para el mismo hecho — mismo patrón de staleness del hallazgo 1, en EP-001.

**Recomendación**: Actualizar la fila de HU-018 al estado real ('Identificada, cierre parcial 1/3 — CA-018.3 Hecho 2026-07-26 vía aaa-037'), ajustar el párrafo de candidatas y agregar la entrega de `space.negative.*` al Valor entregado.

**Nota de verificación**: EP-001:30 exacto ('Identificada (Later; sin disparador activo...)') y línea 32 aún dice 'cada uno esperando su disparador', mientras HU-018 registra en su frontmatter 'cierre parcial 1/3 (CA-018.3 Hecho 2026-07-26 vía aaa-037)' con el CA tildado, y el BACKLOG:86 ya tachó tokens-add-negative-space. La tabla 'Valor entregado' de EP-001 (líneas 18-23) termina en aaa-015, sin la entrega de space.negative. Mismo patrón de staleness del hallazgo 1; severidad baja correcta.

### producto-hus-10 — Slider duplicado: item en Now (components-add-slider) y fila aún viva en la Cantera

- **Archivo**: `docs/backlog/BACKLOG.md:103` · **Producto**: HU-025
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

HU-025 dice 'Sale de la Cantera del BACKLOG al ganar el disparador de la tanda' y el item `components-add-slider` está en Now (promovido al archivar aaa-037), pero la fila '**Slider** | Range input' sigue listada en Cantera § Componentes. Viola la regla del propio archivo ('Un item = una entrada') y el paso de promoción ('Un ítem sube a un horizonte... al hacerlo se le da formato de plantilla').

**Evidencia**: `| **Slider**     | Range input`

**Impacto**: Prioridad 3: doble fuente para el mismo item; el grooming de aaa-037 promovió el item a Now pero no limpió la Cantera — inconsistencia menor pero visible en el archivo operativo principal.

**Recomendación**: Eliminar la fila Slider de la tabla de la Cantera (una línea).

**Nota de verificación**: Verificado: fila '| **Slider** | Range input' en Cantera (BACKLOG:103) coexiste con components-add-slider en Now (BACKLOG:32-38, promovido al archivar aaa-037). HU-025:17 dice 'Sale de la Cantera del BACKLOG al ganar el disparador de la tanda' y la regla 'Un item = una entrada' está en BACKLOG:168. Consistente además con EP-002:66, que lista solo Stepper y DatePicker como candidatas restantes de Cantera. Fix de una línea, severidad baja correcta.

### producto-hus-11 — Regla de plantilla 'incluir siempre un caso de error' incumplida sin excepción registrada en HUs Hechas

- **Archivo**: `docs/product/templates/plantilla-hu.md:39` · **Producto**: HU-019
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El comentario normativo de la plantilla exige 'Incluir siempre al menos un caso de error/validación', pero HUs Hechas de componentes presentacionales no lo tienen: HU-019 (Card, 7 CAs, ninguno de error), HU-021 (Badge) y HU-010 (Skeleton) — mientras que las de forms sí (HU-005 CA-005.4 invalid, HU-022 fallback por error de imagen). La regla escrita como 'siempre' no distingue componentes con superficie de fallo real de los puramente visuales, así que hoy o la plantilla exagera o las HUs incumplen.

**Evidencia**: `Incluir siempre al menos un caso de error/validación.`

**Impacto**: Prioridad 3: una regla normativa que se incumple sistemáticamente sin registrar la excepción erosiona el valor de la plantilla como estándar (¿qué otras reglas son opcionales?).

**Recomendación**: Ajustar el comentario de la plantilla a 'incluir un caso de error/validación cuando el componente tenga superficie de fallo (forms, red, entrada del usuario); si no aplica, declararlo en Notas' — refleja la práctica real ya consolidada en 24 HUs.

**Nota de verificación**: Cita exacta en plantilla-hu.md:38-39 ('Incluir siempre al menos un caso de error/validación'). Verificado: HU-019 (7 CAs), HU-021 (7 CAs) y HU-010 (6 CAs) no tienen ningún caso de error, mientras HU-005 (CA-005.4, invalid/touched) y HU-022 (fallback por error de imagen, CA-022.1/022.5) sí. La distinción forms/presentacional que propone la recomendación refleja la práctica real del corpus (25 HUs, no 24 — detalle cosmético). Severidad baja y ajuste de plantilla razonables.

---

<a id="backlog"></a>

## Backlog operativo y TASK.md (`backlog`)

**Evaluación general**: BACKLOG.md está en buen estado operativo: los 15 changesets enumerados en la nota del veto coinciden exactamente con .changeset/, el único item Now (components-add-slider) es correcto tras archivar aaa-037 hoy, y el grooming del 2026-07-26 actualizó el item de tokens Atlassian. Los fallos son puntuales pero reales: una decisión estancada 15 días (/ds:audit-tokens) que ~13 groomings no lograron escalar al PO, Slider duplicado en la Cantera, y un resto de backlog viejo varado en openspec/changes/. El problema grave está en TASK.md: es un scratch no versionado (gitignored a propósito) que sin embargo contiene trabajo real del kit (1.11, 1.12), una decisión de producto diferida (1.3) y una iniciativa tamaño épica (template-lume, incluido un rename del theme brand-a ya publicado en npm) — y artefactos versionados e inmutables (D-014, EP-006) lo citan, con una referencia ya desincronizada. Hay que regularizar su rol como inbox del PO con regla de triaje y migrar todo lo load-bearing a producto/backlog.

### backlog-01 — TASK.md: scratch no versionado que sostiene trabajo real y decisiones — sin rol definido en la gobernanza

- **Archivo**: `docs/backlog/TASK.md:1`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

TASK.md está gitignored a propósito (.gitignore líneas 1-2: '# Scratch personal del PO — nunca se commitea (se coló 2 veces vía stash de lint-staged)' / 'docs/backlog/TASK.md') y no figura en la tabla de fuentes de verdad del CLAUDE.md. Sin embargo hoy es el ÚNICO lugar donde viven: la decisión diferida 1.3 (visibilidad de HUs hechas), los items de trabajo 1.11 y 1.12, y toda la iniciativa template-lume (sección 2). Peor: artefactos versionados lo citan — EP-006 línea 10 '(PO, 2026-07-18, TASK.md)' y D-014 referencia '1.11' y '1.12'. Si el archivo se pierde (no está en git), se pierde backlog real y quedan referencias colgantes en documentos inmutables.

**Evidencia**: `# Scratch personal del PO — nunca se commitea (se coló 2 veces vía stash de lint-staged)\ndocs/backlog/TASK.md (.gitignore:1-2)`

**Impacto**: Viola la regla 'no mezclar' (prioridad 3, mantenibilidad): contenido normativo fuera de toda fuente de verdad declarada, sin respaldo en git y citado desde artefactos versionados. Un repo que 'se puede retomar tras semanas sin contexto' (actor Mantenedor) no puede depender de un archivo local no versionado.

**Recomendación**: Decisión del PO sobre el rol del archivo, con dos opciones: (a) formalizarlo como 'inbox del PO' — documentado en la tabla de fuentes del CLAUDE.md y en BACKLOG.md con regla de triaje: todo item se migra a Cantera/backlog/HU en el siguiente grooming y se tacha; prohibido referenciarlo desde artefactos versionados (D-XXX, EPs, HUs) — o (b) eliminarlo tras migrar 1.3, 1.11, 1.12 y sección 2 a sus destinos formales. En ambos casos, migrar YA el contenido load-bearing (hallazgos siguientes).

**Nota de verificación**: Verificado en sesión: .gitignore:1-2 exactamente como se cita.

### backlog-02 — Items 1.11 y 1.12 (trabajo real del kit) viven solo en TASK.md y D-014 los cita con numeración ya rota

- **Archivo**: `docs/backlog/TASK.md:9` · **Producto**: EP-002
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: hu-nueva · **Effort**: medium
- **Verificación**: Confirmado (verificación inline en sesión)

  1.11 ('ajustar las proporciones y tamaños para que las dimensiones sean igual que docs/reference/components/moder-minimal') y 1.12 ('el spiner quiero que tenga la estetica de la captura docs/reference/components/spiner') son trabajo real del kit sin HU ni item de backlog. D-014 (decisiones.md, append-only y versionado) los delega explícitamente: 'Las proporciones/dimensiones exactas de la referencia son tarea aparte (1.11); el theming, 1.12' — pero el 1.12 actual de TASK.md es el spinner, no el theming (que hoy es la sección 2.2): la referencia ya está desincronizada porque el archivo no versionado mutó. Además, el disparador natural de 1.11 (cerrar la tanda 3) está a un change de activarse (slider es el último, 7/7).

**Evidencia**: `Las **proporciones/dimensiones exactas** de la referencia son tarea aparte (1.11); el **theming**, 1.12. (docs/product/decisiones.md:22, D-014) vs '- 1.12 [] el spiner quiero que tenga la estetica de la captura docs/reference/components/spiner' (TASK.md:11)`

**Impacto**: Trabajo comprometido por una decisión de producto formal (D-014) es invisible para el backlog y su grooming, y la trazabilidad D-014→tarea ya es incorrecta. Cuando se archive el slider, el grooming no promoverá 1.11 porque no existe en BACKLOG.md (prioridades 2 y 3).

**Recomendación**: Crear los artefactos estables: (a) HU nueva (HU-026) 'ajuste dimensional del kit a la referencia moder-minimal' (afecta HU-019…HU-025, EP-002) + item de backlog en Next con disparador 'archivar components-add-slider'; (b) refinamiento de la HU del Spinner (o HU nueva) para la estética de la captura spiner + item en Next/Cantera. Registrar en decisiones.md (nueva entrada, sin editar D-014) el mapeo correcto de las tareas citadas. Tachar 1.11/1.12 en TASK.md al migrar.

**Nota de verificación**: Verificado en sesión: decisiones.md:22 (D-014) cita 1.11 y 1.12 de TASK.md.

### backlog-03 — Sección 2 de TASK.md (template-lume): iniciativa tamaño épica sin épica, con rename de theme publicado en npm

- **Archivo**: `docs/backlog/TASK.md:14`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: high
- **Verificación**: Confirmado (verificación inline en sesión)

La sección '2. Replicar https://template-lume.vercel.app/' pide: identificar componentes nuevos + generar HUs + changes (2.1), crear una web-page en el playground con arquitectura de navegación (2.2), generar un theme nuevo, y 'el theme brand-a renombrarlo a modern-minimal'. Es alcance de épica (probable EP-007) con cero artefactos de producto: no hay épica, HUs, item de backlog ni entrada en Cantera. El rename de `brand-a` toca la superficie publicada de @romanmartinidev/tokens 0.2.0 (entrypoint de theme consumido según el hito H2 'Cumplido — consumo verificado'): es un breaking pre-1.0 que D-004 permite pero exige tratar como decisión explícita, no como bullet de un scratch.

**Evidencia**: `- el theme brand-a renombrarlo a modern-minimal (TASK.md:20)`

**Impacto**: Dirección de producto ('qué sigue y por qué') viviendo fuera de docs/product/, contra la regla del propio BACKLOG ('la dirección no vive acá' y menos en un archivo no versionado). El rename sin decisión formal ni plan de deprecación rompería consumidores del 0.2.0 en silencio (prioridades 1 y 2).

**Recomendación**: Decisión del PO en dos partes: (a) aprobar la creación de EP-007 'replicar template-lume' (o, si aún no se compromete, entrada en Cantera con formato de plantilla) usando /ds:research-design-system para el análisis del sitio; (b) D-XXX explícita sobre el rename brand-a→modern-minimal: alias temporal + deprecación vs. rename seco en el próximo minor 0.x, documentado en el changeset. Nada de esto arranca desde TASK.md.

**Nota de verificación**: Verificado en sesión: TASK.md §2 leído — incluye el rename brand-a→modern-minimal sin artefactos de producto.

### backlog-04 — /ds:audit-tokens: decisión estancada 15 días — el grooming reevalúa disparadores pero no escala decisiones al PO

- **Archivo**: `docs/backlog/BACKLOG.md:76` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La nota del item dice: 'Nota (2026-07-11): la auditoría a11y detectó el primer hardcode (white en checkmark/dot de Checkbox y Radio) — el disparador podría considerarse activado…; confirmar con el PO'. Desde esa fecha se archivaron ~13 changes (aaa-025…aaa-037, el último hoy 2026-07-26) y la regla de grooming §4 ('al archivar cada change se revisita este archivo — se reevalúan disparadores') se ejecutó cada vez sin que la confirmación pendiente se resolviera. Mientras tanto la superficie auditable creció 7+ componentes (tanda 3 casi completa, Avatar sumó component.avatar._ y space.negative._), agrandando el costo del drift que la skill detectaría.

**Evidencia**: `Nota (2026-07-11): la auditoría a11y detectó el primer hardcode (`white` en checkmark/dot de Checkbox y Radio) — el disparador podría considerarse activado (`components-fix-a11y-minor` ya cerrado por commit directo); confirmar con el PO.`

**Impacto**: Tooling de calidad de EP-005 bloqueado por una confirmación trivial que el proceso no logra poner frente al PO: el grooming reevalúa disparadores pero no tiene mecanismo para escalar decisiones pendientes (prioridad 1: la skill previene drift de tokens; prioridad 3: la nota envejece sin dueño).

**Recomendación**: Resolver la decisión ya (recomendación: activar — el disparador 'primer drift en code review' se cumplió hace 15 días y el kit siguió creciendo; mover a Now y ejecutar como commit directo de tooling). Además, corregir el gap de proceso: agregar a la regla de grooming §4 un paso 'las notas ‘confirmar con el PO’ se listan explícitamente al PO en la misma sesión del archive; ninguna nota sobrevive más de un grooming sin respuesta'.

### backlog-05 — Item 1.3 de TASK.md: decisión diferida del PO que debería ser item Next del BACKLOG

- **Archivo**: `docs/backlog/TASK.md:5`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El item 1.3 (visibilidad del estado de las HUs) tiene análisis completo desde 2026-07-20 ('análisis hecho, decisión diferida por el PO. Opciones evaluadas: tabla global de HUs en product/README [recomendada], contador x/y por épica, archive/ por épica [desaconsejada…]') y quedó congelado en el scratch. 'Esperando una decisión puntual del PO' es literalmente la definición del horizonte Next (BACKLOG.md:20), pero el item no existe en BACKLOG.md, así que ningún grooming lo va a resurfacear.

**Evidencia**: `_(2026-07-20: análisis hecho, decisión diferida por el PO. Opciones evaluadas: tabla global de HUs en product/README [recomendada], contador x/y por épica, archive/ por épica [desaconsejada: rompe ~40+ enlaces; el estado es metadato, no ubicación].)_`

**Impacto**: Una decisión con análisis terminado y recomendación clara lleva 6 días invisible al proceso; con 25 HUs y 6 épicas, la falta de vista de estado global ya cuesta mantenibilidad (prioridad 3) — el propio product/README solo lista IDs de HUs por épica, sin estado por HU.

**Recomendación**: Que el PO resuelva (la opción recomendada — tabla global de HUs con estado en docs/product/README.md — es de bajo costo y ejecutable por commit directo). Si vuelve a diferir, crear el item `product-hu-status-view` en BACKLOG § Next con las opciones evaluadas y disparador 'decisión del PO', y tachar 1.3 en TASK.md.

### backlog-06 — Slider duplicado: item Now y a la vez fila viva en la Cantera

- **Archivo**: `docs/backlog/BACKLOG.md:103` · **Producto**: HU-025
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La Cantera todavía lista '| **Slider** | Range input |' mientras `components-add-slider` es el único item Now (línea 32) con HU-025 creada — y la propia HU-025 declara 'Sale de la Cantera del BACKLOG al ganar el disparador de la tanda' (HU-025-slider.md:17). La fila debió eliminarse en el grooming de D-014 (2026-07-22) y sobrevivió 3+ groomings más. Viola la regla 'Un item = una entrada' (línea 168).

**Evidencia**: `| **Slider**     | Range input |`

**Impacto**: El backlog contradice su propia regla y a HU-025: un lector puede creer que hay un Slider adicional sin disparador. Erosiona la confianza en que la Cantera refleja solo ideas no promovidas (prioridad 3).

**Recomendación**: Eliminar la fila Slider de la tabla de Componentes de la Cantera (commit directo de docs). Aprovechar para verificar en el mismo commit que Stepper y DatePicker siguen siendo correctos (lo son: sin HU ni disparador).

### backlog-07 — Resto de backlog pre-producto varado en openspec/changes/ (components-decide-icon-library/HU.md)

- **Archivo**: `openspec/changes/components-decide-icon-library/HU.md:26`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El directorio `openspec/changes/components-decide-icon-library/` contiene solo un `HU.md` (10-07-2026) con formato de item de backlog viejo que termina en '**Estado**: pendiente.' — pero el change real ya se ejecutó y archivó como `aaa-013-components-decide-icon-library` (generó ADR-012, Lucide). Es un fósil: hace parecer que hay 2 changes activos (solo `tokens-figma-export` lo es), mezcla contenido de backlog dentro de openspec/changes (regla 'no mezclar') y contradice el flujo 'al archivar, el directorio se renombra y se mueve a archive/'.

**Evidencia**: `**Estado**: pendiente.`

**Impacto**: Cualquier agente o dev que liste openspec/changes/ (p. ej. /ds:auto o un grooming) ve un change activo inexistente y un 'pendiente' ya resuelto — ruido directo contra la prioridad 3 y contra la exactitud del inventario de changes.

**Recomendación**: Borrar el directorio `openspec/changes/components-decide-icon-library/` completo (el histórico vive en `openspec/changes/archive/aaa-013-components-decide-icon-library/` y la decisión en ADR-012). Commit directo tipo chore/docs.

### backlog-08 — La nota del veto npm enumera nominalmente los 15 changesets: duplicación manual del estado de .changeset/

- **Archivo**: `docs/backlog/BACKLOG.md:30`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La nota dice 'los changesets se acumulan (hoy 15: Toast, Spinner, …, Textarea y Avatar)'. Hoy la lista es exacta (verificada contra los 15 .md de .changeset/), pero es una enumeración manual que hay que reescribir en cada archive y que duplica un estado cuya fuente de verdad es el directorio `.changeset/`. El mismo BACKLOG prohíbe duplicar lo que otra fuente ya dice (regla de deduplicación, línea 166).

**Evidencia**: `los changesets se acumulan (hoy 15: Toast, Spinner, Skeleton, Menu, Accordion, Breadcrumbs, Pagination, Progress, Button loading, Card, Button variants, Badge, Switch, Textarea y Avatar)`

**Impacto**: Riesgo de drift silencioso a medida que la lista crece: un changeset olvidado en la nota daría una foto falsa del release pendiente. Bajo hoy porque el grooming la viene manteniendo, pero es fricción evitable (prioridad 3).

**Recomendación**: Reducir la nota al dato que importa: el veto + el conteo con puntero ('los changesets se acumulan — inventario en `.changeset/`'), sin lista nominal. Commit directo.

### backlog-09 — playground-theme-switcher: disparador redactado como 'activado' estando en Next

- **Archivo**: `docs/backlog/BACKLOG.md:52` · **Producto**: EP-006
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El item en Next dice '**Disparador**: activado por decisión del PO (diferido 2026-07-23)…'. Según las propias definiciones (línea 19-20), 'disparador activado' = Now; lo que el item quiere decir es que 'se activa POR decisión del PO' (aún no tomada). La redacción actual contradice el estado del item y la semántica de horizontes que el resto del archivo respeta.

**Evidencia**: `**Disparador**: activado por decisión del PO (diferido 2026-07-23) — se retoma cuando quiera, o antes de un release para QA visual multi-theme.`

**Impacto**: Ambigüedad en un documento cuyo valor es precisamente la semántica precisa de Now/Next/Later; un agente ejecutando /ds:auto podría interpretarlo como arrancable (prioridad 3). Menor, pero es el tipo de deriva que las reglas del archivo existen para evitar.

**Recomendación**: Reescribir a '**Disparador**: decisión del PO (diferido 2026-07-23) — se retoma cuando lo pida, o antes de un release para QA visual multi-theme'. Commit directo de docs.

---

<a id="claude-ecosystem"></a>

## Ecosistema .claude/ (`claude-ecosystem`)

**Evaluación general**: El ecosistema .claude/ está muy por encima del estándar: skills con constraints y quality checks explícitos, knowledge ng-best-practices.md que cumple lo que CLAUDE.md exige (fecha de extracción 2026-06-07 + tabla de 12 URLs canónicas), ng-stack-profile.md COMPLETO con los 5 campos críticos, handoff gitignored verificado y script de contraste determinístico con exit codes honestos. Los problemas reales son de drift y de guardrails: CLAUDE.md documenta un comando inexistente (/ng:component vs /ng:create real), el perfil del stack quedó atrás de ADR-020 (DsFieldBase) y de la convención de 6 archivos, y settings.json no codifica como deny/hook las reglas que las skills declaran en prosa (veto npm, prohibición de git add -A), además de acumular permisos one-shot muertos. El único vacío de skill es /ds:audit-tokens, cuyo disparador declarado (>100 tokens) está objetivamente cumplido con 754 custom properties.

### claude-ecosystem-01 — CLAUDE.md documenta /ng:component pero el comando real es /ng:create

- **Archivo**: `CLAUDE.md:194`
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificación inline en sesión)

La tabla de comandos ng-\* de CLAUDE.md (líneas 187, 194 y 199) documenta `/ng:component <nombre>`, pero el archivo real es `.claude/commands/ng/create.md` (expuesto como /ng:create). La rule ng-constraints.md, el agente ng-component (Triggers: /ng:create) y ng-stack-profile.md ya dicen /ng:create — solo CLAUDE.md (y el blueprint) quedaron atrás.

**Evidencia**: `| `/ng:component <nombre>`     | Genera un componente moderno (standalone, OnPush, signals, control flow nativo, a11y, test) |`

**Impacto**: CLAUDE.md es el contrato Claude-repo y se carga en cada sesión: cualquier agente o usuario que siga la tabla invoca un comando inexistente. Viola directamente la prioridad de mantenibilidad vía convenciones claras y contradice a la propia rule ng-constraints.md.

**Recomendación**: Corregir las 3 menciones en CLAUDE.md (tabla, párrafo del perfil y flujo) a `/ng:create`. Verificar con grep que no queden otras menciones fuera del blueprint (que se corrige en hallazgo aparte).

**Nota de verificación**: Verificado en sesión: el comando real registrado es /ng:create; CLAUDE.md documenta /ng:component.

### claude-ecosystem-02 — ng-stack-profile.md no refleja ADR-020 (DsFieldBase) ni la convención real de 6 archivos

- **Archivo**: `.claude/knowledge/ng-stack-profile.md:39`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Las 'Convenciones del repo' del perfil dicen 4 archivos por componente, pero la convención vigente (ADR-010, replicada en add-component) incluye además `.stories.ts` e `index.ts` + export en public-api.ts. Peor: no menciona ADR-020, que manda 'Todo form field del kit extiende DsFieldBase' (packages/components/src/lib/field/field-base.ts, existente y verificado).

**Evidencia**: `un directorio por componente bajo `packages/components/src/lib/<nombre>/`, con sus 4 archivos juntos`

**Impacto**: add-component fase 4 recomienda delegar la generación a /ng:create; con el perfil desactualizado, ng-component generaría un form field sin DsFieldBase (violando ADR-020) y sin stories/index, y ng-review no lo marcaría porque también lee este perfil como fuente de consistencia. Rompe el principio 'crear y revisar con el mismo rasero'.

**Recomendación**: Actualizar la sección 'Convenciones del repo' del perfil: 6 archivos (ts/html/css/spec/stories/index + export en public-api), y agregar en 'Notas condicionales' que los form fields extienden DsFieldBase citando ADR-020. De paso, corregir en add-component fase 4 la frase que dice que el perfil no cubre el naming Ds (hoy sí lo cubre).

### claude-ecosystem-03 — El gate visual del PO pre-archive vive solo en el handoff efímero; backlog-auto no lo contempla

- **Archivo**: `.claude/skills/backlog-auto/SKILL.md:70`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El modo de trabajo vigente de la tanda D-014 ('el gate visual del PO va SIEMPRE antes del archive — nunca archivar sin su OK', registrado en .claude/session-handoff.md) no está institucionalizado en ningún artefacto durable. backlog-auto ejecuta el flujo OpenSpec completo hasta archive, y con commit=auto podría archivar un componente sin el gate visual.

**Evidencia**: `**Tipo OpenSpec** → flujo completo con las skills `opsx:\*`: propose → apply → verify → archive.`

**Impacto**: Una corrida autónoma /ds:auto commit=auto cerraría y archivaría changes de componentes sin la verificación visual del PO, saltándose un control de calidad que el PO considera obligatorio. El handoff es gitignored y se sobrescribe: la regla puede perderse en cualquier /clear.

**Recomendación**: Confirmar con el PO si el gate visual pre-archive es regla permanente del repo. Si lo es, agregarla a los 'Límites duros' de backlog-auto (archive de componentes requiere OK visual explícito) y registrarla como decisión D-XXX o en BACKLOG/CONTRIBUTING, no solo en el handoff.

### claude-ecosystem-04 — El veto de publicación npm no tiene control duro en settings.json (sin deny)

- **Archivo**: `.claude/settings.json:2`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El veto explícito del PO (memoria no-publicar-npm-sin-orden, 2026-07-19) vive solo en MEMORY.md. settings.json tiene únicamente bloque allow — no hay deny para `npm publish`, `pnpm publish`, `pnpm -r publish` ni `changeset publish`.

**Evidencia**: `"permissions": { ⏎     "allow": [`

**Impacto**: La memoria es orientativa, no un control del harness: un subagente sin memoria cargada o una corrida autónoma dependen del prompt de permisos genérico. El estándar profesional para vetos operativos es codificarlos como deny explícito, que bloquea sin depender del contexto conversacional.

**Recomendación**: Agregar bloque deny en .claude/settings.json: `Bash(npm publish*)`, `Bash(pnpm publish*)`, `Bash(pnpm -r publish*)`, `Bash(npx changeset publish*)` (y `Bash(pnpm changeset publish*)`). Retirarlo el día que el PO ordene publicar.

### claude-ecosystem-05 — Bash(git add \*) en la allowlist contradice la regla 'nunca git add -A' de las skills

- **Archivo**: `.claude/settings.json:8`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La allowlist aprueba `Bash(git add *)`, que incluye `git add -A` y `git add .`, exactamente lo que add-component ('Staging solo con paths explícitos (nunca `git add -A`)') y backlog-auto ('Stagear solo los archivos del item (nunca `git add -A`)') prohíben en prosa.

**Evidencia**: `"Bash(git add *)",`

**Impacto**: La regla de staging solo existe como instrucción textual: en una corrida autónoma (/ds:auto commit=auto) un `git add -A` pasa sin prompt y puede arrastrar archivos ajenos al item (el propio .gitignore registra que TASK.md 'se coló 2 veces'). Los guardrails declarados y los permisos efectivos deben coincidir.

**Recomendación**: Agregar deny para `Bash(git add -A*)`, `Bash(git add .*)` y `Bash(git add --all*)` (el deny gana sobre el allow), o reemplazar el allow amplio por un hook PreToolUse que rechace staging masivo.

### claude-ecosystem-06 — /ds:audit-tokens: el disparador declarado está objetivamente cumplido y la skill sigue sin crearse

- **Archivo**: `.claude/commands/ds/README.md:33`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El backlog de commands define crear /ds:audit-tokens 'cuando el package tokens crezca a >100 tokens o aparezca el primer drift'. Verificado: dist/tokens.css tiene 754 declaraciones `--ds-`, y BACKLOG.md registra que la auditoría a11y del 2026-07-11 detectó el primer hardcode ('el disparador podría considerarse activado... confirmar con el PO').

**Evidencia**: `Cuando el package `tokens` crezca a >100 tokens o aparezca el primer drift detectado en code review.`

**Impacto**: Ambos disparadores están cumplidos hace semanas y la única verificación de jerarquía de tokens (huérfanos, hardcodes, bypass semantic→primitive) sigue siendo manual. Con 23 componentes y 754 custom properties, el costo de drift silencioso crece con cada componente nuevo.

**Recomendación**: Confirmar con el PO la activación (como pide el propio BACKLOG) y crear la skill check-style: script determinístico (símil contrast.mjs) que detecte tokens definidos y no referenciados, valores hardcoded fuera de var(--ds-\*) en packages/components/src, y component tokens que referencien primitives directo.

### claude-ecosystem-07 — Blueprint ng-components.md desactualizado respecto del scaffold vivo

- **Archivo**: `.claude/blueprints/ng-components.md:284`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El checklist binario del blueprint exige `component.md` (y todo el documento usa /ng:component), pero el archivo real es `create.md`. Además, el bloque verbatim del knowledge no tiene la nota agregada después al §9 vivo ('criterio del autor; ng-sync no los re-verifica'), y blueprint-lock.json registra "agentStudioVersion": "unknown".

**Evidencia**: `Existen los 5 comandos namespaced en `.claude/commands/ng/`: `ask.md`, `component.md`, `review.md`, `change.md`, `sync.md``

**Impacto**: El criterio de calidad del scaffold ('checklist con ítems binarios') falla contra la realidad: quien verifique la instalación o re-scaffoldee otro repo reproduce la divergencia. Mantenibilidad: el registro del scaffold debe reflejar lo desplegado.

**Recomendación**: Versionar el blueprint (1.2.0 vía /as-blueprint-version o /as-blueprint-sync) registrando el rename component.md→create.md, la nota del §9 y completando agentStudioVersion en el lock.

### claude-ecosystem-08 — Allowlist de settings.json con entradas muertas y one-shot acumuladas

- **Archivo**: `.claude/settings.json:30`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La allowlist acumula permisos de sesiones pasadas que ya no aplican: un comando compuesto con `cd` al directorio `agent-design-sistem` (inexistente — verificado: el repo vive en `agents/design-sistem`), seds one-shot con contenido literal de aaa-013/aaa-014 (líneas 37, 41, 44, 49), mensajes de commit específicos ya realizados (34, 36, 48, 51), y el duplicado Skill(update-config) / Skill(update-config:\*) (58-59).

**Evidencia**: `"Bash(cd \"c:\\\\Users\\\\roman\\\\Projects\\\\romanmartinidev\\\\github-repos\\\\agents\\\\agent-design-sistem\" && pnpm -F @romanmartinidev/tokens test`

**Impacto**: Las entradas muertas son inertes pero entierran los permisos amplios reales (WebFetch, WebSearch, git add \*) entre ~30 líneas de ruido, haciendo la superficie de permisos difícil de auditar. Mantenibilidad pura: la config comiteada debería ser el set estable, no el historial de prompts aceptados.

**Recomendación**: Depurar la allowlist a patrones estables (pnpm build/test/lint, git commit/add acotado, node de scripts del repo, WebFetch por dominio) eliminando one-shots y paths muertos; verificar de paso la semántica del prefijo `/` en `Edit(/.claude/skills/...)` (relativo vs raíz). La skill fewer-permission-prompts puede regenerar la base.

### claude-ecosystem-09 — Default de ng-review escribe el artefacto de review dentro del package publicable

- **Archivo**: `.claude/agents/ng-review.md:28`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El default de salida del review es 'junto al componente revisado', que en este repo significa `packages/components/src/lib/<name>/` — la fuente de una lib publicada en npm. add-component fase 7 usa /ng:review como quality gate de cada alta, así que el caso se dispara en cada componente nuevo. Hoy no hay reviews commiteados (verificado), pero el riesgo es estructural.

**Evidencia**: `**Escribir el artefacto de review** en el path indicado por el invocador (default: junto al componente revisado).`

**Impacto**: Artefactos efímeros de review pueden colarse en commits de la lib (mismo patrón por el que TASK.md se coló 2 veces vía stash de lint-staged). El repo ya tiene convención de reportes fechados en docs/design/ (a11y, research) que el default ignora.

**Recomendación**: Fijar el default del repo sin tocar el agente genérico: en la sección 'Convenciones del repo' de ng-stack-profile.md (y en add-component fase 7) indicar que los reviews van a `docs/design/reviews/<fecha>-<componente>.md` o al scratchpad de sesión si son descartables.

### claude-ecosystem-10 — ng-router tiene fallback de knowledge a ~/.claude/knowledge que el resto del grupo no tiene

- **Archivo**: `.claude/agents/ng-router.md:25`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

ng-router lee los knowledge 'primero en `.claude/knowledge/` del proyecto y, si no existen ahí, en `~/.claude/knowledge/`'. ng-component, ng-review y ng-sync solo leen los del proyecto y fallan rápido si faltan. Piezas del mismo grupo resuelven la misma dependencia de forma distinta.

**Evidencia**: `primero en `.claude/knowledge/`del proyecto y, si no existen ahí, en`~/.claude/knowledge/``

**Impacto**: Si el knowledge del proyecto faltara, el router rutearía con un perfil global ajeno mientras el especialista destino pararía por fail fast — comportamiento divergente dentro del grupo que dice operar con 'knowledge como fuente única'. Inconsistencia entre agentes que hacen cosas parecidas.

**Recomendación**: Quitar el fallback a ~/.claude/knowledge del proceso de ng-router (alinear con el fail fast del resto del grupo y con ng-constraints.md), o si el fallback es deseado como diseño de la familia, declararlo en la rule y en los 4 agentes por igual.

### claude-ecosystem-11 — check-a11y hardcodea '4 scopes (default + 3 themes)' en su quality check

- **Archivo**: `.claude/skills/check-a11y/SKILL.md:130`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El quality check 3 fija el número de scopes en 4, acoplado al estado actual de packages/tokens (dark, brand-a, brand-b verificados en dist/themes/). El script contrast.mjs ya es dinámico: descubre los scopes leyendo dist/themes/\*.css.

**Evidencia**: `¿La tabla de contraste cubre los 4 scopes (default + 3 themes) o declara por qué no?`

**Impacto**: Al agregar o quitar un theme, el quality check queda desfasado en silencio y una auditoría que omita el theme nuevo igual 'pasaría' su autoverificación. Es el único punto de la skill que valida contra un número congelado en vez del estado real del repo.

**Recomendación**: Reformular el check para validar contra la realidad: '¿la tabla cubre todos los scopes que reporta el script (default + cada dist/themes/\*.css) o declara por qué no?'.

### claude-ecosystem-12 — research-design-system manda el output del script a /tmp, contra la convención de scratchpad

- **Archivo**: `.claude/skills/research-design-system/SKILL.md:83`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El paso 2-B instruye `> /tmp/extract.json`. En este entorno Windows /tmp solo existe vía Git Bash (falla en PowerShell), y la convención del harness — que la skill hermana check-a11y ya sigue ('el manifest de pares va al scratchpad, no al repo') — es usar el scratchpad de sesión.

**Evidencia**: `node .claude/skills/research-design-system/scripts/extract-design.mjs <url> > /tmp/extract.json`

**Impacto**: Inconsistencia entre skills hermanas del mismo namespace ds:\* y fragilidad multiplataforma: el mismo tipo de artefacto temporal se maneja con dos convenciones distintas, y una de ellas depende del shell usado.

**Recomendación**: Cambiar el ejemplo a escribir en el scratchpad de la sesión (mismo lenguaje que check-a11y paso 3.2), dejando /tmp fuera del contrato de la skill.

---

<a id="playground"></a>

## Playground y Storybook (`playground`)

**Evaluación general**: El playground es sólido como base: showcase con registro único tipado que alimenta rutas y sidebar, nav accesible con aria-current testeado, Storybook 10 con addon-a11y y cobertura de stories completa (22/22 componentes públicos; `field` es base interna sin export). Los gaps grandes están en su rol de herramienta de QA visual profesional: no hay forma de validar dark/brand ni en la app ni en Storybook, Storybook no participa del CI (stories rotas pasan verde), no existen interaction tests ni docs de tokens, y el spec playground-app quedó desactualizado en tres puntos verificables. Además los tests del playground corren con zone.js mientras la app es zoneless, lo que reduce la fidelidad del QA.

### playground-01 — No se puede validar dark/brand visualmente: ni el playground ni Storybook cargan los themes

- **Archivo**: `apps/playground/src/styles.css:2` · **Producto**: EP-006 / backlog `playground-theme-switcher`
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

styles.css importa solo los tokens base ("@import '@romanmartinidev/tokens/css';") y el target storybook de angular.json inyecta ese mismo archivo. El package de tokens ya exporta './themes/dark', './themes/brand-a' y './themes/brand-b' (packages/tokens/package.json líneas 38-40), pero nada los consume. En .storybook/preview.ts no hay globalTypes ni decorators de theme/brand (verificado por grep sin matches). El backlog ya registra el gap (playground-theme-switcher, Next, diferido por el PO 2026-07-23) pero su alcance propuesto solo cubre la app, no la toolbar de Storybook.

**Evidencia**: `@import '@romanmartinidev/tokens/css';`

**Impacto**: El único QA visual de dark/brand hoy es un gate de contraste por script; ninguna regresión visual de themes es detectable a ojo. Para un DS ya publicado en npm con 3 themes, esto contradice la prioridad 1 (buenas prácticas de QA visual) y bloquea cualquier release multi-theme confiable.

**Recomendación**: Activar el item playground-theme-switcher del backlog y ampliar su alcance: (a) en el playground, toolbar con toggle light/dark + selector de brand seteando data-theme/data-brand; (b) en Storybook, cargar los CSS de themes vía styles del target y agregar globalTypes + decorator que estampe los mismos atributos, para que cada story sea auditable en las 6 combinaciones.

**Nota de verificación**: Todo verificado: styles.css:2 importa solo tokens base; angular.json inyecta ese mismo archivo en ambos targets de Storybook (líneas 80 y 90); packages/tokens/package.json:38-40 exporta los 3 themes; preview.ts no tiene globalTypes ni decorators; grep de themes/dark|data-theme en apps/: cero matches. El backlog (BACKLOG.md:44-54, Next, diferido por PO 2026-07-23) registra el gap con alcance solo-app, sin mencionar Storybook, tal como afirma el hallazgo. Severidad alta razonable para un DS 0.2.0 publicado con 3 themes sin QA visual posible.

### playground-02 — Storybook no participa del CI de PR: stories rotas pasan verde

- **Archivo**: `.github/workflows/pr.yml:32` · **Producto**: EP-005
- **Severidad**: alta · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El pipeline de PR corre format, lint, 'pnpm -r build', 'pnpm -r test', openspec validate y changesets — pero nunca 'build-storybook' (grep de 'storybook' en pr.yml: sin matches). Las stories no entran al build de ng-packagr (excluidas del tarball por spec) ni a los tests, así que su única compilación real es cuando alguien levanta Storybook localmente. El único type-check que las incluye (.storybook/tsconfig.json, include de '../../../packages/components/src/\*_/_.stories.ts') no se ejecuta en CI.

**Evidencia**: `- name: Build (recursive) ⏎         run: pnpm -r build`

**Impacto**: Un refactor de API de un componente puede romper sus stories sin que ningún gate lo detecte; la herramienta de QA visual se degrada silenciosamente. Va directo contra mantenibilidad y contra el rol de Storybook como vitrina de calidad.

**Recomendación**: Agregar un step 'pnpm -F playground build-storybook' (o al menos 'tsc --noEmit -p apps/playground/.storybook/tsconfig.json') al job de PR. Es un smoke test barato que compila todas las stories.

**Nota de verificación**: pr.yml verificado: format, lint, pnpm -r build, pnpm -r test, openspec validate, changesets — ninguna mención a storybook. El build recursivo corre 'ng build' del playground (tsconfig.app.json), que no incluye stories; el único tsconfig que las incluye (.storybook/tsconfig.json:6, include '../../../packages/components/src/\*_/_.stories.ts') no se ejecuta en CI. Las stories tampoco entran a vitest (patrón \*.spec) ni al tarball (spec playground-app líneas 160-164 lo exige). Severidad alta defendible: la vitrina de QA puede romperse en silencio con cualquier refactor de API.

### playground-03 — Drift del spec playground-app: 3 requirements ya no describen la realidad

- **Archivo**: `openspec/specs/playground-app/spec.md:130` · **Producto**: HU-011 / EP-006
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Tres puntos verificados: (1) el spec exige que preview.ts importe los tokens ('preview.ts SHALL importar @romanmartinidev/tokens/css', líneas 130 y 141) pero preview.ts hace deliberadamente lo contrario ('NO importar tokens/css acá: webpack no procesa CSS importado desde TS en este setup', líneas 1-2) — los tokens van vía styles del target en angular.json; (2) el scenario CA-011.1 dice 'un sidebar SHALL listar los 11 entregables del kit' (línea 85) cuando el registry tiene 23 entradas; (3) el requirement de stories solo cubre Button ('Story del Button co-ubicada con el componente', línea 143+) cuando hoy hay 22 componentes con stories co-ubicadas — la regla real ('todo componente del kit SHALL tener stories') no está especificada.

**Evidencia**: ``preview.ts` SHALL importar `@romanmartinidev/tokens/css` para que las stories pinten con tokens.`

**Impacto**: El spec es la fuente de verdad testable del repo; con requirements falsos o desactualizados pierde autoridad y cualquier agente que lo siga literalmente 'corregiría' preview.ts rompiendo el setup real. Golpea la prioridad 2 y 3 (gobernanza que escala).

**Recomendación**: OpenSpec change chico que actualice playground-app/spec.md: legalizar la inyección de tokens vía styles del target storybook (o import equivalente), parametrizar el conteo de entregables al registro (sin número hardcodeado), y generalizar el requirement de stories a todo componente público del kit.

**Nota de verificación**: Los 3 drifts verificados con líneas exactas: (1) spec.md:130 y 138-141 exigen que preview.ts importe tokens/css, y preview.ts:1-2 hace deliberadamente lo contrario (tokens vía styles de angular.json); (2) spec.md:85 dice '11 entregables' y registry.ts tiene 23 entradas (contadas); (3) el requirement de stories (spec.md:143-164) solo cubre Button y hoy hay 22 \*.stories.ts co-ubicados (glob verificado). No hay ningún change OpenSpec activo que lo corrija (solo components-decide-icon-library y tokens-figma-export). Severidad alta correcta: un agente que siga el spec literalmente rompería el setup real de Storybook.

### playground-04 — Tests del playground corren con zone.js mientras la app es zoneless

- **Archivo**: `apps/playground/src/test-setup.ts:7` · **Producto**: EP-006
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: high
- **Verificación**: Confirmado (verificador adversarial)

test-setup.ts importa '@analogjs/vitest-angular/setup-zone' y llama setupTestBed({ zoneless: false }), pero app.config.ts provee provideZonelessChangeDetection() y el spec exige modo zoneless. Los tests de navegación y shell (app.spec.ts) ejercitan un modelo de change detection que nunca corre en producción: bugs de CD específicos de zoneless (mutaciones fuera de listeners, falta de señales) pasan los tests y fallan en la app real.

**Evidencia**: `setupTestBed({ zoneless: false });`

**Impacto**: Reduce la fidelidad del QA del playground justo en su función principal (validar las libs en condiciones reales). El mismo criterio aplica a packages/components (el comentario dice 'Mismo criterio que packages/components/src/test-setup.ts'), así que el arreglo conviene coordinado.

**Recomendación**: Cambiar a setupTestBed({ zoneless: true }) (y quitar setup-zone si @analogjs/vitest-angular lo permite en esa modalidad), corriendo la suite completa para detectar tests que dependían de zone. Si hay una limitación técnica de analogjs que motivó zoneless:false, documentarla en el comentario con la referencia concreta.

**Nota de verificación**: Verificado: test-setup.ts:1 importa setup-zone y línea 7 llama setupTestBed({ zoneless: false }); app.config.ts:13 provee provideZonelessChangeDetection(); el spec playground-app (líneas 32-45) exige modo zoneless. El comentario espejo en packages/components/src/test-setup.ts:10 solo dice 'zoneless: false porque este setup usa zone' — circular, sin limitación técnica documentada, como señala el hallazgo. app.spec.ts existe. Severidad media y arreglo coordinado con components: razonable.

### playground-05 — Sin interaction tests (play functions) en ninguna story

- **Archivo**: `apps/playground/.storybook/main.ts:8` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: L · **Ejecución**: hu-nueva · **Effort**: high
- **Verificación**: Confirmado (verificador adversarial)

Grep de '@storybook/test|userEvent|play: async' sobre los 22 \*.stories.ts: cero matches. Todas las stories son render-only. Componentes con comportamiento rico (menu con submenús y Popover API, modal, select combobox, tabs, accordion, tooltip) no tienen su interacción verificada en Storybook, y el addon-a11y instalado solo audita el estado inicial estático — nunca los estados abiertos (panel de menú, modal desplegado).

**Evidencia**: `stories: ['../../../packages/components/src/lib/**/*.stories.@(ts|mdx)'],`

**Impacto**: El estándar de la industria para design systems publicados (Storybook test module + play functions, corridos en CI) queda sin cubrir; los estados interactivos son justamente donde viven las regresiones de a11y y teclado que el DS promete (D-007).

**Recomendación**: HU nueva en EP-005/EP-006: adoptar storybook/test con play functions para los componentes overlay/interactivos (menu, modal, select, tabs, tooltip como primera tanda) y correrlos en CI (vitest addon de Storybook 10), lo que además ejecuta los checks de a11y sobre estados abiertos.

**Nota de verificación**: Grep preciso de \bplay\s*:|userEvent|@storybook/test|storybook/test sobre los 22 *.stories.ts: cero matches reales (un grep laxo matchea 'display:' en CSS, pero en stories no hay nada). main.ts confirma addon-a11y instalado, que solo audita el render inicial. Componentes overlay (menu con Popover API y submenús, modal, select, tooltip, tabs, accordion) existen todos con stories render-only. Severidad media y ejecución como HU nueva: proporcionadas.

### playground-06 — Compodoc desactivado: autodocs sin prop tables generadas desde el código

- **Archivo**: `apps/playground/angular.json:78` · **Producto**: EP-006
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Ambos targets de Storybook declaran '"compodoc": false'. Las stories usan tags: ['autodocs'], pero sin Compodoc las docs pages de Angular solo muestran los argTypes declarados a mano — los JSDoc de inputs/outputs de los componentes (que el repo escribe con cuidado) no llegan a la documentación, y componentes con stories sin argTypes (ej. menu.stories.ts no declara ninguno) quedan sin tabla de API.

**Evidencia**: `"compodoc": false,`

**Impacto**: La documentación de la API real del componente vive duplicada (JSDoc en código vs argTypes manuales en stories) o directamente falta; para un DS consumible por terceros la prop table completa autogenerada es estándar. Afecta mantenibilidad (una sola fuente) y profesionalismo de la vitrina.

**Recomendación**: Habilitar compodoc: true con compodocArgs ['-e','json','-d','.'] en ambos targets (agregando @compodoc/compodoc como devDep del playground — CLAUDE.md ya lo prevé en el stack) y verificar que las docs pages muestren las tablas de inputs/outputs con sus JSDoc.

**Nota de verificación**: Verificado: angular.json declara "compodoc": false en ambos targets (líneas 78 y 88); @compodoc/compodoc no está en devDependencies del playground; menu.stories.ts usa tags ['autodocs'] sin declarar ningún argType (leído completo); avatar.stories.ts sí declara argTypes a mano, confirmando la duplicación JSDoc/argTypes. CLAUDE.md lista Compodoc en el stack ('si se mantiene'). Severidad media razonable para la vara de DS consumible por terceros.

### playground-07 — Storybook no documenta los tokens: cero páginas MDX/foundations

- **Archivo**: `apps/playground/.storybook/main.ts:8` · **Producto**: EP-005 / EP-001
- **Severidad**: media · **Tamaño**: L · **Ejecución**: hu-nueva · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El glob de stories acepta .mdx pero no existe ningún archivo .mdx en el repo (Glob '\*_/_.mdx': sin resultados) y el patrón solo mira packages/components. La jerarquía de tokens (primitives/semantic/component/theme en packages/tokens/src) no tiene representación visual: paletas de color, escala de spacing, radios, tipografía y sombras solo se pueden inspeccionar leyendo JSON/CSS.

**Evidencia**: `stories: ['../../../packages/components/src/lib/**/*.stories.@(ts|mdx)'],`

**Impacto**: Los tokens son un package publicado (@romanmartinidev/tokens) sin documentación visual consumible — todo DS profesional (Carbon, Polaris, Material) documenta foundations junto a los componentes. Sin esto, validar visualmente un cambio de token requiere adivinar qué componentes lo usan.

**Recomendación**: HU nueva: páginas de docs de foundations en Storybook (MDX o stories dedicadas bajo un path de tokens agregado al glob de main.ts) que rendericen los --ds-\* por categoría, idealmente generadas desde el output de Style Dictionary para que no driften.

**Nota de verificación**: Verificado: Glob '\*_/_.mdx' en todo el repo devuelve cero archivos; main.ts:8 restringe el patrón de stories a packages/components/src/lib. Los tokens (@romanmartinidev/tokens 0.2.0, publicado) no tienen ninguna representación visual en Storybook ni en el playground más allá de la vista de iconografía. Severidad media y HU nueva: proporcionadas.

### playground-08 — Sin Storybook publicado ni regresión visual automatizada

- **Archivo**: `.github/workflows/pr.yml:11` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: L · **Ejecución**: decision-po · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

Los únicos workflows son pr.yml y release.yml; ninguno publica storybook-static (el target build-storybook con outputDir 'storybook-static' existe pero nadie lo consume) ni corre visual regression (Chromatic/Percy/Loki). El QA visual es 100% manual y local.

**Evidencia**: `jobs: ⏎   validate:`

**Impacto**: Cambios de CSS/tokens que alteran el render de los 22 componentes no tienen red de detección; con un release 0.2.0 ya publicado, una regresión visual llegaría a consumidores sin que ningún gate la vea. Es el complemento natural del gate de contraste que ya existe.

**Recomendación**: Decisión del PO (implica servicio externo u hosting): publicar Storybook por PR (GitHub Pages / Chromatic free tier para OSS) y evaluar snapshots visuales sobre las stories como gate no bloqueante al principio.

**Nota de verificación**: Verificado: solo existen pr.yml y release.yml; grep de storybook|chromatic|percy|loki en .github/: cero matches. El target build-storybook con outputDir 'storybook-static' existe en angular.json:83-92 y nadie lo consume en CI. Con packages ya en 0.2.0 publicados, la ausencia de red visual es real. Severidad media y tipo decision-po (servicio externo/hosting): correctos.

### playground-09 — Story de Avatar depende de una imagen remota (pravatar.cc)

- **Archivo**: `packages/components/src/lib/avatar/avatar.stories.ts:59` · **Producto**: HU-022
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

La story ImagenConFallback usa src="https://i.pravatar.cc/80?img=47" — un servicio externo no determinístico (devuelve imágenes distintas, puede caerse, no funciona offline). main.ts ya configura staticDirs: ['../public'], así que hay lugar natural para un asset local.

**Evidencia**: `<ds-avatar name="Sofia Davis" src="https://i.pravatar.cc/80?img=47" />`

**Impacto**: QA no reproducible: la story cambia de render entre corridas y rompe sin red. Si se adopta visual regression (finding anterior), este es un falso positivo garantizado en cada corrida.

**Recomendación**: Reemplazar la URL remota por un asset estático en apps/playground/public (ej. /avatars/sofia.jpg) referenciado con path absoluto desde la story; misma corrección si algún showcase la usa.

**Nota de verificación**: Verificado: avatar.stories.ts:59 contiene exactamente src="https://i.pravatar.cc/80?img=47" (story ImagenConFallback) y main.ts:16 ya declara staticDirs: ['../public']. Es la única referencia a pravatar en el repo (grep global): ningún showcase la usa, así que la corrección es un solo archivo. Severidad media defendible por el vínculo con visual regression; el fix es S como indica.

### playground-10 — styles.css global acumula utilidades por-showcase y se inyecta entero en Storybook

- **Archivo**: `apps/playground/src/styles.css:24` · **Producto**: EP-006
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Confirmado (verificador adversarial)

El stylesheet global contiene utilidades específicas de demos individuales (.playground**team\*, .playground**skeleton-card, .playground\_\_icon-button…) y el propio comentario reconoce la deuda: clases 'migradas de la página única — mantienen sus nombres para no reescribir cada demo'. Además, como los targets storybook/build-storybook inyectan 'src/styles.css' completo (angular.json líneas 80 y 90), todas esas utilidades del playground entran al entorno de stories, que debería ser neutro (solo tokens + reset).

**Evidencia**: `/* Utilidades compartidas por las vistas del showcase (demos migradas de la ⏎    página única — mantienen sus nombres para no reescribir cada demo) */`

**Impacto**: Cada componente nuevo del kit engorda un CSS global sin dueño (ya hay bloques exclusivos del showcase de Avatar, líneas 107-139) y las stories pueden acoplarse accidentalmente a clases que no existen en apps consumidoras — falsea el QA. Contra prioridades 2 y 3.

**Recomendación**: Extraer un entry tokens-only (ej. src/storybook-styles.css con solo el @import de tokens + base html/body) para los targets de Storybook, y mover las utilidades por-demo al CSS del showcase view que las usa (styleUrl por vista, patrón que showcase-case ya sigue).

**Nota de verificación**: Verificado: styles.css:24-25 contiene el comentario citado textual y las utilidades por-demo (.playground**skeleton-card:68, .playground**icon-button:86, bloque team de Avatar exactamente en líneas 107-139); angular.json inyecta src/styles.css completo en storybook (línea 80) y build-storybook (línea 90). Matiz que no cambia el veredicto: hoy ninguna story usa clases playground\_\_ (grep en packages/components: cero matches), o sea el acople es riesgo latente, no defecto actual — el hallazgo ya lo formula como 'pueden acoplarse'. Severidad media OK por el patrón de crecimiento sin dueño.

### playground-11 — Viewport de Storybook sin presets: QA responsive limitado

- **Archivo**: `apps/playground/.storybook/preview.ts:15` · **Producto**: EP-006
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

El parameter viewport solo declara defaultViewport: 'responsive', sin options (en Storybook 10 el viewport es core y se configura con parameters.viewport.options + initialGlobals). No hay presets de breakpoints propios del DS, así que validar componentes como pagination, tabs o menu en móvil depende de redimensionar a mano el navegador.

**Evidencia**: `viewport: { ⏎       defaultViewport: 'responsive', ⏎     },`

**Impacto**: Sin viewports nombrados y repetibles no hay QA responsive sistemático ni base para futuros snapshots por breakpoint. Gap menor pero barato de cerrar y alineado con la vara profesional.

**Recomendación**: Definir options de viewport con los breakpoints del sistema (o MINIMAL_VIEWPORTS de storybook/viewport como punto de partida) y migrar a la API vigente de SB10 (options + initialGlobals) verificando contra la doc de la versión instalada.

**Nota de verificación**: Verificado: preview.ts:15-17 contiene exactamente viewport: { defaultViewport: 'responsive' } sin options ni initialGlobals, y no hay ninguna otra configuración de viewport en el repo. La descripción de la API de SB10 (viewport core, parameters.viewport.options + initialGlobals) es correcta, y la recomendación ya pide verificar contra la doc de la versión instalada. Severidad baja adecuada.

### playground-12 — Target 'test' de angular.json divergente del pipeline real de Vitest

- **Archivo**: `apps/playground/angular.json:70` · **Producto**: EP-006
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Confirmado (verificador adversarial)

angular.json declara un target test con builder '@angular/build:unit-test' sin ninguna opción, mientras el script real es "test": "vitest" (package.json línea 15) usando vitest.config.ts + @analogjs. Existen dos entradas de test que no comparten pipeline: 'ng test' usaría el builder experimental de Angular con sus defaults, 'pnpm test' usa analogjs/jsdom con test-setup.ts.

**Evidencia**: `"test": { ⏎           "builder": "@angular/build:unit-test" ⏎         },`

**Impacto**: Ambigüedad para cualquier dev o agente ('ng test' vs 'pnpm test' pueden dar resultados distintos o fallar uno de los dos); el spec exige explícitamente Vitest+analogjs. Costo de mantenimiento gratuito.

**Recomendación**: Eliminar el target test de angular.json (dejando pnpm test/vitest como única vía, alineada al spec) o configurarlo para delegar exactamente en el mismo setup; documentar la vía canónica.

**Nota de verificación**: Verificado: angular.json:70-72 declara el target test con builder '@angular/build:unit-test' sin opciones, y package.json:15 define "test": "vitest" con vitest.config + test-setup de analogjs. El spec playground-app (líneas 166-173) exige Vitest+analogjs como vía canónica, así que el target divergente es ruido puro. Severidad baja y remoción como fix S: correctos.

### playground-13 — Estado mutable sin signal en MenuShowcase (convención signals-first)

- **Archivo**: `apps/playground/src/app/showcase/menu/menu-showcase.ts:32` · **Producto**: EP-006
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Ajustado (verificador adversarial — ver nota)

MenuShowcase usa 'protected lastAction = ""' mutado en onAction() y renderizado en el template (@if (lastAction) en menu-showcase.html línea 14). En una app zoneless con OnPush funciona solo porque la mutación ocurre dentro de un listener de template que marca la vista dirty; cualquier refactor que mueva la mutación fuera del listener deja la UI sin actualizar. El estándar del repo es signals-first.

**Evidencia**: `protected lastAction = '';`

**Impacto**: Riesgo bajo pero real de bug silencioso en zoneless, y el showcase es la vitrina de cómo se consume el DS: ejemplifica un patrón que el propio repo marca como legacy.

**Recomendación**: Convertir a signal ('protected readonly lastAction = signal("")') y actualizar template y onAction; barrer los demás showcases por el mismo patrón.

**Nota de verificación**: El hallazgo central es exacto: menu-showcase.ts:32 tiene 'protected lastAction = ---' mutado en onAction() y renderizado en menu-showcase.html:14 (@if (lastAction)), en app zoneless con OnPush, contra la convención signals-first del repo (CLAUDE.md). Ajuste de alcance/recomendación: es la ÚNICA ocurrencia — grep de campos protected no-readonly mutables en todos los showcases devuelve solo esa línea; los otros 8 showcases con estado ya usan signal(). El 'barrido de los demás showcases' recomendado no encontraría nada: el fix es un solo archivo, tamaño S se mantiene, severidad baja correcta.

---

<a id="tooling-repo"></a>

## Tooling raíz y gobernanza de repo público (`tooling-repo`)

**Evaluación general**: El tooling raíz es sólido en formato/commits/hooks (Prettier, commitlint, husky, lint-staged, CI de PR coherente con CONTRIBUTING), pero el lint es genérico: no existe angular-eslint, por lo que los 33 templates HTML de los 23 componentes —el producto central— no pasan por ningún linter ni reglas de a11y de template. Como repo público que publica a npm faltan todos los archivos de gobernanza estándar (SECURITY.md, CODEOWNERS, templates de issues/PR, dependabot/renovate) y los tarballs publicados no incluyen el texto de la licencia MIT. Hay además strictness de TypeScript incompleta (sin noUncheckedIndexedAccess/exactOptionalPropertyTypes, specs y stories nunca se typechequean) y residuos de la fase bootstrap (.prettierignore de "Fase 1", docs/reference en .gitignore con archivos trackeados, playwright sin uso).

### tooling-repo-01 — ESLint sin angular-eslint: templates y reglas a11y de Angular sin lint

- **Archivo**: `eslint.config.js:23` · **Producto**: EP-005
- **Severidad**: alta · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Confirmado (verificación inline en sesión)

El flat config solo compone js.configs.recommended + tseslint.configs.recommended + prettier. No hay @angular-eslint en ninguna devDependency del monorepo (verificado por grep en package.json root, packages y app). Los 33 templates .html externos de packages/components/src/lib (checkbox, modal, select, tabs, menu, avatar, etc.) no son procesados por ningún linter: ni reglas de template (template/no-negated-async, track en @for, etc.), ni reglas de accesibilidad de template (template/alt-text, interactive-supports-focus, click-events-have-key-events...), ni reglas TS de Angular (directive/component-selector con prefijo ds, prefer-standalone, no-empty-lifecycle-method). Para un design system cuyo diferencial declarado es la a11y (skill /ds:check-a11y, D-007), no tener el gate automático estándar de la industria es el gap de tooling más grande del repo. En la misma pasada conviene evaluar subir typescript-eslint a recommendedTypeChecked.

**Evidencia**: `js.configs.recommended, ⏎   ...tseslint.configs.recommended,`

**Impacto**: Errores de template y violaciones a11y solo se detectan por auditoría manual; el kit publicado puede regresionar sin que CI lo vea. Contradice la prioridad 1 (buenas prácticas) en el corazón del producto.

**Recomendación**: Agregar angular-eslint (angular.configs.tsRecommended + templateRecommended + templateAccessibility) con processInlineTemplates y bloque files: ['**/*.html'], extender lint-staged para \*.html con eslint --fix, y corregir los hallazgos que aparezcan en los 23 componentes. Es cambio de tooling base → flujo OpenSpec según CONTRIBUTING.md.

**Nota de verificación**: Verificado en sesión: eslint.config.js solo compone js+tseslint+prettier; grep de angular-eslint en package.json de todo el repo: 0 matches.

### tooling-repo-02 — Sin Dependabot ni Renovate: cero automatización de updates de dependencias

- **Archivo**: `.github/workflows/pr.yml`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La estructura completa de .github/ (verificada con Glob) contiene solo actions/setup/action.yml, workflows/pr.yml y workflows/release.yml. No existe .github/dependabot.yml ni renovate.json en el root. El repo publica dos librerías a npm (tokens y components 0.2.0) y depende de un stack grande (Angular 21, Storybook 10, Vitest 4, Style Dictionary 4); sin bot de updates, los parches de seguridad de la cadena de dependencias solo llegan por revisión manual.

**Evidencia**: `Glob .github/**: .github\actions\setup\action.yml, .github\workflows\pr.yml, .github\workflows\release.yml (sin dependabot.yml)`

**Impacto**: Vulnerabilidades en dependencias transitivas quedan sin parchear indefinidamente; estándar mínimo de higiene para un repo público que publica packages consumibles por terceros.

**Recomendación**: Agregar .github/dependabot.yml (ecosistemas npm + github-actions, schedule weekly, groups por familia: angular, storybook, vitest) — Dependabot es nativo y no requiere app externa. Cada PR del bot pasa igual por pr.yml. Alternativa Renovate si se quiere agrupación más fina; decidirlo en el mismo commit.

### tooling-repo-03 — Tarballs publicados sin texto de licencia MIT

- **Archivo**: `packages/components/package.json:34`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Ambos packages publicables declaran "license": "MIT" y "files": ["dist", "README.md"], pero no existe archivo LICENSE dentro de packages/components/ ni packages/tokens/ (verificado con ls). npm solo incluye automáticamente un LICENSE que esté en el directorio del package — el LICENSE del root del monorepo no viaja en el tarball. El release 0.2.0 ya salió así.

**Evidencia**: `"files": [ ⏎     "dist", ⏎     "README.md" ⏎   ],`

**Impacto**: La licencia MIT exige incluir el copyright notice en las copias distribuidas; los packages publicados hoy no cumplen su propia licencia. Gap legal básico de cualquier package profesional.

**Recomendación**: Copiar LICENSE a cada package (o generar la copia en el script de build) y verificar con pnpm pack --dry-run que entra al tarball. Commitear ya; surte efecto en el próximo release autorizado por el PO.

### tooling-repo-04 — Faltan archivos de gobernanza de repo público: SECURITY.md, CODEOWNERS, templates de PR/issues, CODE_OF_CONDUCT

- **Archivo**: `CONTRIBUTING.md:258`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El root contiene CLAUDE.md, CONTRIBUTING.md, LICENSE y README.md (verificado con ls), y .github/ no tiene PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE/, CODEOWNERS ni SECURITY.md. CONTRIBUTING.md § 'Flujo de PR' define una checklist concreta (changeset, link a OpenSpec, lint/format, tests) que hoy nadie ve al abrir un PR porque no hay template que la materialice. SECURITY.md es especialmente relevante: se publican packages a npm y no hay canal declarado para reportar vulnerabilidades.

**Evidencia**: `1. Branch desde `main`: `feat/<descripcion>`o`fix/<descripcion>`.`

**Impacto**: Community health incompleto para un repo público profesional; la checklist de PR de CONTRIBUTING no se operacionaliza y el reporte responsable de vulnerabilidades no tiene canal.

**Recomendación**: Agregar .github/PULL_REQUEST_TEMPLATE.md (checklist derivada de CONTRIBUTING § Flujo de PR), .github/ISSUE_TEMPLATE/ (bug + feature con campos de package/versión), SECURITY.md (reporte privado vía GitHub Security Advisories), CODEOWNERS (\* @roman-martini) y CODE_OF_CONDUCT.md (Contributor Covenant).

### tooling-repo-05 — Strictness de TypeScript incompleta y flags legacy en tsconfig de la lib

- **Archivo**: `packages/components/tsconfig.lib.json:8` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: high
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

tsconfig.lib.json y apps/playground/tsconfig.json activan strict + noImplicitOverride + noPropertyAccessFromIndexSignature + noImplicitReturns + noFallthroughCasesInSwitch y strictTemplates, pero ninguno activa noUncheckedIndexedAccess ni exactOptionalPropertyTypes — los dos flags que más bugs reales atrapan en una librería publicada (accesos indexados a arrays/records de tokens, opcionales de inputs). Además la lib arrastra flags legacy: emitDecoratorMetadata: true (innecesario con Ivy/AOT desde Angular 9; solo infla el output intermedio) y le falta isolatedModules: true, que el playground sí tiene (línea 12 de su tsconfig).

**Evidencia**: `"experimentalDecorators": true, ⏎     "emitDecoratorMetadata": true,`

**Impacto**: Tipos de la API pública menos estrictos de lo que la industria espera de un design system tipado; inconsistencia de config entre lib y app viola la prioridad de mantenibilidad por convención única.

**Recomendación**: Activar noUncheckedIndexedAccess y exactOptionalPropertyTypes en lib y playground, quitar emitDecoratorMetadata y agregar isolatedModules a tsconfig.lib.json; corregir los errores que emerjan. Afecta build de 2 packages + app → flujo OpenSpec (tooling base).

### tooling-repo-06 — Specs y stories nunca se typechequean: no hay script typecheck en el pipeline

- **Archivo**: `packages/components/tsconfig.lib.json:31` · **Producto**: EP-005
- **Severidad**: media · **Tamaño**: M · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

tsconfig.lib.json excluye '**/\*.spec.ts' y '**/\*.stories.ts' del build (correcto para APF), pero ningún paso compensa: vitest vía @analogjs transpila sin typecheck, el root package.json no tiene script typecheck, y pr.yml corre format/lint/build/test sin tsc --noEmit. tsconfig.spec.json existe e incluye los specs pero nada lo ejecuta como verificación de tipos. Los errores de tipos en tests y stories (la documentación viva del DS) solo aparecen si rompen en runtime.

**Evidencia**: `"exclude": ["src/**/*.spec.ts", "src/**/*.stories.ts", "router/src/**/*.spec.ts"]`

**Impacto**: Tests y stories pueden divergir silenciosamente de la API real de los componentes; un rename de input compila y 'pasa' CI con stories rotas en tipos.

**Recomendación**: Agregar script typecheck por package (tsc -p tsconfig.spec.json --noEmit; en components sumar un tsconfig que incluya \*.stories.ts) y 'typecheck': 'pnpm -r typecheck' en el root, cableado como step en pr.yml.

### tooling-repo-07 — docs/reference está en .gitignore pero tiene 9 archivos trackeados: material nuevo se pierde en silencio

- **Archivo**: `.gitignore:78`
- **Severidad**: media · **Tamaño**: S · **Ejecución**: decision-po · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La última línea de .gitignore ('# dev' + 'docs/reference') ignora el directorio, pero git ls-files muestra 9 archivos trackeados ahí (contexto_inicial.md, roadmap-madurez-ds.md, openspec/BACKLOG_HISTORY.md, etc.) — el ignore se agregó después de commitearlos y solo aplica a archivos nuevos (verificado: git check-ignore matchea docs/reference/nuevo.md pero no los trackeados). CLAUDE.md y BACKLOG.md referencian docs/reference/ como fuente viva ('Material de referencia', link a roadmap-madurez-ds.md), y .prettierignore lo trata como material del repo.

**Evidencia**: `# dev ⏎ docs/reference`

**Impacto**: Cualquier documento de referencia nuevo (p. ej. el output de /ds:research-design-system) queda sin versionar sin aviso; estado inconsistente entre .gitignore, .prettierignore y las fuentes de verdad de CLAUDE.md.

**Recomendación**: Decisión del PO: si docs/reference es material del repo (como declara CLAUDE.md), quitar la entrada de .gitignore; si es scratch personal, sacarlo de las fuentes de verdad y des-trackear los 9 archivos. Lo insostenible es el estado mixto actual.

### tooling-repo-08 — packageManager anclado a pnpm 9.0.0: un major desactualizado y sin catalogs

- **Archivo**: `package.json:13`
- **Severidad**: media · **Tamaño**: M · **Ejecución**: openspec-change · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

packageManager: 'pnpm@9.0.0' fija la .0.0 exacta de un major que ya tiene sucesor estable hace más de un año. pnpm 10 trae mejoras de seguridad directamente relevantes para un repo publicador (los lifecycle scripts de dependencias no se ejecutan por defecto — mitiga supply-chain) y catalogs, que eliminarían el drift de rangos Angular ya presente entre workspaces (components declara '@angular/core': '^21' en devDeps, playground '^21.2.0').

**Evidencia**: `"packageManager": "pnpm@9.0.0",`

**Impacto**: Se renuncia a hardening de supply chain y a la herramienta idiomática para versiones únicas por monorepo; el pin en 9.0.0 exacto además congela fixes del propio pnpm 9.x vía corepack.

**Recomendación**: Migrar a pnpm 10 (packageManager, engines, pnpm/action-setup lo infiere solo), mover overrides a pnpm-workspace.yaml, adoptar catalog: para Angular/Storybook/Vitest y declarar onlyBuiltDependencies explícito. Cambio de tooling base → flujo OpenSpec.

### tooling-repo-09 — .prettierignore arrastra exclusiones staled de 'Fase 1': los tokens fuente nunca se formatean

- **Archivo**: `.prettierignore:23`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El bloque final excluye packages/tokens/src/ y packages/tokens/sd.config.mjs con el comentario 'formato se aplica en su fase, no en Fase 1'. El bootstrap terminó hace rato (release 0.2.0, 37 changes archivados, 23 componentes), y la 'fase' nunca llegó: los JSON de tokens (primitives/semantic/component/theme) y el config de Style Dictionary quedan fuera de pnpm format, format:check y del hook pre-commit de forma permanente.

**Evidencia**: `# Packages que se migran/refactorizan en fases posteriores del bootstrap ⏎ # (formato se aplica en su fase, no en Fase 1) ⏎ packages/tokens/src/`

**Impacto**: La fuente de datos central del design system es la única zona del repo sin garantía de formato; deuda de convención que contradice la prioridad 3 (mantenibilidad por estándares).

**Recomendación**: Eliminar las dos entradas, correr pnpm format y commitear el reformateo de packages/tokens en un commit chore aislado.

### tooling-repo-10 — playwright ^1.60.0 en devDependencies del root sin ningún uso

- **Archivo**: `package.json:42`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El root declara playwright ^1.60.0 pero nada lo consume: no hay config de Playwright, ningún script lo invoca, y la única mención en el repo es una idea de Cantera en BACKLOG.md línea 114 ('A11y en CI: @storybook/test-runner + axe-playwright'), que está explícitamente sin disparador.

**Evidencia**: `"playwright": "^1.60.0",`

**Impacto**: Peso de instalación y superficie de supply chain (binarios de browsers) sin beneficio; una dependencia declarada que no se usa confunde sobre qué tooling está realmente activo.

**Recomendación**: Quitarla del root hasta que el item 'A11y en CI' de la Cantera gane disparador; ese change la reintroducirá donde corresponda (probablemente en apps/playground).

### tooling-repo-11 — auto-install-peers=true enmascara peers mal declarados en un monorepo que publica libs con peerDependencies

- **Archivo**: `.npmrc:2`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: medium
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El .npmrc combina auto-install-peers=true con strict-peer-dependencies=true. Para un repo cuyo producto son librerías con peerDependencies (components declara @angular/\*, @lucide/angular y tokens como peers), auto-instalar peers hace que el workspace compile aunque un peer esté mal declarado o falte en las devDependencies del consumidor: el playground funciona localmente mientras un consumidor externo real fallaría. La práctica recomendada para autores de librerías es auto-install-peers=false y dependencias explícitas.

**Evidencia**: `auto-install-peers=true ⏎ strict-peer-dependencies=true`

**Impacto**: El entorno local deja de replicar la experiencia del consumidor de npm — exactamente el escenario que el playground existe para validar.

**Recomendación**: Cambiar a auto-install-peers=false, correr pnpm install y declarar explícitamente cualquier devDependency que emerja como faltante en playground/packages.

### tooling-repo-12 — Script 'version' colisiona con el builtin de pnpm — footgun ya documentado pero no eliminado

- **Archivo**: `package.json:30`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

El root define "version": "changeset version", pero pnpm version es un builtin que pisa al script homónimo — el propio release.yml lo advierte ('OJO: pnpm version es un builtin de pnpm que pisa al script homónimo — invocar changesets directo') y lo esquiva llamando 'pnpm changeset version'. Queda un script inejecutable por su vía natural, cuyo único efecto posible es que alguien corra pnpm version localmente y obtenga el builtin (bump del package.json root) en vez de changesets.

**Evidencia**: `"version": "changeset version",`

**Impacto**: Trampa latente para mantenedores; el workaround vive como comentario en CI en lugar de eliminarse en la fuente.

**Recomendación**: Renombrar a "changeset:version" (y opcionalmente "release" → "changeset:publish" para simetría), actualizando release.yml y CONTRIBUTING.md si citan los nombres.

### tooling-repo-13 — CLAUDE.md documenta 'pnpm -r publish' como comando de publicación, contradiciendo el flujo real y el veto vigente

- **Archivo**: `CLAUDE.md`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

La sección 'Comandos esenciales' termina con '# Publicar (en release)\npnpm -r publish', pero el flujo real (ADR-006, CONTRIBUTING § CI/Release) publica exclusivamente vía release.yml + changeset publish, y además rige el veto del PO de no publicar sin orden explícita. La misma sección arrastra otro residuo: el árbol del repo anota '.changeset/ # Versionado con Changesets (a crear en Fase 1)' cuando .changeset/ existe con 15 changesets acumulados.

**Evidencia**: `# Publicar (en release) ⏎ pnpm -r publish`

**Impacto**: CLAUDE.md es el contrato operativo de los agentes: un comando de publicación manual documentado es exactamente la instrucción equivocada frente al veto y al pipeline automatizado.

**Recomendación**: Reemplazar el bloque de publicación por una nota 'la publicación es exclusiva de release.yml (Changesets); vetada sin orden del PO' y limpiar el comentario 'a crear en Fase 1'.

### tooling-repo-14 — engines.node '>=22.12.0' sin techo permite versiones de Node no soportadas por Angular

- **Archivo**: `package.json:15`
- **Severidad**: baja · **Tamaño**: S · **Ejecución**: commit-directo · **Effort**: low
- **Verificación**: Sin verificación adversarial — revalidar al ejecutar

Con engine-strict=true activo en .npmrc, el rango abierto '>=22.12.0' (repetido en los tres package.json) acepta Node 23 y 25 (releases impares sin LTS, fuera de la matriz de soporte de Angular) y cualquier major futuro. Los packages publicados heredan ese engines en su metadata de npm, prometiendo a consumidores compatibilidad con versiones nunca testeadas. El estándar es un rango cerrado por LTS soportadas.

**Evidencia**: `"node": ">=22.12.0",`

**Impacto**: engine-strict deja de proteger hacia arriba; la metadata publicada afirma soporte que el CI (que corre solo el Node de .nvmrc) no verifica.

**Recomendación**: Cambiar a '^22.12.0 || ^24.0.0' (alineado a la matriz de Node de Angular 21) en root y ambos packages publicables.
