import { describe, expect, it } from 'vitest';

import zIndexJson from '../src/semantic/z-index.json' with { type: 'json' };

// El tipo inferido del JSON tiene claves literales, y los tests indexan con
// variables `string`. La anotación habilita ese acceso sin perder la forma
// del token (`{ value }`), que es lo que las aserciones verifican.
const tokens: Record<string, { value: string }> = zIndexJson.semantic['z-index'];

describe('semantic z-index tokens', () => {
  const expectedLevels = [
    'hide',
    'auto',
    'base',
    'docked',
    'dropdown',
    'sticky',
    'banner',
    'overlay',
    'modal',
    'popover',
    'skiplink',
    'toast',
    'tooltip',
  ];

  it('declares the 13 expected levels in the documented order', () => {
    expect(Object.keys(tokens)).toEqual(expectedLevels);
  });

  it('hide is a negative integer and base is 0', () => {
    expect(parseInt(tokens.hide.value, 10)).toBeLessThan(0);
    expect(tokens.base.value).toBe('0');
  });

  it('auto is the literal string "auto"', () => {
    expect(tokens.auto.value).toBe('auto');
  });

  it('overlay levels (dropdown onwards) are all >= 1000', () => {
    const overlayLevels = [
      'dropdown',
      'sticky',
      'banner',
      'overlay',
      'modal',
      'popover',
      'skiplink',
      'toast',
      'tooltip',
    ];
    for (const level of overlayLevels) {
      const value = parseInt(tokens[level].value, 10);
      expect(value, `level ${level} should be >= 1000`).toBeGreaterThanOrEqual(1000);
    }
  });

  it('consecutive overlay levels increase by at least 10 (room for intercalation)', () => {
    const overlayLevels = [
      'dropdown',
      'sticky',
      'banner',
      'overlay',
      'modal',
      'popover',
      'skiplink',
      'toast',
      'tooltip',
    ];
    for (let i = 1; i < overlayLevels.length; i++) {
      const current = parseInt(tokens[overlayLevels[i]].value, 10);
      const previous = parseInt(tokens[overlayLevels[i - 1]].value, 10);
      expect(
        current - previous,
        `${overlayLevels[i]} - ${overlayLevels[i - 1]} should be >= 10`,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it('all numeric levels (excluding auto) are strictly ascending', () => {
    const numericLevels = expectedLevels.filter((name) => name !== 'auto');
    const numericValues = numericLevels.map((name) => parseInt(tokens[name].value, 10));
    for (let i = 1; i < numericValues.length; i++) {
      expect(
        numericValues[i],
        `${numericLevels[i]} (${numericValues[i]}) should be > ${numericLevels[i - 1]} (${numericValues[i - 1]})`,
      ).toBeGreaterThan(numericValues[i - 1]);
    }
  });
});
