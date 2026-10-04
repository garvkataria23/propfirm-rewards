'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

function resolveSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-switching');
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
  // Force synchronous style recalc so header and all page sections repaint in the exact same frame
  void window.getComputedStyle(root).opacity;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching');
    });
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('propnation_theme') as ThemeMode | null;
    const initialMode: ThemeMode =
      saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
    const resolved: Theme = initialMode === 'system' ? resolveSystemTheme() : initialMode;
    setThemeModeState(initialMode);
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  // Listen to OS system theme changes when themeMode === 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || themeMode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const nextResolved: Theme = e.matches ? 'dark' : 'light';
      setThemeState(nextResolved);
      applyTheme(nextResolved);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setTheme = (newMode: ThemeMode) => {
    const resolved: Theme = newMode === 'system' ? resolveSystemTheme() : newMode;
    setThemeModeState(newMode);
    setThemeState(resolved);
    localStorage.setItem('propnation_theme', newMode);
    applyTheme(resolved);
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
