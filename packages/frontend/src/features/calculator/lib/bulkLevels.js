function resolveLevel(value, maxLevel) {
  if (value === 'max') return maxLevel;
  return Math.min(maxLevel, Math.max(0, Number(value) || 0));
}

export function applyBulkCurrentLevel(rows, selections, value) {
  return rows.reduce((next, row) => {
    const item = row.building ?? row;
    const current = selections[row.id] ?? { currentLevel: 0, targetLevel: 0 };
    const currentLevel = resolveLevel(value, item.maxLevel);
    next[row.id] = {
      currentLevel,
      targetLevel: Math.max(currentLevel, Math.min(item.maxLevel, current.targetLevel)),
    };
    return next;
  }, { ...selections });
}

export function applyBulkTargetLevel(rows, selections, value) {
  return rows.reduce((next, row) => {
    const item = row.building ?? row;
    const current = selections[row.id] ?? { currentLevel: 0, targetLevel: 0 };
    next[row.id] = {
      ...current,
      targetLevel: Math.max(current.currentLevel, resolveLevel(value, item.maxLevel)),
    };
    return next;
  }, { ...selections });
}
