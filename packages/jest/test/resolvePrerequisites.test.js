import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  raiseSelectionTarget,
  resolveBuildingPrerequisites,
  resolveResearchPrerequisites,
  selectBuildingRow,
} from '../../frontend/src/features/planner/lib/resolvePrerequisites.js';

function level(levelNumber, requirements = [], institute = 0) {
  return { level: levelNumber, requirements, institute };
}

describe('prerequisite resolver', () => {
  it('merges research requirements and keeps only the highest Institute level', () => {
    const research = [
      { id: 'a', name: 'A', maxLevel: 4, levels: [
        level(1, [], 27), level(2, [], 28), level(3, [], 29), level(4, [], 31),
      ] },
      { id: 'b', name: 'B', maxLevel: 4, levels: [
        level(1, [{ researchId: 'a', level: 2 }], 20),
        level(2, [], 21), level(3, [], 22), level(4, [{ researchId: 'a', level: 4 }], 30),
      ] },
      { id: 'c', name: 'C', maxLevel: 5, levels: [
        level(1, [], 1), level(2, [], 2), level(3, [], 3), level(4, [], 4),
        level(5, [{ researchId: 'a', level: 4 }, { researchId: 'b', level: 4 }], 5),
      ] },
    ];

    const result = resolveResearchPrerequisites(research, 'c', 5);

    expect(result.requirements.map(({ id, level: required }) => [id, required]).sort()).toEqual([
      ['a', 4], ['b', 4],
    ]);
    expect(result.instituteLevel).toBe(31);
  });

  it('finds requirements introduced by earlier building levels and expands Institute', () => {
    const buildings = [
      { id: 'citadel', name: 'Citadel', maxLevel: 3, levels: [
        level(1, [{ building: 'Camp', level: 1 }]),
        level(2, [{ building: 'Institute', level: 2 }]),
        level(3, [{ building: 'Wall', level: 2 }]),
      ] },
      { id: 'wall', name: 'Wall', maxLevel: 2, levels: [level(1), level(2)] },
      { id: 'camp', name: 'Camp', maxLevel: 1, levels: [level(1)] },
      { id: 'institute', name: 'Institute', maxLevel: 2, levels: [
        level(1), level(2, [{ building: 'Wall', level: 1 }]),
      ] },
    ];

    const result = resolveBuildingPrerequisites(buildings, 'citadel', 3);

    expect(result.requirements.map(({ id, level: required }) => [id, required]).sort()).toEqual([
      ['camp', 1], ['institute', 2], ['wall', 2],
    ]);
  });

  it('keeps only reasons that establish the final highest building requirement', () => {
    const buildingsPath = fileURLToPath(
      new URL('../../frontend/src/features/building/data/buildings.json', import.meta.url),
    );
    const buildings = JSON.parse(readFileSync(buildingsPath, 'utf8'));
    const citadel = buildings.find((building) => building.name === 'Citadel');
    const byId = new Map(buildings.map((building) => [building.id, building]));

    const result = resolveBuildingPrerequisites(buildings, citadel.id, 45);
    const namedRequirements = new Map(result.requirements.map((entry) => [
      byId.get(entry.id).name,
      entry,
    ]));

    expect(namedRequirements.get('Archer Camp')).toMatchObject({
      level: 43,
      reasons: [{ requiredById: citadel.id, atLevel: 44 }],
    });
    expect(namedRequirements.get('Archer Camp').reasons).toHaveLength(1);
    expect(namedRequirements.get('Cavalry Camp')).toMatchObject({
      level: 44,
      reasons: [{ requiredById: citadel.id, atLevel: 45 }],
    });
    expect(namedRequirements.get('Cavalry Camp').reasons).toHaveLength(1);
  });

  it('selects the strongest building slot deterministically', () => {
    const building = { id: 'farm' };
    const rows = [1, 2, 3].map((slot) => ({ id: `farm:${slot}`, building }));
    const selections = {
      'farm:1': { currentLevel: 10, targetLevel: 12 },
      'farm:2': { currentLevel: 12, targetLevel: 12 },
      'farm:3': { currentLevel: 12, targetLevel: 14 },
    };

    expect(selectBuildingRow(rows, 'farm', selections).id).toBe('farm:3');
  });

  it('never lowers a current or existing target level', () => {
    const selections = { x: { currentLevel: 8, targetLevel: 10 } };
    expect(raiseSelectionTarget(selections, 'x', 6).x).toEqual({
      currentLevel: 8,
      targetLevel: 10,
    });
  });
});
