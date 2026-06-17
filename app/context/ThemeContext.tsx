import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { getTheme, setTheme as persistTheme } from '../services/storage';

export const themes = {
  light: {
    background: '#F7F5F1',
    text: '#1A1916',
    border: '#E6E2DA',
    sectionBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
  },
  dark: {
    background: '#0E0E10',
    text: '#F4F2EE',
    border: '#2C2C30',
    sectionBackground: '#161618',
    headerBackground: '#0E0E10',
    cardBackground: '#1A1A1D',
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
