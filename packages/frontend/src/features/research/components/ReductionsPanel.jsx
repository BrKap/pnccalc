import React from 'react';
import CalculatedReductionsPanel from '../../calculator/components/CalculatedReductionsPanel.jsx';
import { researchLoadoutConfig } from '../data/researchLoadout';

export default function ReductionsPanel({ reductions }) {
  return (
    <CalculatedReductionsPanel
      reductions={reductions}
      percentResources={researchLoadoutConfig.percentResources}
      staticResources={researchLoadoutConfig.staticResources}
    />
  );
}
