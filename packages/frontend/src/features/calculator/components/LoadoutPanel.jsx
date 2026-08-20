import React, { useId } from 'react';
import NumberInput from './NumberInput.jsx';
import InfoPopover from './InfoPopover.jsx';
import LoadoutEffectDetails from './LoadoutEffectDetails.jsx';

function updateSelection(setLoadout, group, id, value) {
  setLoadout((current) => ({
    ...current,
    [group]: {
      ...(current[group] ?? {}),
      [id]: value,
    },
  }));
}

function SelectionField({ item, group, value, setLoadout, image }) {
  const fieldId = useId();
  const selection = value ?? '';

  return (
    <div className="loadout-field">
      <span className="loadout-label">
        {image && (
          <InfoPopover
            trigger={<img src={image} alt="" />}
            label={`Show ${item.name} reductions`}
            triggerClassName="loadout-icon-button"
          >
            <LoadoutEffectDetails
              item={item}
              selection={selection}
              group={group}
              image={image}
            />
          </InfoPopover>
        )}
        <label htmlFor={fieldId}>{item.name}</label>
      </span>
      <select
        id={fieldId}
        value={selection}
        onChange={(event) => updateSelection(setLoadout, group, item.id, event.target.value)}
      >
        <option value="">None</option>
        {Object.keys(item.levels).map((level) => (
          <option key={level} value={level}>
            {group === 'gear' ? `${level} star` : `+${level}`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function LoadoutPanel({ config, loadout, setLoadout, images = {} }) {
  const setBonusActive = config.setBonus?.isActive(loadout.gear ?? {}) ?? false;

  return (
    <section className="control-panel loadout-panel" aria-label={`${config.name} setup controls`}>
      <div className="panel-heading loadout-heading">
        <div>
          <h2>{config.name} Setup</h2>
          <p>Choose the gear and heroes you own. Cost reductions update automatically.</p>
        </div>
        {config.setBonus && (
          <span className={`set-bonus-pill ${setBonusActive ? 'active' : ''}`}>
            {setBonusActive ? 'Full 7-star bonus active' : 'Full 7-star bonus inactive'}
          </span>
        )}
      </div>

      <div className="loadout-sections">
        <fieldset className="loadout-options">
          <legend>Gear</legend>
          <div className="loadout-grid gear-grid">
            {config.gear.map((piece) => (
              <SelectionField
                key={piece.id}
                item={piece}
                group="gear"
                value={loadout.gear?.[piece.id]}
                setLoadout={setLoadout}
                image={images[piece.id]}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="loadout-options">
          <legend>Heroes</legend>
          <div className="loadout-grid hero-grid">
            {config.heroes.map((hero) => (
              <SelectionField
                key={hero.id}
                item={hero}
                group="heroes"
                value={loadout.heroes?.[hero.id]}
                setLoadout={setLoadout}
                image={images[hero.id]}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="loadout-options speed-options">
          <legend>Speed</legend>
          <NumberInput
            label={`${config.speedLabel} (%)`}
            value={loadout.speedPercent ?? 0}
            min={0}
            max={1000}
            suffix="%"
            onChange={(value) => setLoadout((current) => ({
              ...current,
              speedPercent: Math.max(0, value),
            }))}
          />
          <p>Enter the percentage bonus indicated from your Lord Detail's page in game.</p>
        </fieldset>
      </div>
    </section>
  );
}
