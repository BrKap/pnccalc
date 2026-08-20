import { describe, expect, it } from '@jest/globals';
import {
  createEmptyPreset,
  migrateLegacyPresetStore,
} from '../../frontend/src/features/presets/presetStore.js';

describe('preset store', () => {
  it('creates independent blank calculator state', () => {
    const first = createEmptyPreset('First');
    const second = createEmptyPreset('Second');
    first.researchSelections.example = { currentLevel: 1, targetLevel: 2 };

    expect(second.researchSelections).toEqual({});
    expect(first.id).not.toBe(second.id);
  });

  it('migrates every existing calculator field into the first preset', () => {
    const values = new Map([
      ['pnc-research-selections-v3', { research: { currentLevel: 2, targetLevel: 4 } }],
      ['pnc-building-selections-v1', { building: { currentLevel: 3, targetLevel: 5 } }],
      ['pnc-research-loadout-v1', { gear: { hat: '7' } }],
      ['pnc-building-loadout-v1', { heroes: { chloe: '5' } }],
      ['pnc-research-enabled-rows-v2', { research: false }],
      ['pnc-research-enabled-categories-v1', { development: false }],
      ['pnc-building-enabled-rows-v1', { building: false }],
    ]);
    const storage = { getItem: (key) => (
      values.has(key) ? JSON.stringify(values.get(key)) : null
    ) };

    const store = migrateLegacyPresetStore(storage);

    expect(store.version).toBe(1);
    expect(store.presets).toHaveLength(1);
    expect(store.presets[0]).toMatchObject({
      researchSelections: values.get('pnc-research-selections-v3'),
      buildingSelections: values.get('pnc-building-selections-v1'),
      researchLoadout: values.get('pnc-research-loadout-v1'),
      buildingLoadout: values.get('pnc-building-loadout-v1'),
      enabledResearch: values.get('pnc-research-enabled-rows-v2'),
      enabledResearchCategories: values.get('pnc-research-enabled-categories-v1'),
      enabledBuildings: values.get('pnc-building-enabled-rows-v1'),
    });
  });
});
