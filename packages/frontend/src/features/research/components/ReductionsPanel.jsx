import React from 'react';
import NumberInput from '../../calculator/components/NumberInput.jsx';
import { RESOURCE_LABELS } from '../../calculator/resourceConfig';

export default function ReductionsPanel({ reductions, setReductions }) {
  const setPercent = (key, value) => {
    setReductions((current) => ({
      ...current,
      resourcePercent: {
        ...current.resourcePercent,
        [key]: Math.max(0, value) / 100,
      },
    }));
  };

  const setStatic = (key, value) => {
    setReductions((current) => ({
      ...current,
      resourceStatic: {
        ...current.resourceStatic,
        [key]: Math.max(0, value),
      },
    }));
  };

  return (
    <section className="control-panel" aria-label="Reduction controls">
      <div className="panel-heading">
        <h2>Reductions</h2>
      </div>

      <div className="control-columns">
        <div>
          <h3>Percent</h3>
          {['food', 'wood', 'stone', 'iron', 'inscription'].map((resource) => (
            <NumberInput
              key={resource}
              label={RESOURCE_LABELS[resource]}
              value={Math.round((reductions.resourcePercent[resource] ?? 0) * 100)}
              min={0}
              max={100}
              onChange={(value) => setPercent(resource, value)}
            />
          ))}
          <NumberInput
            label="Research Speed"
            value={Math.round(reductions.researchSpeedPercent * 100)}
            min={0}
            max={1000}
            onChange={(value) =>
              setReductions((current) => ({
                ...current,
                researchSpeedPercent: Math.max(0, value) / 100,
              }))
            }
          />
        </div>

        <div>
          <h3>Static</h3>
          {['food', 'wood', 'stone', 'iron'].map((resource) => (
            <NumberInput
              key={resource}
              label={RESOURCE_LABELS[resource]}
              value={reductions.resourceStatic[resource] ?? 0}
              min={0}
              max={999999999}
              onChange={(value) => setStatic(resource, value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
