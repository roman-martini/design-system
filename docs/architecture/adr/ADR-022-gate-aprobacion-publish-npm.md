# ADR-022 — Gate de aprobación para el publish a npm: environment con required reviewer

- **Fecha**: 2026-07-28
- **Estado**: Aceptado
- **Dominio**: ci / seguridad / transversal
- **ADRs relacionados**: [ADR-006](ADR-006-estrategia-ci-cd.md) (**matizado**: su `release.yml` de job único pasa a dos jobs, y su modelo de "merge del PR de release ⇒ publish inmediato" queda condicionado a una aprobación humana), [ADR-021](ADR-021-estrategia-publicacion-packages.md) (qué se publica; este ADR decide quién autoriza publicarlo), [ADR-015](ADR-015-versionado-lockstep.md) (el par se publica en lockstep, así que una aprobación cubre ambos packages)

## Contexto

`release.yml` corre en cada `push` a `main` con un único job que delega en `changesets/action`. Esa action hace **dos cosas distintas** según el estado del repo: si hay changesets pendientes, abre o actualiza el PR de versionado; si no quedan (típicamente porque ese PR se acaba de mergear), **publica a npm inmediatamente**.

El control sobre esa publicación era enteramente humano. El veto de publicación vigente desde el 2026-07-19 —con changesets acumulándose a propósito— se sostenía en que nadie mergeara el PR de release, un PR que queda abierto y actualizándose indefinidamente. Un merge accidental publicaba a npm sin ninguna confirmación adicional, y **npm no permite republicar una versión**: el error es irreversible.

[D-018](../../product/decisiones.md)(b) decidió materializar el control como control **técnico**: un GitHub Environment con required reviewer. [D-028](../../product/decisiones.md) levantó el veto y lo convirtió en "aprobación explícita del PO por versión" — lo que hace que este gate deje de ser una red de seguridad para pasar a ser **el mecanismo mismo** por el que se autoriza cada release.

Hasta ahora existía una mitigación incidental: el gate de changesets roto ([ci-cd-01]) bloqueaba el PR de release bajo branch protection. Esa mitigación **desaparece** al arreglar el gate en este mismo change, lo que hace que la decisión no pueda diferirse.

Cambiar el modelo de release definido en ADR-006 y decidir dónde vive el `NPM_TOKEN` afecta a los dos packages publicables y es costoso de revertir una vez que hay versiones publicadas bajo el nuevo flujo → amerita ADR.

## Opciones consideradas

### Opción A — Mantener el job único y agregarle `environment: npm-publish`

Un solo job, con el environment declarado a nivel de job.

- **Pros**: cambio de una línea; ninguna reestructuración del workflow.
- **Contras**: `changesets/action` no distingue sus dos modos hasta que ya está corriendo, así que la aprobación se pediría en **cada push a `main`**, incluidos los que solo actualizan el PR de versionado — la operación trivial y reversible. Un gate que se dispara varias veces por semana para no hacer nada se aprueba por reflejo, y el día que aparezca el que sí publica no se va a distinguir del ruido. Un control que entrena a ignorarlo es peor que no tenerlo. Descartada.

### Opción B — Publish manual vía `workflow_dispatch`

Sacar el publish del flujo automático y dejarlo como workflow disparado a mano por el mantenedor.

- **Pros**: control total y explícito; imposible publicar por accidente al mergear.
- **Contras**: reintroduce un paso manual en el punto exacto donde ADR-006 eligió automatizar, y traslada al operador la responsabilidad de correrlo con el estado correcto del repo (build fresco, tags, changesets consumidos). El registro de quién autorizó qué queda en el historial de runs en vez de en un mecanismo de aprobación auditable. Descartada.

### Opción C — Dos jobs, con el environment sobre el de publish (elegida)

Partir `release.yml` en un job `version` sin gate y un job `publish` con `environment: npm-publish`, condicionado por el output `hasChangesets` del primero.

- **Pros**: la aprobación se pide **exactamente cuando el acto es irreversible** y nunca en el caso trivial; `NPM_TOKEN` pasa a ser secret del environment, de modo que ningún otro job puede leerlo aunque alguien edite el YAML; el registro de aprobaciones queda en la UI de Environments, auditable por versión; el flujo automático de ADR-006 se conserva intacto hasta el punto de publicación.
- **Contras**: el workflow pasa de un job a dos, con un checkout y un setup adicionales (~1 min de wall-clock en el run que publica, que ocurre pocas veces por mes). La protección real depende de una configuración manual en GitHub que el repositorio no puede declarar ni verificar.

## Decisión

**El publish a npm queda detrás de un GitHub Environment con required reviewer, en un job separado del versionado.**

Reglas:

1. **`release.yml` tiene dos jobs.** `version` (sin gate) ejecuta `changesets/action` con únicamente el input `version` y expone su output `hasChangesets`. `publish` declara `needs: version` y `if: needs.version.outputs.has-changesets == 'false'`.
2. **El job `publish` declara `environment: npm-publish`**, un environment con **required reviewer**. Ninguna publicación ocurre sin aprobación humana explícita, una por versión (el lockstep de ADR-015 hace que esa única aprobación cubra a los dos packages).
3. **`NPM_TOKEN` es secret del environment `npm-publish`, no del repositorio.** El job `version` no puede leerlo. Mover el secret es parte de la decisión, no un detalle de implementación: es lo que impide que un error de edición del YAML exponga el token a un job sin gate.
4. **Los permisos se declaran por job.** `version`: `contents: write` + `pull-requests: write`. `publish`: `contents: write` (`changeset publish` pushea los tags de release y crea los GitHub releases) + `id-token: write` (provenance, [D-018](../../product/decisiones.md)(c)). En el job de publish el least-privilege lo aporta el gate de aprobación, no el permiso — el `write` es funcionalmente necesario.
5. **La configuración del environment es responsabilidad del mantenedor y no se puede aplicar por código.** Se documenta en `CONTRIBUTING.md` junto al checklist de branch protection, con la advertencia explícita de que **hasta que el environment exista con su reviewer, el gate no protege**: GitHub crea implícitamente un environment desconocido en el primer run que lo referencia, sin reviewers.
6. **El publish sigue siendo el único camino a npm.** Se mantiene la prohibición de ADR-006 de publicar a mano, y este change **elimina el script `release` del root** para que no exista un publish manual de un comando.

## Consecuencias

### Positivas

- El veto de publicación deja de depender de memoria humana y pasa a ser un control técnico verificable, tal como pedía D-018(b).
- La aprobación queda registrada por versión en la UI de Environments: hay traza de quién autorizó cada release.
- El `NPM_TOKEN` reduce su superficie de exposición a un único job que solo corre bajo aprobación.
- El flujo automatizado que eligió ADR-006 se conserva: nada del versionado se vuelve manual.

### Negativas / trade-offs aceptados

- **La protección depende de una configuración manual fuera del repositorio.** Es el trade-off central: el YAML declara la intención, la garantía la da el mantenedor. Peor aún, la falta de configuración **no falla ruidosamente** — GitHub crea el environment vacío y el run sigue. Se mitiga documentándolo como acción explícita del mantenedor, no se elimina.
- **Un job más**: checkout y setup duplicados en el run que publica. Costo despreciable frente a la frecuencia real de release.
- **El gate no distingue quién aprueba de quién mergeó.** En un repo de un solo mantenedor, el reviewer y el autor son la misma persona; el valor acá es la confirmación deliberada, no la separación de funciones. Si el repo suma mantenedores, revisar si conviene exigir que el aprobador sea distinto del autor.

### Acciones de seguimiento

- **Acción del mantenedor, pendiente**: crear el environment `npm-publish` en GitHub Settings → Environments con required reviewer, y mover `NPM_TOKEN` de los secrets del repositorio a los del environment. Sin este paso el gate es decorativo.
- El primer release real (el `0.3.0` de D-028) es la verificación de extremo a extremo de este flujo; hasta entonces la reestructuración está verificada solo por `actionlint` y por lectura del fuente de `changesets/action`.
- Trusted publishing vía OIDC ([ci-cd-11], pendiente de decisión del PO) permitiría retirar el `NPM_TOKEN` por completo. `changesets/action` ya lo soporta: usa OIDC cuando no encuentra `NPM_TOKEN`. Si se adopta, la regla 3 pierde objeto y este ADR se matiza.
