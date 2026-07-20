import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsAccordion } from './accordion';
import { DsAccordionItem } from './accordion-item';

const meta: Meta<DsAccordion> = {
  title: 'Components/Accordion',
  component: DsAccordion,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsAccordion, DsAccordionItem] })],
  argTypes: {
    headingLevel: { control: { type: 'number', min: 1, max: 6 } },
  },
  args: {
    multiple: false,
    headingLevel: 3,
  },
};

export default meta;

type Story = StoryObj<DsAccordion>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-accordion [multiple]="multiple" [headingLevel]="headingLevel">
        <ds-accordion-item>
          <span dsAccordionHeader>¿Qué es el design system?</span>
          <p>Tokens con theming y componentes Angular accesibles construidos sobre ellos.</p>
        </ds-accordion-item>
        <ds-accordion-item>
          <span dsAccordionHeader>¿Cómo se instala?</span>
          <p>npm install de tokens y components; el CSS de tokens va en los estilos globales.</p>
        </ds-accordion-item>
        <ds-accordion-item>
          <span dsAccordionHeader>¿Se puede themear?</span>
          <p>Sí: los themes redefinen tokens semánticos sin tocar los componentes.</p>
        </ds-accordion-item>
      </ds-accordion>
    `,
  }),
};

export const Multiple: Story = {
  args: { multiple: true },
  render: (args) => ({
    props: args,
    template: `
      <ds-accordion [multiple]="multiple">
        <ds-accordion-item [expanded]="true">
          <span dsAccordionHeader>Requisitos</span>
          <p>Angular 21+, tokens como peerDependency.</p>
        </ds-accordion-item>
        <ds-accordion-item [expanded]="true">
          <span dsAccordionHeader>Compatibilidad</span>
          <p>Zoneless y signals-first; los componentes son standalone.</p>
        </ds-accordion-item>
      </ds-accordion>
    `,
  }),
};

export const DisabledSection: Story = {
  render: () => ({
    template: `
      <ds-accordion>
        <ds-accordion-item>
          <span dsAccordionHeader>Sección disponible</span>
          <p>Contenido normal.</p>
        </ds-accordion-item>
        <ds-accordion-item [disabled]="true">
          <span dsAccordionHeader>Sección no disponible</span>
          <p>No puede expandirse; el header sigue siendo focusable (ADR-011).</p>
        </ds-accordion-item>
      </ds-accordion>
    `,
  }),
};

export const Nested: Story = {
  render: () => ({
    template: `
      <ds-accordion>
        <ds-accordion-item>
          <span dsAccordionHeader>Configuración avanzada</span>
          <ds-accordion [headingLevel]="4">
            <ds-accordion-item>
              <span dsAccordionHeader>Tokens</span>
              <p>Jerarquía primitives → semantic → component → theme.</p>
            </ds-accordion-item>
            <ds-accordion-item>
              <span dsAccordionHeader>Themes</span>
              <p>Un theme solo redefine tokens semánticos.</p>
            </ds-accordion-item>
          </ds-accordion>
        </ds-accordion-item>
        <ds-accordion-item>
          <span dsAccordionHeader>Otra sección del padre</span>
          <p>La exclusividad y el teclado del anidado no interfieren con el padre.</p>
        </ds-accordion-item>
      </ds-accordion>
    `,
  }),
};

export const CustomHeadingLevel: Story = {
  args: { headingLevel: 2 },
  render: (args) => ({
    props: args,
    template: `
      <ds-accordion [headingLevel]="headingLevel">
        <ds-accordion-item>
          <span dsAccordionHeader>Header con aria-level configurable</span>
          <p>El nivel de heading se adapta a la jerarquía del documento del consumidor.</p>
        </ds-accordion-item>
      </ds-accordion>
    `,
  }),
};
