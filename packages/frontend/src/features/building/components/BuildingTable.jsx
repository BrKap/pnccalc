import React from 'react';
import ResourceBadge from '../../calculator/components/ResourceBadge.jsx';
import { BUILDING_RESOURCE_TYPES } from '../lib/calculateBuildingCost';
import BuildingRow from './BuildingRow.jsx';

export default function BuildingTable({
  rows,
  selections,
  setSelections,
  reductions,
  enabledRows,
  onToggleRow,
}) {
  const onSelectionChange = (rowId, nextSelection) => {
    setSelections((current) => ({ ...current, [rowId]: nextSelection }));
  };

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th><span className="visually-hidden">Include</span></th>
            <th>Building</th>
            <th>Current</th>
            <th>Target</th>
            {BUILDING_RESOURCE_TYPES.map((resource) => (
              <th key={resource}><ResourceBadge resource={resource} compact /></th>
            ))}
            <th>Time</th>
            <th>Power</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <BuildingRow
              key={row.id}
              row={row}
              enabled={enabledRows[row.id] !== false}
              onToggle={() => onToggleRow(row.id)}
              selection={selections[row.id] ?? { currentLevel: 0, targetLevel: 0 }}
              onSelectionChange={onSelectionChange}
              reductions={reductions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
