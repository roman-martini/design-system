import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as publicApi from '../../public-api';
import { DsToastService, provideDsToasts } from './toast';
import { expectNoAxeViolations } from '../../testing/axe';

// jsdom no resuelve la CSS var --ds-component-toast-duration → aplica el
// fallback documentado del item (5000ms), que coincide con el token.
const DEFAULT_DURATION = 5000;

function containerEl(): HTMLElement | null {
  return document.querySelector('ds-toast-container');
}

function itemEls(): HTMLElement[] {
  return Array.from(document.querySelectorAll('ds-toast-container ds-toast-item'));
}

// Las regiones viven fuera del contenedor (que es un popover: cerrado computa
// display:none y queda fuera del árbol de accesibilidad).
function politeRegion(): HTMLElement | null {
  return document.querySelector('body > div [aria-live="polite"]');
}

function assertiveRegion(): HTMLElement | null {
  return document.querySelector('body > div [aria-live="assertive"]');
}

// Queries por accesible name (rol button + aria-label / texto visible), no por clase CSS.
function closeButton(item: HTMLElement, label = 'Cerrar'): HTMLButtonElement | null {
  return item.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}

function actionButton(item: HTMLElement, label: string): HTMLButtonElement | null {
  return (
    Array.from(item.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === label,
    ) ?? null
  );
}

describe('DsToastService', () => {
  let service: DsToastService;
  let appRef: ApplicationRef;

  const tick = (): void => appRef.tick();

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DsToastService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('show renderiza el toast y devuelve una referencia con dismiss (CA-008.1)', () => {
    const ref = service.show({ message: 'Guardado', variant: 'success' });
    tick();
    expect(itemEls()).toHaveLength(1);
    expect(itemEls()[0].textContent).toContain('Guardado');

    ref.dismiss();
    tick();
    expect(itemEls()).toHaveLength(0);
  });

  it('los atajos setean la variante (CA-008.1)', () => {
    service.success('ok');
    service.danger('boom');
    tick();
    const variants = itemEls().map((el) => el.getAttribute('data-variant'));
    expect(variants).toEqual(['success', 'danger']);
  });

  it('sin provider la posición es bottom-right (CA-008.2)', () => {
    service.info('hola');
    tick();
    expect(containerEl()?.getAttribute('data-position')).toBe('bottom-right');
  });

  it('success/info/warning se auto-cierran tras la duración default (CA-008.3)', () => {
    service.success('bye');
    tick();
    expect(itemEls()).toHaveLength(1);

    vi.advanceTimersByTime(DEFAULT_DURATION - 1);
    tick();
    expect(itemEls()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    tick();
    expect(itemEls()).toHaveLength(0);
  });

  it('duration custom ajusta el timer y duration 0 lo hace persistente (CA-008.3)', () => {
    service.info('rapido', { duration: 1000 });
    service.warning('eterno', { duration: 0 });
    tick();
    expect(itemEls()).toHaveLength(2);

    vi.advanceTimersByTime(1000);
    tick();
    expect(itemEls()).toHaveLength(1);
    expect(itemEls()[0].textContent).toContain('eterno');

    vi.advanceTimersByTime(60_000);
    tick();
    expect(itemEls()).toHaveLength(1);
  });

  it('el hover pausa el timer y al salir reanuda con el tiempo restante (CA-008.3)', () => {
    service.success('pausable');
    tick();
    const item = itemEls()[0];

    vi.advanceTimersByTime(DEFAULT_DURATION - 500);
    item.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(60_000);
    tick();
    expect(itemEls()).toHaveLength(1);

    item.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(499);
    tick();
    expect(itemEls()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    tick();
    expect(itemEls()).toHaveLength(0);
  });

  it('el foco interno pausa el timer aunque el mouse salga (CA-008.3)', () => {
    service.success('con foco');
    tick();
    const item = itemEls()[0];

    item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    item.dispatchEvent(new Event('mouseenter'));
    item.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(60_000);
    tick();
    expect(itemEls()).toHaveLength(1);

    item.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    vi.advanceTimersByTime(DEFAULT_DURATION);
    tick();
    expect(itemEls()).toHaveLength(0);
  });

  it('danger no se auto-cierra y siempre muestra el botón de cierre (CA-008.3)', () => {
    service.danger('error grave');
    tick();
    vi.advanceTimersByTime(600_000);
    tick();
    expect(itemEls()).toHaveLength(1);

    const close = closeButton(itemEls()[0]);
    expect(close).not.toBeNull();
    close?.click();
    tick();
    expect(itemEls()).toHaveLength(0);
  });

  it('la acción ejecuta el callback, cierra el toast y no roba el foco al aparecer (CA-008.4)', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    const callback = vi.fn();
    service.info('accionable', { action: { label: 'Deshacer', callback } });
    tick();
    expect(document.activeElement).toBe(outside);

    const action = actionButton(itemEls()[0], 'Deshacer');
    expect(action).not.toBeNull();
    action?.click();
    tick();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(itemEls()).toHaveLength(0);
    outside.remove();
  });

  // Scenario: la región de anuncios preexiste al primer toast (CA-008.5). Una
  // live region insertada junto con su contenido frecuentemente no se anuncia:
  // el primer toast de la sesión —el más importante— se perdía.
  it('las regiones de anuncio existen antes del primer toast', () => {
    expect(itemEls()).toHaveLength(0);
    expect(politeRegion()).not.toBeNull();
    expect(assertiveRegion()).not.toBeNull();
  });

  it('las regiones son dos, con politeness fija cada una', () => {
    // Dos estáticas en vez de una mutable: varios lectores cachean la
    // politeness al construir el árbol (design §2).
    expect(politeRegion()!.getAttribute('role')).toBe('status');
    expect(assertiveRegion()!.getAttribute('role')).toBe('alert');
  });

  it('el mensaje se anuncia con la urgencia de su variante (CA-008.5)', () => {
    service.info('estado');
    tick();
    expect(politeRegion()!.textContent).toBe('estado');
    expect(assertiveRegion()!.textContent).toBe('');

    service.danger('alerta');
    tick();
    expect(assertiveRegion()!.textContent).toBe('alerta');
  });

  it('el elemento visual del toast no declara rol de live region (evita el anuncio doble)', () => {
    service.info('estado');
    service.danger('alerta');
    tick();
    const [status, alert] = itemEls();
    expect(status.hasAttribute('role')).toBe(false);
    expect(alert.hasAttribute('role')).toBe(false);
    // El cierre se resuelve por accesible name: existe un button con el aria-label default.
    expect(closeButton(status)).not.toBeNull();
  });

  it('un mensaje repetido pasa por vacío antes de reescribirse', () => {
    service.info('mismo mensaje');
    tick();

    // takeRecords() entrega las mutaciones pendientes de forma síncrona; el
    // callback del observer es asíncrono y no llegaría dentro del test.
    const observer = new MutationObserver(() => {});
    observer.observe(politeRegion()!, { childList: true, characterData: true, subtree: true });

    service.info('mismo mensaje');
    tick();
    const records = observer.takeRecords();
    observer.disconnect();

    // El vaciado explícito es lo que hace que un mensaje idéntico vuelva a
    // anunciarse: varios lectores comparan el texto y callan si no cambió.
    expect(records.length).toBeGreaterThanOrEqual(2);
    expect(records.some((record) => record.removedNodes.length > 0)).toBe(true);
    expect(politeRegion()!.textContent).toBe('mismo mensaje');
  });

  it('los iconos de variante y del cierre son decorativos (ADR-012)', () => {
    service.warning('con icono');
    tick();
    const svgs = itemEls()[0].querySelectorAll('svg');
    expect(svgs.length).toBe(2); // icono de variante + X
    for (const svg of Array.from(svgs)) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('el stack apila en orden y reacomoda al cerrar uno del medio (CA-008.6)', () => {
    service.info('uno');
    const second = service.info('dos');
    service.info('tres');
    tick();
    expect(itemEls().map((el) => el.textContent?.trim())).toEqual(['uno', 'dos', 'tres']);

    second.dismiss();
    tick();
    expect(itemEls().map((el) => el.textContent?.trim())).toEqual(['uno', 'tres']);
  });

  it('el contenedor es popover manual: abre con el primer toast y cierra al vaciarse (CA-008.6)', () => {
    const ref = service.success('primero');
    tick();
    const container = containerEl();
    expect(container?.getAttribute('popover')).toBe('manual');
    // Polyfill de jsdom (test-setup): showPopover marca data-popover-open.
    expect(container?.hasAttribute('data-popover-open')).toBe(true);

    ref.dismiss();
    tick();
    expect(container?.hasAttribute('data-popover-open')).toBe(false);
  });

  it('el contenedor y el item NO son parte de la API pública', () => {
    const exported = Object.keys(publicApi).join(' ');
    expect(exported).toContain('DsToastService');
    expect(exported).toContain('provideDsToasts');
    expect(exported).not.toContain('DsToastContainer');
    expect(exported).not.toContain('DsToastItem');
  });
});

describe('DsToastService con provideDsToasts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideDsToasts({ position: 'top-right', dismissLabel: 'Dismiss' })],
    });
  });

  it('la posición global y el dismissLabel salen del provider (CA-008.2)', () => {
    const service = TestBed.inject(DsToastService);
    service.info('configurado');
    TestBed.inject(ApplicationRef).tick();

    expect(containerEl()?.getAttribute('data-position')).toBe('top-right');
    expect(closeButton(itemEls()[0], 'Dismiss')).not.toBeNull();
  });
});

// Fase 1 de HU-028 (aaa-042): axe sobre el toast renderizado. El contenedor se
// monta en document.body (no en un fixture), así que se audita ahí. Con timers
// reales: axe.run es asíncrono y los fake timers del bloque de arriba lo colgarían.
describe('a11y (axe)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('un toast con acción y cierre no tiene violaciones WCAG A/AA', async () => {
    const service = TestBed.inject(DsToastService);
    const appRef = TestBed.inject(ApplicationRef);

    service.show({
      message: 'Cambios guardados',
      variant: 'success',
      action: { label: 'Deshacer', callback: () => undefined },
    });
    appRef.tick();

    const container = containerEl();
    expect(container).not.toBeNull();

    await expectNoAxeViolations(container as HTMLElement);
  });
});
