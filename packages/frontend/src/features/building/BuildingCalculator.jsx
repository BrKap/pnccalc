import React, { useMemo, useState } from 'react';
import { ArrowLeft, ListChecks, Search } from 'lucide-react';
import useLocalStorageState from '../../hooks/useLocalStorageState';
import TotalsPanel from '../calculator/components/TotalsPanel.jsx';
import BulkLevelControls from '../calculator/components/BulkLevelControls.jsx';
import CollapsiblePanelGroup from '../calculator/components/CollapsiblePanelGroup.jsx';
import { applyBulkCurrentLevel, applyBulkTargetLevel } from '../calculator/lib/bulkLevels';
import buildings from './data/buildings.json';
import BuildingReductionsPanel from './components/BuildingReductionsPanel.jsx';
import BuildingTable from './components/BuildingTable.jsx';
import {
  BUILDING_RESOURCE_TYPES,
  calculateBuildingTotals,
} from './lib/calculateBuildingCost';
import { createBuildingRows } from './lib/createBuildingRows';
import '../research/research.css';

const buildingRows = createBuildingRows(buildings);

const defaultReductions = {
  resourcePercent: { food: 0, wood: 0, stone: 0, iron: 0, goldStatue: 0 },
  resourceStatic: { food: 0, wood: 0, stone: 0, iron: 0 },
  constructionSpeedPercent: 0,
};

export default function BuildingCalculator({ onNavigateHome }) {
  const [query, setQuery] = useState('');
  const [selections, setSelections] = useLocalStorageState('pnc-building-selections-v1', {});
  const [reductions, setReductions] = useLocalStorageState(
    'pnc-building-reductions-v1',
    defaultReductions,
  );
  const [enabledRows, setEnabledRows] = useLocalStorageState('pnc-building-enabled-rows-v1', {});
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? buildingRows.filter((row) => row.name.toLowerCase().includes(normalizedQuery))
      : buildingRows;
  }, [query]);
  const totals = useMemo(
    () => calculateBuildingTotals(
      buildingRows.filter((row) => enabledRows[row.id] !== false),
      selections,
      reductions,
    ),
    [selections, reductions, enabledRows],
  );
  const maxBuildingLevel = Math.max(0, ...buildingRows.map((row) => row.building.maxLevel));
  const toggleRow = (rowId) => {
    setEnabledRows((current) => ({ ...current, [rowId]: current[rowId] === false }));
  };

  return (
    <main className="calculator-page building-page">
      <header className="app-header">
        <div>
          <button type="button" className="back-button" onClick={onNavigateHome}>
            <ArrowLeft size={17} />
            Home
          </button>
          <p className="eyebrow">Puzzles & Chaos</p>
          <h1>Building Calculator</h1>
        </div>
        <div className="data-pill">
          <ListChecks size={16} />
          {buildingRows.length} building slots
        </div>
      </header>

      <section className="category-strip" aria-label="Building categories">
        <button type="button" className="active">Buildings</button>
      </section>

      <section className="workspace">
        <CollapsiblePanelGroup>
          <TotalsPanel totals={totals} resourceTypes={BUILDING_RESOURCE_TYPES} />
          <BuildingReductionsPanel reductions={reductions} setReductions={setReductions} />
        </CollapsiblePanelGroup>

        <div className="primary-column">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Buildings</p>
              <h2>{visibleRows.length} Building Rows</h2>
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                value={query}
                placeholder="Search buildings"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <BulkLevelControls
              maxLevel={maxBuildingLevel}
              onApplyCurrent={(value) => setSelections((current) => (
                applyBulkCurrentLevel(buildingRows, current, value)
              ))}
              onApplyTarget={(value) => setSelections((current) => (
                applyBulkTargetLevel(buildingRows, current, value)
              ))}
            />
          </div>
          <BuildingTable
            rows={visibleRows}
            selections={selections}
            setSelections={setSelections}
            reductions={reductions}
            enabledRows={enabledRows}
            onToggleRow={toggleRow}
          />
        </div>
      </section>
    </main>
  );
}
