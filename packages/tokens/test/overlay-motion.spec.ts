import { describe, expect, it } from 'vitest';

import motionJson from '../src/semantic/motion.json' with { type: 'json' };

const transitions = motionJson.semantic.motion.transition;

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

  it('values follow the "<n>ms cubic-bezier(...)" shorthand without explicit property', () => {
    const shorthand = /^\d+ms\s+cubic-bezier\([^)]+\)$/;
    expect(transitions['overlay-enter'].value).toMatch(shorthand);
    expect(transitions['overlay-exit'].value).toMatch(shorthand);
  });

  it('enter duration is greater than or equal to exit duration (UX convention)', () => {
    const enterMs = parseDuration(transitions['overlay-enter'].value);
    const exitMs = parseDuration(transitions['overlay-exit'].value);
    expect(enterMs).toBeGreaterThanOrEqual(exitMs);
  });
});
