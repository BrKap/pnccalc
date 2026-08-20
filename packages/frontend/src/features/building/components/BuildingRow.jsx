import React from 'react';
import { Info } from 'lucide-react';
import { formatNumber, formatTime } from '../../calculator/formatters';
import InfoPopover from '../../calculator/components/InfoPopover.jsx';
import UpgradeDetails from '../../calculator/components/UpgradeDetails.jsx';
import {
  BUILDING_RESOURCE_TYPES,
  calculateBuildingCost,
  clampBuildingTarget,
} from '../lib/calculateBuildingCost';

export default function BuildingRow({
  row,
  selection,
  onSelectionChange,
  reductions,
  enabled,
  onToggle,
}) {
  const { building } = row;
  const rowTotal = calculateBuildingCost(
    building,
    selection.currentLevel,
    selection.targetLevel,
    reductions,
  );
  const nextLevel = selection.currentLevel + 1;
  const nextLevelData = building.levels.find((entry) => entry.level === nextLevel);
  const targetLevelData = building.levels.find((entry) => entry.level === selection.targetLevel);
  const nextLevelTotal = selection.currentLevel < building.maxLevel
    ? calculateBuildingCost(building, selection.currentLevel, nextLevel, reductions)
    : null;
  const formatPrerequisites = (levelData) => (levelData?.requirements ?? []).map(
    (requirement) => `${requirement.building} Level ${requirement.level}`,
  );

  const updateCurrentLevel = (currentLevel) => {
    onSelectionChange(row.id, {
      currentLevel,
      targetLevel: clampBuildingTarget(building, currentLevel, selection.targetLevel),
    });
  };

  const updateTargetLevel = (targetLevel) => {
    onSelectionChange(row.id, {
      ...selection,
      targetLevel: clampBuildingTarget(building, selection.currentLevel, targetLevel),
    });
  };

  return (
    <tr className={enabled ? '' : 'excluded-row'}>
      <td className="include-cell">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          aria-label={`Include ${row.name} in totals`}
        />
      </td>
      <th scope="row">
        <span className="research-name upgrade-name">
          {row.name}
          <InfoPopover
            trigger={<Info size={14} aria-hidden="true" />}
            label={`Show ${row.name} upgrade details`}
            triggerClassName="row-info-button"
          >
            <UpgradeDetails
              name={row.name}
              currentLevel={selection.currentLevel}
              targetLevel={selection.targetLevel}
              maxLevel={building.maxLevel}
              nextResult={nextLevelTotal}
              totalResult={rowTotal}
              nextPrerequisites={formatPrerequisites(nextLevelData)}
              targetPrerequisites={formatPrerequisites(targetLevelData)}
              resourceTypes={BUILDING_RESOURCE_TYPES}
              plannerPath={`#/planner/building/${encodeURIComponent(row.id)}`}
            />
          </InfoPopover>
        </span>
        <span className="research-meta">Max {building.maxLevel}</span>
      </th>
      <td>
        <select
          value={selection.currentLevel}
          onChange={(event) => updateCurrentLevel(Number(event.target.value))}
          aria-label={`Current level for ${row.name}`}
        >
          {Array.from({ length: building.maxLevel + 1 }, (_, level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          value={selection.targetLevel}
          onChange={(event) => updateTargetLevel(Number(event.target.value))}
          aria-label={`Target level for ${row.name}`}
        >
          {Array.from({ length: building.maxLevel + 1 }, (_, level) => (
            <option key={level} value={level} disabled={level < selection.currentLevel}>
              {level}
            </option>
          ))}
        </select>
      </td>
      {BUILDING_RESOURCE_TYPES.map((resource) => (
        <td key={resource}>{formatNumber(rowTotal.resources[resource])}</td>
      ))}
      <td>{formatTime(rowTotal.timeSeconds)}</td>
      <td>{formatNumber(rowTotal.power)}</td>
    </tr>
  );
}
