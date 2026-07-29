# Design — ci-correctness-hardening

Decisiones técnicas de la Parte E. Lo que sobrevive al archivado va a **ADR-022** (gate de aprobación del publish); el resto muere con este documento.

---

## 1. Changeset enforcement: por qué el actual falla y qué lo reemplaza

### Los tres defectos encadenados

El step vigente (`.github/workflows/pr.yml`) tiene tres fallas independientes:

| #   | Defecto                                                                               | Consecuencia                                                                     |
| --- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | La exclusión solo cubre `(README\|CHANGELOG).md`, no `packages/*/package.json`        | El PR `changeset-release/main` entra a la rama que exige changeset → gate rojo   |
| 2   | La detección positiva grepea el output decorado del CLI (`^🦋`, `---.*\.md$`)         | Falso positivo latente: hasta "NO packages to be bumped" imprime líneas con `🦋` |
| 3   | El `\|\| true` cubre **todo** el pipeline de `git diff`, no solo el grep de exclusión | Un error de git (ref ausente, shallow) deja `PKG_CHANGES` vacío → **pase mudo**  |

El defecto 2 hoy no se materializa porque `set -euo pipefail` hace que el exit 1 del CLI mate el pipeline antes; o sea, el gate funciona por accidente del `pipefail`, no por su lógica. Además `grep -q` cierra el pipe apenas encuentra match, lo que puede provocar EPIPE intermitente en el CLI del otro lado.

### El reemplazo

Detección **por archivos** en las dos direcciones — nunca se parsea output de herramienta:

```bash
CHANGED=$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- 'packages/')     # sin || true: si git falla, el step falla
PKG_CHANGES=$(printf '%s\n' "$CHANGED" | grep -vE '...' || true)           # || true acotado al grep
NEW_CHANGESETS=$(git diff --name-only --diff-filter=AM "$BASE_SHA" "$HEAD_SHA" -- '.changeset/*.md' | grep -vE '/README\.md$' || true)
```

Cuatro decisiones dentro de eso:

- **SHAs explícitos del evento, no `origin/main...HEAD`.** En un `pull_request`, `HEAD` es el merge commit sintético que arma GitHub. Usar `github.event.pull_request.base.sha` y `.head.sha` describe el PR real y no depende de que la ref remota esté fetcheada. Elimina de paso el `git fetch ... || true` previo.
- **`--diff-filter=AM` en los changesets.** Un PR que _borra_ un changeset no debe contar como que lo agregó.
- **`|| true` solo en el grep.** `grep` sale con 1 cuando no hay matches (caso normal), y esa es la única falla que queremos tragar. Un fallo de `git` vuelve a ser fatal.
- **Excepción a nivel `if:` del step, no dentro del bash.** `if: github.head_ref != 'changeset-release/main'` es declarativo, visible en la UI de Actions como step skipped, y no puede quedar tapado por una rama de shell.

### Por qué la excepción por nombre de branch

`changesets/action` crea su PR desde `changeset-release/<baseBranch>` — es contrato de la action, no convención local. La alternativa era reconocer el _patrón_ del diff (solo bumps de `package.json` + `CHANGELOG.md`), pero eso es una heurística sobre contenido: el día que Changesets sume un archivo al PR de versión, el gate vuelve a romper en silencio. El nombre del branch es explícito y falla de forma visible si cambia.

> Matiz operativo, no funcional: el PR de release creado con `GITHUB_TOKEN` normalmente **no dispara** `pr.yml` (GitHub suprime workflows sobre eventos originados por ese token), así que el modo de falla práctico hoy es "el check requerido `Validate` nunca reporta" en vez de "el step falla". El resultado para el mantenedor es el mismo — PR inmergeable — y la excepción cubre igual el caso en que el PR se dispare (re-run manual, PAT, `workflow_dispatch`).

---

## 2. Gate de aprobación del publish: dos jobs, no uno

D-018(b) decidió el control; acá se decide su forma.

### El problema con el job único

`changesets/action` hace **dos cosas distintas** en un solo step, según el estado del repo: si hay changesets pendientes abre/actualiza el PR de versión; si no quedan, publica. Poner `environment: npm-publish` en el job actual pondría required review sobre **ambos** modos: cada merge a main quedaría esperando aprobación para la operación inocua de actualizar un PR. Un gate que se dispara en el caso trivial se aprueba por reflejo y deja de ser un gate.

### La forma elegida

```
job version   (sin environment)  → changesets/action con `version:` únicamente
                                   expone output hasChangesets
job publish   (environment: npm-publish, needs: version,
               if: needs.version.outputs.hasChangesets == 'false')
                                 → build + changeset publish
```

Propiedades:

- La aprobación se pide **exactamente cuando se va a publicar**, que es el acto irreversible (npm no permite republicar una versión).
- `NPM_TOKEN` deja de ser secret del repo y pasa a ser **secret del environment**: ningún otro job puede leerlo, ni siquiera por error de edición del YAML.
- El job `version` mantiene los permisos de escritura que necesita para el PR; `publish` lleva `contents: write` + `id-token: write` (provenance, D-018(c)). El `write` no es opcional: `changesets/action` pushea los tags de release y crea los GitHub releases tras publicar — verificado en el fuente de la v1.9.0 (`runPublish` con `createGithubReleases`). El least-privilege real de ese job lo aporta el gate de aprobación, no el permiso.

### Lo que no se puede hacer por código

El environment se crea en GitHub Settings → Environments, no en el repositorio. **Si el environment no existe, GitHub lo crea implícitamente en el primer run — sin reviewers y sin protección.** El YAML por sí solo no da la garantía: la da el mantenedor configurando el required reviewer. Por eso la tarea queda explícita en `tasks.md` y documentada en `CONTRIBUTING.md` como acción del mantenedor, junto a las de branch protection.

Esta decisión matiza el modelo de release de ADR-006 (que describía un job único sin gate) → **ADR-022**.

---

## 3. Pinning por SHA y salto de majors

Las cuatro actions están pineadas por tag mutable. El tag `v4` de `actions/checkout` puede reapuntarse si la action se compromete — el vector exacto del incidente `tj-actions/changed-files` de 2025. Es especialmente sensible en `release.yml`, donde `changesets/action` corre con `contents: write` y acceso a `NPM_TOKEN`.

### Estado real (resuelto contra la API de GitHub el 2026-07-28)

| Action               | En el repo | Última | SHA pineado                                | Nota                                  |
| -------------------- | ---------- | ------ | ------------------------------------------ | ------------------------------------- |
| `actions/checkout`   | v4         | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | 3 majors de atraso                    |
| `actions/setup-node` | v4         | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | 3 majors de atraso                    |
| `pnpm/action-setup`  | v4         | v6.0.9 | `0ebf47130e4866e96fce0953f49152a61190b271` | 2 majors de atraso                    |
| `changesets/action`  | v1         | v1.9.0 | `a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d` | major correcto; el tag `v1` sí derivó |

La última columna justifica el ejercicio: el tag mutable `v1` de `changesets/action` **no** apunta al mismo commit que `v1.9.0`. Se estaba corriendo un contenido que nadie fijó.

### Breaking changes verificados contra las release notes

- **checkout v5**: Node 24 (runner ≥ v2.327.1 — los hosted de GitHub están muy por encima). **v6**: credenciales en archivo separado. **v7**: bloquea checkout de PRs de fork en `pull_request_target`/`workflow_run` (no usamos ninguno de los dos) + migración a ESM. Nuestro uso es `fetch-depth: 0` y nada más → sin impacto.
- **setup-node v5**: caching automático cuando hay `packageManager` en el manifest; **v6** lo limita a npm. Nosotros pasamos `cache: 'pnpm'` **explícito**, que sigue mandando en todas las versiones → sin impacto. **v7**: ESM + outputs nuevos.
- **pnpm/action-setup v5**: Node 24. **v6**: soporte para pnpm v11. Seguimos omitiendo `version:` a propósito para que se infiera de `packageManager` → sin impacto.

Fuera de alcance deliberado: subir `packageManager: pnpm@9.0.0` (clavado desde abril 2024). No es de esta parte, y Dependabot lo va a proponer como PR revisable.

---

## 4. El CLI de OpenSpec: el package estaba equivocado

Hallazgo nuevo de esta sesión, no registrado en la review. Evidencia:

- `registry.npmjs.org/openspec` → **una sola versión** (`0.0.0`), `dist-tags.latest = 0.0.0`, repo `openspecio/openspec`, autor `akerust`, copyright 2019, **sin campo `bin`** y sin `description`.
- El CLI real es `@fission-ai/openspec` (`bin: { openspec: "bin/openspec.js" }`, latest `1.6.0`, repo `Fission-AI/OpenSpec`).
- En la máquina del mantenedor hay `@fission-ai/openspec@1.3.1` **instalado global** — `npx` resuelve primero el binario del PATH, así que localmente el comando "funciona" y la falla queda invisible.

Consecuencia: en CI, donde ese global no existe, `npx --yes openspec validate --all` descarga el placeholder, no encuentra ejecutable y aborta. **El gate de OpenSpec nunca validó una sola spec en CI.** No es un problema de versión no pinneada (como lo describían [ci-cd-05] y [openspec-01]): es el package equivocado.

Fix: `@fission-ai/openspec@1.6.0` como devDependency del root → queda bajo `--frozen-lockfile` y bajo Dependabot; el step pasa a `pnpm exec openspec validate --all`; se expone el script `openspec` en el root para que los comandos ya documentados en `openspec/README.md` y `CONTRIBUTING.md` funcionen tal como están escritos.

Compatibilidad verificada antes de pinear: `1.6.0` corre sobre el repo actual con **27 passed, 0 failed** — idéntico a la línea base del `1.3.1` global. No hay reglas nuevas que rompan specs existentes.

**Nota sobre telemetría**: el CLI trae `posthog-node` y reporta nombre de comando + versión con un UUID anónimo. Se revisó el módulo antes de pinearlo: se **auto-desactiva cuando `CI=true`** (que GitHub Actions siempre setea), y localmente admite opt-out por `OPENSPEC_TELEMETRY=0` o el estándar `DO_NOT_TRACK=1`. En CI no envía nada; en local queda a criterio del mantenedor. No viaja a los packages publicables — es devDependency del root.

---

## 5. actionlint: binario pineado con checksum

Tres formas de correrlo en CI:

1. **Action de terceros** (`raven-actions/actionlint`) — la más corta, pero suma una dependencia de supply chain más al pipeline, justo en el change que reduce supply chain.
2. **Docker** (`rhysd/actionlint:latest`) — sin instalación, pero `:latest` es exactamente el tag mutable que este change está eliminando, y el pull agrega ~20s.
3. **Binario del release oficial, versión fija + verificación de SHA256** — elegida.

Se descarga `actionlint_1.7.12_linux_amd64.tar.gz` del release oficial y se verifica contra el checksum publicado (`8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8`) **antes** de extraer y ejecutar. Es el mismo criterio que se aplica a las actions: nada corre sin identidad fijada. La versión queda visible en el YAML, así que subirla es un commit revisable.

**Alcance: solo `.github/workflows/*.yml`.** La intención original era incluir también la composite action, pero actionlint no soporta ese formato — verificado con el binario 1.7.12 sobre `.github/actions/setup/action.yml`, que reporta `"jobs" section is missing`, `"on" section is missing` y `unexpected key "description"`. Pasársela rompería el step en todo PR.

---

## 6. commitlint sobre el rango correcto del PR

La trampa: en un evento `pull_request`, `HEAD` es el **merge commit sintético** que GitHub arma entre la base y la rama. Su mensaje (`Merge <sha> into <sha>`) no cumple Conventional Commits, así que `commitlint --from origin/main --to HEAD` falla en todo PR — un gate que siempre falla se termina removiendo.

Se usa el rango real del PR:

```bash
pnpm exec commitlint --from "${{ github.event.pull_request.base.sha }}" \
                     --to   "${{ github.event.pull_request.head.sha }}" --verbose
```

Requiere `fetch-depth: 0` (ya presente) para que ambos SHAs existan localmente. Reutiliza `commitlint.config.js` y las devDeps ya instaladas: cero herramientas nuevas.

Esto cierra el gap que el propio ADR-006 abrió — usó "los hooks locales no se aplican con `--no-verify`" como argumento contra la opción de solo-hooks, y después dejó el pipeline sin validación de mensajes.

---

## 7. Dependabot

`.github/dependabot.yml` con dos ecosistemas:

- **`github-actions`** (weekly): es lo que hace sostenible el pinning por SHA. Sin esto, pinear congela; con esto, cada bump llega como PR revisable con las release notes.
- **`npm`** (weekly, `directory: "/"`): Dependabot resuelve el workspace pnpm desde el root. Agrupamiento de minor/patch en un PR por ecosistema para no inundar la cola; los majors llegan sueltos, que es donde hace falta leer.

Consecuencia asumida: un PR de Dependabot que toque una dependencia de `packages/*` va a exigir changeset. Es correcto — cambia el artefacto publicado — y se resuelve agregándolo al PR.

---

## 8. Scripts del root: `version` se renombra, `release` se elimina

- `"version": "changeset version"` es **inejecutable por su vía natural**: `pnpm version` es un builtin que pisa al script homónimo. El workaround vive hoy como comentario en `release.yml`. Se renombra a `changeset:version`, que no colisiona, y el comentario deja de ser necesario.
- `"release": "pnpm -r build && changeset publish"` se **elimina**. `release.yml` no lo usa (corre build y publish por separado), la spec que lo prometía se corrige en este mismo change, y mientras exista es un publish manual de un comando — exactamente lo que el gate de aprobación del §2 busca impedir. Menos superficie es mejor control.

La eliminación arrastra la alineación documental de [ci-cd-12]: `openspec/specs/ci-cd-pipeline/spec.md`, `CONTRIBUTING.md`, `docs/architecture/README.md` y `CLAUDE.md` citan `pnpm release` como el comando del release.

---

## 9. Qué se puede verificar acá y qué no

GitHub Actions no corre local, así que la honestidad sobre el alcance de la verificación es parte del diseño:

| Verificable en esta sesión                                                           | Solo confirmable en el primer PR real                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `actionlint` sobre los YAML finales (sintaxis, expresiones, shellcheck de los `run`) | Que el environment pida aprobación (depende del setup manual) |
| El script de enforcement contra escenarios de git reales, ejecutado a mano           | El comportamiento de las actions en sus majors nuevas         |
| `openspec validate --all` con el CLI pinneado                                        | El hit de cache de pnpm con `setup-node` v7                   |
| `pnpm install --frozen-lockfile`, lint, format, build y tests del repo               | Que el PR `changeset-release/main` efectivamente pase         |

Las tres verificaciones de la izquierda son obligatorias antes de cerrar el change; el margen restante se acepta explícitamente y falla de forma ruidosa, no silenciosa.
