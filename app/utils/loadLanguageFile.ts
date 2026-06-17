import type { Word } from './types';

/**
 * Static require map. Metro requires literal `require(...)` calls, so the paths
 * stay inline; we just key them by `"${learning}-${known}-${level}"` instead of
 * the old giant switch.
 *
 * `learning` is the language being learned (rendered as `word_1`), `known` is
 * the user's known language (rendered as `word_2`). Values are lowercase full
 * language names (e.g. `english`, `german`).
 */
const LANGUAGE_FILES: Record<string, Word[]> = {
  'english-german-a1': require('../../languages/en/de/a1.json'),
  'english-german-a2': require('../../languages/en/de/a2.json'),
  'english-german-b1': require('../../languages/en/de/b1.json'),
  'english-german-b2': require('../../languages/en/de/b2.json'),
  'english-german-c1': require('../../languages/en/de/c1.json'),

  'german-english-a1': require('../../languages/de/en/a1.json'),
  'german-english-a2': require('../../languages/de/en/a2.json'),
  'german-english-b1': require('../../languages/de/en/b1.json'),
  'german-english-b2': require('../../languages/de/en/b2.json'),
  'german-english-c1': require('../../languages/de/en/c1.json'),

  'english-russian-a1': require('../../languages/en/ru/a1.json'),
  'english-russian-a2': require('../../languages/en/ru/a2.json'),
  'english-russian-b1': require('../../languages/en/ru/b1.json'),
  'english-russian-b2': require('../../languages/en/ru/b2.json'),
  'english-russian-c1': require('../../languages/en/ru/c1.json'),

  'english-french-a1': require('../../languages/en/fr/a1.json'),
  'english-french-a2': require('../../languages/en/fr/a2.json'),
  'english-french-b1': require('../../languages/en/fr/b1.json'),
  'english-french-b2': require('../../languages/en/fr/b2.json'),
  'english-french-c1': require('../../languages/en/fr/c1.json'),

  'french-english-a1': require('../../languages/fr/en/a1.json'),
  'french-english-a2': require('../../languages/fr/en/a2.json'),
  'french-english-b1': require('../../languages/fr/en/b1.json'),
  'french-english-b2': require('../../languages/fr/en/b2.json'),
  'french-english-c1': require('../../languages/fr/en/c1.json'),

  'german-russian-a1': require('../../languages/de/ru/a1.json'),
  'german-russian-a2': require('../../languages/de/ru/a2.json'),
  'german-russian-b1': require('../../languages/de/ru/b1.json'),
  'german-russian-b2': require('../../languages/de/ru/b2.json'),
  'german-russian-c1': require('../../languages/de/ru/c1.json'),
};

/** Same fallback as the legacy switch's `default` branch. */
const FALLBACK: Word[] = require('../../languages/en/de/c1.json');

/**
 * Loads the word list for the given learning/known language pair and level.
 * Async to preserve the previous call site's contract.
 */
const loadLanguageFile = async (
  learning: string,
  known: string,
  level: string,
): Promise<Word[]> => {
  const key = `${learning}-${known}-${level}`;
  return LANGUAGE_FILES[key] ?? FALLBACK;
};

export default loadLanguageFile;
