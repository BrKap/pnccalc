function clampLevel(item, level) {
  return Math.max(0, Math.min(item.maxLevel, Number(level) || 0));
}

function updateHighestReasons(reasonMap, dependencyId, dependencyLevel, previousLevel, reason) {
  if (dependencyLevel < previousLevel) return;

  if (dependencyLevel > previousLevel) {
    reasonMap.set(dependencyId, [reason]);
    return;
  }

  const reasons = reasonMap.get(dependencyId) ?? [];
  const existingIndex = reasons.findIndex(
    (entry) => entry.requiredById === reason.requiredById,
  );
  if (existingIndex < 0) {
    reasonMap.set(dependencyId, [...reasons, reason]);
    return;
  }

  if (reason.atLevel > reasons[existingIndex].atLevel) {
    reasonMap.set(dependencyId, reasons.map((entry, index) => (
      index === existingIndex ? reason : entry
    )));
  }
}

const researchIndexCache = new WeakMap();
const buildingIndexCache = new WeakMap();

function createIndexes(items, getRequirements, getDependencyId) {
  return {
    possibleDependencies: new Map(items.map((item) => [
      item.id,
      new Set(item.levels.flatMap((level) => (
        getRequirements(level).map(getDependencyId).filter(Boolean)
      ))),
    ])),
    levelsByItem: new Map(items.map((item) => [
      item.id,
      new Map(item.levels.map((level) => [level.level, level])),
    ])),
  };
}

function resolveHighestRequirements({
  items,
  goalId,
  goalLevel,
  getRequirements,
  getDependencyId,
  getRequiredLevel,
  onLevel,
  possibleDependencies,
  levelsByItem,
}) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const goal = itemById.get(goalId);

  if (!goal) {
    return { requirements: [], errors: [`Unknown goal: ${goalId}`], levelsScanned: 0 };
  }

  const requiredLevels = new Map([[goalId, clampLevel(goal, goalLevel)]]);
  const processedLevels = new Map();
  const reasons = new Map();
  const errors = [];
  let levelsScanned = 0;
  const queue = [goalId];

  while (queue.length) {
    const itemId = queue.shift();
    const item = itemById.get(itemId);
    if (!item) continue;

    const requiredLevel = requiredLevels.get(itemId) ?? 0;
    const previouslyProcessed = processedLevels.get(itemId) ?? 0;
    if (requiredLevel <= previouslyProcessed) continue;

    const possible = possibleDependencies.get(itemId) ?? new Set();
    const foundInNewRange = new Set();

    for (let levelNumber = requiredLevel; levelNumber > previouslyProcessed; levelNumber -= 1) {
      const level = levelsByItem.get(itemId)?.get(levelNumber);
      if (!level) {
        errors.push(`Missing ${item.name} level ${levelNumber}.`);
        continue;
      }

      levelsScanned += 1;
      onLevel?.(level);

      getRequirements(level).forEach((requirement) => {
        const dependencyId = getDependencyId(requirement);
        const dependency = itemById.get(dependencyId);
        if (!dependency) {
          errors.push(`Unknown prerequisite ${dependencyId} required by ${item.name}.`);
          return;
        }

        foundInNewRange.add(dependencyId);
        const nextLevel = clampLevel(dependency, getRequiredLevel(requirement));
        const previousLevel = requiredLevels.get(dependencyId) ?? 0;
        updateHighestReasons(reasons, dependencyId, nextLevel, previousLevel, {
          requiredById: itemId,
          requiredByLevel: requiredLevel,
          atLevel: levelNumber,
        });

        if (nextLevel > previousLevel) {
          requiredLevels.set(dependencyId, nextLevel);
          queue.push(dependencyId);
        }
      });

      if (possible.size > 0 && [...possible].every((id) => foundInNewRange.has(id))) {
        break;
      }
    }

    processedLevels.set(itemId, requiredLevel);
  }

  requiredLevels.delete(goalId);

  return {
    requirements: [...requiredLevels.entries()].map(([id, level]) => ({
      id,
      level,
      reasons: reasons.get(id) ?? [],
    })),
    errors: [...new Set(errors)],
    levelsScanned,
  };
}

export function resolveResearchPrerequisites(research, goalId, goalLevel) {
  let indexes = researchIndexCache.get(research);
  if (!indexes) {
    indexes = createIndexes(
      research,
      (level) => level.requirements ?? [],
      (requirement) => requirement.researchId,
    );
    researchIndexCache.set(research, indexes);
  }
  let instituteLevel = 0;
  const result = resolveHighestRequirements({
    items: research,
    goalId,
    goalLevel,
    getRequirements: (level) => level.requirements ?? [],
    getDependencyId: (requirement) => requirement.researchId,
    getRequiredLevel: (requirement) => requirement.level,
    onLevel: (level) => {
      instituteLevel = Math.max(instituteLevel, level.institute ?? 0);
    },
    ...indexes,
  });

  return { ...result, instituteLevel };
}

export function resolveBuildingPrerequisites(buildings, goalId, goalLevel) {
  let indexes = buildingIndexCache.get(buildings);
  if (!indexes) {
    const buildingIdByName = new Map(
      buildings.map((building) => [building.name, building.id]),
    );
    indexes = {
      ...createIndexes(
        buildings,
        (level) => level.requirements ?? [],
        (requirement) => buildingIdByName.get(requirement.building),
      ),
      buildingIdByName,
    };
    buildingIndexCache.set(buildings, indexes);
  }
  return resolveHighestRequirements({
    items: buildings,
    goalId,
    goalLevel,
    getRequirements: (level) => level.requirements ?? [],
    getDependencyId: (requirement) => indexes.buildingIdByName.get(requirement.building),
    getRequiredLevel: (requirement) => requirement.level,
    possibleDependencies: indexes.possibleDependencies,
    levelsByItem: indexes.levelsByItem,
  });
}

export function selectBuildingRow(rows, buildingId, selections, preferredRowId) {
  const candidates = rows.filter((row) => row.building.id === buildingId);
  if (preferredRowId) {
    const preferred = candidates.find((row) => row.id === preferredRowId);
    if (preferred) return preferred;
  }

  return [...candidates].sort((left, right) => {
    const leftSelection = selections[left.id] ?? { currentLevel: 0, targetLevel: 0 };
    const rightSelection = selections[right.id] ?? { currentLevel: 0, targetLevel: 0 };
    return rightSelection.currentLevel - leftSelection.currentLevel
      || rightSelection.targetLevel - leftSelection.targetLevel
      || left.id.localeCompare(right.id, undefined, { numeric: true });
  })[0];
}

export function raiseSelectionTarget(selections, rowId, requiredLevel) {
  const current = selections[rowId] ?? { currentLevel: 0, targetLevel: 0 };
  return {
    ...selections,
    [rowId]: {
      ...current,
      targetLevel: Math.max(current.currentLevel, current.targetLevel, requiredLevel),
    },
  };
}
