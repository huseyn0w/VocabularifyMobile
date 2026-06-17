import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders, screen, waitFor } from './test-utils';
import { STORAGE_KEYS } from '../../app/services/storage';

// Deterministic word list so HomeScreen renders a known first word + total.
const STUB_WORDS = [
  { word_1: 'apfel', word_2: 'apple' },
  { word_1: 'banane', word_2: 'banana' },
  { word_1: 'kirsche', word_2: 'cherry' },
];

jest.mock('../../app/utils/loadLanguageFile', () => ({
  __esModule: true,
  default: jest.fn(async () => STUB_WORDS),
}));

const mockNavigation: any = { navigate: jest.fn(), goBack: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

import HomeScreen from '../../app/screens/HomeScreen';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('HomeScreen', () => {
  it('renders the current word and a "1 / N" progress label from the stubbed list', async () => {
    renderWithProviders(<HomeScreen />);

    // First word_1 renders.
    expect(await screen.findByText('apfel')).toBeTruthy();
    // Its translation (word_2) renders (ShowBoth is the default mode).
    expect(screen.getByText('apple')).toBeTruthy();
    // Progress label shows 1 / 3.
    expect(screen.getByText(`1 / ${STUB_WORDS.length}`)).toBeTruthy();
  });

  it('resumes from the persisted last index', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.lastIndex, JSON.stringify(2));
    renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('kirsche')).toBeTruthy();
      expect(screen.getByText(`3 / ${STUB_WORDS.length}`)).toBeTruthy();
    });
  });
});
