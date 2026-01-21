import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: (_t) => {},
});

const THEME_STORAGE_KEY = 'theme';

function applyDocumentClass(isDark) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light'; // Default to light mode
  });

  const resolvedTheme = theme;
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    applyDocumentClass(isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme, isDark]);

  const setTheme = (next) => {
    setThemeState(next === 'dark' || next === 'light' ? next : 'light');
  };

  const toggleTheme = () => {
    setThemeState(theme === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(() => ({ theme, resolvedTheme, isDark, toggleTheme, setTheme }), [theme, resolvedTheme, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
