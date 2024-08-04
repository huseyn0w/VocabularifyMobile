import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  light: {
    background: '#EFEFF4',
    text: '#000000',
    border: '#C7C7CC',
    sectionBackground: '#fff',
    headerBackground: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    text: '#FFFFFF',
    border: '#3A3A3A',
    sectionBackground: '#1E1E1E',
    headerBackground: '#000000',
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
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setThemeType(storedTheme as ThemeType);
      }
    })();
  }, []);

  useEffect(() => {
    const currentTheme =
      themeType === 'system'
        ? colorScheme === 'dark'
          ? themes.dark
          : themes.light
        : themes[themeType];
    setTheme(currentTheme);
  }, [themeType, colorScheme]);

  const handleSetThemeType = async (newTheme: ThemeType) => {
    setThemeType(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType: handleSetThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
