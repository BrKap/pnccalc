import {
  applyBulkCurrentLevel,
  applyBulkTargetLevel,
} from '../../frontend/src/features/calculator/lib/bulkLevels.js';

const rows = [
  { id: 'development:1', maxLevel: 5 },
  { id: 'development:2', maxLevel: 10 },
];

describe('bulk level controls', () => {
  test('clamps a bulk current level to each item maximum and raises targets', () => {
    const result = applyBulkCurrentLevel(rows, {}, '8');

    expect(result['development:1']).toEqual({ currentLevel: 5, targetLevel: 5 });
    expect(result['development:2']).toEqual({ currentLevel: 8, targetLevel: 8 });
  });

  test('sets each target to its own maximum', () => {
    const result = applyBulkTargetLevel(rows, {}, 'max');

    expect(result['development:1'].targetLevel).toBe(5);
    expect(result['development:2'].targetLevel).toBe(10);
  });

  test('does not set a target below the current level', () => {
    const selections = {
      'development:1': { currentLevel: 4, targetLevel: 5 },
    };

    const result = applyBulkTargetLevel(rows.slice(0, 1), selections, '2');
    expect(result['development:1']).toEqual({ currentLevel: 4, targetLevel: 4 });
  });

  test('supports building row wrappers', () => {
    const buildingRows = [{ id: 'building:1:slot:1', building: { maxLevel: 45 } }];
    const result = applyBulkTargetLevel(buildingRows, {}, 'max');

    expect(result['building:1:slot:1'].targetLevel).toBe(45);
  });
});
