import { COPY, UI_LANGUAGES, UiLanguage } from "../../app/i18n/copy";
import { translate, uiLanguageOf } from "../../app/i18n";
import { LANGUAGE_META, languages } from "../../app/utils/types";

describe("copy table", () => {
  const keys = Object.keys(COPY) as (keyof typeof COPY)[];

  it("covers every shipped language for every key", () => {
    const gaps: string[] = [];
    for (const key of keys) {
      for (const language of UI_LANGUAGES) {
        const value = COPY[key][language];
        if (typeof value !== "string" || value.trim().length === 0) {
          gaps.push(`${key}.${language}`);
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  // The interface language is derived from the known language, so a language
  // the picker offers with no column here would silently fall back to English.
  it("has a column for every language the picker offers", () => {
    const offered = languages.map(
      (language) => LANGUAGE_META[language].code as UiLanguage,
    );
    expect([...UI_LANGUAGES].sort()).toEqual([...offered].sort());
  });

  it("keeps the same placeholders in every translation of a key", () => {
    const placeholders = (text: string) =>
      (text.match(/\{(\w+)\}/g) ?? []).sort().join(",");
    const mismatched: string[] = [];
    for (const key of keys) {
      const expected = placeholders(COPY[key].en);
      for (const language of UI_LANGUAGES) {
        if (placeholders(COPY[key][language]) !== expected) {
          mismatched.push(`${key}.${language}`);
        }
      }
    }
    expect(mismatched).toEqual([]);
  });
});

describe("uiLanguageOf", () => {
  it("maps a known-language name to its code", () => {
    expect(uiLanguageOf("german")).toBe("de");
    expect(uiLanguageOf("Russian")).toBe("ru");
    expect(uiLanguageOf(" turkish ")).toBe("tr");
  });

  it("falls back to English for an empty or unknown language", () => {
    expect(uiLanguageOf("")).toBe("en");
    expect(uiLanguageOf("klingon")).toBe("en");
  });
});

describe("translate", () => {
  it("fills placeholders", () => {
    expect(translate("en", "home.lesson", { n: 3, total: 12 })).toBe(
      "lesson 3 / 12",
    );
    expect(translate("de", "home.lesson", { n: 3, total: 12 })).toBe(
      "Lektion 3 / 12",
    );
  });

  // A placeholder left standing is loud; an empty gap is not, and this is the
  // only signal that a caller forgot a variable.
  it("leaves a placeholder in place when its value is missing", () => {
    expect(translate("en", "home.lesson", { n: 3 })).toBe("lesson 3 / {total}");
  });

  it("returns the same string with no variables to fill", () => {
    expect(translate("ru", "home.extra")).toBe("сверх курса");
  });
});
