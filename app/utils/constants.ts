// Non-key constants. Storage keys now live in app/services/storage.ts.
export { STORAGE_KEYS } from '../services/storage';

/**
 * Where the app sends anyone who wants to chip in. Buy Me a Coffee replaced the
 * PayPal donate button, which is the same move BerlinArea made; one link is
 * easier to keep alive than two, and the label stays English in every language
 * because it is the platform's own name.
 */
export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/elman';
export const BUY_ME_A_COFFEE_LABEL = 'Buy me a coffee';

/** The project's own page, and the two legal pages every elman.group app links. */
export const PROJECT_URL = 'https://elman.group/vocabularify';
export const PRIVACY_URL = 'https://elman.group/datenschutz.html';
export const IMPRINT_URL = 'https://elman.group/impressum.html';

/** Both repositories behind the app. */
export const REPO_MOBILE_URL = 'https://github.com/huseyn0w/VocabularifyMobile';
export const REPO_DESKTOP_URL = 'https://github.com/huseyn0w/Vocabularify';
export const SHOW_TRANSLATION_DELAY = 3000;
export const CHANGE_WORD_TIMEOUT_DURATION = 5000;
export const DEFAULT_FREQUENCY = 5000;

// A sentence takes longer to read than a word, so it holds the screen for this
// many times the configured interval. Mirrors the constant of the same name in
// Desktop's src/shared/constants.ts.
export const SENTENCE_DWELL_MULTIPLIER = 2;
