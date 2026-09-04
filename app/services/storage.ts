import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LanguageSettings,
  LegacyLanguageSettings,
  LearningMode,
} from "../utils/types";
import { DEFAULT_FREQUENCY } from "../utils/constants";

/**
 * Centralized, typed wrapper around AsyncStorage.
 *
 * All keys live here. Every getter validates the stored value at runtime and
 * falls back to a typed default - stored JSON is never trusted blindly, so
 * malformed or stale data can't crash the app.
 */

export const STORAGE_KEYS = {
  language: "languageSettings",
  deckIndex: "deckProgress",
  mode: "learningMode",
  frequency: "WORDS_FREQUENCY",
  autoAdvance: "autoAdvance",
  deckPin: "deckPin",
  theme: "theme",
} as const;

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  learningLanguage: "english",
  knownLanguage: "german",
  level: "a1",
};

// --- type guards -----------------------------------------------------------

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNewSettings(value: unknown): value is LanguageSettings {
  return (
    isObject(value) &&
    typeof value.learningLanguage === "string" &&
    typeof value.knownLanguage === "string" &&
    typeof value.level === "string"
  );
}

function isLegacySettings(value: unknown): value is LegacyLanguageSettings {
  return (
    isObject(value) &&
    typeof value.fromLanguage === "string" &&
    typeof value.toLanguage === "string" &&
    typeof value.level === "string"
  );
}

function isLearningMode(value: unknown): value is LearningMode {
  return (
    value === LearningMode.ShowBoth ||
    value === LearningMode.ShowWordThenTranslation
  );
}

/**
 * Maps the legacy persisted shape to the new one.
 * In the old code `fromLanguage` was actually the language being LEARNED and
 * `toLanguage` was the KNOWN language, so the mapping preserves the user's
 * actual selection rather than the misleading field names.
 */
function migrateLegacySettings(
  legacy: LegacyLanguageSettings,
): LanguageSettings {
  return {
    learningLanguage: legacy.fromLanguage,
    knownLanguage: legacy.toLanguage,
    level: legacy.level,
  };
}

async function readJSON(key: string): Promise<unknown> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// --- language settings -----------------------------------------------------

/**
 * Reads language settings, migrating the legacy `{ fromLanguage, toLanguage }`
 * shape to the new `{ learningLanguage, knownLanguage }` shape and persisting
 * the migrated value back. Returns `null` when nothing has been saved yet
 * (so callers can detect a first run), or a typed default if the stored value
 * is malformed.
 */
export async function getLanguageSettings(): Promise<LanguageSettings | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.language);
  if (raw == null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_LANGUAGE_SETTINGS };
  }

  if (isNewSettings(parsed)) {
    return {
      learningLanguage: parsed.learningLanguage,
      knownLanguage: parsed.knownLanguage,
      level: parsed.level,
    };
  }

  if (isLegacySettings(parsed)) {
    const migrated = migrateLegacySettings(parsed);
    await setLanguageSettings(migrated);
    return migrated;
  }

  return { ...DEFAULT_LANGUAGE_SETTINGS };
}

export async function setLanguageSettings(
  settings: LanguageSettings,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.language, JSON.stringify(settings));
}

/** True when the user has already saved language settings (not a first run). */
export async function hasLanguageSettings(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.language)) !== null;
}

// --- deck position ------------------------------------------------------

/**
 * Where the learner is, per deck. A deck is one (learning, known, level)
 * triple, so switching pair or level no longer discards the position - the
 * same thing Desktop's `AppState.progress` does.
 *
 * The stored index counts items, not words: with a course loaded a deck is
 * words and sentences interleaved. That is why the legacy single
 * `lastWordIndex` is not migrated - a word index means a different place in
 * the new list, and landing the learner mid-lesson at random is worse than
 * starting them at the top.
 */
export function deckKey(
  learningLanguage: string,
  knownLanguage: string,
  level: string,
): string {
  return `${learningLanguage}:${knownLanguage}:${level}`;
}

function isIndexMap(value: unknown): value is Record<string, number> {
  return (
    isObject(value) &&
    Object.values(value).every(
      (v) => typeof v === "number" && Number.isFinite(v) && v >= 0,
    )
  );
}

export async function getDeckIndex(key: string): Promise<number> {
  const value = await readJSON(STORAGE_KEYS.deckIndex);
  if (!isIndexMap(value)) return 0;
  const stored = value[key];
  return typeof stored === "number" ? Math.floor(stored) : 0;
}

export async function setDeckIndex(key: string, index: number): Promise<void> {
  const value = await readJSON(STORAGE_KEYS.deckIndex);
  const map = isIndexMap(value) ? { ...value } : {};
  map[key] = Math.max(0, Math.floor(index));
  await AsyncStorage.setItem(STORAGE_KEYS.deckIndex, JSON.stringify(map));
}

// --- saved spot ------------------------------------------------------------

/**
 * One bookmark per deck, set by hand from the Progress screen.
 *
 * This is deliberately not the same thing as the position above. The position
 * moves with every card, including the ones swiped past while looking for
 * something; the bookmark only moves when the learner says so, which is what
 * makes it worth coming back to.
 */
export async function getDeckPin(key: string): Promise<number | null> {
  const value = await readJSON(STORAGE_KEYS.deckPin);
  if (!isIndexMap(value)) return null;
  const stored = value[key];
  return typeof stored === "number" ? Math.floor(stored) : null;
}

export async function setDeckPin(key: string, index: number): Promise<void> {
  const value = await readJSON(STORAGE_KEYS.deckPin);
  const map = isIndexMap(value) ? { ...value } : {};
  map[key] = Math.max(0, Math.floor(index));
  await AsyncStorage.setItem(STORAGE_KEYS.deckPin, JSON.stringify(map));
}

export async function clearDeckPin(key: string): Promise<void> {
  const value = await readJSON(STORAGE_KEYS.deckPin);
  if (!isIndexMap(value)) return;
  const map = { ...value };
  delete map[key];
  await AsyncStorage.setItem(STORAGE_KEYS.deckPin, JSON.stringify(map));
}

// --- mode ------------------------------------------------------------------

export async function getMode(): Promise<LearningMode> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.mode);
  if (raw == null) return LearningMode.ShowBoth;
  // Older versions stored the mode as a raw (unquoted) string; newer versions
  // store it as JSON. Accept both so existing users keep their selection.
  if (isLearningMode(raw)) return raw;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isLearningMode(parsed)) return parsed;
  } catch {
    /* fall through to default */
  }
  return LearningMode.ShowBoth;
}

export async function setMode(mode: LearningMode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.mode, JSON.stringify(mode));
}

// --- frequency -------------------------------------------------------------

export async function getFrequency(): Promise<number> {
  const value = await readJSON(STORAGE_KEYS.frequency);
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_FREQUENCY;
}

export async function setFrequency(frequency: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.frequency, JSON.stringify(frequency));
}

// --- auto-advance ----------------------------------------------------------

/**
 * Whether a card turns on its own.
 *
 * Off unless the learner asked for it. The app used to advance every five
 * seconds from the first launch, which reads a sentence away before it has
 * been read and gives no way to sit on a word. An unset key is a learner who
 * never chose, so it means off - including for anyone upgrading, who can turn
 * it back on in one tap.
 */
export async function getAutoAdvance(): Promise<boolean> {
  const value = await readJSON(STORAGE_KEYS.autoAdvance);
  return value === true;
}

export async function setAutoAdvance(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.autoAdvance, JSON.stringify(enabled));
}

// --- theme -----------------------------------------------------------------

export type ThemeType = "light" | "dark" | "system";

export async function getTheme(): Promise<ThemeType> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.theme);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export async function setTheme(theme: ThemeType): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
}

/**
 * One-shot migration entry point. Reading language settings already migrates
 * and persists the legacy shape, so calling this on startup guarantees the
 * stored data is in the current format.
 */
export async function migrateSettings(): Promise<void> {
  await getLanguageSettings();
}
