import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@jest/globals';

const dataUrl = new URL('../../frontend/src/features/research/data/', import.meta.url);
const researchText = readFileSync(fileURLToPath(new URL('research.json', dataUrl)), 'utf8');
const categories = JSON.parse(
  readFileSync(fileURLToPath(new URL('categories.json', dataUrl)), 'utf8'),
);
const research = JSON.parse(researchText);

describe('research frontend data', () => {
  it('uses category-local sequential IDs', () => {
    expect(categories).toHaveLength(12);
    expect(research).toHaveLength(393);

    categories.forEach((category) => {
      expect(category.itemIds).toEqual(
        Array.from(
          { length: category.itemIds.length },
          (_, index) => `${category.id}:${index + 1}`,
        ),
      );
    });
  });

  it('keeps only the compact calculator contract', () => {
    expect(Object.keys(research[0])).toEqual([
      'id',
      'name',
      'categoryId',
      'maxLevel',
      'sourceIcon',
      'levels',
    ]);
    expect(Object.keys(research[0].levels[0])).toEqual([
      'level',
      'costs',
      'timeSeconds',
      'power',
    ]);
    expect(researchText).not.toMatch(
      /sourceId|luaId|sourceNameKey|benefitType|nameMapping|sourceTechId|sourceLevelId/,
    );
  });

  it('exports War Rage with Inscription costs', () => {
    const warRage = research.filter((item) => item.categoryId === 'war-rage');
    const levels = warRage.flatMap((item) => item.levels);

    expect(warRage).toHaveLength(27);
    expect(levels).toHaveLength(162);
    expect(levels.every((level) => level.costs.inscription > 0)).toBe(true);
    expect(warRage.at(-3).name).toBe('Infantry Heavy Strike');
  });

  it('keeps Unit Tactics resistance and T13 retaliation rows in source order', () => {
    const unitTactics = research.filter((item) => item.categoryId === 'unit-tactics');
    const names = unitTactics.map((item) => item.name);

    expect(unitTactics).toHaveLength(39);
    expect(names[8]).toBe('Tactical Skill Resistance');
    expect(names[13]).toBe('Tactical Skill Resistance');
    expect(names.slice(35)).toEqual([
      'T13 Infantry Retaliation',
      'T13 Archer Retaliation',
      'T13 Cavalry Retaliation',
      'T13 Enhanced Soldier Retaliation',
    ]);
    expect(names.slice(35)).not.toContain('Tactical Skill Resistance');
  });

  it('exports the separate Apocalypse category and material', () => {
    const category = categories.find((entry) => entry.id === 'apocalypse');
    const apocalypse = research.filter((item) => item.categoryId === 'apocalypse');
    const levels = apocalypse.flatMap((item) => item.levels);

    expect(category).toMatchObject({ name: 'Apocalypse' });
    expect(apocalypse).toHaveLength(43);
    expect(levels).toHaveLength(279);
    expect(levels.every((level) => level.costs.apocalypseResearchMaterial > 0)).toBe(true);
    expect(apocalypse.map((item) => item.name)).toContain('Enhanced Infantry Heavy Strike');
  });
});
