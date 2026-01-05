/**
 * Zustand store for app theme
 */
import {create} from 'zustand';
import {AppTheme} from '../types';
import {storage} from 'react-native-mmkv';

const THEME_KEY = 'app_theme';

const defaultTheme: AppTheme = {
  mode: 'light',
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
};

const getStoredTheme = (): AppTheme => {
  const stored = storage.getString(THEME_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultTheme;
    }
  }
  return defaultTheme;
};

interface ThemeStore {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  setThemeMode: (mode: AppTheme['mode']) => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getStoredTheme(),

  setTheme: theme => {
    storage.set(THEME_KEY, JSON.stringify(theme));
    set({theme});
  },

  setThemeMode: mode => {
    const theme = get().theme;
    const newTheme: AppTheme = {
      ...theme,
      mode,
      backgroundColor:
        mode === 'dark'
          ? '#1e293b'
          : mode === 'sepia'
          ? '#f4e4c1'
          : mode === 'paper'
          ? '#faf9f6'
          : '#ffffff',
    };
    get().setTheme(newTheme);
  },
}));


