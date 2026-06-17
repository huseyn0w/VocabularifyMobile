import React, { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../app/context/ThemeContext';
import { LanguageProvider } from '../../app/context/LanguageContext';

/**
 * Wraps a component in the app's Theme + Language providers so screens that
 * consume those contexts render the same way they do in the app.
 */
export const AllProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: AllProviders });

export * from '@testing-library/react-native';
