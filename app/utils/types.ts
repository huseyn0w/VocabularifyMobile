// types.ts
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  LearningModeScreen: undefined;
  LanguageSettingsScreen: undefined;
  AboutScreen: undefined;
  BackgroundScreen: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Main: undefined;
};

// Language list, levels, available pairs and per-language metadata are generated
// from the on-disk languages/ tree — see scripts/generate-language-map.js.
export type { Language, LanguageMeta } from './languageData';
export { languages, levels, availableCombinations, LANGUAGE_META } from './languageData';

/**
 * A single flashcard entry as stored in the language JSON files.
 * `word_1` is rendered as the main word (the language being learned),
 * `word_2` is its translation (the user's known language).
 */
export interface Word {
  word_1: string;
  word_2: string;
}

/**
 * The user's language selection.
 * `learningLanguage` is the language being LEARNED (rendered as `word_1`).
 * `knownLanguage` is the user's KNOWN language (rendered as `word_2`).
 *
 * NOTE: this replaces the old, inverted `{ fromLanguage, toLanguage }` shape.
 */
export interface LanguageSettings {
  learningLanguage: string;
  knownLanguage: string;
  level: string;
}

/** Persisted shape used by older app versions. Kept only for migration. */
export interface LegacyLanguageSettings {
  fromLanguage: string;
  toLanguage: string;
  level: string;
}

/** Typed learning modes (replaces the magic strings). */
export const LearningMode = {
  ShowBoth: 'showBoth',
  ShowWordThenTranslation: 'showWordThenTranslation',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional const + type companion pattern
export type LearningMode = typeof LearningMode[keyof typeof LearningMode];
