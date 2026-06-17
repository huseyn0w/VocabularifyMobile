import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';

import LearningModeScreen from '../../app/screens/LearningModeScreen';
import LanguageSettingsScreen from '../../app/screens/LanguageSettingsScreen';
import WelcomeScreen from '../../app/screens/WelcomeScreen';
import BackgroundScreen from '../../app/screens/BackgroundScreen';
import { STORAGE_KEYS } from '../../app/services/storage';
import { LearningMode } from '../../app/utils/types';

const mockNavigation: any = { navigate: jest.fn(), goBack: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('LearningModeScreen', () => {
  it('pressing an option persists the selected mode', async () => {
    renderWithProviders(<LearningModeScreen />);
    const option = await screen.findByText('Word first, then translation');

    fireEvent.press(option);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.mode);
      expect(JSON.parse(stored as string)).toBe(LearningMode.ShowWordThenTranslation);
    });
  });
});

describe('LanguageSettingsScreen', () => {
  it('selecting a learning language reveals the matching known-language options', async () => {
    renderWithProviders(<LanguageSettingsScreen />);
    // Default settings start with english/german/a1 already populated, so the
    // "From" section shows English's combinations: German, French, Russian.
    await screen.findByText('I want to learn');
    expect(screen.getByText('From')).toBeTruthy();
    // French appears twice: once in the learn list and once as a known option
    // for English.
    expect(screen.getAllByText('French')).toHaveLength(2);

    // Switch the learning language to German -> known options become English +
    // Russian only (no French). French should now appear only in the learn list,
    // not as a known option. German appears twice (learn list + currently
    // selected known option); the first occurrence is the learn-list row.
    fireEvent.press(screen.getAllByText('German')[0]);

    await waitFor(() => {
      expect(screen.getByText('Russian')).toBeTruthy();
      // French is no longer a known option (German -> [English, Russian]); it
      // only remains in the learn list, so exactly one occurrence.
      expect(screen.getAllByText('French')).toHaveLength(1);
    });
  });

  it('selecting a frequency persists it', async () => {
    renderWithProviders(<LanguageSettingsScreen />);
    const option = await screen.findByText('7 seconds');

    fireEvent.press(option);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.frequency);
      expect(JSON.parse(stored as string)).toBe(7000);
    });
  });
});

describe('WelcomeScreen via LanguageSelector', () => {
  it('selecting a learning language reveals known options, then a level reveals the Level section', async () => {
    renderWithProviders(<WelcomeScreen />);
    await screen.findByText('I want to learn');

    // Initially no "From" / "Level" sections.
    expect(screen.queryByText('From')).toBeNull();
    expect(screen.queryByText('Level')).toBeNull();

    // At this point the only rows on screen are the learn list, so "English"
    // is unambiguous. Pick it -> the "From" section appears.
    fireEvent.press(screen.getByText('English'));

    const fromHeader = await screen.findByText('From');
    expect(fromHeader).toBeTruthy();

    // Pick a known language -> "Level" section appears. German appears in both
    // the learn list and the "From" options; the last occurrence is the known
    // option in the "From" section.
    const germanRows = screen.getAllByText('German');
    fireEvent.press(germanRows[germanRows.length - 1]);
    expect(await screen.findByText('Level')).toBeTruthy();
    expect(screen.getByText('A1')).toBeTruthy();
  });
});

describe('BackgroundScreen', () => {
  it('selecting a theme option triggers the theme setter (persisted)', async () => {
    renderWithProviders(<BackgroundScreen navigation={mockNavigation} />);
    const dark = await screen.findByText('Dark');

    fireEvent.press(dark);

    await waitFor(async () => {
      expect(await AsyncStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');
    });
  });
});
