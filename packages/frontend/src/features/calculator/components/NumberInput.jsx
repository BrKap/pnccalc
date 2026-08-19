import React, { useEffect, useState } from 'react';

export default function NumberInput({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  onChange,
}) {
  const [draftValue, setDraftValue] = useState(String(value ?? ''));

  useEffect(() => {
    setDraftValue(String(value ?? ''));
  }, [value]);

  const updateValue = (event) => {
    const nextDraft = event.target.value;
    setDraftValue(nextDraft);

    if (nextDraft !== '') {
      onChange(Number(nextDraft));
    }
  };

  const restoreEmptyValue = () => {
    if (draftValue !== '') return;
    const fallback = Math.max(0, min);
    setDraftValue(String(fallback));
    onChange(fallback);
  };

  return (
    <label className="field">
      <span>{label}</span>
      <span className="number-input-control">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draftValue}
          onChange={updateValue}
          onBlur={restoreEmptyValue}
        />
        {suffix && <span className="number-input-suffix" aria-hidden="true">{suffix}</span>}
      </span>
    </label>
  );
}
