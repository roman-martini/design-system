---
estado: Nuevo
fecha-ingreso: 2026-08-08
---

# Estrategia de componentes: PrimeNG vs kit propio

## Requerimiento

Decidir la dirección estratégica del sistema para los **proyectos frontend reales del PO** — en particular un eventual SaaS propio, de un solo producto, vendido por suscripción y mantenido a largo plazo. La pregunta: ¿conviene deprecar el mantenimiento de `@romanmartinidev/components` y adoptar PrimeNG, seguir haciendo crecer el kit propio a demanda, o una vía intermedia? El actor es el **PO como negocio**: cada hora invertida en mantener componentes es una hora que no va al producto que genera ingresos.

## Preguntas

- [ ] ¿Se valida técnicamente que un preset de PrimeNG (`definePreset`) puede consumir `@romanmartinidev/tokens` y cubrir la identidad visual completa? (spike propuesto abajo — es la pregunta que desbloquea todo lo demás)
- [ ] ¿Qué significa exactamente "congelar" `packages/components`: superficie fija + compilar con cada Angular major, o archivado activo? ¿Cuál es el criterio de salida?
- [ ] ¿La decisión final amerita ADR? (Es one-way door a nivel de dirección del repo: cambia el propósito de la capa de componentes.)
- [ ] ¿Qué pasa con el pipeline de producto actual (EP-002, HUs de componentes pendientes, BACKLOG) si el kit entra en modo pasivo?

## Exploración

Análisis realizado en sesión con Claude (2026-08-08), contra los tres criterios de recomendación del repo (escala, práctica profesional, adaptabilidad).

### Contexto dimensionado

El kit actual tiene ~22 componentes con tests (945+), stories, auditoría axe y gobernanza de specs — no es un experimento: es un design system real. Pero los componentes que un SaaS necesita son justamente los **caros** que faltan: DataTable con sort/filter/virtual scroll, DatePicker, autocomplete, tree, upload. Estimación: ~1 año de trabajo en solitario haciéndolos bien.

### Opciones evaluadas

**A — Migrar a PrimeNG y deprecar el kit.**
Pros: ~90 componentes incluyendo los caros; mantenimiento tercerizado (PrimeTek absorbe los 2 majors de Angular por año); la IA conoce la API de PrimeNG por training data (el argumento "mi lib le sirve más a la IA" juega en realidad a favor de PrimeNG); theming moderno vía design tokens (`definePreset`) compatible con la filosofía del repo.
Contras: el argumento "mi lib es más liviana" es real pero modesto (PrimeNG es tree-shakeable con standalone components — no se paga lo que no se usa); dependencia del roadmap/bugs de PrimeTek; se pierde el control fino de HTML/a11y; estética "PrimeNG" reconocible sin theming serio.

**B — Kit propio como única base, creciendo a demanda.**
Pros: control total, peso mínimo, a11y de primera clase, activo de carrera.
Contras (problema de escala): Material/Carbon/Polaris los mantienen equipos de 10-30 personas; un solo dev contra 2 majors de Angular por año más los componentes complejos pendientes no escala — es aritmética de horas, no opinión. El kit pasa de medio a fin. Solo se justificaría si el diseño **es** el producto (tipo Linear/Superhuman); para un SaaS B2B típico nadie paga suscripción por un select custom.

**C — Híbrido: tokens propios + PrimeNG themeado + wrappers (recomendada).**

1. **`@romanmartinidev/tokens` sigue vivo y manda**: es el activo más valioso y más barato de mantener; identidad visual del producto inyectada en PrimeNG vía preset. Sobrevive a cualquier lib de componentes (incluso no-Angular) — es el seguro de adaptabilidad.
2. **PrimeNG como motor de componentes, nunca "desnudo"**: patrón wrapper/facade — la app consume `<app-date-picker>`, `<app-table>`, etc., que por dentro usan PrimeNG. Los wrappers fijan defaults del producto en un solo lugar y son el seguro anti lock-in: si PrimeNG toma una dirección que no sirve, se migran los wrappers, no 400 pantallas.
3. **`packages/components` congelado**: no se borra (portfolio, evidencia de seniority), no se expande. Piezas simples donde ya es excelente (button, badge, card) pueden usarse dentro del mismo patrón wrapper si aportan más control que el equivalente PrimeNG.
4. **Dos kits completos en paralelo: no** — doble mantenimiento sin beneficio para ninguno.

Es el patrón estándar de la industria para equipos sin headcount dedicado de design system: capa de tokens propia sobre una lib de componentes mantenida por terceros. Construir los ~90 componentes es lo que hacen Google/IBM/Shopify porque pueden pagarlo.

**Costo explícito de la recomendación**: armar el preset mapeando los tokens es trabajo real (orden de días, no horas), y ~2 años de trabajo en componentes pasan a ser activo de aprendizaje/portfolio más que de producción. Ese costo ya está hundido; la decisión de hoy solo dirige el esfuerzo futuro.

### Primer paso propuesto

Spike en el playground: preset de PrimeNG consumiendo `@romanmartinidev/tokens` + 2-3 wrappers de ejemplo (botón, input, tabla), para validar que el theming llega a donde se necesita **antes** de la decisión formal.
