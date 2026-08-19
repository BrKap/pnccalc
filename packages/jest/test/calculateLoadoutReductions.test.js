import { describe, expect, it } from '@jest/globals';
import { calculateLoadoutReductions } from '../../frontend/src/features/calculator/lib/calculateLoadoutReductions.js';
import { builderLoadoutConfig } from '../../frontend/src/features/building/data/builderLoadout.js';
import { researchLoadoutConfig } from '../../frontend/src/features/research/data/researchLoadout.js';

describe('calculateLoadoutReductions', () => {
  it('returns zero reductions for an empty builder loadout', () => {
    expect(calculateLoadoutReductions(builderLoadoutConfig, {})).toEqual({
      resourcePercent: {
        food: 0,
        wood: 0,
        stone: 0,
        iron: 0,
        goldStatue: 0,
        ancientTome: 0,
      },
      resourceStatic: { food: 0, wood: 0, stone: 0, iron: 0 },
      constructionSpeedPercent: 0,
    });
  });

  it('combines builder gear, heroes, and manual construction speed', () => {
    const reductions = calculateLoadoutReductions(builderLoadoutConfig, {
      gear: { sword: '7', scepter: '6' },
      heroes: { william: '5', chloe: '1' },
      speedPercent: 75,
    });

    expect(reductions.resourcePercent).toMatchObject({
      food: 0.4,
      wood: 0.15,
      goldStatue: 0.1,
      ancientTome: 0.05,
    });
    expect(reductions.resourceStatic).toEqual({
      food: 4900000,
      wood: 2500000,
      stone: 1030000,
      iron: 495000,
    });
    expect(reductions.constructionSpeedPercent).toBe(0.75);
  });

  it('activates the full builder set bonus only with all six 7-star pieces', () => {
    const gear = Object.fromEntries(builderLoadoutConfig.gear.map((piece) => [piece.id, '7']));
    const reductions = calculateLoadoutReductions(builderLoadoutConfig, { gear });

    expect(reductions.resourcePercent.goldStatue).toBeCloseTo(0.6);
    expect(reductions.resourcePercent.ancientTome).toBeCloseTo(0.3);

    gear.shoes = '6';
    const incomplete = calculateLoadoutReductions(builderLoadoutConfig, { gear });
    expect(incomplete.resourcePercent.goldStatue).toBeCloseTo(0.3);
  });

  it('combines all research gear and heroes from the supplied notes', () => {
    const gear = Object.fromEntries(researchLoadoutConfig.gear.map((piece) => [piece.id, '7']));
    const reductions = calculateLoadoutReductions(researchLoadoutConfig, {
      gear,
      heroes: { lucia: '5', penny: '5' },
      speedPercent: 120,
    });

    expect(reductions.resourcePercent).toEqual({
      food: 0.3,
      wood: 0.3,
      stone: 0.3,
      iron: 0.3,
      inscription: 0.3,
    });
    expect(reductions.resourceStatic).toEqual({
      food: 8100000,
      wood: 12100000,
      stone: 1000000,
      iron: 350000,
    });
    expect(reductions.researchSpeedPercent).toBe(1.2);
  });
});
