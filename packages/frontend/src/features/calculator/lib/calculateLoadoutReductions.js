function addEffects(target, effects = {}) {
  Object.entries(effects.percent ?? {}).forEach(([resource, value]) => {
    target.resourcePercent[resource] = (target.resourcePercent[resource] ?? 0) + value;
  });
  Object.entries(effects.static ?? {}).forEach(([resource, value]) => {
    target.resourceStatic[resource] = (target.resourceStatic[resource] ?? 0) + value;
  });
}

export function calculateLoadoutReductions(config, loadout = {}) {
  const reductions = {
    resourcePercent: Object.fromEntries(config.percentResources.map((resource) => [resource, 0])),
    resourceStatic: Object.fromEntries(config.staticResources.map((resource) => [resource, 0])),
    [config.speedKey]: Math.max(0, Number(loadout.speedPercent) || 0) / 100,
  };

  config.gear.forEach((piece) => {
    const level = loadout.gear?.[piece.id];
    addEffects(reductions, piece.levels[level]);
  });

  config.heroes.forEach((hero) => {
    const enhancement = loadout.heroes?.[hero.id];
    addEffects(reductions, hero.levels[enhancement]);
  });

  if (config.setBonus?.isActive(loadout.gear ?? {})) {
    addEffects(reductions, config.setBonus.effects);
  }

  return reductions;
}
