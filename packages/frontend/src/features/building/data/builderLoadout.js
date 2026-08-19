const effect = (staticReductions, percentReductions = {}) => ({
  static: staticReductions,
  percent: percentReductions,
});

const gear = (id, name, levels) => ({ id, name, levels });

const addBuilderSpecialResources = (percent, star) => ({
  ...percent,
  ...(star >= 6 ? { goldStatue: 0.05 } : {}),
  ...(star === 7 ? { ancientTome: 0.05 } : {}),
});

const builderGear = [
  gear('sword', 'Sword', Object.fromEntries([
    [3, effect({ food: 1000000, stone: 200000 }, { food: 0.05 })],
    [4, effect({ food: 2000000, stone: 400000 }, { food: 0.10 })],
    [5, effect({ food: 4000000, stone: 800000 }, { food: 0.20 })],
    [6, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ food: 0.30 }, 6))],
    [7, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ food: 0.40 }, 7))],
  ])),
  gear('scepter', 'Scepter', Object.fromEntries([
    [3, effect({ wood: 500000, iron: 100000 }, { wood: 0.025 })],
    [4, effect({ wood: 1000000, iron: 200000 }, { wood: 0.05 })],
    [5, effect({ wood: 2000000, iron: 400000 }, { wood: 0.10 })],
    [6, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ wood: 0.15 }, 6))],
    [7, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ wood: 0.20 }, 7))],
  ])),
  gear('robe', 'Robe', Object.fromEntries([
    [3, effect({ wood: 500000, iron: 100000 }, { wood: 0.025 })],
    [4, effect({ wood: 1000000, iron: 200000 }, { wood: 0.05 })],
    [5, effect({ wood: 2000000, iron: 400000 }, { wood: 0.10 })],
    [6, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ wood: 0.15 }, 6))],
    [7, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ wood: 0.20 }, 7))],
  ])),
  gear('hat', 'Hat', Object.fromEntries([
    [3, effect({ food: 1000000, stone: 200000 }, { stone: 0.05 })],
    [4, effect({ food: 2000000, stone: 400000 }, { stone: 0.10 })],
    [5, effect({ food: 4000000, stone: 800000 }, { stone: 0.20 })],
    [6, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ stone: 0.30 }, 6))],
    [7, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ stone: 0.40 }, 7))],
  ])),
  gear('bracelet', 'Bracelet', Object.fromEntries([
    [3, effect({ wood: 500000, iron: 100000 }, { iron: 0.025 })],
    [4, effect({ wood: 1000000, iron: 200000 }, { iron: 0.05 })],
    [5, effect({ wood: 2000000, iron: 400000 }, { iron: 0.10 })],
    [6, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ iron: 0.15 }, 6))],
    [7, effect({ wood: 2400000, iron: 480000 }, addBuilderSpecialResources({ iron: 0.20 }, 7))],
  ])),
  gear('shoes', 'Shoes', Object.fromEntries([
    [3, effect({ food: 1000000, stone: 200000 }, { iron: 0.025 })],
    [4, effect({ food: 2000000, stone: 400000 }, { iron: 0.05 })],
    [5, effect({ food: 4000000, stone: 800000 }, { iron: 0.10 })],
    [6, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ iron: 0.15 }, 6))],
    [7, effect({ food: 4800000, stone: 1000000 }, addBuilderSpecialResources({ iron: 0.20 }, 7))],
  ])),
];

const heroLevels = (resources) => Object.fromEntries(
  [20000, 30000, 40000, 60000, 80000, 100000].map((value, enhancement) => [
    enhancement,
    effect(Object.fromEntries(resources.map(([resource, multiplier]) => [resource, value * multiplier]))),
  ]),
);

export const builderLoadoutConfig = {
  name: 'Builder',
  speedKey: 'constructionSpeedPercent',
  speedLabel: 'Construction Speed',
  percentResources: ['food', 'wood', 'stone', 'iron', 'goldStatue', 'ancientTome'],
  staticResources: ['food', 'wood', 'stone', 'iron'],
  gear: builderGear,
  heroes: [
    { id: 'william', name: 'William', levels: heroLevels([['food', 1], ['wood', 1]]) },
    { id: 'chloe', name: 'Chloe', levels: heroLevels([['stone', 1], ['iron', 0.5]]) },
  ],
  setBonus: {
    isActive: (selections) => builderGear.every(
      (piece) => String(selections[piece.id]) === '7',
    ),
    effects: { percent: { goldStatue: 0.30 } },
  },
};
