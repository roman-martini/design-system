---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-002, D-007, D-017]
---

# HU-029 — angular-eslint con reglas de template y accesibilidad (mantenedor)

**COMO** mantenedor de una librería de componentes Angular publicada
**QUIERO** que el lint entienda templates de Angular y aplique sus reglas de accesibilidad
**PARA** que los errores de template y las violaciones a11y se detecten en cada commit, y no por auditoría manual sobre un kit que ya tiene 23 componentes.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **Se adopta el preset completo, no un subconjunto mínimo** — se incorporan las capas de reglas recomendadas de Angular para TypeScript, para templates y de **accesibilidad de templates**, con procesamiento de templates inline. Elegir el conjunto robusto y no el barato es [D-017](../../decisiones.md); el lint a11y de templates es enforcement de [D-007](../../decisiones.md).
2. **La corrección de hallazgos es parte de la HU** — activar las reglas sin arreglar lo que emerja en los 23 componentes dejaría el gate encendido y rojo, o peor, con excepciones silenciosas. La HU no está Hecha hasta que el lint pase limpio.
3. **Cero supresiones sin justificación** — cada `eslint-disable` que sobreviva al change lleva comentario con motivo. Una regla que se decide no aplicar se desactiva en la configuración, a la vista, y no caso por caso.
4. **Es cambio de tooling base → flujo OpenSpec**, y por su tamaño se ejecuta como change propio dentro del bloque estratégico pre-1.0.

## Criterios de aceptación

- [ ] **CA-029.1 (configuración de TypeScript)** — Dado `eslint.config.js`, cuando se inspecciona, entonces compone las reglas recomendadas de angular-eslint para archivos TypeScript, además de las capas de JS/TS y Prettier ya presentes.
- [ ] **CA-029.2 (templates linteados)** — Dado un archivo de template HTML del repo, cuando corre `pnpm lint`, entonces se analiza con las reglas de template de Angular; los templates **inline** de los componentes también se procesan.
- [ ] **CA-029.3 (reglas de accesibilidad activas)** — Dado el bloque de reglas de templates, cuando se inspecciona la configuración, entonces incluye la capa de accesibilidad de angular-eslint; si alguna de sus reglas se desactiva, la configuración lleva el motivo escrito.
- [ ] **CA-029.4 (violación falla el lint)** — Dado un template al que se le introduce una violación de a11y cubierta por las reglas (por ejemplo un elemento interactivo sin texto accesible), cuando corre `pnpm lint`, entonces el comando **termina en error**; el step de lint de CI bloquea el PR.
- [ ] **CA-029.5 (kit limpio)** — Dados los 23 componentes existentes, cuando corre el lint con la configuración nueva, entonces no hay errores; los hallazgos detectados al activar las reglas quedan corregidos en el change y las supresiones remanentes están justificadas por escrito.
- [ ] **CA-029.6 (pre-commit alcanza a los templates)** — Dado un commit que modifica un archivo HTML, cuando corre el hook de pre-commit, entonces el archivo pasa por ESLint igual que los `.ts`; hoy queda afuera de lint-staged.
- [ ] **CA-029.7 (sin regresión funcional)** — Dado el kit tras aplicar las correcciones, cuando corren build y suite de tests, entonces todo pasa y ningún componente cambia su API pública; si una corrección obliga a tocar la API, se levanta como decisión antes de aplicarla.

## Dependencias

- Ninguna sobre otras HUs. Toca `eslint.config.js`, las devDependencies del root, la configuración de lint-staged y los templates de los componentes.
- Se beneficia de que [HU-026](HU-026-coverage-typecheck-ci.md) esté hecha: con typecheck y coverage ya cableados, las correcciones de templates tienen red de seguridad.

## Fuera de alcance

- Reglas de estilo/formato que colisionen con Prettier: el formateo sigue siendo responsabilidad de Prettier.
- Endurecer la configuración de TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, quitar `emitDecoratorMetadata`) — hallazgo aparte, change aparte, dentro del mismo bloque estratégico.
- Reglas de a11y sobre el DOM renderizado: eso lo cubre [HU-028](HU-028-a11y-automatizada-axe.md) con axe. El lint ve el template estático; axe ve el resultado.
- Renombrar selectores o reorganizar componentes a raíz de reglas de naming, si el preset lo sugiere: se releva y se decide en el change antes de aplicar.

## Notas

- Hallazgo que la origina: `tooling-repo-01` (ESLint sin angular-eslint: templates y reglas a11y de Angular sin lint; severidad alta, confirmado en sesión — `eslint.config.js` solo compone JS + tseslint + Prettier, y no hay ninguna referencia a angular-eslint en el repo) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **Parte N** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md) — bloque estratégico pre-1.0, con un change propio y sesión dedicada (no se mezcla con los otros ítems de la parte).
- El volumen de hallazgos al activar las reglas es desconocido hasta correrlas: el change debe medirlo primero y, si resulta grande, encauzar la corrección en tareas separadas dentro del mismo change antes de encender el gate en CI.
