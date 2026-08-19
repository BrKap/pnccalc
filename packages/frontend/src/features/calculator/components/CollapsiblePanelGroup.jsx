import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CollapsiblePanelGroup({
  children,
  title = 'Costs & Reductions',
  ariaLabel = 'Cost and reduction panels',
  contentId = 'calculator-cost-panels',
  contentClassName = '',
}) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = collapsed ? ChevronDown : ChevronUp;

  return (
    <section className="panel-group" aria-label={ariaLabel}>
      <div className="panel-group-toolbar">
        <h2>{title}</h2>
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          aria-controls={contentId}
        >
          <Icon size={17} aria-hidden="true" />
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      <div
        id={contentId}
        className={`side-column top-panels ${contentClassName}`.trim()}
        hidden={collapsed}
      >
        {children}
      </div>
    </section>
  );
}
