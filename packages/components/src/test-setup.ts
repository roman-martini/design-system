import '@analogjs/vitest-angular/setup-zone';

import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// Idempotente: en runners de CI con pocos cores, varios archivos de test
// comparten worker y el setup corre más de una vez ("Cannot set base
// providers because it has already been called").
try {
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
} catch {
  // Ya inicializado por otro archivo de test en el mismo worker.
}

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
