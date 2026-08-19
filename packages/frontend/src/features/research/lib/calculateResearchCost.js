export const RESOURCE_TYPES = [
  'food',
  'wood',
  'stone',
  'iron',
  'ancientTome',
  'inscription',
  'documentFragment',
  'apocalypseResearchMaterial',
];

const STATIC_REDUCTION_RESOURCES = new Set(['food', 'wood', 'stone', 'iron']);

export function createEmptyTotals() {
  return {
    resources: Object.fromEntries(RESOURCE_TYPES.map((resource) => [resource, 0])),
    timeSeconds: 0,
    power: 0,
  };
}

export function normalizeReductions(reductions = {}) {
  return {
    resourcePercent: {
      food: 0,
      wood: 0,
      stone: 0,
      iron: 0,
      inscription: 0,
      ...(reductions.resourcePercent ?? {}),
    },
    resourceStatic: {
      food: 0,
      wood: 0,
      stone: 0,
      iron: 0,
      ...(reductions.resourceStatic ?? {}),
    },
    researchSpeedPercent: reductions.researchSpeedPercent ?? 0,
  };
}

function assertLevelRange(item, currentLevel, targetLevel) {
  if (!Number.isInteger(currentLevel) || !Number.isInteger(targetLevel)) {
    throw new TypeError('Current and target levels must be integers.');
  }

  if (currentLevel < 0 || targetLevel < 0) {
    throw new RangeError('Current and target levels cannot be negative.');
  }

  if (targetLevel < currentLevel) {
    throw new RangeError('Target level cannot be below current level.');
  }

  if (targetLevel > item.maxLevel) {
    throw new RangeError(`Target level cannot exceed max level ${item.maxLevel}.`);
  }
}

function calculateReducedResourceCost(resource, baseCost, reductions) {
  const percent = reductions.resourcePercent[resource] ?? 0;

  if (STATIC_REDUCTION_RESOURCES.has(resource)) {
    const staticReduction = reductions.resourceStatic[resource] ?? 0;
    return Math.max(0, baseCost * (1 - percent) - staticReduction);
  }

  if (resource === 'inscription') {
    return baseCost * (1 - percent);
  }

  return baseCost;
}

export function calculateResearchCost(item, currentLevel, targetLevel, reductionsInput = {}) {
  assertLevelRange(item, currentLevel, targetLevel);

  const reductions = normalizeReductions(reductionsInput);
  const totals = createEmptyTotals();
  const selectedLevels = item.levels.filter(
    (entry) => entry.level > currentLevel && entry.level <= targetLevel,
  );

  selectedLevels.forEach((entry) => {
    RESOURCE_TYPES.forEach((resource) => {
      totals.resources[resource] += calculateReducedResourceCost(
        resource,
        entry.costs[resource] ?? 0,
        reductions,
      );
    });

    totals.timeSeconds += entry.timeSeconds ?? 0;
    totals.power += entry.power ?? 0;
  });

  totals.timeSeconds = totals.timeSeconds / (1 + reductions.researchSpeedPercent);
  totals.levelsIncluded = selectedLevels.map((entry) => entry.level);

  return totals;
}

export function calculateCategoryTotals(items, selections, reductions = {}) {
  const totals = createEmptyTotals();
  const itemTotals = {};

  items.forEach((item) => {
    const selection = selections[item.id] ?? { currentLevel: 0, targetLevel: 0 };
    const result = calculateResearchCost(
      item,
      selection.currentLevel,
      selection.targetLevel,
      reductions,
    );

    itemTotals[item.id] = result;

    RESOURCE_TYPES.forEach((resource) => {
      totals.resources[resource] += result.resources[resource];
    });

    totals.timeSeconds += result.timeSeconds;
    totals.power += result.power;
  });

  return {
    ...totals,
    itemTotals,
  };
}

export function clampTargetLevel(item, currentLevel, targetLevel) {
  return Math.min(item.maxLevel, Math.max(currentLevel, targetLevel));
}
