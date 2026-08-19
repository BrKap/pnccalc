import React from 'react';
import { RESOURCE_LABELS } from '../resourceConfig';
import { formatNumber } from '../formatters';

function formatPercent(value) {
  return `${Number(((value ?? 0) * 100).toFixed(2))}%`;
}

export default function CalculatedReductionsPanel({ reductions, percentResources, staticResources }) {
  return (
    <section className="control-panel" aria-label="Calculated cost reductions">
      <div className="panel-heading reduction-heading">
        <div>
          <h2>Cost Reductions</h2>
          <p>Calculated from your selected gear and heroes.</p>
        </div>
      </div>
      <div className="control-columns reduction-columns">
        <div>
          <h3>Percent</h3>
          <dl className="reduction-list">
            {percentResources.map((resource) => (
              <div key={resource}>
                <dt>{RESOURCE_LABELS[resource]}</dt>
                <dd>{formatPercent(reductions.resourcePercent[resource])}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3>Static</h3>
          <dl className="reduction-list">
            {staticResources.map((resource) => (
              <div key={resource}>
                <dt>{RESOURCE_LABELS[resource]}</dt>
                <dd>{formatNumber(reductions.resourceStatic[resource] ?? 0)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
