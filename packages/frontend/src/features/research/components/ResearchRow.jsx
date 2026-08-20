import React from 'react';
import { Info } from 'lucide-react';
import {
  RESOURCE_TYPES,
  calculateResearchCost,
  clampTargetLevel,
} from '../lib/calculateResearchCost';
import { formatNumber, formatTime } from '../../calculator/formatters';
import InfoPopover from '../../calculator/components/InfoPopover.jsx';
import UpgradeDetails from '../../calculator/components/UpgradeDetails.jsx';

export default function ResearchRow({
  item,
  selection,
  onSelectionChange,
  reductions,
  enabled,
  onToggle,
  researchById,
}) {
  const researchName = item.name;
  const rowTotal = calculateResearchCost(
    item,
    selection.currentLevel,
    selection.targetLevel,
    reductions,
  );
  const nextLevel = selection.currentLevel + 1;
  const nextLevelData = item.levels.find((entry) => entry.level === nextLevel);
  const targetLevelData = item.levels.find((entry) => entry.level === selection.targetLevel);
  const nextLevelTotal = selection.currentLevel < item.maxLevel
    ? calculateResearchCost(item, selection.currentLevel, nextLevel, reductions)
    : null;
  const formatPrerequisites = (levelData) => [
    ...(levelData?.institute > 0
      ? [`Research Institute Level ${levelData.institute}`]
      : []),
    ...(levelData?.requirements ?? []).map((requirement) => {
      const requiredResearch = researchById.get(requirement.researchId);
      return `${requiredResearch?.name ?? 'Research prerequisite'} Level ${requirement.level}`;
    }),
  ];

  const updateCurrentLevel = (currentLevel) => {
    onSelectionChange(item.id, {
      currentLevel,
      targetLevel: clampTargetLevel(item, currentLevel, selection.targetLevel),
    });
  };

  const updateTargetLevel = (targetLevel) => {
    onSelectionChange(item.id, {
      ...selection,
      targetLevel: clampTargetLevel(item, selection.currentLevel, targetLevel),
    });
  };

  return (
    <tr className={enabled ? '' : 'excluded-row'}>
      <td className="include-cell">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          aria-label={`Include ${researchName} in totals`}
        />
      </td>
      <th scope="row">
        <span className="research-name upgrade-name">
          {researchName}
          <InfoPopover
            trigger={<Info size={14} aria-hidden="true" />}
            label={`Show ${researchName} upgrade details`}
            triggerClassName="row-info-button"
          >
            <UpgradeDetails
              name={researchName}
              currentLevel={selection.currentLevel}
              targetLevel={selection.targetLevel}
              maxLevel={item.maxLevel}
              nextResult={nextLevelTotal}
              totalResult={rowTotal}
              nextPrerequisites={formatPrerequisites(nextLevelData)}
              targetPrerequisites={formatPrerequisites(targetLevelData)}
              resourceTypes={RESOURCE_TYPES}
              plannerPath={`#/planner/research/${encodeURIComponent(item.id)}`}
            />
          </InfoPopover>
        </span>
        <span className="research-meta">Max {item.maxLevel}</span>
      </th>
      <td>
        <select
          value={selection.currentLevel}
          onChange={(event) => updateCurrentLevel(Number(event.target.value))}
          aria-label={`Current level for ${researchName}`}
        >
          {Array.from({ length: item.maxLevel + 1 }, (_, level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          value={selection.targetLevel}
          onChange={(event) => updateTargetLevel(Number(event.target.value))}
          aria-label={`Target level for ${researchName}`}
        >
          {Array.from({ length: item.maxLevel + 1 }, (_, level) => (
            <option key={level} value={level} disabled={level < selection.currentLevel}>
              {level}
            </option>
          ))}
        </select>
      </td>
      <td>{formatNumber(rowTotal.resources.food)}</td>
      <td>{formatNumber(rowTotal.resources.wood)}</td>
      <td>{formatNumber(rowTotal.resources.stone)}</td>
      <td>{formatNumber(rowTotal.resources.iron)}</td>
      <td>{formatNumber(rowTotal.resources.ancientTome)}</td>
      <td>{formatNumber(rowTotal.resources.documentFragment)}</td>
      <td>{formatNumber(rowTotal.resources.inscription)}</td>
      <td>{formatNumber(rowTotal.resources.apocalypseResearchMaterial)}</td>
      <td>{formatTime(rowTotal.timeSeconds)}</td>
      <td>{formatNumber(rowTotal.power)}</td>
    </tr>
  );
}
