import React, { useState } from 'react';
import { ChevronsUp } from 'lucide-react';

function LevelSelect({ label, maxLevel, value, onChange }) {
  return (
    <label className="bulk-level-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Array.from({ length: maxLevel + 1 }, (_, level) => (
          <option key={level} value={level}>{level}</option>
        ))}
        <option value="max">Max</option>
      </select>
    </label>
  );
}

export default function BulkLevelControls({ maxLevel, onApplyCurrent, onApplyTarget }) {
  const [currentLevel, setCurrentLevel] = useState('0');
  const [targetLevel, setTargetLevel] = useState('0');

  return (
    <div className="bulk-level-controls" aria-label="Set all row levels">
      <ChevronsUp size={18} aria-hidden="true" />
      <LevelSelect label="All current" maxLevel={maxLevel} value={currentLevel} onChange={setCurrentLevel} />
      <button type="button" onClick={() => onApplyCurrent(currentLevel)}>Apply</button>
      <LevelSelect label="All target" maxLevel={maxLevel} value={targetLevel} onChange={setTargetLevel} />
      <button type="button" onClick={() => onApplyTarget(targetLevel)}>Apply</button>
    </div>
  );
}
