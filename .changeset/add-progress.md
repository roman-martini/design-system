---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsProgress` (HU-016, última pieza de la tanda 2 D-011 — la completa): barra de progreso accesible — determinada (`value`/`max` con `role="progressbar"` + `aria-valuenow/min/max`, clamp y fill proporcional con transición tokenizada) e indeterminada (`value` null, animación continua reemplazada por pulso de opacidad bajo `prefers-reduced-motion`, patrón del spinner), `showValue` opt-in, sizes sm/md/lg, tonos primary/success/danger y label accesible con opt-out. Guía de uso spinner vs progress documentada en el showcase.

Tokens: `component.progress.*` nuevos (track, fill×3, sizes, value-text, motion); los fills referencian la familia `text.*` semántica — pares fill/track verificados 3:1 (WCAG 1.4.11, UI no-texto) en los 4 scopes, primer uso del nivel `ui` del gate.
