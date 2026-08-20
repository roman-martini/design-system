/** @vitest-environment node */
import { existsSync, readdirSync } from 'node:fs';

import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import {
  DsAccordion,
  DsAccordionItem,
  DsAvatar,
  DsAvatarGroup,
  DsBadge,
  DsBreadcrumbItem,
  DsBreadcrumbs,
  DsButton,
  DsCard,
  DsCardContent,
  DsCardDescription,
  DsCardFooter,
  DsCardHeader,
  DsCardTitle,
  DsCheckbox,
  DsInput,
  DsMenu,
  DsMenuItem,
  DsMenuSeparator,
  DsMenuTrigger,
  DsModal,
  DsOption,
  DsPagination,
  DsProgress,
  DsRadio,
  DsRadioGroup,
  DsSelect,
  DsSkeleton,
  DsSlider,
  DsSpinner,
  DsSwitch,
  DsTab,
  DsTabs,
  DsTextarea,
  DsToastService,
  DsTooltip,
} from '@romanmartinidev/components';
import { DsBreadcrumbsRouter } from '../../router/src/public-api';

// Verificación SSR del kit (components-package § Compatibilidad con
// server-side rendering): una página que instancia TODOS los componentes
// públicos se renderiza con la plataforma server real. Corre en environment
// node a propósito — en jsdom `document` global existe y un acceso sin guarda
// pasaría en verde; acá crashea de verdad, que es lo que el gate tiene que
// medir. Cobertura anclada al filesystem, como axe-coverage y public-surface:
// una lista a mano se desactualiza justo cuando entra el componente nuevo.

const LIB_DIR = ['src/lib', 'packages/components/src/lib'].find((p) => existsSync(p));

/**
 * Directorios de `src/lib/` que el template no instancia por selector de
 * elemento. Cada entrada declara cómo se ejercita en su lugar (o por qué no).
 */
const FUERA_DEL_TEMPLATE: Record<string, { marcador?: string; motivo: string }> = {
  field: {
    motivo:
      'clase base abstracta (DsFieldBase): no se renderiza sola, entra al render vía input, textarea, select, checkbox, radio y switch',
  },
  tooltip: {
    marcador: 'dsTooltip',
    motivo: 'directiva de atributo: se aplica sobre un botón del template',
  },
  toast: {
    motivo:
      'service: se ejercita con DsToastService.show() en el constructor del kitchen-sink, durante el render server; la semántica no-op la cubre toast.spec.ts',
  },
};

const KITCHEN_SINK_TEMPLATE = `
  <ds-accordion>
    <ds-accordion-item>Contenido del panel</ds-accordion-item>
  </ds-accordion>
  <ds-avatar name="Ada Lovelace" />
  <ds-avatar-group>
    <ds-avatar name="Grace Hopper" />
    <ds-avatar name="Margaret Hamilton" />
  </ds-avatar-group>
  <ds-badge>Nuevo</ds-badge>
  <ds-breadcrumbs>
    <ds-breadcrumb-item><a href="/">Inicio</a></ds-breadcrumb-item>
    <ds-breadcrumb-item><a href="/kit">Kit</a></ds-breadcrumb-item>
  </ds-breadcrumbs>
  <ds-breadcrumbs-router />
  <ds-button>Acción</ds-button>
  <ds-card>
    <ds-card-header>
      <ds-card-title>Título</ds-card-title>
      <ds-card-description>Descripción</ds-card-description>
    </ds-card-header>
    <ds-card-content>Contenido</ds-card-content>
    <ds-card-footer>Pie</ds-card-footer>
  </ds-card>
  <ds-checkbox>Acepto los términos</ds-checkbox>
  <ds-input label="Nombre" />
  <button [dsMenuTriggerFor]="menu">Abrir menú</button>
  <ds-menu #menu>
    <ds-menu-item>Primera</ds-menu-item>
    <ds-menu-separator />
    <ds-menu-item>Segunda</ds-menu-item>
  </ds-menu>
  <ds-modal [open]="true" heading="Modal abierto en server">Cuerpo del modal</ds-modal>
  <ds-pagination [totalPages]="5" />
  <ds-progress />
  <ds-radio-group>
    <ds-radio [value]="'a'">Opción A</ds-radio>
    <ds-radio [value]="'b'">Opción B</ds-radio>
  </ds-radio-group>
  <ds-select label="País">
    <ds-option [value]="'ar'">Argentina</ds-option>
    <ds-option [value]="'uy'">Uruguay</ds-option>
  </ds-select>
  <ds-skeleton />
  <ds-slider />
  <ds-spinner />
  <ds-switch>Notificaciones</ds-switch>
  <ds-tabs>
    <ds-tab value="uno" label="Uno">Primer tab</ds-tab>
    <ds-tab value="dos" label="Dos">Segundo tab</ds-tab>
  </ds-tabs>
  <ds-textarea label="Comentarios" />
  <button dsTooltip="Ayuda contextual">?</button>
`;

@Component({
  selector: 'ssr-kitchen-sink',
  standalone: true,
  template: KITCHEN_SINK_TEMPLATE,
  imports: [
    DsAccordion,
    DsAccordionItem,
    DsAvatar,
    DsAvatarGroup,
    DsBadge,
    DsBreadcrumbItem,
    DsBreadcrumbs,
    DsBreadcrumbsRouter,
    DsButton,
    DsCard,
    DsCardContent,
    DsCardDescription,
    DsCardFooter,
    DsCardHeader,
    DsCardTitle,
    DsCheckbox,
    DsInput,
    DsMenu,
    DsMenuItem,
    DsMenuSeparator,
    DsMenuTrigger,
    DsModal,
    DsOption,
    DsPagination,
    DsProgress,
    DsRadio,
    DsRadioGroup,
    DsSelect,
    DsSkeleton,
    DsSlider,
    DsSpinner,
    DsSwitch,
    DsTab,
    DsTabs,
    DsTextarea,
    DsTooltip,
  ],
})
class SsrKitchenSink {
  constructor() {
    // El escenario de component-toast: show() invocado durante el render
    // server tiene que ser un no-op seguro.
    inject(DsToastService).show({ message: 'Render en server', variant: 'info' });
  }
}

async function renderKitchenSink(): Promise<string> {
  return renderApplication(
    () =>
      bootstrapApplication(SsrKitchenSink, {
        providers: [provideZonelessChangeDetection(), provideRouter([])],
      }),
    {
      document:
        '<html><head><title>ssr</title></head><body><ssr-kitchen-sink></ssr-kitchen-sink></body></html>',
    },
  );
}

// Selectores de elemento instanciados por el template (fuente de la aserción
// sobre el HTML emitido).
const SELECTORES_DEL_TEMPLATE = [...new Set(KITCHEN_SINK_TEMPLATE.match(/<ds-[a-z-]+/g) ?? [])].map(
  (tag) => tag.slice(1),
);

describe('compatibilidad SSR del kit', () => {
  it('la página kitchen-sink se renderiza en server sin excepción', async () => {
    const html = await renderKitchenSink();

    expect(SELECTORES_DEL_TEMPLATE.length).toBeGreaterThan(20);
    for (const selector of SELECTORES_DEL_TEMPLATE) {
      expect(html, `el HTML server no contiene <${selector}>`).toContain(`<${selector}`);
    }
  });

  it('el server render no deja rastro de scroll lock en el body', async () => {
    const html = await renderKitchenSink();
    const bodyTag = html.match(/<body[^>]*>/)?.[0] ?? '';

    // El modal está abierto en el template: en server no debe lockear scroll.
    expect(bodyTag).not.toContain('overflow');
  });

  it('el toast disparado en server no se serializa', async () => {
    const html = await renderKitchenSink();

    expect(html).not.toContain('ds-toast-container');
  });

  it('todo componente del kit está en el kitchen-sink o declara cómo se ejercita', () => {
    expect(LIB_DIR).toBeDefined();

    const dirs = readdirSync(LIB_DIR as string, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    expect(dirs.length).toBeGreaterThan(20);

    const sinCobertura = dirs.filter((dir) => {
      const fuera = FUERA_DEL_TEMPLATE[dir];
      if (fuera) {
        return fuera.marcador ? !KITCHEN_SINK_TEMPLATE.includes(fuera.marcador) : false;
      }
      return !KITCHEN_SINK_TEMPLATE.includes(`<ds-${dir}`);
    });

    expect(
      sinCobertura,
      `Estos componentes no están en el kitchen-sink SSR: ${sinCobertura.join(', ')}. ` +
        `Agregalos al template, o declaralos en FUERA_DEL_TEMPLATE con cómo se ejercitan.`,
    ).toEqual([]);
  });

  it('cada declaración fuera del template corresponde a un directorio que existe', () => {
    const huerfanas = Object.keys(FUERA_DEL_TEMPLATE).filter(
      (dir) => !existsSync(`${LIB_DIR as string}/${dir}`),
    );

    expect(huerfanas, 'Declaraciones que ya no corresponden a ningún directorio').toEqual([]);
  });
});
