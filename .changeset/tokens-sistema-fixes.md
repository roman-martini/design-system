---
'@romanmartinidev/tokens': minor
---

Fixes de consistencia de los tokens de sistema (aaa-052, Parte H). Tres cambios **visibles**:

- **El anillo de foco sigue a la marca activa**: `semantic.shadow.focus` ahora compone su color desde `semantic.color.focus-ring`, así que con `data-brand="a"` el foco es verde (`green.600`) y con `data-brand="b"` violeta (`purple.500`) — antes quedaba azul fijo en cualquier marca. En default y dark no cambia (los valores declarados se realinearon al render real). El gate de contraste cubre el par focus-ring/superficie en los 4 scopes, que era el agujero por el que este bug sobrevivió.
- **Elevación visible en dark** (D-025): el theme dark overridea `semantic.shadow.card/card-hover/dropdown/modal/toast` con mayor opacidad (0.1 → 0.4) y la misma geometría. Antes heredaba sombras casi invisibles sobre fondo oscuro.
- **Overlays 50 ms más rápidos**: `overlay-enter` pasa de 250 ms a 200 ms y `overlay-exit` de 150 ms a 100 ms, al alinearse a la escala primitiva de duraciones (los valores viejos no existían como primitivas). Se mantiene enter ≥ exit.

Sin cambio visual: los 6 presets `semantic.motion.transition.*` se declaran por composición de primitivas en vez de literales; nuevo token `semantic.color.bg.inverse` (el tooltip lo consume junto a `text.inverse` en vez de cruzar roles); la tipografía de tooltip/input referencia sus roles semantic, con las 28 referencias legadas component→`font.*` congeladas por trinquete en el test de jerarquía; el build se separa en `sd.config.mjs` (definición importable) + `build.mjs` (ejecución) sin cambio de output.
