const emptyLoadout = () => ({ gear: {}, heroes: {}, speedPercent: 0 });

export function createEmptyPreset(name = 'New preset') {
  return {
    id: globalThis.crypto?.randomUUID?.()
      ?? `preset-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    updatedAt: new Date().toISOString(),
    researchSelections: {},
    buildingSelections: {},
    researchLoadout: emptyLoadout(),
    buildingLoadout: emptyLoadout(),
    enabledResearch: {},
    enabledResearchCategories: {},
    enabledBuildings: {},
    goals: [],
  };
}

function readStorage(storage, key, fallback) {
  try {
    const value = storage?.getItem(key);
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function migrateLegacyPresetStore(storage = globalThis.window?.localStorage) {
  const preset = {
    ...createEmptyPreset('My account'),
    researchSelections: readStorage(storage, 'pnc-research-selections-v3', {}),
    buildingSelections: readStorage(storage, 'pnc-building-selections-v1', {}),
    researchLoadout: readStorage(storage, 'pnc-research-loadout-v1', emptyLoadout()),
    buildingLoadout: readStorage(storage, 'pnc-building-loadout-v1', emptyLoadout()),
    enabledResearch: readStorage(storage, 'pnc-research-enabled-rows-v2', {}),
    enabledResearchCategories: readStorage(
      storage,
      'pnc-research-enabled-categories-v1',
      {},
    ),
    enabledBuildings: readStorage(storage, 'pnc-building-enabled-rows-v1', {}),
  };

  return { version: 1, activePresetId: preset.id, presets: [preset] };
}
