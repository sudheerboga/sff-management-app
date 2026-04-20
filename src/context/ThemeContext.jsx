import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildTheme, T as TDefault } from '../styles/theme';
import * as ThemeModule from '../styles/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('sff_theme') || 'dark'; } catch { return 'dark'; }
  });

  // Mutate the shared T object so all components automatically pick up changes
  const theme = buildTheme(mode);
  Object.assign(ThemeModule.T, theme);

  useEffect(() => {
    try { localStorage.setItem('sff_theme', mode); } catch {}
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [mode, theme.bg, theme.text]);

  function toggle() { setMode(m => m === 'dark' ? 'light' : 'dark'); }

  return (
    <ThemeContext.Provider value={{ mode, theme, toggle, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
