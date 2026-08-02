---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

**El primer toast de la sesión vuelve a anunciarse en lectores de pantalla** (tercer change de la Parte G de la review integral).

El contenedor se creaba recién en el primer `show()`, y el `role="status"`/`role="alert"` viajaba en el elemento del toast que se insertaba en ese mismo ciclo: una live region que aparece junto con su contenido frecuentemente no se anuncia, porque las regiones `aria-live` tienen que preexistir en el DOM para que la tecnología asistiva las observe. Como el contenedor además es un popover —y cerrado computa `display: none`, o sea que está fuera del árbol de accesibilidad— crearlo antes no alcanzaba: había que sacar el anuncio de ahí adentro.

`DsToastService` ahora crea al inicializarse una **región de anuncios persistente en el `body`**, sin presencia visual pero presente para la tecnología asistiva, con dos regiones independientes (`polite` y `assertive`) porque la urgencia de una región existente no se puede mutar de forma confiable. Al mostrar un toast, su mensaje se escribe en la que corresponde a su variante.

**Cambio de DOM observable**: el elemento visual del toast ya no declara `role="status"` ni `role="alert"` — con la región persistente anunciando, conservarlo produciría un anuncio duplicado. Si tenías tests que asertaban ese rol sobre el elemento del toast, ahora corresponde mirar la región de anuncios. La API pública (`show`, los atajos, `provideDsToasts`, los types) no cambia.

La creación de la región va guardada por plataforma: sin esa guarda, mover el acceso al DOM al arranque del service habría roto el renderizado del lado del servidor, que hoy sobrevive solo porque el service no toca el documento hasta el primer toast. La estrategia SSR completa del kit sigue pendiente.
