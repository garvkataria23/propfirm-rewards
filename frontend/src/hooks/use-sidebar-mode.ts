'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'propnation_sidebar_pinned';

// Shared in-memory hover state across all hook instances
let globalHoveredState = false;

export function useSidebarMode() {
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isHovered, setIsHoveredState] = useState<boolean>(globalHoveredState);
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

    const handleHoverSync = () => {
      setIsHoveredState(globalHoveredState);
    };

    window.addEventListener('sidebar-preference-change', handleSync);
    window.addEventListener('sidebar-hover-change', handleHoverSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sidebar-preference-change', handleSync);
      window.removeEventListener('sidebar-hover-change', handleHoverSync);
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

  const setHovered = (hovered: boolean) => {
    if (globalHoveredState !== hovered) {
      globalHoveredState = hovered;
      setIsHoveredState(hovered);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sidebar-hover-change'));
      }
    }
  };

  const togglePinned = () => setPinned(!isPinned);
  const isExpanded = isPinned || isHovered;

  return { isPinned, setPinned, togglePinned, isHovered, setHovered, isExpanded, mounted };
}
