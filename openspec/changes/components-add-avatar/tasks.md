# Tasks — aaa-037 — Avatar (DsAvatar + DsAvatarGroup) + space.negative

Cada tarea es ≤2 h con criterio binario. Diseño: API y fallback (design §1), grupo (§2), tokens (§3), gate (§4).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

## 2. Tokens

- [ ] 2.1 `semantic/space.json`: `negative.2xs–xl` vía `calc(-1 * {semantic.space.*})` (jerarquía intacta, HU-018 CA-018.3/018.4). Verificar en `dist/tokens.css` que el output es correcto (var o valor resuelto).
- [ ] 2.2 `component/avatar.json`: `tone.<t>.{bg,text}` (6 tonos, misma cadena semántica que Badge subtle), `radius` (`{semantic.radius.full}`), `group.overlap` (`{semantic.space.negative.sm}`); eliminar `bg`/`text` planos del bootstrap (sin consumidor → no breaking). Build de tokens verde.
- [ ] 2.3 Gate de contraste: pares `avatar-tone-<t>` (nivel "text") verdes en los 4 themes.

**Criterio**: tokens emitidos con jerarquía intacta; gate verde.

## 3. DsAvatar

- [ ] 3.1 `lib/avatar/avatar.ts/.html/.css`: `name`/`src`/`size`/`tone` (design §1); iniciales y hash como funciones puras; fallback ante `(error)` de imagen con reset al cambiar `src`; a11y (alt / role="img"+aria-label / aria-hidden decorativo); estilos por tokens (circular, sizes, tonos por data-attrs).
- [ ] 3.2 Export en `lib/avatar/index.ts` (`DsAvatar`, `DsAvatarSize`, `DsAvatarTone`).

**Criterio**: compila; fallback y a11y según spec.

## 4. DsAvatarGroup

- [ ] 4.1 `lib/avatar/avatar-group.ts/.html/.css`: `role="group"` + `label`; solape por `--ds-component-avatar-group-overlap` + anillo (`border-width`/`border-color`); `max` con `contentChildren(DsAvatar)` (oculta excedentes vía señal interna) e item "+N" (`role="img"`, "y N más").
- [ ] 4.2 `export * from './lib/avatar';` en `public-api.ts` (Avatar + Group + types); build APF verde.

**Criterio**: grupo apila, colapsa y anuncia; API completa exportada.

## 5. Tests + showcase

- [ ] 5.1 `avatar.spec.ts`: imagen vs fallback (incl. dispatch de `error`), iniciales 1/2 palabras, hash determinístico (mismo name → mismo tono) y override `tone`, sizes, a11y (alt, role/aria-label, decorativo), no-hardcodes por CSS fuente, export público.
- [ ] 5.2 `avatar-group.spec.ts`: solape aplicado, `max` + "+N" (conteo y aria-label), `role="group"`/`label`.
- [ ] 5.3 `avatar.stories.ts` + showcase `/avatar`: iniciales (hash y tone manual), imagen con fallback, sizes, grupo S/J/I con "+N" y filas de team de la referencia; snippets copiables.
- [ ] 5.4 `pnpm -r test`, `build-storybook`, playground.

**Criterio**: suite verde; showcase reproduce la referencia.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-avatar --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría `/ng:review` sobre `src/lib/avatar/` — 0 altas, 0 medias; hallazgos menores resueltos.
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changeset único con **minor** de components (DsAvatar + DsAvatarGroup) y **minor** de tokens (`space.negative.*` + paleta avatar).
- [ ] 6.6 Commit del feat autorizado por el PO.

**Criterio**: automáticos verdes; changeset correcto.

## 7. Archive

- [ ] 7.1 Mover a `archive/aaa-037-components-add-avatar/`; `status: archived` + fecha; crear la spec base `component-avatar` desde el delta.
- [ ] 7.2 **HU-018**: marcar CA-018.3 cumplido por este change (referencia cruzada en la HU y su tabla).
- [ ] 7.3 Registros: `openspec/README.md`, catálogos en `docs/architecture/README.md`, grooming del BACKLOG (Avatar sale; `components-add-slider` promovido — último de la tanda), HU-022 → Hecha, EP-002 al día.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive.

**Criterio**: change archivado, spec base creada, HU-018 CA-018.3 registrado, registros al día.
