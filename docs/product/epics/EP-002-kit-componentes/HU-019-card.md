---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-07-22, aaa-032 components-add-card archivado — primera entrega de la tanda 3; 10 tests, /ng:review 0 altas/medias y 7 bajas corregidas, verificación visual del PO en playground OK)
decisiones: [D-002, D-007, D-014, D-015]
adrs: [ADR-004, ADR-007]
---

# HU-019 — Card contenedor (dev consumidor)

**COMO** dev que arma vistas (forms, settings, perfiles, pricing)
**QUIERO** un `ds-card` contenedor consistente con sub-partes opcionales
**PARA** agrupar contenido con borde, radius, sombra y padding tokenizados sin recrear el patrón en cada pantalla.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) — **las 5 capturas** usan la card como contenedor (subscription, settings, auth, cookie consent, team). Es el componente foundational de la tanda: los demás se muestran dentro.

## Decisiones de refinamiento (PO, 2026-07-22)

1. **Sub-partes híbridas** — `ds-card` + sub-partes usables como **elemento o atributo** (`ds-card-title` / `<h2 dsCardTitle>`), patrón Angular Material. Por qué: estructura descubrible con spacing garantizado, y el consumidor conserva la semántica real de heading en el árbol de accesibilidad. Todas las sub-partes (header/title/description/content/footer) son opcionales.
2. **Variantes de elevación** — input `variant`: `outline` (default, borde + sombra sutil — reproduce la referencia) | `elevated` (sombra mayor) | `flat` (sin sombra). El PO optó por variantes frente a la apariencia única recomendada; trade-off asumido: superficie de API mayor sin caso en la referencia para `elevated`/`flat`, a cambio de cubrir dashboards y superficies anidadas sin change futuro.
3. **Padding configurable** — input `padding`: `comfortable` (default) | `compact`, ambos por tokens. Mismo trade-off asumido que la decisión 2 (la referencia usa un solo padding); habilita listas y vistas densas.

## Criterios de aceptación

<!-- Binarios: sí/no sin interpretación. Al implementar se vuelven scenarios del spec
     component-card (nuevo, ADR-018) — delta del change components-add-card. -->

- [x] **CA-019.1 (contenedor con variantes)** — Dado `<ds-card>` (standalone, OnPush) con `variant` `outline | elevated | flat` (default `outline`), entonces borde, radius, sombra y fondo salen de tokens `component.card.*`; el default reproduce la apariencia de la referencia (borde + sombra sutil).
- [x] **CA-019.2 (sub-partes híbridas)** — Dadas las sub-partes `ds-card-header`, `ds-card-content`, `ds-card-footer` (elemento) y `dsCardTitle`/`dsCardDescription` (elemento o atributo), entonces cada una aplica sus estilos tokenizados, todas son opcionales y el spacing entre partes sale de tokens.
- [x] **CA-019.3 (padding configurable)** — Dado `padding` `comfortable` (default) | `compact`, entonces ambos valores salen de tokens `component.card.*` y afectan de forma consistente a las sub-partes.
- [x] **CA-019.4 (semántica preservada)** — Dado `<h2 dsCardTitle>`, entonces el árbol de accesibilidad conserva el heading nivel 2; la card no impone `role` ni roba semántica al contenido.
- [x] **CA-019.5 (tokens sin pares nuevos)** — Dado el CSS del componente, entonces todo valor sale de `var(--ds-*)` (`component.card.*` + semantic existentes), sin hardcodes; las superficies usan `bg`/`border` existentes → sin pares de contraste nuevos.
- [x] **CA-019.6 (export público)** — Dado `public-api.ts`, entonces exporta `DsCard`, las sub-partes y los types `DsCardVariant`/`DsCardPadding`.
- [x] **CA-019.7 (showcase)** — Dado el playground (EP-006), entonces la página de `DsCard` reproduce al menos una vista de la referencia (ej. Cookie Settings), y muestra las 3 variantes y ambos paddings.

## Dependencias

- Ninguna (foundational). **Primera entrega de la tanda 3.**

## Fuera de alcance

- Card interactiva/clickable completa (hover/focus de card como link) — composición del consumidor por ahora.
- El patrón "radio-card" (Starter/Pro de la referencia) — composición de Card + Radio, no un componente.
- Slots dedicados de media/imagen.

## Notas

- Change OpenSpec: `components-add-card` — introduce el spec `component-card` (componente nuevo, ADR-018).
- Naming (ADR-007): `DsCard`, `DsCardHeader`, `DsCardContent`, `DsCardFooter`, `DsCardTitle`, `DsCardDescription`; carpeta única `card/` (ADR-010).
- Tokens nuevos `component.card.*` (padding ×2, radius, gap, sombras por variante, tipografía de title/description) referenciando semantic — changeset **minor** de components + tokens (lockstep ADR-015).
