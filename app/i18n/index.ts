import { useCallback } from "react";
import { useLanguageContext } from "../context/LanguageContext";
import { LANGUAGE_META, Language, languages } from "../utils/types";
import { COPY, CopyKey, UI_LANGUAGES, UiLanguage } from "./copy";

export type { CopyKey, UiLanguage } from "./copy";
export { UI_LANGUAGES } from "./copy";

const DEFAULT_UI_LANGUAGE: UiLanguage = "en";

/**
 * The known language as a two-letter code the copy table is keyed by.
 *
 * `settings.knownLanguage` holds a lowercase display name ("german"), not a
 * code, because that is what the language picker writes. A name outside the
 * seven shipped languages, or an empty one mid-selection, falls back to
 * English rather than showing keys.
 */
export function uiLanguageOf(knownLanguage: string): UiLanguage {
  const wanted = knownLanguage.trim().toLowerCase();
  if (!wanted) return DEFAULT_UI_LANGUAGE;
  const match = (languages as readonly Language[]).find(
    (language) => language.toLowerCase() === wanted,
  );
  if (!match) return DEFAULT_UI_LANGUAGE;
  const code = LANGUAGE_META[match].code as UiLanguage;
  return UI_LANGUAGES.includes(code) ? code : DEFAULT_UI_LANGUAGE;
}

type Vars = Record<string, string | number>;

/** Fills `{name}` placeholders. A name with no value is left in place, so a
 *  missing variable reads as an obvious defect rather than an empty gap. */
function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

export function translate(
  language: UiLanguage,
  key: CopyKey,
  vars?: Vars,
): string {
  const entry = COPY[key];
  const text = entry[language] || entry[DEFAULT_UI_LANGUAGE];
  return interpolate(text, vars);
}

/**
 * The interface follows the language the learner already speaks, not the
 * phone's locale. See the note at the top of copy.ts.
 */
export function useTranslate() {
  const { settings } = useLanguageContext();
  const language = uiLanguageOf(settings.knownLanguage);
  const t = useCallback(
    (key: CopyKey, vars?: Vars) => translate(language, key, vars),
    [language],
  );
  return { t, language };
}

export default useTranslate;
