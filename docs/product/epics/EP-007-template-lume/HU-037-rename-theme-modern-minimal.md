---
epica: EP-007
actor: Dev consumidor
estado: Refinada (2026-07-26)
decisiones: [D-020, D-014, D-010]
adrs: [ADR-003, ADR-015]
---

# HU-037 — Rename del theme brand-a a modern-minimal (Dev consumidor)

**COMO** dev consumidor que importa un theme de `@romanmartinidev/tokens` para dar identidad visual a mi app
**QUIERO** que el theme se llame `modern-minimal` en vez de `brand-a`, sin que se me rompa la app que ya lo importa
**PARA** entender qué lenguaje visual estoy aplicando con solo leer el import, en vez de descifrar una etiqueta opaca.

## Decisiones de refinamiento

1. **Alcance del rename: nombre, no valores** — el rename cambia el nombre público del theme (archivo fuente, entry point, selector CSS). Los valores de los tokens en [`packages/tokens/src/theme/brand-a.json`](../../../../packages/tokens/src/theme/brand-a.json) —hoy la escala `green`— **no se tocan** en esta HU. Acercar la paleta a la referencia visual, si corresponde, es trabajo posterior alimentado por HU-038 (PO, 2026-07-26).

2. **El alias cubre entry point y selector** — [D-020](../../decisiones.md) dice "manteniendo `brand-a` como alias deprecado". Un consumidor del `0.2.0` depende de **dos** cosas: el import `@romanmartinidev/tokens/themes/brand-a` y el atributo HTML `data-brand="a"`. Deprecar solo una lo rompe igual, así que el alias cubre las dos: el entry point viejo sigue existiendo y el selector viejo sigue activando el theme (derivado de D-020, sin decisión nueva).

3. **Sin fecha de remoción del alias** — el alias queda deprecado pero vigente por tiempo indefinido. Cuándo se elimina es decisión del PO en el marco de la política de versionado pre-1.0, y necesita su propia D-XXX. Esta HU no la fija (PO, 2026-07-26).

4. **`brand-b` fuera de alcance** — [D-020](../../decisiones.md) nombra solo `brand-a`. `brand-b` conserva su nombre aunque quede con nomenclatura inconsistente; resolverlo es pregunta abierta 3 de la épica (PO, 2026-07-26).

## Estado actual verificado en el repo (2026-07-26)

| Artefacto                                                                                                  | Hoy                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/tokens/src/theme/brand-a.json`](../../../../packages/tokens/src/theme/brand-a.json)             | Fuente del theme: overrides de tokens `semantic.color` sobre la escala `green`                                                                           |
| [`packages/tokens/sd.config.mjs`](../../../../packages/tokens/sd.config.mjs)                               | Array `themes` (líneas 48–52): `{ name: 'brand-a', source: ['src/theme/brand-a.json'], selector: '[data-brand="a"]' }` → emite `dist/themes/brand-a.css` |
| [`packages/tokens/package.json`](../../../../packages/tokens/package.json)                                 | `exports["./themes/brand-a"]: "./dist/themes/brand-a.css"` (junto a `./themes/dark` y `./themes/brand-b`); `sideEffects` incluye `./dist/themes/*.css`   |
| [`packages/tokens/README.md`](../../../../packages/tokens/README.md)                                       | Documenta el import (línea 45), el uso de `data-brand="a"` (líneas 49–54) y la tabla de entry points (línea 73)                                          |
| [`openspec/specs/design-tokens-package/spec.md`](../../../../openspec/specs/design-tokens-package/spec.md) | Nombra `brand-a` como ejemplo de theme (línea 87) y el selector `[data-brand="a"]` en los scenarios de cascada (líneas 121, 131–133)                     |
| npm                                                                                                        | `@romanmartinidev/tokens@0.2.0` publicado con el entry point `./themes/brand-a` ([D-010](../../decisiones.md))                                           |

## Criterios de aceptación

- [ ] **CA-037.1 (nombre nuevo)** — Dado un consumidor que importa `@romanmartinidev/tokens/themes/modern-minimal` y marca su HTML con `data-brand="modern-minimal"`, cuando renderiza un elemento que usa `--ds-semantic-color-bg-primary`, entonces recibe el valor del theme (la escala `green` actual) y no el del `:root` base.

- [ ] **CA-037.2 (alias viejo sigue funcionando)** — Dado un consumidor del `0.2.0` que importa `@romanmartinidev/tokens/themes/brand-a` y usa `data-brand="a"`, cuando actualiza a la versión con el rename sin tocar su código, entonces la app compila y los tokens semánticos resuelven exactamente a los mismos valores que antes del rename.

- [ ] **CA-037.3 (paridad alias ↔ nombre nuevo)** — Dado el build de tokens, cuando se comparan los CSS del nombre nuevo y del alias, entonces ambos declaran el mismo conjunto de custom properties con los mismos valores, y la única diferencia es el selector (`[data-brand="modern-minimal"]` vs. `[data-brand="a"]`).

- [ ] **CA-037.4 (deprecación visible)** — Dado un consumidor que sigue usando el nombre viejo, cuando lee el CSS del alias, el README del package o el CHANGELOG generado por el changeset de esta HU, entonces encuentra en los tres una marca explícita de que `brand-a` está deprecado y de que el reemplazo es `modern-minimal`.

- [ ] **CA-037.5 (caso de error: alias eliminado por accidente)** — Dado el suite de tests de `packages/tokens`, cuando alguien elimina el entry point `./themes/brand-a` de `package.json` o su selector del build, entonces el test falla con un mensaje que identifica el alias faltante; el build no puede publicarse en verde sin el alias.

- [ ] **CA-037.6 (caso de error: nombre inexistente)** — Dado un consumidor que importa `@romanmartinidev/tokens/themes/brand-c` (o cualquier nombre no exportado), cuando compila su app, entonces falla en tiempo de build por entry point inexistente y no en silencio en runtime.

## Dependencias

- Ninguna HU bloqueante. Es independiente del research (HU-038) y del prototipo (HU-040).
- La versión con el rename se publica en npm cuando el PO lo autorice: el **veto de publicación vigente desde 2026-07-19** ([D-014](../../decisiones.md)) sigue en pie. El changeset se acumula como el resto.
- Lockstep de versionado entre packages ([ADR-015](../../../architecture/adr/ADR-015-versionado-lockstep.md)): el changeset de tokens arrastra a components.

## Fuera de alcance

- **Cambiar los valores del theme** para acercarlo a la referencia visual: ver decisión de refinamiento 1.
- **Renombrar `brand-b`**: ver decisión de refinamiento 4.
- **Eliminar el alias `brand-a`**: ver decisión de refinamiento 3. Candidato a HU futura con su propia D-XXX.
- **Cambiar el mecanismo de theming** (cascada por selector de atributo, [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md)): solo cambian nombres y se agrega un selector alias.
- **Renombrar el atributo `data-brand`** a algo más descriptivo: sería un breaking mayor, no está en [D-020](../../decisiones.md).
- **Publicar a npm**: la publicación es de [EP-003](../EP-003-consumo-distribucion/EP-003-consumo-distribucion.md) y depende del PO.

## Notas

- El cambio toca la **superficie pública publicada** del package. Aunque el alias evita el breaking, el changeset debe describirlo con claridad: un consumidor que lea solo el CHANGELOG tiene que entender qué cambió y qué debe hacer.
- La spec [`openspec/specs/design-tokens-package/spec.md`](../../../../openspec/specs/design-tokens-package/spec.md) menciona `brand-a` en su texto y en scenarios de cascada; el change que implemente esta HU debe incluir el delta de spec correspondiente, no solo el código.
- CA-037.3 y CA-037.5 son buenos candidatos a test automatizado en el suite de `packages/tokens` (vitest ya está configurado en el package): sin ellos, la paridad del alias depende de que alguien la revise a mano.
- El riesgo real no es el rename sino el **olvido de un lugar**: la referencia a `brand-a` aparece en el JSON fuente, `sd.config.mjs`, `package.json`, el README del package y la spec. Un grep del término antes de cerrar el change evita dejar documentación desincronizada.
