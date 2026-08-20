import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'pnc-estimation-notice-dismissed';

function wasDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function EstimationNotice() {
  const [visible, setVisible] = useState(() => !wasDismissed());

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Dismissal still works for this session when browser storage is unavailable.
    }
  };

  if (!visible) return null;

  return (
    <aside className="estimation-notice" aria-label="Upgrade data notice">
      <Info className="estimation-notice-icon" size={20} aria-hidden="true" />
      <div>
        <strong>Newer upgrade data is estimated</strong>
        <p>
           This project is not affiliated with the game developers and is a community driven project which means some newer upgrade costs are estimations awaiting verification from community members.{' '}
          <a href="#/contact">Contact me</a> if you can help verify them, share a suggestion,
          or report an error.
        </p>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss upgrade data notice">
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
