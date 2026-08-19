import React from 'react';
import { calculateResearchCost, clampTargetLevel } from '../lib/calculateResearchCost';
import { formatNumber, formatTime } from '../../calculator/formatters';

export default function ResearchRow({
  item,
  selection,
  onSelectionChange,
  reductions,
  enabled,
  onToggle,
}) {
  const researchName = item.name;
  const rowTotal = calculateResearchCost(
    item,
    selection.currentLevel,
    selection.targetLevel,
    reductions,
  );

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
        <span className="research-name">{researchName}</span>
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
