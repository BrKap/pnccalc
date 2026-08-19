const effect = (staticReductions, percentReductions = {}) => ({
  static: staticReductions,
  percent: percentReductions,
});

const gear = (id, name, levels) => ({ id, name, levels });

const addInscription = (percent, star) => ({
  ...percent,
  ...(star >= 6 ? { inscription: 0.05 } : {}),
});

const researchGear = [
  gear('parchment', 'Parchment', Object.fromEntries([
    [3, effect({ food: 400000, stone: 80000 }, { food: 0.03 })],
    [4, effect({ food: 800000, stone: 160000 }, { food: 0.06 })],
    [5, effect({ food: 1600000, stone: 320000 }, { food: 0.12 })],
    [6, effect({ food: 2000000, stone: 400000 }, addInscription({ food: 0.18 }, 6))],
    [7, effect({ food: 2000000, stone: 400000 }, addInscription({ food: 0.30 }, 7))],
  ])),
  gear('pen', 'Pen', Object.fromEntries([
    [3, effect({ wood: 800000, iron: 20000 }, { wood: 0.015 })],
    [4, effect({ wood: 1600000, iron: 40000 }, { wood: 0.03 })],
    [5, effect({ wood: 3200000, iron: 80000 }, { wood: 0.06 })],
    [6, effect({ wood: 4000000, iron: 100000 }, addInscription({ wood: 0.09 }, 6))],
    [7, effect({ wood: 4000000, iron: 100000 }, addInscription({ wood: 0.15 }, 7))],
  ])),
  gear('robe', 'Robe', Object.fromEntries([
    [3, effect({ wood: 800000, iron: 20000 }, { wood: 0.015 })],
    [4, effect({ wood: 1600000, iron: 40000 }, { wood: 0.03 })],
    [5, effect({ wood: 3200000, iron: 80000 }, { wood: 0.06 })],
    [6, effect({ wood: 4000000, iron: 100000 }, addInscription({ wood: 0.09 }, 6))],
    [7, effect({ wood: 4000000, iron: 100000 }, addInscription({ wood: 0.15 }, 7))],
  ])),
  gear('hat', 'Hat', Object.fromEntries([
    [3, effect({ food: 400000, stone: 80000 }, { stone: 0.03 })],
    [4, effect({ food: 800000, stone: 160000 }, { stone: 0.06 })],
    [5, effect({ food: 1600000, stone: 320000 }, { stone: 0.12 })],
    [6, effect({ food: 2000000, stone: 400000 }, addInscription({ stone: 0.18 }, 6))],
    [7, effect({ food: 2000000, stone: 400000 }, addInscription({ stone: 0.30 }, 7))],
  ])),
  gear('ring', 'Ring', Object.fromEntries([
    [3, effect({ wood: 800000, iron: 20000 }, { iron: 0.015 })],
    [4, effect({ wood: 1600000, iron: 40000 }, { iron: 0.03 })],
    [5, effect({ wood: 3200000, iron: 80000 }, { iron: 0.06 })],
    [6, effect({ wood: 4000000, iron: 100000 }, addInscription({ iron: 0.09 }, 6))],
    [7, effect({ wood: 4000000, iron: 100000 }, addInscription({ iron: 0.15 }, 7))],
  ])),
  gear('shoes', 'Shoes', Object.fromEntries([
    [3, effect({ food: 400000, stone: 80000 }, { iron: 0.015 })],
    [4, effect({ food: 800000, stone: 160000 }, { iron: 0.03 })],
    [5, effect({ food: 1600000, stone: 320000 }, { iron: 0.06 })],
    [6, effect({ food: 2000000, stone: 400000 }, addInscription({ iron: 0.09 }, 6))],
    [7, effect({ food: 4000000, stone: 100000 }, addInscription({ iron: 0.15 }, 7))],
  ])),
];

const heroLevels = (resources) => Object.fromEntries(
  [20000, 30000, 40000, 60000, 80000, 100000].map((value, enhancement) => [
    enhancement,
    effect(Object.fromEntries(resources.map(([resource, multiplier]) => [resource, value * multiplier]))),
  ]),
);

export const researchLoadoutConfig = {
  name: 'Research',
  speedKey: 'researchSpeedPercent',
  speedLabel: 'Research Speed',
  percentResources: ['food', 'wood', 'stone', 'iron', 'inscription'],
  staticResources: ['food', 'wood', 'stone', 'iron'],
  gear: researchGear,
  heroes: [
    { id: 'lucia', name: 'Lucia', levels: heroLevels([['stone', 1], ['iron', 0.5]]) },
    { id: 'penny', name: 'Penny', levels: heroLevels([['food', 1], ['wood', 1]]) },
  ],
};
