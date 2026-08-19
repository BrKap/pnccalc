import React from 'react';
import CalculatedReductionsPanel from '../../calculator/components/CalculatedReductionsPanel.jsx';
import { builderLoadoutConfig } from '../data/builderLoadout';

export default function BuildingReductionsPanel({ reductions }) {
  return (
    <CalculatedReductionsPanel
      reductions={reductions}
      percentResources={builderLoadoutConfig.percentResources}
      staticResources={builderLoadoutConfig.staticResources}
    />
  );
}
