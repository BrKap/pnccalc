import { describe, expect, it } from '@jest/globals';
import {
  BUILDING_RESOURCE_TYPES,
  calculateBuildingCost,
  calculateBuildingTotals,
} from '../../frontend/src/features/building/lib/calculateBuildingCost.js';

const costs = (values = {}) =>
  Object.fromEntries(BUILDING_RESOURCE_TYPES.map((resource) => [resource, values[resource] ?? 0]));

const building = {
  id: 'building:1',
  maxLevel: 3,
  levels: [
    { level: 1, costs: costs({ food: 100, wood: 50, goldStatue: 10 }), timeSeconds: 60, power: 5 },
    { level: 2, costs: costs({ food: 200, stone: 25, goldStatue: 20 }), timeSeconds: 120, power: 10 },
    { level: 3, costs: costs({ food: 300, iron: 10, goldStatue: 30 }), timeSeconds: 180, power: 15 },
  ],
};

describe('calculateBuildingCost', () => {
  it('sums current-exclusive through target-inclusive levels', () => {
    const result = calculateBuildingCost(building, 1, 3);
    expect(result.resources.food).toBe(500);
    expect(result.resources.goldStatue).toBe(50);
    expect(result.timeSeconds).toBe(300);
    expect(result.power).toBe(25);
  });

  it('rejects targets below the current level', () => {
    expect(() => calculateBuildingCost(building, 2, 1)).toThrow(/below current/);
  });

  it('applies resource, Gold Statue, and construction speed reductions', () => {
    const result = calculateBuildingCost(building, 0, 2, {
      resourcePercent: { food: 0.1, goldStatue: 0.25 },
      resourceStatic: { food: 10 },
      constructionSpeedPercent: 0.5,
    });
    expect(result.resources.food).toBe(250);
    expect(result.resources.goldStatue).toBe(22.5);
    expect(result.timeSeconds).toBe(120);
  });

  it('totals independently repeated building rows', () => {
    const rows = [
      { id: 'building:1:slot:1', building },
      { id: 'building:1:slot:2', building },
    ];
    const result = calculateBuildingTotals(rows, {
      'building:1:slot:1': { currentLevel: 0, targetLevel: 1 },
      'building:1:slot:2': { currentLevel: 1, targetLevel: 2 },
    });
    expect(result.resources.food).toBe(300);
    expect(result.timeSeconds).toBe(180);
    expect(result.power).toBe(15);
  });
});
