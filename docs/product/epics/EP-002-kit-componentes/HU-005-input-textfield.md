# HU-005 — Input/TextField para formularios reales (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que arma formularios con el DS
**QUIERO** un `ds-input` de texto accesible integrado a Angular Forms
**PARA** cubrir la entrada de datos básica — junto con Select (HU-003), el mínimo de cualquier formulario real.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir: CVA (Reactive Forms + `[(ngModel)]`), label/hint/mensaje de error asociados programáticamente (`aria-describedby`), tipos de texto (`text`, `email`, `password`, `number`…), estados (focus, invalid, disabled accesible ADR-011), sizes por tokens, prefijo/sufijo (icono o texto) según convención ADR-012.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Textarea, máscaras de entrada y autocomplete/typeahead: HUs posteriores si aparece caso real (D-005).
- Validadores propios: la validación es de Angular Forms; el componente solo la refleja visual y semánticamente.

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-input`).
