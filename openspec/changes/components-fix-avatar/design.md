# Design — components-fix-avatar

## Context

Motivación en `proposal.md` § Why. Estado actual: `avatar-group.ts` computa `` moreLabel = `y ${overflowCount()} más` `` y lo bindea al `aria-label` del item "+N". No hay input.

El kit ya resolvió el problema para strings anunciados en otros seis lugares, con dos formas distintas:

- **String simple**: `closeLabel` (modal), `dismissLabel` (toast), `label` (spinner, progress).
- **Fragmentos componibles**: `DsPagination` expone `pageLabel` y `ofLabel` y arma "Página 3 de 10".

## Goals / Non-Goals

**Goals:**

- Que el texto del overflow se pueda traducir y pluralizar.
- Dejar escrita la convención que ya se cumple en el resto del kit.

**Non-Goals:**

- **No** se incorpora una librería de i18n ni un formato tipo ICU: el kit no toma esa dependencia por un string.
- **No** se tocan los demás textos del avatar ni el resto de la API.

## Decisions

### 1. Función `(count: number) => string`, no string con placeholder

Las tres formas posibles se evalúan contra lo que un traductor necesita:

| Forma                   | Traduce | Pluraliza | Reordena |
| ----------------------- | ------- | --------- | -------- |
| String con `{count}`    | Sí      | **No**    | Sí       |
| Fragmentos (pagination) | Sí      | **No**    | **No**   |
| Función                 | Sí      | Sí        | Sí       |

La pluralización es la que decide: en inglés "1 more" y "2 more" difieren, y en idiomas con más formas plurales la diferencia es mayor. Un string con placeholder obligaría a inventar un mini-lenguaje de interpolación —el camino hacia un ICU casero—, y los fragmentos asumen que el número va al medio.

El costo es que el consumidor debe declarar una función en su clase en vez de escribir un atributo en el template. Es aceptable para el caso que resuelve: quien traduce una app ya tiene sus textos en TypeScript.

**Por qué no se alinea con `DsPagination`**: ahí los fragmentos son literales fijos alrededor de un número ("Página" 3 "de" 10) y funcionan. Acá el string entero depende de la cantidad. Divergen porque el problema es distinto, no por inconsistencia; queda anotado para que la próxima lectura no lo "corrija".

### 2. El default se conserva exactamente

`(count) => \`y ${count} más\``. Ningún consumidor actual cambia de comportamiento, así que el change es aditivo pese a tocar la superficie pública.

### 3. La convención se escribe donde es verificable

El requirement del grupo pasa a exigir que ese nombre accesible sea configurable. Es el mismo movimiento que `aaa-045` hizo con los named exports y `aaa-046` con el `display` de los popovers: la regla existía de hecho en seis componentes y se rompió en el séptimo porque no estaba escrita en ningún lado.

No se agrega un gate transversal que barra todos los componentes buscando strings anunciados: a diferencia del `export *` o del `display`, "string expuesto a AT" no es detectable por patrón sintáctico sin falsos positivos. Queda como requirement por componente.

## Risks / Trade-offs

- **[La función no se puede setear desde un atributo estático ni desde los controles de Storybook]** → es el costo de la pluralización. La story del grupo puede declarar la función en su clase si se quiere mostrar el override.
- **[Divergencia de forma con `DsPagination`]** → deliberada y documentada arriba; los dos casos tienen requisitos distintos.
