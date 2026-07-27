---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-022, D-002, D-017]
adrs: [ADR-006]
---

# HU-031 — Storybook publicado y regresión visual (mantenedor)

**COMO** mantenedor de un design system con `0.2.0` ya publicado en npm
**QUIERO** que el Storybook del kit se publique en una URL viva y actualizada
**PARA** que la documentación navegable —la interfaz pública de todo DS— deje de exigir clonar el monorepo, y para tener una referencia visual estable donde ejercer el gate visual del PO.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **GitHub Pages ahora; Chromatic y regresión visual, aparte** — [D-021](../../decisiones.md) aprueba **solo la publicación en GitHub Pages** en esta entrega: costo casi nulo, sin servicio externo ni cuenta nueva, y el target `build-storybook` ya existe y hoy nadie lo consume. **Chromatic y los snapshots visuales automáticos quedan explícitamente diferidos** y se evalúan como decisión separada; no forman parte del alcance ni condicionan el cierre de esta HU.
2. **La URL publicada sirve al gate visual de [D-022](../../decisiones.md)** — ningún change de componente se archiva sin revisión visual del PO; tener el Storybook desplegado le da un lugar estable donde mirar, en lugar de depender de un entorno local levantado a mano. Es un beneficio de la publicación, no un requisito adicional de esta HU.
3. **El título de la HU nombra el problema completo a propósito** — "publicado y regresión visual" es el par que el hallazgo identifica; se entrega la mitad aprobada y se deja registrada la otra en Fuera de alcance, para que la evaluación pendiente no se pierda.

## Criterios de aceptación

- [ ] **CA-031.1 (Storybook publicado)** — Dado el `main` del repo, cuando termina el workflow de publicación, entonces el `storybook-static` construido queda servido en una URL pública de GitHub Pages, navegable sin clonar el repositorio.
- [ ] **CA-031.2 (contenido completo)** — Dado el Storybook publicado, cuando se navega, entonces lista todos los componentes del kit con sus stories, controles y documentación, equivalentes a lo que se ve corriendo Storybook localmente.
- [ ] **CA-031.3 (actualización automática)** — Dado un merge a `main` que cambia componentes, stories o tokens, cuando se completa el pipeline, entonces la URL publicada refleja ese cambio sin intervención manual.
- [ ] **CA-031.4 (build roto no publica)** — Dado un `build-storybook` que falla, cuando corre el workflow, entonces el job **termina en error** y la versión previamente publicada **queda intacta**: nunca se sirve un Storybook parcial o corrupto.
- [ ] **CA-031.5 (permisos mínimos)** — Dado el workflow de publicación, cuando se inspecciona, entonces usa el mecanismo oficial de Pages con los permisos acotados a lo necesario para desplegar, sin credenciales de larga vida ni secretos nuevos.
- [ ] **CA-031.6 (URL descubrible)** — Dado el `README.md` del repo, cuando alguien busca la documentación del kit, entonces encuentra el enlace a la URL publicada; el mismo enlace queda registrado en la documentación de contribución como referencia del gate visual de D-022.
- [ ] **CA-031.7 (regresión visual fuera de esta entrega)** — Dado el alcance aprobado, cuando se cierra la HU, entonces **no** se incorporó Chromatic, Percy ni snapshots visuales automáticos, y la evaluación de regresión visual queda registrada como decisión pendiente separada.

## Dependencias

- Requiere Pages habilitado en el repositorio (configuración del PO en GitHub, fuera del código).
- Se apoya en el target `build-storybook` existente del playground; si el smoke de `build-storybook` en CI se incorpora con los otros gates (Parte F del plan), conviene reutilizar el mismo build.

## Fuera de alcance

- **Chromatic** y cualquier servicio externo de hosting o revisión visual — diferido por D-021, se evalúa por separado.
- **Regresión visual automatizada** (snapshots, Percy, Loki, `test-runner` con comparación de imágenes) — mismo diferimiento; candidato claro a futuro, con su propia HU cuando el PO lo apruebe.
- Preview por PR (una URL efímera por rama): esta entrega publica `main`. Candidato a futuro si el gate visual lo pide.
- Dominio propio, versionado de la documentación por release y páginas de foundations/tokens generadas desde Style Dictionary — trabajo separado dentro de la misma parte del plan.
- Interaction tests (play functions) sobre las stories.

## Notas

- Hallazgos que la originan: `ci-cd-09` ([ADR-006](../../../architecture/adr/ADR-006-estrategia-ci-cd.md) difirió el deploy de Storybook como follow-up `playground-storybook-deploy` y nunca se activó; con `0.2.0` en npm, un consumidor externo no tiene forma de ver componentes ni ejemplos) y `playground-08` (ningún workflow publica `storybook-static` ni corre regresión visual; el QA visual es 100% manual y local) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **Parte L** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md), como change OpenSpec.
- Esta HU **no deroga** el diferimiento de ADR-006: lo cierra parcialmente. Si al implementar aparece una decisión de infraestructura de largo plazo (dominio, versionado de docs), se registra en un ADR nuevo que referencie a ADR-006.
