'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'propnation_sidebar_pinned';

export function useSidebarMode() {
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsPinned(stored === 'true');
      }
    } catch {}

    const handleSync = () => {
      try {
        const updated = localStorage.getItem(STORAGE_KEY);
        if (updated !== null) {
          setIsPinned(updated === 'true');
        }
      } catch {}
    };

    window.addEventListener('sidebar-preference-change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sidebar-preference-change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const setPinned = (pinned: boolean) => {
    setIsPinned(pinned);
    try {
      localStorage.setItem(STORAGE_KEY, String(pinned));
      window.dispatchEvent(new Event('sidebar-preference-change'));
    } catch {}
  };

  const togglePinned = () => setPinned(!isPinned);

  return { isPinned, setPinned, togglePinned, mounted };
}
