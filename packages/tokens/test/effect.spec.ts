import { describe, expect, it } from 'vitest';

import effectJson from '../src/semantic/effect.json' with { type: 'json' };

describe('semantic effect tokens', () => {
  it('exposes effect.blur.overlay', () => {
    expect(effectJson.semantic.effect.blur).toHaveProperty('overlay');
  });

  it('blur.overlay value ends in "px"', () => {
    const value = effectJson.semantic.effect.blur.overlay.value;
    expect(value).toMatch(/^\d+px$/);
  });
});
