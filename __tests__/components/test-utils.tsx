import React, { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../../app/context/ThemeContext';
import { LanguageProvider } from '../../app/context/LanguageContext';
import { STORAGE_KEYS } from '../../app/services/storage';
import { LanguageSettings } from '../../app/utils/types';

/**
 * Wraps a component in the app's Theme + Language providers so screens that
 * consume those contexts render the same way they do in the app.
 */
export const AllProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

/**
 * German learned from English, so the interface renders in English and the
 * assertions below can be read.
 *
 * The interface follows `knownLanguage`, and the app's own default is German,
 * which would put every screen in this file into German. Seeding a real pair
 * (de/en exists) rather than reaching for English-from-English, which does
 * not.
 */
export const TEST_SETTINGS: LanguageSettings = {
  learningLanguage: 'german',
  knownLanguage: 'english',
  level: 'a1',
};

export const seedSettings = async (
  settings: Partial<LanguageSettings> = {},
): Promise<void> => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.language,
    JSON.stringify({ ...TEST_SETTINGS, ...settings }),
  );
};

export const renderWithProviders = async (
  ui: ReactElement,
  options?: { settings?: Partial<LanguageSettings> },
) => {
  await seedSettings(options?.settings);
  return render(ui, { wrapper: AllProviders });
};

export * from '@testing-library/react-native';
