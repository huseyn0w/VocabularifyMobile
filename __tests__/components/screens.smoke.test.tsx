import React from 'react';
import { renderWithProviders, screen, waitFor } from './test-utils';

import HomeScreen from '../../app/screens/HomeScreen';
import WelcomeScreen from '../../app/screens/WelcomeScreen';
import SettingsScreen from '../../app/screens/SettingsScreen';
import LearningModeScreen from '../../app/screens/LearningModeScreen';
import LanguageSettingsScreen from '../../app/screens/LanguageSettingsScreen';
import BackgroundScreen from '../../app/screens/BackgroundScreen';
import AboutScreen from '../../app/screens/AboutScreen';
import ProgressScreen from '../../app/screens/ProgressScreen';
import HowItWorksScreen from '../../app/screens/HowItWorksScreen';

// Stub navigation for screens that consume @react-navigation.
const mockNavigation: any = { navigate: jest.fn(), goBack: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('screen smoke tests', () => {
  it('Home renders (shows loading or a word, never crashes)', async () => {
    await renderWithProviders(<HomeScreen />);
    // The deck loads asynchronously; assert we eventually leave a stable
    // state. The hint names the lesson swipe on a level that has a course and
    // not on one that does not, so match either wording.
    await waitFor(() => {
      expect(screen.queryByText(/^swipe /)).toBeTruthy();
    });
  });

  it('Welcome opens on the explanation, not on a question', async () => {
    await renderWithProviders(<WelcomeScreen />);
    expect(await screen.findByText(/Words come in lessons/)).toBeTruthy();
    expect(screen.queryByText('🇬🇧 English')).toBeNull();
  });

  it('Settings renders its preference rows', async () => {
    await renderWithProviders(<SettingsScreen navigation={mockNavigation} />);
    expect(await screen.findByText('Progress')).toBeTruthy();
    expect(screen.getByText('Learning mode')).toBeTruthy();
    expect(screen.getByText('Language settings')).toBeTruthy();
    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('How it works')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('LearningMode renders both options', async () => {
    await renderWithProviders(<LearningModeScreen />);
    expect(await screen.findByText('Word and translation')).toBeTruthy();
    expect(screen.getByText('Word first, then translation')).toBeTruthy();
  });

  it('LanguageSettings renders the selector, the levels and the pace section', async () => {
    await renderWithProviders(<LanguageSettingsScreen />);
    expect(await screen.findByText('I want to learn')).toBeTruthy();
    // The level rows say what the code means, so "A1" never stands alone.
    expect(screen.getByText(/Beginner/)).toBeTruthy();
    expect(screen.getByText('Pace')).toBeTruthy();
  });

  it('Progress renders the position and both level actions', async () => {
    await renderWithProviders(<ProgressScreen />);
    expect(await screen.findByText('Save this spot')).toBeTruthy();
    expect(screen.getByText('Start this level over')).toBeTruthy();
  });

  it('HowItWorks renders the explanation', async () => {
    await renderWithProviders(<HowItWorksScreen />);
    expect(await screen.findByText(/Words come in lessons/)).toBeTruthy();
    expect(screen.getByText('No streaks, no scores')).toBeTruthy();
  });

  it('Background renders the appearance options', async () => {
    await renderWithProviders(<BackgroundScreen navigation={mockNavigation} />);
    expect(await screen.findByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('System')).toBeTruthy();
  });

  it('About renders its copy', async () => {
    await renderWithProviders(<AboutScreen />);
    expect(await screen.findByText('Vocabularify')).toBeTruthy();
    expect(screen.getByText('GitHub project')).toBeTruthy();
  });

  // ehuseynov.net stopped resolving and the screen still linked to it. These
  // names are the check that the row set matches the links the project
  // actually publishes, so a dead one has to be replaced rather than dropped.
  it('About links the project, both repos, the coffee page and the legal pages', async () => {
    await renderWithProviders(<AboutScreen />);
    for (const label of [
      'Project page',
      'GitHub project',
      'Desktop version',
      'Buy me a coffee',
      'Datenschutz',
      'Impressum',
    ]) {
      expect(await screen.findByText(label)).toBeTruthy();
    }
  });
});
