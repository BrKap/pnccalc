import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@jest/globals';
import {
  BUILDING_SLOT_COUNTS,
  createBuildingRows,
} from '../../frontend/src/features/building/lib/createBuildingRows.js';

const buildingsPath = fileURLToPath(
  new URL('../../frontend/src/features/building/data/buildings.json', import.meta.url),
);
const buildingsText = readFileSync(buildingsPath, 'utf8');
const buildings = JSON.parse(buildingsText);

function getLevel(buildingName, level) {
  const building = buildings.find((entry) => entry.name === buildingName);
  return building?.levels.find((entry) => entry.level === level);
}

describe('building frontend data', () => {
  it('uses sequential public IDs and exports every building through level 45', () => {
    expect(buildings).toHaveLength(24);
    expect(buildings.map((building) => building.id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `building:${index + 1}`),
    );
    buildings.forEach((building) => {
      expect(building.maxLevel).toBe(45);
      expect(building.levels.map((level) => level.level)).toEqual(
        Array.from({ length: 45 }, (_, index) => index + 1),
      );
    });
  });

  it('keeps only the compact calculator contract', () => {
    expect(Object.keys(buildings[0])).toEqual(['id', 'name', 'maxLevel', 'sourceIcon', 'levels']);
    expect(Object.keys(buildings[0].levels[0])).toEqual([
      'level',
      'costs',
      'timeSeconds',
      'power',
    ]);
    expect(buildingsText).not.toMatch(/sourceId|sourceRecordId|sourceBuildingId|luaId/);
  });

  it('merges normal and special building materials', () => {
    expect(getLevel('Citadel', 36).costs).toMatchObject({
      ancientTome: 22000,
      astronomyTome: 1200,
      gloryCodex: 500,
      goldStatue: 1000,
    });
  });

  it('includes late-game materials and fractional seconds', () => {
    expect(getLevel('Citadel', 41).costs.apocalypseCodex).toBe(500);
    expect(getLevel('Citadel', 45).costs.apocalypseCodex).toBe(3000);
    expect(getLevel('War Hall', 2).costs.silverStatue).toBe(1);
    expect(getLevel('Citadel', 41).timeSeconds).toBe(110429161.5);
  });

  it('creates all 45 independently selectable building slots', () => {
    const rows = createBuildingRows(buildings);
    expect(rows).toHaveLength(45);

    Object.entries(BUILDING_SLOT_COUNTS).forEach(([name, count]) => {
      expect(rows.filter((row) => row.building.name === name)).toHaveLength(count);
    });
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
  });
});
