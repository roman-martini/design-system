# playground

Laboratorio interno del monorepo. App Angular 21 **zoneless** que consume las dos libs publicables (`@romanmartinidev/tokens` y `@romanmartinidev/components`) y aloja el setup de **Storybook 10**. **No se publica a npm** (`"private": true`).

## Scripts

| Script                               | Qué hace                                                   |
| ------------------------------------ | ---------------------------------------------------------- |
| `pnpm -F playground start`           | Levanta el dev server de la app en `http://localhost:4200` |
| `pnpm -F playground build`           | Build de producción de la app a `dist/playground/browser/` |
| `pnpm -F playground test`            | Vitest (specs en `src/**/*.spec.ts`)                       |
| `pnpm -F playground storybook`       | Levanta Storybook en `http://localhost:6006`               |
| `pnpm -F playground build-storybook` | Build estático de Storybook a `storybook-static/`          |

## Cómo agregar el demo de un componente nuevo

1. El componente ya debe estar implementado en `packages/components/src/lib/<name>/`.
2. **Story co-ubicada** (junto al componente): crear `packages/components/src/lib/<name>/<name>.stories.ts` siguiendo el patrón de `button.stories.ts` (CSF 3, meta + Default + variantes). Storybook lo recoge automáticamente vía el glob de `apps/playground/.storybook/main.ts`.
3. **Demo en la app** (opcional, para validar consumo en Angular real): importar el componente en `apps/playground/src/app/app.ts` (agregarlo al array `imports`) y renderizarlo en `app.html`.

## Estructura

```
apps/playground/
├── .storybook/            # Config Storybook 10
│   ├── main.ts
│   ├── preview.ts         # importa tokens CSS
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── app.ts         # App standalone (selector: app-root)
│   │   ├── app.html       # demo del Button con variants/sizes/disabled
│   │   ├── app.css
│   │   ├── app.spec.ts    # specs Vitest
│   │   └── app.config.ts  # providers: zoneless + globalErrorListeners
│   ├── main.ts
│   ├── index.html
│   ├── styles.css         # importa @romanmartinidev/tokens/css
│   └── test-setup.ts      # Vitest + Angular TestBed
├── angular.json
├── package.json
├── tsconfig.{json,app,spec}.json
└── vitest.config.ts
```

## Decisiones clave

- **Zoneless** (`provideZonelessChangeDetection()` en `app.config.ts`).
- **Single page** sin routing.
- **Sin SSR**.
- **Stories co-ubicadas** en `packages/components/src/lib/<comp>/<comp>.stories.ts` (recogidas desde acá vía glob).
- **Tokens vía `@import`** en `src/styles.css` (debe ir antes de cualquier estilo).

Detalle completo en [ADR-005](../../docs/architecture/adr/ADR-005-arquitectura-playground.md).
