import React from 'react';
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
  prerequisites,
  resourceTypes,
}) {
  const nextLevel = currentLevel + 1;
  const hasNextLevel = currentLevel < maxLevel;
  const hasRange = targetLevel > currentLevel;

  return (
    <div className="popover-content upgrade-details">
      <div className="popover-title-row">
        <h3>{name}</h3>
        <span>Level {currentLevel} → {targetLevel}</span>
      </div>
      <p className="popover-note">Costs and time include your active reductions and speed bonus.</p>

      <section className="prerequisite-block">
        <h4>Prerequisites{hasNextLevel ? ` for Level ${nextLevel}` : ''}</h4>
        {hasNextLevel && prerequisites.length ? (
          <ul>
            {prerequisites.map((prerequisite) => (
              <li key={prerequisite}>{prerequisite}</li>
            ))}
          </ul>
        ) : (
          <p>{hasNextLevel ? 'None' : 'Maximum level reached'}</p>
        )}
      </section>

      <CostBlock
        title={hasNextLevel ? `Level ${nextLevel}` : 'Next level'}
        result={hasNextLevel ? nextResult : null}
        resourceTypes={resourceTypes}
        emptyMessage="Maximum level reached."
      />
      <CostBlock
        title={hasRange ? `Levels ${nextLevel}–${targetLevel}` : 'Selected range'}
        result={hasRange ? totalResult : null}
        resourceTypes={resourceTypes}
        emptyMessage="Choose a target above the current level."
      />
    </div>
  );
}
