import '@analogjs/vitest-angular/setup-zone';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Cuando Vitest comparte el contexto entre archivos (runners con pocos
// cores), @angular/core/testing queda cacheado y sus hooks de limpieza
// por-test solo se registran para el primer archivo; además el init manual
// corre dos veces sobre el mismo TestBed. setupTestBed() cubre ambos casos:
// inicializa el entorno una sola vez (guard en globalThis) y registra los
// cleanup hooks en cada archivo. zoneless: false porque este setup usa zone.
setupTestBed({ zoneless: false });

// jsdom (27.x) todavía no implementa los métodos de HTMLDialogElement.
// Polyfill mínimo del contrato que DsModal necesita: showModal/close + evento
// `close`. El focus trap y el top layer son de la plataforma (no testeables acá).
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// jsdom (27.x) tampoco implementa la Popover API. Polyfill mínimo del contrato
// que DsSelect necesita: showPopover/hidePopover + evento `toggle` con
// newState. El top layer y el light-dismiss son de la plataforma (no
// testeables acá) — se testea el cableado propio (ADR-013 §6, mismo criterio).
if (typeof HTMLElement !== 'undefined' && !('showPopover' in HTMLElement.prototype)) {
  const dispatchToggle = (el: HTMLElement, oldState: string, newState: string): void => {
    const event = new Event('toggle');
    Object.assign(event, { oldState, newState });
    el.dispatchEvent(event);
  };
  Object.assign(HTMLElement.prototype, {
    showPopover(this: HTMLElement): void {
      if (this.hasAttribute('data-popover-open')) return;
      this.setAttribute('data-popover-open', '');
      dispatchToggle(this, 'closed', 'open');
    },
    hidePopover(this: HTMLElement): void {
      if (!this.hasAttribute('data-popover-open')) return;
      this.removeAttribute('data-popover-open');
      dispatchToggle(this, 'open', 'closed');
    },
  });
}
