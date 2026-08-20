import React, { useState } from 'react';
import { ListTree } from 'lucide-react';
import ResourceBadge from './ResourceBadge.jsx';
import { formatNumber, formatTime } from '../formatters';

function CostBlock({ title, result, resourceTypes, emptyMessage }) {
  if (!result) {
    return (
      <section className="upgrade-cost-block">
        <h4>{title}</h4>
        <p className="popover-empty">{emptyMessage}</p>
      </section>
    );
  }

  const usedResources = resourceTypes.filter((resource) => result.resources[resource] > 0);

  return (
    <section className="upgrade-cost-block">
      <h4>{title}</h4>
      <dl className="popover-cost-list">
        {usedResources.map((resource) => (
          <div key={resource}>
            <dt><ResourceBadge resource={resource} /></dt>
            <dd>{formatNumber(result.resources[resource])}</dd>
          </div>
        ))}
        {!usedResources.length && (
          <div>
            <dt>Resources</dt>
            <dd>None</dd>
          </div>
        )}
        <div>
          <dt>Time</dt>
          <dd>{formatTime(result.timeSeconds)}</dd>
        </div>
        <div>
          <dt>Power</dt>
          <dd>{formatNumber(result.power)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function UpgradeDetails({
  name,
  currentLevel,
  targetLevel,
  maxLevel,
  nextResult,
  totalResult,
  nextPrerequisites,
  targetPrerequisites,
  resourceTypes,
  plannerPath,
}) {
  const [scope, setScope] = useState('next');
  const nextLevel = currentLevel + 1;
  const hasNextLevel = currentLevel < maxLevel;
  const hasRange = targetLevel > currentLevel;
  const isTargetScope = scope === 'target';
  const prerequisiteLevel = isTargetScope ? targetLevel : nextLevel;
  const prerequisites = isTargetScope ? targetPrerequisites : nextPrerequisites;
  const result = isTargetScope ? totalResult : nextResult;
  const hasSelection = isTargetScope ? hasRange : hasNextLevel;
  const costTitle = isTargetScope
    ? hasRange ? `Levels ${nextLevel}–${targetLevel}` : 'Selected range'
    : hasNextLevel ? `Level ${nextLevel}` : 'Next level';
  const emptyMessage = isTargetScope
    ? 'Choose a target above the current level.'
    : 'Maximum level reached.';

  return (
    <div className="popover-content upgrade-details">
      <div className="popover-title-row">
        <h3>{name}</h3>
        <span>Level {currentLevel} → {targetLevel}</span>
      </div>
      <p className="popover-note">Costs and time include your active reductions and speed bonus.</p>

      <div className="upgrade-scope-toggle" role="group" aria-label="Upgrade detail level">
        <button
          type="button"
          className={isTargetScope ? '' : 'active'}
          aria-pressed={!isTargetScope}
          onClick={() => setScope('next')}
        >
          Next level
        </button>
        <button
          type="button"
          className={isTargetScope ? 'active' : ''}
          aria-pressed={isTargetScope}
          onClick={() => setScope('target')}
        >
          Target level
        </button>
      </div>

      <section className="prerequisite-block">
        <h4>Prerequisites{hasSelection ? ` for Level ${prerequisiteLevel}` : ''}</h4>
        {hasSelection && prerequisites.length ? (
          <ul>
            {prerequisites.map((prerequisite) => (
              <li key={prerequisite}>{prerequisite}</li>
            ))}
          </ul>
        ) : (
          <p>{hasSelection ? 'None' : emptyMessage}</p>
        )}
      </section>

      <CostBlock
        title={costTitle}
        result={hasSelection ? result : null}
        resourceTypes={resourceTypes}
        emptyMessage={emptyMessage}
      />
      {plannerPath && hasSelection && (
        <a
          className="planner-link"
          href={`${plannerPath}?level=${prerequisiteLevel}`}
        >
          <ListTree size={15} />
          Open full prerequisite planner
        </a>
      )}
    </div>
  );
}
