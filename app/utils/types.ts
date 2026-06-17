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

export type Language = typeof languages[number];

export const languages = ['English', 'German', 'Russian', 'French'] as const;

export const levels = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

export const availableCombinations: Record<Language, Language[]> = {
  English: ['German', 'French', 'Russian'],
  German: ['English', 'Russian'],
  Russian: [],
  French: ['English'],
};

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
