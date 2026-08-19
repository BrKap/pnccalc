import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CollapsiblePanelGroup({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = collapsed ? ChevronDown : ChevronUp;

  return (
    <section className="panel-group" aria-label="Cost and reduction panels">
      <div className="panel-group-toolbar">
        <h2>Costs &amp; Reductions</h2>
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          aria-controls="calculator-cost-panels"
        >
          <Icon size={17} aria-hidden="true" />
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      <div
        id="calculator-cost-panels"
        className="side-column top-panels"
        hidden={collapsed}
      >
        {children}
      </div>
    </section>
  );
}
