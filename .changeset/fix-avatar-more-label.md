---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': patch
---

**El texto del overflow de `DsAvatarGroup` se puede traducir** (sexto change de la Parte G de la review integral).

El nombre accesible del "+N" estaba fijo en español (`y 3 más`) sin ningún input para cambiarlo: era **el único texto del kit anunciado por tecnología asistiva que un consumidor no podía traducir**. El resto ya eran overridables — `closeLabel` del modal, `dismissLabel` del toast, `label` del spinner y los seis labels de `DsPagination`.

Ahora hay un input `moreLabel` que recibe la cantidad oculta:

```ts
protected readonly moreLabel = (count: number) => (count === 1 ? '1 more' : `${count} more`);
```

Es una función y no un string con placeholder porque el texto entero depende del número: traducirlo suele exigir pluralización o un orden de palabras distinto, y ninguna de las dos cosas se resuelve concatenando fragmentos fijos. Difiere a propósito de `DsPagination`, que sí usa fragmentos porque ahí son literales fijos alrededor del número.

El default es exactamente el texto anterior, así que nada cambia si no lo configurás.
