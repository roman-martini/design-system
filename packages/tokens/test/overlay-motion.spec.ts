import { describe, expect, it } from 'vitest';

import motionPrimitives from '../src/primitives/motion.json' with { type: 'json' };
import motionJson from '../src/semantic/motion.json' with { type: 'json' };

const transitions = motionJson.semantic.motion.transition;
const { duration, easing } = motionPrimitives.motion;

/**
 * Desde aaa-052 los presets se declaran por COMPOSICIÓN de primitivas
 * (`{motion.duration.*} {motion.easing.*}`), no como literal duplicado. Los tests
 * verifican el valor RESUELTO siguiendo las referencias, y además que ningún preset
 * vuelva a declararse como literal.
 */
const resolve = (declared: string): string =>
  declared.replace(/\{motion\.(duration|easing)\.([^}]+)\}/g, (_, kind: string, key: string) => {
    const table: Record<string, { value: string }> = kind === 'duration' ? duration : easing;
    const entry = table[key];
    if (!entry) throw new Error(`referencia a primitiva inexistente: motion.${kind}.${key}`);
    return entry.value;
  });

const parseDuration = (value: string): number => {
  const match = value.match(/^(\d+)ms/);
  if (!match) {
    throw new Error(`Invalid transition value, expected "<n>ms ..." got: ${value}`);
  }
  return parseInt(match[1], 10);
};

describe('semantic motion overlay transitions', () => {
  it('declares overlay-enter and overlay-exit', () => {
    expect(transitions).toHaveProperty('overlay-enter');
    expect(transitions).toHaveProperty('overlay-exit');
  });

  it('resolved values follow the "<n>ms cubic-bezier(...)" shorthand without explicit property', () => {
    const shorthand = /^\d+ms\s+(cubic-bezier\([^)]+\)|linear)$/;
    expect(resolve(transitions['overlay-enter'].value)).toMatch(shorthand);
    expect(resolve(transitions['overlay-exit'].value)).toMatch(shorthand);
  });

  it('enter duration is greater than or equal to exit duration (UX convention)', () => {
    const enterMs = parseDuration(resolve(transitions['overlay-enter'].value));
    const exitMs = parseDuration(resolve(transitions['overlay-exit'].value));
    expect(enterMs).toBeGreaterThanOrEqual(exitMs);
  });

  it('ningún preset de transition es un literal: todos componen primitivas', () => {
    const composition = /^\{motion\.duration\.[^}]+\}\s+\{motion\.easing\.[^}]+\}$/;
    for (const [name, token] of Object.entries(transitions)) {
      expect(
        token.value,
        `semantic.motion.transition.${name} debe componerse como "{motion.duration.*} {motion.easing.*}"`,
      ).toMatch(composition);
    }
  });
});
