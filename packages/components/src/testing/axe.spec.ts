import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from './axe';

// El helper es la pieza de la que depende todo el gate de a11y: se verifica en
// los cuatro sentidos como test permanente, no con una inyección manual que se
// revierte. Si alguien relaja una de las condiciones, esta suite lo detecta.

let root: HTMLElement | null = null;

function montar(html: string): HTMLElement {
  root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  root?.remove();
  root = null;
});

describe('expectNoAxeViolations', () => {
  it('pasa sobre un render accesible', async () => {
    const el = montar(`<button type="button">Guardar</button>`);

    await expect(expectNoAxeViolations(el)).resolves.toBeUndefined();
  });

  it('falla ante una violación AA nombrando la regla, el impacto y el nodo', async () => {
    const el = montar(`<button type="button"></button>`);

    await expect(expectNoAxeViolations(el)).rejects.toThrow(/button-name/);
    await expect(expectNoAxeViolations(el)).rejects.toThrow(/critical/);
    await expect(expectNoAxeViolations(el)).rejects.toThrow(/<button type="button">/);
  });

  it('falla cuando axe no evaluó nada, en vez de contarlo como éxito', async () => {
    // Un [popover] cerrado es invisible para axe: 0 violaciones y 0 passes.
    // Sin la condición de "corrida concluyente" esto pasaría en verde.
    const el = montar(`<div popover="auto"><button type="button"></button></div>`);

    await expect(expectNoAxeViolations(el)).rejects.toThrow(/no produjo un resultado concluyente/);
    await expect(expectNoAxeViolations(el)).rejects.toThrow(/no evaluó ninguna regla con éxito/);
  });

  it('falla cuando un <dialog open> rompe el motor, en vez de dar verde falso', async () => {
    // El caso que la medición del 2026-07-31 expuso: con un <dialog open> axe
    // deja de detectar violaciones REALES (acá hay un button sin nombre y una
    // imagen sin alt) y las degrada a incomplete por error interno.
    const el = montar(`<dialog open><button type="button"></button><img src="x.png"></dialog>`);

    await expect(expectNoAxeViolations(el)).rejects.toThrow(/error interno del motor/);
  });

  it('acepta una corrida no concluyente solo si se declara el motivo', async () => {
    const el = montar(`<div popover="auto"><button type="button"></button></div>`);

    await expect(
      expectNoAxeViolations(el, {
        allowInconclusive: 'contenido de popover: no auditable en jsdom',
      }),
    ).resolves.toBeUndefined();
  });

  it('una violación real falla aunque se haya declarado allowInconclusive', async () => {
    // allowInconclusive relaja la exigencia de concluyencia, NO la de violaciones:
    // si axe llegó a detectar algo, el gate falla igual.
    const el = montar(`<button type="button"></button>`);

    await expect(
      expectNoAxeViolations(el, { allowInconclusive: 'motivo cualquiera' }),
    ).rejects.toThrow(/button-name/);
  });
});
