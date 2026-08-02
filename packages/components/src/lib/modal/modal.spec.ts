import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DsModal } from './modal';
import { expectNoAxeViolations } from '../../testing/axe';
import { readComponentCss, readPublicApi } from '../../testing/css';

@Component({
  standalone: true,
  imports: [DsModal],
  template: `
    <ds-modal
      [(open)]="open"
      [size]="size()"
      [heading]="heading()"
      [closeLabel]="closeLabel()"
      [closeOnEscape]="closeOnEscape()"
      [closeOnOverlay]="closeOnOverlay()"
    >
      <p class="body-content">Contenido del modal</p>
      <div ds-modal-footer>
        <button type="button" class="footer-action">Aceptar</button>
      </div>
    </ds-modal>
  `,
})
class Host {
  readonly open = signal(false);
  readonly size = signal<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly heading = signal('');
  readonly closeLabel = signal('Cerrar');
  readonly closeOnEscape = signal(true);
  readonly closeOnOverlay = signal(true);
}

describe('DsModal', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const dialog = (): HTMLDialogElement =>
    fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cerrar lo que haya quedado abierto para que el scroll lock compartido
    // (contador de módulo) no contamine el siguiente test.
    host.open.set(false);
    fixture.detectChanges();
    fixture.destroy();
  });

  it('opens and closes via the two-way model', () => {
    expect(dialog().open).toBe(false);

    host.open.set(true);
    fixture.detectChanges();
    expect(dialog().open).toBe(true);

    host.open.set(false);
    fixture.detectChanges();
    expect(dialog().open).toBe(false);
  });

  it('closes on ESC (cancel event) and syncs the model', () => {
    host.open.set(true);
    fixture.detectChanges();

    dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(dialog().open).toBe(false);
  });

  it('stays open on ESC when closeOnEscape=false', () => {
    host.closeOnEscape.set(false);
    host.open.set(true);
    fixture.detectChanges();

    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog().dispatchEvent(cancelEvent);
    fixture.detectChanges();

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
    expect(dialog().open).toBe(true);
  });

  it('closes on backdrop click and syncs the model', () => {
    host.open.set(true);
    fixture.detectChanges();

    // Un click en el backdrop llega con target === <dialog>
    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
  });

  it('does not close on backdrop click when closeOnOverlay=false', () => {
    host.closeOnOverlay.set(false);
    host.open.set(true);
    fixture.detectChanges();

    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(true);
  });

  it('does not close when clicking inside the content', () => {
    host.open.set(true);
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.body-content') as HTMLElement;
    content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(true);
  });

  it('renders the close button per ADR-012 and closes on click', () => {
    host.closeLabel.set('Cerrar diálogo');
    host.open.set(true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.ds-modal__close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Cerrar diálogo');

    const icon = closeBtn.querySelector('svg');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');

    closeBtn.click();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });

  it('links the heading via aria-labelledby', () => {
    host.heading.set('Confirmar acción');
    host.open.set(true);
    fixture.detectChanges();

    const h2 = fixture.nativeElement.querySelector('.ds-modal__heading') as HTMLHeadingElement;
    expect(h2).toBeTruthy();
    expect(h2.textContent?.trim()).toBe('Confirmar acción');
    expect(h2.id).toBeTruthy();
    expect(dialog().getAttribute('aria-labelledby')).toBe(h2.id);
  });

  it('omits aria-labelledby and heading element without a heading', () => {
    host.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ds-modal__heading')).toBeNull();
    expect(dialog().getAttribute('aria-labelledby')).toBeNull();
  });

  it('applies the size via data attribute for token-driven widths', () => {
    for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
      host.size.set(size);
      fixture.detectChanges();
      expect(dialog().getAttribute('data-size')).toBe(size);
    }
  });

  it('projects body and footer content', () => {
    host.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ds-modal__body .body-content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ds-modal__footer .footer-action')).toBeTruthy();
  });

  it('locks body scroll while open and restores it on close', () => {
    document.body.style.overflow = 'scroll';

    host.open.set(true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    host.open.set(false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('scroll');

    document.body.style.overflow = '';
  });

  it('restores body scroll when destroyed while open', () => {
    document.body.style.overflow = 'auto';

    host.open.set(true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.destroy();
    expect(document.body.style.overflow).toBe('auto');

    document.body.style.overflow = '';
  });

  it('with two open modals, scroll unlocks only when the last one closes', async () => {
    document.body.style.overflow = '';

    host.open.set(true);
    fixture.detectChanges();

    const secondFixture = TestBed.createComponent(Host);
    secondFixture.detectChanges();
    secondFixture.componentInstance.open.set(true);
    secondFixture.detectChanges();

    expect(document.body.style.overflow).toBe('hidden');

    host.open.set(false);
    fixture.detectChanges();
    // El primero cerró, pero el segundo sigue abierto → el lock se mantiene
    expect(document.body.style.overflow).toBe('hidden');

    secondFixture.componentInstance.open.set(false);
    secondFixture.detectChanges();
    expect(document.body.style.overflow).toBe('');

    secondFixture.destroy();
  });
});

// Fase 1 de HU-028 (aaa-042). DsModal es el caso que la medición marcó como NO
// auditable en jsdom: un `<dialog open>` en el árbol rompe 11 reglas de axe
// (`checkVisibility` y `getAnimations` son undefined en jsdom 27), y el motor
// deja de detectar violaciones que existen. Se declara la exclusión explícita
// en vez de dejar un test verde que no prueba nada — la cobertura real de este
// componente llega con la fase 2 (Storybook test-runner, Parte L).
describe('a11y (axe)', () => {
  it('el modal abierto queda declarado como no auditable en jsdom', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.heading.set('Confirmar');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Sin violaciones detectables; la corrida NO es concluyente y eso queda
    // dicho acá, no escondido en la configuración del helper.
    await expectNoAxeViolations(fixture.nativeElement, {
      allowInconclusive:
        'un <dialog open> rompe las reglas de axe en jsdom; la auditoría real del modal es de la fase 2',
    });
  });
});

@Component({
  standalone: true,
  imports: [DsModal],
  template: `
    <p id="titulo-externo">Título propio del consumidor</p>
    <ds-modal
      [(open)]="open"
      [heading]="heading()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"
    >
      <p>Contenido</p>
    </ds-modal>
  `,
})
class NameHost {
  readonly open = signal(true);
  readonly heading = signal('');
  readonly ariaLabel = signal<string | null>(null);
  readonly ariaLabelledby = signal<string | null>(null);
}

// Scenario: el diálogo siempre tiene nombre accesible (components-08). Sin
// heading, `labelledBy` daba null y el <dialog> quedaba sin nombre — un modal
// de confirmación con contenido proyectado, que es el caso más común del kit,
// se anunciaba solo como "diálogo".
describe('DsModal — nombre accesible', () => {
  let fixture: ComponentFixture<NameHost>;
  let host: NameHost;

  const dialog = (): HTMLDialogElement =>
    fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  const modalHost = (): HTMLElement =>
    fixture.nativeElement.querySelector('ds-modal') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NameHost] }).compileComponents();
    fixture = TestBed.createComponent(NameHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    host.open.set(false);
    fixture.detectChanges();
    fixture.destroy();
  });

  it('con heading, el dialog lo referencia por aria-labelledby', () => {
    host.heading.set('Confirmar acción');
    fixture.detectChanges();
    const headingEl = fixture.nativeElement.querySelector('.ds-modal__heading') as HTMLElement;
    expect(dialog().getAttribute('aria-labelledby')).toBe(headingEl.id);
    expect(dialog().hasAttribute('aria-label')).toBe(false);
  });

  it('sin heading, el aria-label del consumidor nombra al dialog', () => {
    host.ariaLabel.set('Confirmar borrado');
    fixture.detectChanges();
    expect(dialog().getAttribute('aria-label')).toBe('Confirmar borrado');
    expect(dialog().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('el nombre no queda declarado sobre el host, donde sería inerte y prohibido', () => {
    host.ariaLabel.set('Confirmar borrado');
    fixture.detectChanges();
    expect(modalHost().hasAttribute('aria-label')).toBe(false);
    expect(modalHost().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('un aria-labelledby explícito gana sobre el heading y excluye al aria-label', () => {
    host.heading.set('Título del componente');
    host.ariaLabelledby.set('titulo-externo');
    host.ariaLabel.set('ignorado');
    fixture.detectChanges();
    expect(dialog().getAttribute('aria-labelledby')).toBe('titulo-externo');
    expect(dialog().hasAttribute('aria-label')).toBe(false);
  });

  it('sin ninguna de las tres vías no inventa un nombre', () => {
    // Un nombre por defecto ("Diálogo") apagaría el gate de axe sin resolver el
    // problema real: el consumidor que no nombra su modal debe verlo.
    expect(dialog().hasAttribute('aria-label')).toBe(false);
    expect(dialog().hasAttribute('aria-labelledby')).toBe(false);
  });
});

// Scenarios de la spec `component-modal` que no tenían test (testing-05, aaa-042).
// Criterio de aaa-023: jsdom no computa estilos, así que el contrato de tokens se
// verifica sobre el CSS fuente.
describe('DsModal — contrato de tokens y superficie pública', () => {
  const css = readComponentCss('modal');

  it('deriva el ancho de cada size de los tokens component.modal.size', () => {
    for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
      expect(css).toContain(`--ds-component-modal-size-${size}`);
    }
  });

  it('no hardcodea anchos ni hex codes en su CSS fuente', () => {
    expect(css.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    // Un `width`/`max-width` en px sería un ancho hardcodeado; los tamaños salen
    // de los tokens de arriba.
    expect(css).not.toMatch(/\b(?:max-)?width:\s*\d+px/);
    // El ancho de borde era el último valor dimensional hardcodeado del archivo
    // (components-12): un theme que engrose bordes no llegaba al modal.
    expect(css).not.toMatch(/(?<![-\w])[1-9]\d*px/);
    expect(css).toContain('border: var(--ds-dimension-1)');
  });

  it('pinta el backdrop con los tokens de overlay', () => {
    // Vía el token de componente, que resuelve a {semantic.color.bg.overlay}: es
    // la jerarquía que exige `design-tokens-package` (un componente consume
    // `component.*`, no `semantic.*` directo). El scenario de la spec decía
    // `--ds-semantic-color-bg-overlay`; se corrigió en aaa-042 al escribir este
    // test — la implementación estaba bien y la spec la describía mal.
    expect(css).toContain('--ds-component-modal-overlay-bg');
    expect(css).toContain('--ds-semantic-effect-blur-overlay');
  });

  it('anima entrada y salida con los tokens de motion de overlay', () => {
    expect(css).toContain('--ds-semantic-motion-transition-overlay-enter');
    expect(css).toContain('--ds-semantic-motion-transition-overlay-exit');
  });

  it('desactiva las transiciones bajo prefers-reduced-motion', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('se exporta desde public-api.ts', () => {
    expect(readPublicApi()).toContain(`export * from './lib/modal';`);
  });
});
