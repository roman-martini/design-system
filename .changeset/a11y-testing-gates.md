---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

Gates de accesibilidad y fidelidad de la suite (fase 1 de HU-028, Parte F2 de la review integral). No cambia la API ni el aspecto de ningún componente: es infraestructura de verificación que corre en cada PR.

- **axe sobre el DOM de todo el kit**: un helper único (`expectNoAxeViolations`) corre `axe-core` sobre el render por defecto de cada componente público y falla ante cualquier violación WCAG A/AA. Da enforcement a D-007, que hasta ahora dependía de auditorías manuales. El kit entró limpio: 26 de 27 casos medidos sin violaciones.
- **El gate distingue "no hay violaciones" de "no se pudo evaluar"**: con un `<dialog open>` en el árbol, axe deja de detectar violaciones reales en jsdom. Contar la ausencia de violaciones como éxito habría dado verde falso sobre el modal, así que el helper exige además que el motor haya evaluado algo. Lo no auditable en jsdom queda declarado con su motivo y asignado a la fase 2.
- **La suite corre en zoneless**, igual que la app y que los consumidores del kit: testear bajo otro modelo de change detection escondía los defectos propios de zoneless. Los 316 tests existentes pasaron sin modificarse.
- **Scenarios de spec que no tenían test**: `size` y tokens de `DsSelect`, tokens de tamaño, backdrop y transiciones de `DsModal`, y los estilos del estado `loading` de `DsButton` (CA-017.7). El helper de lectura de CSS fuente, duplicado en 13 specs, pasa a tener una sola implementación que **falla si el archivo no aparece** en vez de devolver vacío — antes, un path equivocado dejaba pasar sus aserciones en verde.
