import React, { createContext, useContext } from 'react';
import { DarkNavigationTheme, ThemePalette, Colors, ThemeMode } from '@/utils/theme';

interface ThemeModeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  navigationTheme: typeof DarkNavigationTheme;
  ready: boolean;
}

const DEFAULT_VALUE: ThemeModeContextValue = {
  mode: 'dark',
  isDark: true,
  colors: Colors,
  navigationTheme: DarkNavigationTheme,
  ready: true,
};

const ThemeModeContext = createContext<ThemeModeContextValue>(DEFAULT_VALUE);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeModeContext.Provider value={DEFAULT_VALUE}>{children}</ThemeModeContext.Provider>
);

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
