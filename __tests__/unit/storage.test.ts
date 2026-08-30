import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  DEFAULT_LANGUAGE_SETTINGS,
  getLanguageSettings,
  setLanguageSettings,
  hasLanguageSettings,
  deckKey,
  getDeckIndex,
  setDeckIndex,
  getMode,
  setMode,
  getFrequency,
  setFrequency,
  getTheme,
  setTheme,
  migrateSettings,
} from '../../app/services/storage';
import { LearningMode } from '../../app/utils/types';
import { DEFAULT_FREQUENCY } from '../../app/utils/constants';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('getLanguageSettings', () => {
  it('returns null when nothing is stored (first run)', async () => {
    expect(await getLanguageSettings()).toBeNull();
  });

  it('returns the new-shape settings as-is', async () => {
    const settings = {
      learningLanguage: 'french',
      knownLanguage: 'english',
      level: 'b1',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.language, JSON.stringify(settings));

    expect(await getLanguageSettings()).toEqual(settings);
  });

  it('migrates the legacy { fromLanguage, toLanguage } shape and persists it back', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.language,
      JSON.stringify({ fromLanguage: 'german', toLanguage: 'russian', level: 'a2' }),
    );

    const migrated = await getLanguageSettings();
    expect(migrated).toEqual({
      learningLanguage: 'german',
      knownLanguage: 'russian',
      level: 'a2',
    });

    // The migrated value is persisted back in the new shape.
    const reread = await AsyncStorage.getItem(STORAGE_KEYS.language);
    expect(JSON.parse(reread as string)).toEqual({
      learningLanguage: 'german',
      knownLanguage: 'russian',
      level: 'a2',
    });
  });

  it('returns the default on malformed JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.language, '{not valid json');
    expect(await getLanguageSettings()).toEqual(DEFAULT_LANGUAGE_SETTINGS);
  });

  it('returns the default for a valid-JSON but unrecognized shape', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.language, JSON.stringify({ foo: 'bar' }));
    expect(await getLanguageSettings()).toEqual(DEFAULT_LANGUAGE_SETTINGS);
  });
});

describe('hasLanguageSettings', () => {
  it('is false when nothing stored, true once set', async () => {
    expect(await hasLanguageSettings()).toBe(false);
    await setLanguageSettings(DEFAULT_LANGUAGE_SETTINGS);
    expect(await hasLanguageSettings()).toBe(true);
  });
});

describe('migrateSettings', () => {
  it('upgrades a persisted legacy shape to the new shape', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.language,
      JSON.stringify({ fromLanguage: 'english', toLanguage: 'german', level: 'c1' }),
    );

    await migrateSettings();

    const stored = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_KEYS.language)) as string,
    );
    expect(stored).toEqual({
      learningLanguage: 'english',
      knownLanguage: 'german',
      level: 'c1',
    });
  });
});

describe('getMode', () => {
  it('defaults to ShowBoth when nothing stored', async () => {
    expect(await getMode()).toBe(LearningMode.ShowBoth);
  });

  it('parses a legacy raw (unquoted) string encoding', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.mode,
      LearningMode.ShowWordThenTranslation,
    );
    expect(await getMode()).toBe(LearningMode.ShowWordThenTranslation);
  });

  it('parses the new JSON-encoded value', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.mode,
      JSON.stringify(LearningMode.ShowWordThenTranslation),
    );
    expect(await getMode()).toBe(LearningMode.ShowWordThenTranslation);
  });

  it('falls back to ShowBoth on garbage', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.mode, 'totally-not-a-mode');
    expect(await getMode()).toBe(LearningMode.ShowBoth);
  });
});

describe('round-trips per key', () => {
  it('language settings round-trip', async () => {
    const value = { learningLanguage: 'german', knownLanguage: 'english', level: 'b2' };
    await setLanguageSettings(value);
    expect(await getLanguageSettings()).toEqual(value);
  });

  it('deck position round-trips per deck and guards bad values', async () => {
    const de = deckKey('german', 'russian', 'a1');
    const fr = deckKey('french', 'english', 'a1');

    await setDeckIndex(de, 42);
    expect(await getDeckIndex(de)).toBe(42);

    // A second deck keeps its own position rather than overwriting the first.
    await setDeckIndex(fr, 7);
    expect(await getDeckIndex(de)).toBe(42);
    expect(await getDeckIndex(fr)).toBe(7);

    // Defaults to 0 for a deck never opened, and when nothing is stored.
    expect(await getDeckIndex(deckKey('italian', 'english', 'c1'))).toBe(0);
    await AsyncStorage.clear();
    expect(await getDeckIndex(de)).toBe(0);

    // Negative positions are clamped and fractional ones floored.
    await setDeckIndex(de, -5);
    expect(await getDeckIndex(de)).toBe(0);
    await setDeckIndex(de, 3.9);
    expect(await getDeckIndex(de)).toBe(3);

    // A malformed stored map falls back to 0 rather than throwing.
    await AsyncStorage.setItem(STORAGE_KEYS.deckIndex, JSON.stringify({ [de]: 'nope' }));
    expect(await getDeckIndex(de)).toBe(0);
  });

  it('mode round-trips', async () => {
    await setMode(LearningMode.ShowWordThenTranslation);
    expect(await getMode()).toBe(LearningMode.ShowWordThenTranslation);
  });

  it('frequency round-trips and guards bad values', async () => {
    await setFrequency(7000);
    expect(await getFrequency()).toBe(7000);

    await AsyncStorage.clear();
    expect(await getFrequency()).toBe(DEFAULT_FREQUENCY);

    await AsyncStorage.setItem(STORAGE_KEYS.frequency, JSON.stringify(0));
    expect(await getFrequency()).toBe(DEFAULT_FREQUENCY);
  });

  it('theme round-trips and defaults to system', async () => {
    expect(await getTheme()).toBe('system');
    await setTheme('dark');
    expect(await getTheme()).toBe('dark');
    await setTheme('light');
    expect(await getTheme()).toBe('light');

    await AsyncStorage.setItem(STORAGE_KEYS.theme, 'banana');
    expect(await getTheme()).toBe('system');
  });
});
