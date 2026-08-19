import React from 'react';
import { IMAGE_ASSETS } from '../assets/resourceImages';
import { RESOURCE_IMAGE_IDS, RESOURCE_LABELS } from '../resourceConfig';

export default function ResourceBadge({ resource, compact = false }) {
  const label = RESOURCE_LABELS[resource] ?? resource;
  const image = IMAGE_ASSETS[RESOURCE_IMAGE_IDS[resource]];

  return (
    <span className={`resource-badge resource-${resource}`} title={label}>
      {image ? (
        <img className="resource-image" src={image} alt="" aria-hidden="true" />
      ) : (
        <span className="resource-icon" aria-hidden="true">
          {label.slice(0, 1)}
        </span>
      )}
      <span className={compact ? 'visually-hidden' : undefined}>{label}</span>
    </span>
  );
}
