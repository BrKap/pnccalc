import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, ListTree, Target } from 'lucide-react';
import buildings from '../building/data/buildings.json';
import research from '../research/data/research.json';
import { createBuildingRows } from '../building/lib/createBuildingRows';
import {
  BUILDING_RESOURCE_TYPES,
  calculateBuildingCost,
} from '../building/lib/calculateBuildingCost';
import { RESOURCE_TYPES, calculateResearchCost } from '../research/lib/calculateResearchCost';
import { builderLoadoutConfig } from '../building/data/builderLoadout';
import { researchLoadoutConfig } from '../research/data/researchLoadout';
import { calculateLoadoutReductions } from '../calculator/lib/calculateLoadoutReductions';
import { formatNumber, formatTime } from '../calculator/formatters';
import ResourceBadge from '../calculator/components/ResourceBadge.jsx';
import PresetControl from '../presets/PresetControl.jsx';
import { usePresetField } from '../presets/PresetContext.jsx';
import useLocalStorageState from '../../hooks/useLocalStorageState';
import {
  raiseSelectionTarget,
  resolveBuildingPrerequisites,
  resolveResearchPrerequisites,
  selectBuildingRow,
} from './lib/resolvePrerequisites';
import './planner.css';

const buildingRows = createBuildingRows(buildings);
const buildingById = new Map(buildings.map((building) => [building.id, building]));
const researchById = new Map(research.map((item) => [item.id, item]));
const allResourceTypes = [...new Set([...RESOURCE_TYPES, ...BUILDING_RESOURCE_TYPES])];
const defaultLoadout = { gear: {}, heroes: {}, speedPercent: 0 };

function addCost(totals, cost) {
  if (!cost) return totals;
  Object.entries(cost.resources).forEach(([resource, amount]) => {
    totals.resources[resource] = (totals.resources[resource] ?? 0) + amount;
  });
  totals.timeSeconds += cost.timeSeconds;
  totals.power += cost.power;
  return totals;
}

function getStatus(currentLevel, targetLevel, requiredLevel) {
  if (currentLevel >= requiredLevel) return 'completed';
  if (targetLevel >= requiredLevel) return 'planned';
  return 'missing';
}

function RequirementCard({ requirement }) {
  const usedResources = allResourceTypes.filter(
    (resource) => (requirement.cost?.resources[resource] ?? 0) > 0,
  );
  const statusLabels = {
    completed: 'Requirement met',
    planned: 'Already planned',
    missing: 'Target needed',
  };

  return (
    <article className={`planner-requirement ${requirement.status}`}>
      <details>
        <summary>
          <span className="requirement-status-icon" aria-hidden="true">
            {requirement.status === 'completed' ? <Check size={16} /> : <ChevronRight size={16} />}
          </span>
          <span className="requirement-name">
            <strong>{requirement.name}</strong>
            <small>{statusLabels[requirement.status]}</small>
          </span>
          <span className="requirement-levels">
            <strong>Level {requirement.requiredLevel}</strong>
            <small>Current {requirement.currentLevel}</small>
          </span>
        </summary>
        <div className="requirement-details">
          <div>
            <h4>Why required?</h4>
            {requirement.reasons.length ? (
              <ul>
                {requirement.reasons.map((reason, index) => (
                  <li key={`${reason}:${index}`}>{reason}</li>
                ))}
              </ul>
            ) : <p>{requirement.reason}</p>}
          </div>
          <div>
            <h4>Remaining cost</h4>
            {requirement.status === 'completed' ? <p>None — current level is sufficient.</p> : (
              <div className="requirement-costs">
                {usedResources.map((resource) => (
                  <span key={resource}>
                    <ResourceBadge resource={resource} compact />
                    {formatNumber(requirement.cost.resources[resource])}
                  </span>
                ))}
                <span>Time <strong>{formatTime(requirement.cost.timeSeconds)}</strong></span>
                <span>Power <strong>{formatNumber(requirement.cost.power)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </details>
    </article>
  );
}

export default function PlannerPage({ planner }) {
  const [researchSelections, setResearchSelections] = usePresetField('researchSelections', {});
  const [buildingSelections, setBuildingSelections] = usePresetField('buildingSelections', {});
  const [researchLoadout] = usePresetField('researchLoadout', defaultLoadout);
  const [buildingLoadout] = usePresetField('buildingLoadout', defaultLoadout);
  const [, setGoals] = usePresetField('goals', []);
  const [hideCompleted, setHideCompleted] = useLocalStorageState(
    'pnc-planner-hide-completed-v1',
    false,
  );
  const [showApplyPreview, setShowApplyPreview] = useState(false);

  const type = planner.type;
  const goalRow = type === 'building'
    ? buildingRows.find((row) => row.id === planner.goalId)
      ?? buildingRows.find((row) => row.building.id === planner.goalId)
    : null;
  const goalItem = type === 'research' ? researchById.get(planner.goalId) : goalRow?.building;
  const goalSelection = type === 'research'
    ? researchSelections[goalItem?.id]
    : buildingSelections[goalRow?.id];
  const currentLevel = goalSelection?.currentLevel ?? 0;
  const initialLevel = Math.max(
    currentLevel,
    Math.min(goalItem?.maxLevel ?? 0, planner.level || currentLevel),
  );
  const [goalLevel, setGoalLevel] = useState(initialLevel);

  useEffect(() => {
    setGoalLevel(initialLevel);
    setShowApplyPreview(false);
  }, [planner.type, planner.goalId, planner.level, initialLevel]);

  const researchReductions = useMemo(
    () => calculateLoadoutReductions(researchLoadoutConfig, researchLoadout),
    [researchLoadout],
  );
  const buildingReductions = useMemo(
    () => calculateLoadoutReductions(builderLoadoutConfig, buildingLoadout),
    [buildingLoadout],
  );

  const resolution = useMemo(() => {
    if (!goalItem) return { requirements: [], errors: ['Upgrade not found.'], instituteLevel: 0 };
    return type === 'research'
      ? resolveResearchPrerequisites(research, goalItem.id, goalLevel)
      : resolveBuildingPrerequisites(buildings, goalItem.id, goalLevel);
  }, [type, goalItem, goalLevel]);

  const plan = useMemo(() => {
    if (!goalItem) return { requirements: [], totals: null, changes: 0, met: 0 };
    const totals = {
      resources: Object.fromEntries(allResourceTypes.map((resource) => [resource, 0])),
      timeSeconds: 0,
      power: 0,
    };
    const requirements = [];

    if (type === 'research') {
      const goalCurrent = researchSelections[goalItem.id]?.currentLevel ?? 0;
      addCost(totals, calculateResearchCost(
        goalItem,
        goalCurrent,
        Math.max(goalCurrent, goalLevel),
        researchReductions,
      ));

      resolution.requirements.forEach((entry) => {
        const item = researchById.get(entry.id);
        const selection = researchSelections[entry.id] ?? { currentLevel: 0, targetLevel: 0 };
        const status = getStatus(selection.currentLevel, selection.targetLevel, entry.level);
        const cost = calculateResearchCost(
          item,
          selection.currentLevel,
          Math.max(selection.currentLevel, entry.level),
          researchReductions,
        );
        addCost(totals, cost);
        requirements.push({
          key: `research:${entry.id}`,
          type: 'research',
          id: entry.id,
          name: item.name,
          requiredLevel: entry.level,
          currentLevel: selection.currentLevel,
          targetLevel: selection.targetLevel,
          status,
          cost,
          reasons: entry.reasons.map((reason) => {
            const parent = researchById.get(reason.requiredById);
            return `Required to upgrade ${parent?.name ?? 'Research'} to level ${reason.atLevel}`;
          }),
        });
      });

      if (resolution.instituteLevel > 0) {
        const institute = buildings.find((building) => building.name === 'Institute');
        const row = selectBuildingRow(buildingRows, institute.id, buildingSelections);
        const selection = buildingSelections[row.id] ?? { currentLevel: 0, targetLevel: 0 };
        const status = getStatus(
          selection.currentLevel,
          selection.targetLevel,
          resolution.instituteLevel,
        );
        const cost = calculateBuildingCost(
          institute,
          selection.currentLevel,
          Math.max(selection.currentLevel, resolution.instituteLevel),
          buildingReductions,
        );
        addCost(totals, cost);
        requirements.push({
          key: 'building:institute',
          type: 'building',
          id: institute.id,
          rowId: row.id,
          name: 'Research Institute',
          requiredLevel: resolution.instituteLevel,
          currentLevel: selection.currentLevel,
          targetLevel: selection.targetLevel,
          status,
          cost,
          reasons: [],
          reason: 'Highest Institute requirement in the research prerequisite closure.',
        });
      }
    } else {
      const goalCurrent = buildingSelections[goalRow.id]?.currentLevel ?? 0;
      addCost(totals, calculateBuildingCost(
        goalItem,
        goalCurrent,
        Math.max(goalCurrent, goalLevel),
        buildingReductions,
      ));

      resolution.requirements.forEach((entry) => {
        const building = buildingById.get(entry.id);
        const row = selectBuildingRow(buildingRows, entry.id, buildingSelections);
        const selection = buildingSelections[row.id] ?? { currentLevel: 0, targetLevel: 0 };
        const status = getStatus(selection.currentLevel, selection.targetLevel, entry.level);
        const cost = calculateBuildingCost(
          building,
          selection.currentLevel,
          Math.max(selection.currentLevel, entry.level),
          buildingReductions,
        );
        addCost(totals, cost);
        requirements.push({
          key: `building:${entry.id}`,
          type: 'building',
          id: entry.id,
          rowId: row.id,
          name: row.name,
          requiredLevel: entry.level,
          currentLevel: selection.currentLevel,
          targetLevel: selection.targetLevel,
          status,
          cost,
          reasons: entry.reasons.map((reason) => {
            const parent = buildingById.get(reason.requiredById);
            return `Required to upgrade ${parent?.name ?? 'Building'} to level ${reason.atLevel}`;
          }),
        });
      });
    }

    requirements.sort((left, right) => (
      (left.status === 'completed') - (right.status === 'completed')
      || left.name.localeCompare(right.name)
    ));
    const goalTarget = goalSelection?.targetLevel ?? 0;
    const goalNeedsChange = goalTarget < goalLevel;
    return {
      requirements,
      totals,
      changes: requirements.filter((entry) => entry.targetLevel < entry.requiredLevel).length
        + (goalNeedsChange ? 1 : 0),
      met: requirements.filter((entry) => entry.status === 'completed').length,
    };
  }, [
    type,
    goalItem,
    goalRow,
    goalLevel,
    goalSelection,
    resolution,
    researchSelections,
    buildingSelections,
    researchReductions,
    buildingReductions,
  ]);

  if (!goalItem) {
    return (
      <main className="calculator-page planner-page">
        <a className="back-button" href="#/"><ArrowLeft size={17} /> Home</a>
        <section className="planner-empty"><h1>Upgrade not found</h1></section>
      </main>
    );
  }

  const visibleRequirements = hideCompleted
    ? plan.requirements.filter((entry) => entry.status !== 'completed')
    : plan.requirements;
  const usedResourceTypes = allResourceTypes.filter(
    (resource) => (plan.totals.resources[resource] ?? 0) > 0,
  );

  const applyPlan = () => {
    if (type === 'research') {
      setResearchSelections((current) => {
        let next = raiseSelectionTarget(current, goalItem.id, goalLevel);
        resolution.requirements.forEach((entry) => {
          next = raiseSelectionTarget(next, entry.id, entry.level);
        });
        return next;
      });
      if (resolution.instituteLevel > 0) {
        const institute = buildings.find((building) => building.name === 'Institute');
        setBuildingSelections((current) => {
          const row = selectBuildingRow(buildingRows, institute.id, current);
          return raiseSelectionTarget(current, row.id, resolution.instituteLevel);
        });
      }
    } else {
      setBuildingSelections((current) => {
        let next = raiseSelectionTarget(current, goalRow.id, goalLevel);
        resolution.requirements.forEach((entry) => {
          const row = selectBuildingRow(buildingRows, entry.id, next);
          next = raiseSelectionTarget(next, row.id, entry.level);
        });
        return next;
      });
    }

    setGoals((current) => [
      ...current.filter((goal) => !(goal.type === type && goal.id === planner.goalId)),
      { type, id: planner.goalId, level: goalLevel },
    ]);
    setShowApplyPreview(false);
  };

  return (
    <main className="calculator-page planner-page">
      <header className="app-header">
        <div>
          <a className="back-button" href={type === 'research' ? '#/research' : '#/building'}>
            <ArrowLeft size={17} />
            {type === 'research' ? 'Research calculator' : 'Building calculator'}
          </a>
          <p className="eyebrow">Upgrade planner</p>
          <h1>{goalRow?.name ?? goalItem.name}</h1>
        </div>
        <div className="header-actions">
          <PresetControl />
          <div className="data-pill"><ListTree size={16} /> {plan.requirements.length} requirements</div>
        </div>
      </header>

      <section className="planner-goal" aria-labelledby="planner-goal-heading">
        <div>
          <p className="eyebrow">Goal</p>
          <h2 id="planner-goal-heading">{goalRow?.name ?? goalItem.name}</h2>
          <p>Current level {currentLevel}</p>
        </div>
        <label>
          Target level
          <select value={goalLevel} onChange={(event) => setGoalLevel(Number(event.target.value))}>
            {Array.from({ length: goalItem.maxLevel + 1 }, (_, level) => (
              <option key={level} value={level} disabled={level < currentLevel}>{level}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="planner-summary" aria-label="Plan summary">
        <div><strong>{plan.requirements.length}</strong><span>Requirements</span></div>
        <div><strong>{plan.met}</strong><span>Already met</span></div>
        <div><strong>{plan.changes}</strong><span>Targets to raise</span></div>
        <div><strong>{formatTime(plan.totals.timeSeconds)}</strong><span>Total time</span></div>
        <div><strong>{formatNumber(plan.totals.power)}</strong><span>Total power</span></div>
      </section>

      <div className="planner-layout">
        <section className="planner-requirements" aria-labelledby="requirements-heading">
          <div className="planner-section-heading">
            <div><p className="eyebrow">Highest levels only</p><h2 id="requirements-heading">Requirements</h2></div>
            <label><input type="checkbox" checked={hideCompleted} onChange={(event) => setHideCompleted(event.target.checked)} /> Hide completed</label>
          </div>
          {resolution.errors?.length > 0 && (
            <div className="planner-errors" role="alert">
              {resolution.errors.map((error) => <p key={error}>{error}</p>)}
            </div>
          )}
          <div className="requirement-list">
            {visibleRequirements.map((requirement) => (
              <RequirementCard key={requirement.key} requirement={requirement} />
            ))}
            {!visibleRequirements.length && (
              <p className="planner-empty">All requirements are already met.</p>
            )}
          </div>
        </section>

        <aside className="planner-cost-panel">
          <h2>Total remaining cost</h2>
          <div className="planner-resource-list">
            {usedResourceTypes.map((resource) => (
              <div key={resource}><ResourceBadge resource={resource} /><strong>{formatNumber(plan.totals.resources[resource])}</strong></div>
            ))}
            {!usedResourceTypes.length && <p>No remaining resource cost.</p>}
          </div>
          <div className="metric-row"><span>Time</span><strong>{formatTime(plan.totals.timeSeconds)}</strong></div>
          <div className="metric-row"><span>Power</span><strong>{formatNumber(plan.totals.power)}</strong></div>
        </aside>
      </div>

      <div className="planner-action-bar">
        {showApplyPreview ? (
          <div className="apply-preview">
            <span>Raise {plan.changes} targets; {plan.met} requirements are already met.</span>
            <button type="button" className="secondary-button" onClick={() => setShowApplyPreview(false)}>Cancel</button>
            <button type="button" className="primary-button" onClick={applyPlan}>Confirm targets</button>
          </div>
        ) : (
          <button type="button" className="primary-button" onClick={() => setShowApplyPreview(true)}>
            <Target size={17} /> Review &amp; apply targets
          </button>
        )}
      </div>
    </main>
  );
}
