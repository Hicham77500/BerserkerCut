import React, { createContext, useContext } from 'react';
import {
  DarkNavigationTheme,
  LightNavigationTheme,
  ThemePalette,
  ThemeMode,
  DarkColors,
  LightColors,
} from '@/utils/theme';
import { getSecureItem, setSecureItem } from '@/utils/storage/secureStorage';
import { THEME_PREFERENCE_STORAGE_KEY } from '@/constants/storageKeys';

/**
 * Hook ThemeMode - Mode sombre exclusivement
 * Configuration du thème uniforme pour toute l'application
 */

interface ThemeModeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  navigationTheme: typeof DarkNavigationTheme;
  ready: boolean;
  setMode: (nextMode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

// Valeur par défaut avant hydratation du thème persistant
const DEFAULT_VALUE: ThemeModeContextValue = {
  mode: 'dark',
  isDark: true,
  colors: DarkColors,
  navigationTheme: DarkNavigationTheme,
  ready: false,
  setMode: async () => {},
  toggleMode: async () => {},
};

const ThemeModeContext = createContext<ThemeModeContextValue>(DEFAULT_VALUE);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = React.useState<ThemeMode>('dark');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const persisted = await getSecureItem(THEME_PREFERENCE_STORAGE_KEY);
        if (!isMounted) return;
        if (persisted === 'light' || persisted === 'dark') {
          setModeState(persisted);
        }
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = React.useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await setSecureItem(THEME_PREFERENCE_STORAGE_KEY, nextMode);
  }, []);

  const toggleMode = React.useCallback(async () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    await setMode(nextMode);
  }, [mode, setMode]);

  const isDark = mode === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const navigationTheme = isDark ? DarkNavigationTheme : LightNavigationTheme;

  const value = React.useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      isDark,
      colors,
      navigationTheme,
      ready,
      setMode,
      toggleMode,
    }),
    [mode, isDark, colors, navigationTheme, ready, setMode, toggleMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
