// Non-key constants. Storage keys now live in app/services/storage.ts.
export { STORAGE_KEYS } from '../services/storage';

export const PAYPAY_DONATION_URL = 'https://www.paypal.com/donate/?hosted_button_id=MMANJ7TC2SJMN';
export const SHOW_TRANSLATION_DELAY = 3000;
export const CHANGE_WORD_TIMEOUT_DURATION = 5000;
export const DEFAULT_FREQUENCY = 5000;

// A sentence takes longer to read than a word, so it holds the screen for this
// many times the configured interval. Mirrors the constant of the same name in
// Desktop's src/shared/constants.ts.
export const SENTENCE_DWELL_MULTIPLIER = 2;
