import React from 'react';
import { RESOURCE_LABELS } from '../resourceConfig';
import { formatNumber } from '../formatters';

export default function LoadoutEffectDetails({ item, selection, group, image }) {
  const effects = item.levels[selection];

  return (
    <div className="popover-content">
      <div className="popover-title-row">
        <div className="popover-item-title">
          {image && <img src={image} alt="" aria-hidden="true" />}
          <h3>{item.name}</h3>
        </div>
        <span>{selection === '' || selection == null
          ? 'Not selected'
          : group === 'gear' ? `${selection} star` : `+${selection}`}</span>
      </div>
      {!effects ? (
        <p className="popover-empty">Select a level to view this item’s reductions.</p>
      ) : (
        <dl className="effect-list">
          {Object.entries(effects.percent ?? {}).map(([resource, value]) => (
            <div key={`percent-${resource}`}>
              <dt>{RESOURCE_LABELS[resource]}</dt>
              <dd>{Number((value * 100).toFixed(2))}% reduction</dd>
            </div>
          ))}
          {Object.entries(effects.static ?? {}).map(([resource, value]) => (
            <div key={`static-${resource}`}>
              <dt>{RESOURCE_LABELS[resource]}</dt>
              <dd>{formatNumber(value)} flat reduction</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
