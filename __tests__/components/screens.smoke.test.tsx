import React from 'react';
import { renderWithProviders, screen, waitFor } from './test-utils';

import HomeScreen from '../../app/screens/HomeScreen';
import WelcomeScreen from '../../app/screens/WelcomeScreen';
import SettingsScreen from '../../app/screens/SettingsScreen';
import LearningModeScreen from '../../app/screens/LearningModeScreen';
import LanguageSettingsScreen from '../../app/screens/LanguageSettingsScreen';
import BackgroundScreen from '../../app/screens/BackgroundScreen';
import AboutScreen from '../../app/screens/AboutScreen';

// Stub navigation for screens that consume @react-navigation.
const mockNavigation: any = { navigate: jest.fn(), goBack: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('screen smoke tests', () => {
  it('Home renders (shows loading or a word, never crashes)', async () => {
    renderWithProviders(<HomeScreen />);
    // The deck loads asynchronously; assert we eventually leave a stable state.
    await waitFor(() => {
      expect(screen.queryByText('Swipe to change words')).toBeTruthy();
    });
  });

  it('Welcome renders the intro copy and the learn options', async () => {
    renderWithProviders(<WelcomeScreen />);
    expect(await screen.findByText('Welcome')).toBeTruthy();
    expect(screen.getByText('I want to learn')).toBeTruthy();
  });

  it('Settings renders its preference rows', async () => {
    renderWithProviders(<SettingsScreen navigation={mockNavigation} />);
    expect(await screen.findByText('Learning Mode')).toBeTruthy();
    expect(screen.getByText('Language settings')).toBeTruthy();
    expect(screen.getByText('Background')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('LearningMode renders both options', async () => {
    renderWithProviders(<LearningModeScreen />);
    expect(await screen.findByText('Word and translation')).toBeTruthy();
    expect(screen.getByText('Word first, then translation')).toBeTruthy();
  });

  it('LanguageSettings renders the selector + frequency section', async () => {
    renderWithProviders(<LanguageSettingsScreen />);
    expect(await screen.findByText('I want to learn')).toBeTruthy();
    expect(screen.getByText('Word frequency')).toBeTruthy();
  });

  it('Background renders the appearance options', async () => {
    renderWithProviders(<BackgroundScreen navigation={mockNavigation} />);
    expect(await screen.findByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('System')).toBeTruthy();
  });

  it('About renders its copy', async () => {
    renderWithProviders(<AboutScreen />);
    expect(await screen.findByText('Vocabulary Booster')).toBeTruthy();
    expect(screen.getByText('GitHub project')).toBeTruthy();
  });
});
