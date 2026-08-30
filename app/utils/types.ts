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
// from the on-disk languages/ tree - see scripts/generate-language-map.js.
export type { Language, LanguageMeta } from "./languageData";
export {
  languages,
  levels,
  availableCombinations,
  LANGUAGE_META,
} from "./languageData";

/**
 * A single flashcard entry as stored in the language JSON files.
 *
 * `word_1` is the KNOWN language and `word_2` the one being LEARNED - the
 * orientation the files are generated in, and the one Desktop reads them
 * with. The card shows `word_2` large and `word_2`'s translation, `word_1`,
 * underneath.
 *
 * The field names are backwards to read; they are the on-disk format and are
 * not worth a migration of 210 files.
 */
export interface Word {
  word_1: string;
  word_2: string;
}

/**
 * The user's language selection.
 * `learningLanguage` is the language being LEARNED; its words live in the
 * `word_2` column. `knownLanguage` is the user's KNOWN language, in `word_1`.
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
  ShowBoth: "showBoth",
  ShowWordThenTranslation: "showWordThenTranslation",
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional const + type companion pattern
export type LearningMode = (typeof LearningMode)[keyof typeof LearningMode];
