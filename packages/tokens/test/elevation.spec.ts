import { describe, expect, it } from 'vitest';

import shadowPrimitives from '../src/primitives/shadow.json' with { type: 'json' };
import shadowSemantic from '../src/semantic/shadow.json' with { type: 'json' };
import darkTheme from '../src/theme/dark.json' with { type: 'json' };

/**
 * Elevación en dark — D-025, aaa-052.
 *
 * El theme dark overridea `semantic.shadow.*` con mayor opacidad para que la sombra
 * siga siendo un canal de separación visible sobre fondo oscuro. Los overrides son
 * literales (un theme no puede introducir primitivas), y el riesgo de esa duplicación
 * es la deriva de geometría: que alguien cambie offsets/blur/spread en la primitiva y
 * dark quede con la forma vieja. Este test la vuelve imposible de ignorar:
 *
 * - PARIDAD: cada override de dark conserva la geometría exacta del scope default.
 * - OPACIDAD: cada capa del override es estrictamente más opaca que la del default.
 */

type ShadowLayer = { geometry: string; alpha: number };

/** Divide un box-shadow por comas de primer nivel (las de rgba() no cuentan). */
const splitLayers = (value: string): string[] => {
  const layers: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  layers.push(current.trim());
  return layers;
};

const parseLayer = (layer: string): ShadowLayer => {
  const match = layer.match(/^(.*)rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  if (!match) throw new Error(`capa de sombra no parseable: ${layer}`);
  return {
    geometry: `${match[1].trim()} rgb(${match[2]},${match[3]},${match[4]})`,
    alpha: parseFloat(match[5]),
  };
};

const parse = (value: string): ShadowLayer[] => splitLayers(value).map(parseLayer);

/** Resuelve el valor default de un semantic.shadow.* siguiendo su referencia a la primitiva. */
const resolveDefault = (key: string): string => {
  const semantic = (shadowSemantic.semantic.shadow as Record<string, { value: string }>)[key];
  const ref = semantic.value.match(/^\{shadow\.([^}]+)\}$/);
  if (!ref) return semantic.value;
  return (shadowPrimitives.shadow as Record<string, { value: string }>)[ref[1]].value;
};

const darkShadow =
  (darkTheme.semantic as { shadow?: Record<string, { value: string }> }).shadow ?? {};
const overridden = Object.keys(darkShadow);

describe('elevación en dark (D-025)', () => {
  it('dark overridea las sombras de elevación (card, card-hover, dropdown, modal, toast)', () => {
    expect(overridden.sort()).toEqual(['card', 'card-hover', 'dropdown', 'modal', 'toast']);
  });

  it('input y focus quedan fuera: no son elevación', () => {
    expect(darkShadow).not.toHaveProperty('input');
    expect(darkShadow).not.toHaveProperty('focus');
  });

  it.each(overridden)('%s: el override de dark conserva la geometría del default', (key) => {
    const base = parse(resolveDefault(key));
    const dark = parse(darkShadow[key].value);
    expect(dark.length, `${key}: cantidad de capas distinta`).toBe(base.length);
    dark.forEach((layer, i) => {
      expect(layer.geometry, `${key} capa ${i}: la geometría difiere del default`).toBe(
        base[i].geometry,
      );
    });
  });

  it.each(overridden)(
    '%s: cada capa de dark es estrictamente más opaca que la del default',
    (key) => {
      const base = parse(resolveDefault(key));
      const dark = parse(darkShadow[key].value);
      dark.forEach((layer, i) => {
        expect(
          layer.alpha,
          `${key} capa ${i}: opacidad dark ${layer.alpha} debe superar a la default ${base[i].alpha}`,
        ).toBeGreaterThan(base[i].alpha);
      });
    },
  );
});
