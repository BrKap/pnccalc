import React from 'react';
import { formatNumber, formatTime } from '../formatters';
import ResourceBadge from './ResourceBadge.jsx';

export default function TotalsPanel({ totals, resourceTypes, title = 'Total Cost' }) {
  return (
    <aside className="totals-panel" aria-label="Total costs">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>

      <div className="total-grid">
        {resourceTypes.map((resource) => (
          <div className="total-cell" key={resource}>
            <ResourceBadge resource={resource} />
            <strong>{formatNumber(totals.resources[resource])}</strong>
          </div>
        ))}
      </div>

      <div className="metric-row">
        <span>Speedup</span>
        <strong>{formatTime(totals.timeSeconds)}</strong>
      </div>
      <div className="metric-row">
        <span>Power</span>
        <strong>{formatNumber(totals.power)}</strong>
      </div>
    </aside>
  );
}
