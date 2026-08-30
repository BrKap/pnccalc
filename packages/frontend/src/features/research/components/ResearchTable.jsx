import React from 'react';
import ResearchRow from './ResearchRow.jsx';
import ResourceBadge from '../../calculator/components/ResourceBadge.jsx';

export default function ResearchTable({
  items,
  selections,
  setSelections,
  reductions,
  enabledRows,
  onToggleRow,
  researchById,
}) {
  const onSelectionChange = (itemId, nextSelection) => {
    setSelections((current) => ({
      ...current,
      [itemId]: nextSelection,
    }));
  };

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th><span className="visually-hidden">Include</span></th>
            <th>Upgrade</th>
            <th>Current</th>
            <th>Target</th>
            <th className="mobile-details-heading"><span className="visually-hidden">Details</span></th>
            <th className="cost-column"><ResourceBadge resource="food" compact /></th>
            <th className="cost-column"><ResourceBadge resource="wood" compact /></th>
            <th className="cost-column"><ResourceBadge resource="stone" compact /></th>
            <th className="cost-column"><ResourceBadge resource="iron" compact /></th>
            <th className="cost-column"><ResourceBadge resource="ancientTome" compact /></th>
            <th className="cost-column"><ResourceBadge resource="documentFragment" compact /></th>
            <th className="cost-column"><ResourceBadge resource="inscription" compact /></th>
            <th className="cost-column"><ResourceBadge resource="apocalypseResearchMaterial" compact /></th>
            <th className="cost-column">Time</th>
            <th className="cost-column">Power</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ResearchRow
              key={item.id}
              item={item}
              enabled={enabledRows[item.id] !== false}
              onToggle={() => onToggleRow(item.id)}
              selection={selections[item.id] ?? { currentLevel: 0, targetLevel: 0 }}
              onSelectionChange={onSelectionChange}
              reductions={reductions}
              researchById={researchById}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
