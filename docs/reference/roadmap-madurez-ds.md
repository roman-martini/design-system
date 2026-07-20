# Roadmap de madurez de un design system

> Marco conceptual rescatado del repo de investigación previo — era la columna vertebral de `docs/backlog/FUTURE-WORK.md`, fusionado al [BACKLOG](../backlog/BACKLOG.md) el 2026-07-20. Material de referencia **no normativo**: define niveles de madurez, métricas de éxito y anti-patrones. El estado del repo respecto a estos niveles **no se trackea acá** — la dirección vive en [docs/product/README.md § Roadmap](../product/README.md#roadmap) y la cola operativa en [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md).

## Los 5 niveles de madurez

| Nivel | Tema                                                    | Qué incluye                                                                                          |
| ----- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1     | Cerrar deuda — componentes base + tokens                | Kit de componentes esenciales con tokens completos y tests por componente                             |
| 2     | Calidad profesional — tests, a11y CI, stylelint, bundle | Calidad verificada automáticamente: a11y en CI, visual regression, lint de tokens, bundle budget      |
| 3     | Distribución y consumo — monorepo, publish, versionado  | Packages publicables con CI/release, versionado y docs de consumo                                     |
| 4     | Escalado real — multi-framework, mobile, Figma sync     | **Solo si hay ≥2 frameworks objetivo, apps nativas o sync bidireccional Figma**; si no, sobre-ingeniería |
| 5     | Patterns / Templates / Recipes                          | Composiciones reusables (útil con ≥10 componentes), como stories compuestas — no componentes nuevos   |

## Métricas de éxito por nivel

| Nivel | Métrica                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------- |
| 1     | App real puede construirse 100% con componentes del DS (sin componentes ad-hoc).              |
| 2     | Otro dev hace PR cambiando un componente y el CI lo bloquea/aprueba sin intervención manual.  |
| 3     | App externa instala `@romanmartinidev/components` y la usa sin mirar el código fuente del DS. |
| 4     | Cambio de token en Figma llega a producción en < 5 minutos sin código manual.                 |
| 5     | Nuevo prototipo se arma combinando templates existentes en < 30 minutos.                      |

## Anti-patrones a evitar

- **No agregar Web Components todavía**. Stencil/Lit suman complejidad sin valor mientras solo haya un consumidor Angular.
- **No saltar a Nx hasta tener ≥5 packages**. pnpm workspaces es suficiente.
- **No documentar componentes que aún no existen**. Storybook se desactualiza solo si la doc va por detrás.
- **No usar Material Angular como base**. Va contra el ejercicio de aprendizaje y agrega dependencias pesadas.
- **No crear DatePicker propio**. Wrapping de `flatpickr` o `vanilla-calendar` es más realista.
- **No usar `!important` ni override por especificidad**. Si un token no alcanza, sumar uno nuevo en lugar de hackear CSS.
- **No commitear archivos generados** (Compodoc `documentation.json`, builds, etc.). Deben estar en `.gitignore`.

Ver también [PLAYBOOK.md § Anti-patrones a evitar](../architecture/PLAYBOOK.md#anti-patrones-a-evitar) para anti-patrones de la **infraestructura** del repo.

## Recursos de referencia

- **Style Dictionary v4 docs**: https://styledictionary.com/
- **Storybook Angular**: https://storybook.js.org/docs/get-started/install?renderer=angular
- **Changesets**: https://github.com/changesets/changesets
- **ng-packagr**: https://github.com/ng-packagr/ng-packagr
- **Floating UI**: https://floating-ui.com/ — positioning para overlays (el kit terminó eligiendo Popover API nativa, ver ADR-014)
- **Chromatic**: https://www.chromatic.com/
- **Token Studio**: https://tokens.studio/
- **WAI-ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
