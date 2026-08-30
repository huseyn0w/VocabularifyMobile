import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { getTheme, setTheme as persistTheme } from '../services/storage';
import { palette } from '../theme/tokens';

// Legacy colour object, kept because the context type still exposes it.
// Values come from app/theme/tokens.ts so nothing here can drift from the
// palette the rest of the app renders with.
interface LegacyTheme {
  background: string;
  text: string;
  border: string;
  sectionBackground: string;
  headerBackground: string;
  cardBackground: string;
}

export const themes: Record<'light' | 'dark', LegacyTheme> = {
  light: {
    background: palette.light.bg,
    text: palette.light.ink,
    border: palette.light.border,
    sectionBackground: palette.light.surface,
    headerBackground: palette.light.bg,
    cardBackground: palette.light.card,
  },
  dark: {
    background: palette.dark.bg,
    text: palette.dark.ink,
    border: palette.dark.border,
    sectionBackground: palette.dark.surface,
    headerBackground: palette.dark.bg,
    cardBackground: palette.dark.card,
  },
};

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof themes.light | typeof themes.dark;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  themeType: 'light',
  setThemeType: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useRNColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    (async () => {
      setThemeType(await getTheme());
    })();
  }, []);

  useEffect(() => {
    // Resolve the effective scheme from the user's setting.
    const resolved =
      themeType === 'system'
        ? systemColorScheme === 'dark'
          ? 'dark'
          : 'light'
        : themeType;

    // Drive NativeWind so the `.dark` class applies app-wide. When the user
    // chooses "system" we hand control back to NativeWind's own system tracker.
    if (themeType === 'system') {
      nwColorScheme.set('system');
    } else {
      nwColorScheme.set(themeType);
    }

    // Keep the legacy color object in sync with the active scheme.
    setTheme(resolved === 'dark' ? themes.dark : themes.light);
  }, [themeType, systemColorScheme]);

  const handleSetThemeType = async (newTheme: ThemeType) => {
    setThemeType(newTheme);
    await persistTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType: handleSetThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
