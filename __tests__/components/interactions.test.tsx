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
    await renderWithProviders(<LearningModeScreen />);
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
    await renderWithProviders(<LanguageSettingsScreen />);
    // The seeded settings are german/english/a1, so the "From" section shows
    // German's known options (every other language, since the full matrix
    // makes any language learnable from any other). Rows render as
    // "<flag> <name>".
    await screen.findByText('I want to learn');
    expect(screen.getByText('From')).toBeTruthy();
    // Russian appears twice: once in the learn list and once as a known option
    // for German.
    expect(screen.getAllByText('🇷🇺 Russian')).toHaveLength(2);

    // Switch the learning language to Russian (press its learn-list row, the
    // first occurrence) -> known options become every language EXCEPT Russian.
    // Russian then appears only in the learn list (a language is never a known
    // option of itself), and English becomes a selectable known option.
    fireEvent.press(screen.getAllByText('🇷🇺 Russian')[0]);

    await waitFor(() => {
      // English is now a known option for Russian: learn list + known option.
      expect(screen.getAllByText('🇬🇧 English')).toHaveLength(2);
      // Russian is no longer a known option of itself; only the learn-list row.
      expect(screen.getAllByText('🇷🇺 Russian')).toHaveLength(1);
    });
  });

  it('offers no intervals until the cards are set to turn by themselves', async () => {
    await renderWithProviders(<LanguageSettingsScreen />);
    await screen.findByText('I want to learn');

    // Auto-advance is off unless asked for, so there is nothing to configure.
    expect(screen.queryByText('7 seconds')).toBeNull();

    fireEvent.press(screen.getByText('Cards turn by themselves'));

    expect(await screen.findByText('7 seconds')).toBeTruthy();
    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.autoAdvance);
      expect(JSON.parse(stored as string)).toBe(true);
    });
  });

  it('selecting a frequency persists it', async () => {
    await renderWithProviders(<LanguageSettingsScreen />);
    await screen.findByText('I want to learn');
    fireEvent.press(screen.getByText('Cards turn by themselves'));
    const option = await screen.findByText('7 seconds');

    fireEvent.press(option);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.frequency);
      expect(JSON.parse(stored as string)).toBe(7000);
    });
  });
});

describe('WelcomeScreen - known language first, then the explanation', () => {
  it('walks source -> explanation -> target -> level, and saves', async () => {
    await renderWithProviders(<WelcomeScreen />);

    // The known language is asked first, because it is what everything after
    // it is written in. Nothing else is on the screen yet.
    expect(await screen.findByText(/already speak\?/i)).toBeTruthy();
    expect(screen.queryByText(/Words come in lessons/)).toBeNull();
    expect(screen.queryByText('A1')).toBeNull();
    expect(screen.getAllByText('🇩🇪 Deutsch')).toHaveLength(1);

    // Naming German switches the whole rest of the wizard into German,
    // starting with the explanation.
    fireEvent.press(screen.getByText('🇩🇪 Deutsch'));
    expect(await screen.findByText(/Wörter kommen in Lektionen/)).toBeTruthy();

    fireEvent.press(screen.getByText("Los geht's"));
    expect(await screen.findByText(/Was möchtest du/)).toBeTruthy();
    // German is gone from the list: you cannot learn German from German.
    expect(screen.queryByText('🇩🇪 Deutsch')).toBeNull();

    fireEvent.press(screen.getByText('🇬🇧 English'));
    expect(await screen.findByText(/Wo fängst du/)).toBeTruthy();
    expect(screen.getByText(/Mittelstufe/)).toBeTruthy();

    fireEvent.press(screen.getByText(/Mittelstufe/));
    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.language);
      expect(JSON.parse(stored as string)).toEqual({
        learningLanguage: 'english',
        knownLanguage: 'german',
        level: 'b1',
      });
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Main');
  });

  it('Back returns to the previous step', async () => {
    await renderWithProviders(<WelcomeScreen />);
    fireEvent.press(await screen.findByText('🇩🇪 Deutsch'));
    await screen.findByText(/Wörter kommen in Lektionen/);

    fireEvent.press(screen.getByText("Los geht's"));
    await screen.findByText(/Was möchtest du/);

    fireEvent.press(screen.getByText('Zurück'));
    expect(await screen.findByText(/Wörter kommen in Lektionen/)).toBeTruthy();

    // Back again lands on the language picker, which is the first step and
    // has nothing to return to, so Back is not offered there. It now reads in
    // German: the answer is known, so there is no reason to fall back.
    fireEvent.press(screen.getByText('Zurück'));
    expect(await screen.findByText(/sprichst du schon/i)).toBeTruthy();
    expect(screen.queryByText('Zurück')).toBeNull();
  });
});

describe('BackgroundScreen', () => {
  it('selecting a theme option triggers the theme setter (persisted)', async () => {
    await renderWithProviders(<BackgroundScreen navigation={mockNavigation} />);
    const dark = await screen.findByText('Dark');

    fireEvent.press(dark);

    await waitFor(async () => {
      expect(await AsyncStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');
    });
  });
});
