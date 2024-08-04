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
  English: ['German', 'French'],
  German: ['English', 'Russian'],
  Russian: [],
  French: ['English']
};