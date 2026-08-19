export const BUILDING_SLOT_COUNTS = {
  Residence: 5,
  'Medical Tent': 5,
  Farm: 4,
  Lumberyard: 4,
  Quarry: 4,
  Furnace: 4,
  'Well of Life': 2,
};

export function createBuildingRows(buildings) {
  return buildings.flatMap((building) => {
    const count = BUILDING_SLOT_COUNTS[building.name] ?? 1;
    return Array.from({ length: count }, (_, index) => ({
      id: `${building.id}:slot:${index + 1}`,
      name: count > 1 ? `${building.name} ${index + 1}` : building.name,
      building,
    }));
  });
}
