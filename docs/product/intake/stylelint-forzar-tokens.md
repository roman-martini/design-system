---
estado: Nuevo
fecha-ingreso: 2026-07-26
---

# Stylelint para forzar el uso de tokens

## Requerimiento

Que un valor hardcodeado en el CSS de un componente (un color literal, un `px` suelto) **falle el lint** en vez de depender de que alguien lo note en review. El actor es el **mantenedor**: hoy la disciplina de tokenizar es manual y ya se filtró al menos un hardcode real (`white` en el checkmark de Checkbox y el dot de Radio, detectado en la auditoría a11y del 2026-07-11).

## Preguntas

- [ ] ¿Se solapa con [HU-032](../epics/EP-005-calidad-profesional/HU-032-audit-tokens-skill.md) (`/ds:audit-tokens`), que también detecta hardcodes? La diferencia real: la skill audita cuando se la invoca, stylelint bloquea en el commit. Vale decidir si son complementarios o si uno vuelve al otro innecesario **antes** de construir los dos.
- [ ] ¿Qué se permite hardcodear legítimamente? Siempre hay excepciones (`0`, `100%`, `transparent`, valores de reset); sin esa lista el gate genera ruido y termina desactivado.
- [ ] ¿Corre sobre `packages/components` solamente, o también sobre el playground?

## Exploración

Migrado desde la Cantera del BACKLOG el 2026-07-26 ([D-019](../decisiones.md)), donde figuraba como complemento de `/ds:audit-tokens`. Conviene refinarlo **después** de que HU-032 esté hecha: recién ahí se sabe cuánto queda sin cubrir.
