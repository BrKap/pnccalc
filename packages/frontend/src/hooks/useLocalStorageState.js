import { useEffect, useState } from 'react';

export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const resolveInitialValue = () => (
      typeof initialValue === 'function' ? initialValue() : initialValue
    );
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue === null ? resolveInitialValue() : JSON.parse(storedValue);
    } catch {
      return resolveInitialValue();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The calculator remains usable when browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}
