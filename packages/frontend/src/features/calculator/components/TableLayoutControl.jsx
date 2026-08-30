import React from 'react';
import useLocalStorageState from '../../../hooks/useLocalStorageState';

const MOBILE_LAYOUT_QUERY = '(max-width: 700px)';

export function useTableLayout() {
  const [storedLayout, setStoredLayout] = useLocalStorageState('pnc-table-layout-v1', () => (
    window.matchMedia(MOBILE_LAYOUT_QUERY).matches ? 'simplified' : 'standard'
  ));
  const layout = storedLayout === 'vertical'
    ? 'simplified'
    : storedLayout === 'horizontal'
      ? 'standard'
      : storedLayout;

  return [layout, setStoredLayout];
}

export default function TableLayoutControl({ layout, onChange }) {
  return (
    <label className="table-layout-control">
      <span>Layout</span>
      <select value={layout} onChange={(event) => onChange(event.target.value)}>
        <option value="standard">Standard</option>
        <option value="simplified">Simplified</option>
      </select>
    </label>
  );
}
