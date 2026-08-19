export const BUILDING_RESOURCE_TYPES = [
  'food',
  'wood',
  'stone',
  'iron',
  'ancientTome',
  'astronomyTome',
  'gloryCodex',
  'goldStatue',
  'apocalypseCodex',
  'silverStatue',
];

const STATIC_REDUCTION_RESOURCES = new Set(['food', 'wood', 'stone', 'iron']);

export function createEmptyBuildingTotals() {
  return {
    resources: Object.fromEntries(BUILDING_RESOURCE_TYPES.map((resource) => [resource, 0])),
    timeSeconds: 0,
    power: 0,
  };
}

export function normalizeBuildingReductions(reductions = {}) {
  return {
    resourcePercent: {
      food: 0,
      wood: 0,
      stone: 0,
      iron: 0,
      goldStatue: 0,
      ancientTome: 0,
      ...(reductions.resourcePercent ?? {}),
    },
    resourceStatic: {
      food: 0,
      wood: 0,
      stone: 0,
      iron: 0,
      ...(reductions.resourceStatic ?? {}),
    },
    constructionSpeedPercent: reductions.constructionSpeedPercent ?? 0,
  };
}

function assertLevelRange(building, currentLevel, targetLevel) {
  if (!Number.isInteger(currentLevel) || !Number.isInteger(targetLevel)) {
    throw new TypeError('Current and target levels must be integers.');
  }
  if (currentLevel < 0 || targetLevel < 0) {
    throw new RangeError('Current and target levels cannot be negative.');
  }
  if (targetLevel < currentLevel) {
    throw new RangeError('Target level cannot be below current level.');
  }
  if (targetLevel > building.maxLevel) {
    throw new RangeError(`Target level cannot exceed max level ${building.maxLevel}.`);
  }
}

function reduceResource(resource, baseCost, reductions) {
  const percent = reductions.resourcePercent[resource] ?? 0;

  if (STATIC_REDUCTION_RESOURCES.has(resource)) {
    return Math.max(0, baseCost * (1 - percent) - (reductions.resourceStatic[resource] ?? 0));
  }
  return baseCost * (1 - percent);
}

export function calculateBuildingCost(building, currentLevel, targetLevel, reductionsInput = {}) {
  assertLevelRange(building, currentLevel, targetLevel);
  const reductions = normalizeBuildingReductions(reductionsInput);
  const totals = createEmptyBuildingTotals();
  const selectedLevels = building.levels.filter(
    (entry) => entry.level > currentLevel && entry.level <= targetLevel,
  );

  selectedLevels.forEach((entry) => {
    BUILDING_RESOURCE_TYPES.forEach((resource) => {
      totals.resources[resource] += reduceResource(
        resource,
        entry.costs[resource] ?? 0,
        reductions,
      );
    });
    totals.timeSeconds += entry.timeSeconds ?? 0;
    totals.power += entry.power ?? 0;
  });

  totals.timeSeconds /= 1 + reductions.constructionSpeedPercent;
  totals.levelsIncluded = selectedLevels.map((entry) => entry.level);
  return totals;
}

export function calculateBuildingTotals(rows, selections, reductionsInput = {}) {
  const totals = createEmptyBuildingTotals();
  const rowTotals = {};

  rows.forEach((row) => {
    const selection = selections[row.id] ?? { currentLevel: 0, targetLevel: 0 };
    const result = calculateBuildingCost(
      row.building,
      selection.currentLevel,
      selection.targetLevel,
      reductionsInput,
    );
    rowTotals[row.id] = result;
    BUILDING_RESOURCE_TYPES.forEach((resource) => {
      totals.resources[resource] += result.resources[resource];
    });
    totals.timeSeconds += result.timeSeconds;
    totals.power += result.power;
  });

  return { ...totals, rowTotals };
}

export function clampBuildingTarget(building, currentLevel, targetLevel) {
  return Math.min(building.maxLevel, Math.max(currentLevel, targetLevel));
}
