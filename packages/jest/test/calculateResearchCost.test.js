import { describe, expect, it } from '@jest/globals';
import {
  calculateCategoryTotals,
  calculateResearchCost,
} from '../../frontend/src/features/research/lib/calculateResearchCost.js';

const item = {
  id: 'development:1',
  maxLevel: 3,
  levels: [
    {
      level: 1,
      costs: {
        food: 100,
        wood: 50,
        stone: 0,
        iron: 0,
        ancientTome: 0,
        inscription: 10,
        documentFragment: 0,
      },
      timeSeconds: 60,
      power: 5,
    },
    {
      level: 2,
      costs: {
        food: 200,
        wood: 100,
        stone: 25,
        iron: 0,
        ancientTome: 1,
        inscription: 20,
        documentFragment: 2,
      },
      timeSeconds: 120,
      power: 10,
    },
    {
      level: 3,
      costs: {
        food: 300,
        wood: 150,
        stone: 50,
        iron: 10,
        ancientTome: 2,
        inscription: 30,
        documentFragment: 3,
      },
      timeSeconds: 180,
      power: 15,
    },
  ],
};

describe('calculateResearchCost', () => {
  it('sums costs from current level exclusive to target level inclusive', () => {
    const result = calculateResearchCost(item, 1, 3);

    expect(result.resources.food).toBe(500);
    expect(result.resources.wood).toBe(250);
    expect(result.resources.stone).toBe(75);
    expect(result.resources.ancientTome).toBe(3);
    expect(result.resources.documentFragment).toBe(5);
    expect(result.timeSeconds).toBe(300);
    expect(result.power).toBe(25);
    expect(result.levelsIncluded).toEqual([2, 3]);
  });

  it('rejects target levels below the current level', () => {
    expect(() => calculateResearchCost(item, 2, 1)).toThrow(/Target level cannot be below/);
  });

  it('applies resource percent and static reductions per spreadsheet behavior', () => {
    const result = calculateResearchCost(item, 0, 2, {
      resourcePercent: {
        food: 0.1,
        wood: 0,
        stone: 0,
        iron: 0,
        inscription: 0.25,
      },
      resourceStatic: {
        food: 10,
        wood: 20,
        stone: 0,
        iron: 0,
      },
    });

    expect(result.resources.food).toBe(250);
    expect(result.resources.wood).toBe(110);
    expect(result.resources.inscription).toBe(22.5);
  });

  it('applies research speed reductions to total time', () => {
    const result = calculateResearchCost(item, 0, 2, {
      researchSpeedPercent: 0.5,
    });

    expect(result.timeSeconds).toBe(120);
  });

  it('calculates category totals across selected items', () => {
    const secondItem = {
      ...item,
      id: 'development:2',
      levels: item.levels.map((level) => ({
        ...level,
        costs: {
          ...level.costs,
          food: 10,
        },
        timeSeconds: 10,
        power: 1,
      })),
    };

    const result = calculateCategoryTotals(
      [item, secondItem],
      {
        'development:1': { currentLevel: 1, targetLevel: 2 },
        'development:2': { currentLevel: 0, targetLevel: 3 },
      },
      {},
    );

    expect(result.resources.food).toBe(230);
    expect(result.timeSeconds).toBe(150);
    expect(result.power).toBe(13);
  });
});
