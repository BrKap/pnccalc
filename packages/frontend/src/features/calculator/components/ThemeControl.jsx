import React, { useEffect } from 'react';
import { MonitorCog } from 'lucide-react';
import useLocalStorageState from '../../../hooks/useLocalStorageState';

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export default function ThemeControl() {
  const [theme, setTheme] = useLocalStorageState('pnc-theme-v1', 'system');

  useEffect(() => {
    const media = window.matchMedia(SYSTEM_THEME_QUERY);
    const applyTheme = () => {
      const resolvedTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  return (
    <label className="theme-control">
      <MonitorCog size={17} aria-hidden="true" />
      <span>Theme</span>
      <select value={theme} onChange={(event) => setTheme(event.target.value)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
