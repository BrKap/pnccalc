import React, { useMemo, useState } from 'react';
import { ArrowLeft, ListChecks, Search } from 'lucide-react';
import categories from './data/categories.json';
import research from './data/research.json';
import useLocalStorageState from '../../hooks/useLocalStorageState';
import TotalsPanel from '../calculator/components/TotalsPanel.jsx';
import BulkLevelControls from '../calculator/components/BulkLevelControls.jsx';
import CollapsiblePanelGroup from '../calculator/components/CollapsiblePanelGroup.jsx';
import { applyBulkCurrentLevel, applyBulkTargetLevel } from '../calculator/lib/bulkLevels';
import { RESOURCE_TYPES, calculateCategoryTotals } from './lib/calculateResearchCost';
import CategoryTabs from './components/CategoryTabs.jsx';
import ReductionsPanel from './components/ReductionsPanel.jsx';
import ResearchTable from './components/ResearchTable.jsx';
import './research.css';

const researchById = new Map(research.map((item) => [item.id, item]));

const defaultReductions = {
  resourcePercent: {
    food: 0,
    wood: 0,
    stone: 0,
    iron: 0,
    inscription: 0,
  },
  resourceStatic: {
    food: 0,
    wood: 0,
    stone: 0,
    iron: 0,
  },
  researchSpeedPercent: 0,
};

export default function ResearchCalculator({ onNavigateHome }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [selections, setSelections] = useLocalStorageState('pnc-research-selections-v3', {});
  const [reductions, setReductions] = useLocalStorageState(
    'pnc-research-reductions-v2',
    defaultReductions,
  );
  const [enabledRows, setEnabledRows] = useLocalStorageState('pnc-research-enabled-rows-v2', {});
  const [enabledCategories, setEnabledCategories] = useLocalStorageState(
    'pnc-research-enabled-categories-v1',
    {},
  );

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const categoryItems = useMemo(() => {
    const itemIds = selectedCategory?.itemIds ?? [];
    return itemIds.map((id) => researchById.get(id)).filter(Boolean);
  }, [selectedCategory]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categoryItems;
    }

    return categoryItems.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [categoryItems, query]);

  const enabledCategoryItems = useMemo(
    () => categoryItems.filter((item) => enabledRows[item.id] !== false),
    [categoryItems, enabledRows],
  );
  const categoryTotals = useMemo(
    () => calculateCategoryTotals(enabledCategoryItems, selections, reductions),
    [enabledCategoryItems, selections, reductions],
  );
  const enabledResearch = useMemo(
    () => research.filter(
      (item) => enabledCategories[item.categoryId] !== false && enabledRows[item.id] !== false,
    ),
    [enabledCategories, enabledRows],
  );
  const overallTotals = useMemo(
    () => calculateCategoryTotals(enabledResearch, selections, reductions),
    [enabledResearch, selections, reductions],
  );
  const maxCategoryLevel = Math.max(0, ...categoryItems.map((item) => item.maxLevel));

  const toggleRow = (itemId) => {
    setEnabledRows((current) => ({ ...current, [itemId]: current[itemId] === false }));
  };

  const toggleCategory = (categoryId) => {
    setEnabledCategories((current) => ({
      ...current,
      [categoryId]: current[categoryId] === false,
    }));
  };

  return (
    <main className="calculator-page research-page">
      <header className="app-header">
        <div>
          <button type="button" className="back-button" onClick={onNavigateHome}>
            <ArrowLeft size={17} />
            Home
          </button>
          <p className="eyebrow">Puzzles & Chaos</p>
          <h1>Research Calculator</h1>
        </div>
        <div className="data-pill">
          <ListChecks size={16} />
          {research.length} research entries
        </div>
      </header>

      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        enabledCategories={enabledCategories}
        onSelectCategory={setSelectedCategoryId}
        onToggleCategory={toggleCategory}
      />

      <section className="workspace">
        <CollapsiblePanelGroup>
          <TotalsPanel
            totals={categoryTotals}
            resourceTypes={RESOURCE_TYPES}
            title={`${selectedCategory?.name ?? 'Category'} Cost`}
          />
          <TotalsPanel
            totals={overallTotals}
            resourceTypes={RESOURCE_TYPES}
            title="All Categories Cost"
          />
          <ReductionsPanel reductions={reductions} setReductions={setReductions} />
        </CollapsiblePanelGroup>

        <div className="primary-column">
          <div className="toolbar">
            <div>
              <p className="eyebrow">
                {selectedCategory?.name ?? ''}
              </p>
              <h2>
                {visibleItems.length} Research Items
              </h2>
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                value={query}
                placeholder="Search research"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <BulkLevelControls
              maxLevel={maxCategoryLevel}
              onApplyCurrent={(value) => setSelections((current) => (
                applyBulkCurrentLevel(categoryItems, current, value)
              ))}
              onApplyTarget={(value) => setSelections((current) => (
                applyBulkTargetLevel(categoryItems, current, value)
              ))}
            />
          </div>

          <ResearchTable
            items={visibleItems}
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
