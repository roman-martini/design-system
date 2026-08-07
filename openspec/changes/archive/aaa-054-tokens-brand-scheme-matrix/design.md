# Diseño — aaa-054

## Los tonos de los overlays

Regla: cada overlay replica la **relación tonal** que `dark.json` fija para el default (blue): texto/ícono/focus suben a `400`, links a `400`/`300`, el primary queda en tono medio con hover que **aclara**, subtle baja a `900`. La marca aporta el hue; el scheme, la lightness — misma separación que usan los sistemas multi-marca.

| Token                  | dark default | brand-a light | **brand-a-dark** | brand-b light  | **brand-b-dark** |
| ---------------------- | ------------ | ------------- | ---------------- | -------------- | ---------------- |
| `bg.primary`           | blue.500     | green.700     | green.600        | purple.600     | purple.500       |
| `bg.primary-hover`     | blue.400     | green.800     | green.500        | purple.700     | purple.400       |
| `bg.primary-active`    | blue.300     | green.900     | green.400        | purple.800     | purple.300       |
| `bg.primary-subtle`    | blue.900     | green.50      | green.900        | purple.50      | purple.900       |
| `text.link` / `-hover` | blue.400/300 | green.700/800 | green.400/300    | purple.700/800 | purple.400/300   |
| `icon.primary`         | blue.400     | green.600     | green.400        | purple.600     | purple.400       |
| `focus-ring`           | blue.400     | green.600     | green.500        | purple.500     | purple.400       |

`border.primary` no entra: la marca lo fija en su `500`, tono medio válido en ambos schemes (igual que dark default). Los valores finales los valida el gate combinado, no el ojo — si un tono no llega al umbral, se ajusta dentro de la misma escala.

## `loadScopes` compone, no adivina

Los scopes combinados se construyen en `scripts/contrast.mjs` con la misma semántica que el browser: `dark+brand-a` = base ∪ dark ∪ brand-a ∪ brand-a-dark, en ese orden. La detección es por convención de nombres (`brand-<x>` + opcional `brand-<x>-dark`), sin lista hardcodeada: una marca nueva entra al gate sola. Los overlays **no** se evalúan como scope suelto (base ∪ overlay no existe en ningún browser real); solo componen.

## Por qué overlays declarativos y no derivación

La alternativa profesional de largo plazo (marca = paleta fuente, scheme deriva tonos — Material) reordena el modelo completo y es one-way door: merece ADR propio cuando haya marcas reales. Los overlays declarativos son el mismo mecanismo que ya gobierna `dark.json` — cero conceptos nuevos, gate más fuerte hoy.

## Orden

Tokens → build → gate (pares × scopes combinados en verde) → playground → gate visual del PO.
