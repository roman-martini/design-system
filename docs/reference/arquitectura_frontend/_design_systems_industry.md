# Design Systems — Prácticas de la industria

> Relacionado: [02_design_systems.md](./02_design_systems.md) · [01_css_architecture.md](./01_css_architecture.md)

Qué hacen realmente las empresas grandes que tienen design systems exitosos, qué no funciona a escala, y cuál es el stack que más converge en la industria hoy.

---

## Patrones que más adoptan y mejor resultado tienen

### 1. Token pipeline automático: Figma → tokens → CSS

El de mayor ROI. Elimina la divergencia entre lo que diseño define y lo que código implementa.

```
Figma Tokens / Figma Variables
        ↓  (export automático)
tokens.json  (W3C Design Tokens format)
        ↓  (Style Dictionary, Token Transformer)
tokens.css / tokens.ts / tokens.android.xml
        ↓
Componentes en producción
```

Un cambio de color en Figma se convierte en un PR automático con el token actualizado. Los componentes no se tocan. Sin pipeline, los tokens de diseño y los del código divergen en semanas.

**Quién lo hace:** Shopify (Polaris), Adobe (Spectrum), IBM (Carbon), GitHub (Primer).

---

### 2. Tokens semánticos como contrato central

Sin la separación primitivos → semánticos, el theming y el multi-producto son imposibles de mantener. Todas las empresas con DS exitoso tienen esta separación aunque la llamen diferente.

```css
/* Primitivo — nunca en componentes */
--rd-color-blue-500: #3b82f6;

/* Semántico — el contrato real */
--rd-semantic-color-bg-primary: var(--rd-color-blue-500);

/* El componente usa el semántico */
background: var(--rd-semantic-color-bg-primary);
```

Cambiar de azul a verde para toda la marca = sobreescribir un token semántico. Sin esta capa, es buscar y reemplazar en cientos de archivos.

---

### 3. Headless components — la tendencia más fuerte

Separar el **comportamiento y la accesibilidad** de los **estilos**. El componente headless maneja foco, teclado, ARIA roles y estado. El equipo trae los estilos.

```tsx
// Radix UI — comportamiento correcto sin imponer estilos
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root>
  <Dialog.Trigger>Abrir</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className={styles.overlay} />
    <Dialog.Content className={styles.content}>
      ...
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

La accesibilidad correcta de un Dialog, Dropdown o DatePicker es extremadamente difícil de implementar. Hacerlo una vez bien y reutilizarlo es enormemente eficiente.

**Librerías:** Radix UI, React Aria (Adobe), HeadlessUI (Tailwind Labs).
**Quién lo usa:** Vercel (Geist usa Radix), Linear, Stripe, Loom, Clerk.

---

### 4. Zero-runtime CSS

**El problema:** CSS-in-JS con runtime (styled-components, Emotion) inyecta estilos en el browser en cada render. Con miles de componentes y SSR, el costo es real. Meta creó StyleX específicamente para resolver esto.

```
Runtime CSS-in-JS          Zero-runtime
styled-components    →     vanilla-extract
Emotion              →     StyleX (Meta)
                           Panda CSS
                           Linaria
```

El CSS se genera en build time y se sirve como archivos estáticos. Sin overhead en el browser, compatible con React Server Components.

**Quién lo usa:** Meta (StyleX), Shopify (vanilla-extract).

---

### 5. CSS Layers para control de cascada

Sistemas modernos de DS usan `@layer` para eliminar la guerra de especificidad. Es especialmente valioso en un DS distribuido como paquete npm — el consumidor puede sobreescribir sin `!important`.

```css
/* En el paquete */
@layer reset, tokens, base, components, utilities;

@layer components {
  .button { background: var(--rd-semantic-color-bg-primary); }
}

/* En el consumidor — gana sin necesitar especificidad más alta */
@layer utilities {
  .bg-custom { background: red; }
}
```

**Quién lo usa:** GitHub (Primer), Shopify, sistemas de DS modernos distribuidos como paquete.

---

### 6. Web Components para stacks múltiples

Funcionan en React, Angular, Vue o sin framework. La apuesta correcta cuando el DS tiene que servir a múltiples equipos con stacks distintos.

**Quién lo usa:** Google (Material Web), Adobe (Spectrum Web Components), GitHub (Primer Web).

**Trade-off:** más verbose que JSX, SSR más complejo. Vale la pena solo si el DS realmente sirve a múltiples frameworks.

---

## Lo que no funciona a escala

| Práctica | Por qué falla |
|---|---|
| Runtime CSS-in-JS masivo | Meta lo abandonó — overhead en SSR, incompatible con RSC |
| DS "terminado" sin proceso de evolución | Queda obsoleto en meses, equipos dejan de adoptarlo |
| Tokens sin pipeline automático | Figma y código divergen, nadie confía en los tokens |
| DS monolítico (todo o nada) | Equipos prefieren copiar antes que adoptar todo el sistema |
| Sin ownership claro | Sin equipo responsable, el DS muere por negligencia |
| Documentación estática | Queda desactualizada — Storybook como doc viva es el estándar |
| Accesibilidad como afterthought | Retrofitting de a11y en un DS establecido es costosísimo |

---

## Design systems de referencia

| Empresa | DS | CSS approach | Componentes |
|---|---|---|---|
| Google | Material Web | CSS custom properties + Lit | Web Components |
| Meta | Sin DS público | StyleX (zero-runtime) | React interno |
| Adobe | Spectrum | CSS Modules + React Aria | Headless + Web Components |
| Shopify | Polaris | vanilla-extract + CSS Modules | React |
| GitHub | Primer | CSS Layers + custom properties | React + Web Components |
| IBM | Carbon | Sass + design tokens | React, Angular, Vue, Web Components |
| Salesforce | SLDS | BEM + custom properties | Web Components (LWC) |
| Atlassian | ADS | Emotion (runtime) | React |
| Vercel | Geist | CSS Modules + Radix UI | React (headless) |
| Radix / WorkOS | Radix | Sin estilos | Headless React |

---

## El stack que más converge hoy

Para una empresa mediana que arranca un DS nuevo:

```
Tokens:      Style Dictionary + W3C Design Tokens format
Pipeline:    Figma Variables → export → PR automático vía CI
CSS:         vanilla-extract o CSS Modules + CSS Layers
Componentes: Radix UI / React Aria (headless) + estilos propios
Docs:        Storybook
Versioning:  semver + changesets (monorepo)
```

**Por qué este stack:**
- Style Dictionary es el estándar de facto para transformar tokens a múltiples formatos
- vanilla-extract da type safety sin runtime — gana a CSS Modules en teams TypeScript-first
- Radix / React Aria resuelve el problema más difícil (accesibilidad) sin imponer estilos
- Storybook es el estándar para documentación viva desde 2018
- Changesets automatiza el versioning en monorepos de paquetes

---

## Señal de madurez de un DS

Un DS maduro tiene estas características observables:

- El pipeline Figma → código es automático, no manual
- Los tokens semánticos son el contrato entre diseño y desarrollo
- Los componentes tienen tests de accesibilidad automatizados (axe)
- Hay un proceso claro para proponer, revisar y publicar cambios
- Los consumidores pueden adoptar componentes individuales sin instalar todo
- El changelog documenta cada cambio con migration guide para breaking changes
- La documentación muestra el componente funcionando, no un screenshot
