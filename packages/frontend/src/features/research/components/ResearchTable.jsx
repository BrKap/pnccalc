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
            <th>Research</th>
            <th>Current</th>
            <th>Target</th>
            <th><ResourceBadge resource="food" compact /></th>
            <th><ResourceBadge resource="wood" compact /></th>
            <th><ResourceBadge resource="stone" compact /></th>
            <th><ResourceBadge resource="iron" compact /></th>
            <th><ResourceBadge resource="ancientTome" compact /></th>
            <th><ResourceBadge resource="documentFragment" compact /></th>
            <th><ResourceBadge resource="inscription" compact /></th>
            <th><ResourceBadge resource="apocalypseResearchMaterial" compact /></th>
            <th>Time</th>
            <th>Power</th>
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
