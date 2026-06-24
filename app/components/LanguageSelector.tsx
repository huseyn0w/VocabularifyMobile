import React from 'react';
import { Language, LANGUAGE_META, availableCombinations, languages, levels } from '../utils/types';
import Section from './Section';
import SelectableRow from './SelectableRow';

interface LanguageSelectorProps {
  /** Currently selected learning language (the language being learned), lowercase or null. */
  learningLanguage: string | null;
  /** Currently selected known language, lowercase or null. */
  knownLanguage: string | null;
  /** Currently selected level, lowercase or null. */
  level: string | null;
  onSelectLearning: (language: Language) => void;
  onSelectKnown: (language: Language) => void;
  onSelectLevel: (level: string) => void;
}

const matchesLanguage = (selected: string | null, option: Language): boolean =>
  selected != null && selected.toLowerCase() === option.toLowerCase();

const languageLabel = (language: Language): string =>
  `${LANGUAGE_META[language].flag} ${language}`;

const toLanguageKey = (selected: string | null): Language | null => {
  if (!selected) return null;
  const capitalized = (selected.charAt(0).toUpperCase() + selected.slice(1)) as Language;
  return capitalized;
};

/**
 * The shared learning/known/level selection UI used by WelcomeScreen and
 * LanguageSettingsScreen. Driven entirely by props so each screen owns its
 * own persistence/confirmation behavior.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  learningLanguage,
  knownLanguage,
  level,
  onSelectLearning,
  onSelectKnown,
  onSelectLevel,
}) => {
  const learnableLanguages = languages.filter(
    (language) => availableCombinations[language].length > 0,
  );

  const learningKey = toLanguageKey(learningLanguage);
  const knownOptions: Language[] = learningKey
    ? availableCombinations[learningKey] ?? []
    : [];

  return (
    <>
      <Section title="I want to learn" index={0}>
        {learnableLanguages.map((language, i) => (
          <SelectableRow
            key={language}
            label={languageLabel(language)}
            selected={matchesLanguage(learningLanguage, language)}
            onPress={() => onSelectLearning(language)}
            isLast={i === learnableLanguages.length - 1}
          />
        ))}
      </Section>

      {learningLanguage ? (
        <Section title="From" index={1}>
          {knownOptions.map((language, i) => (
            <SelectableRow
              key={language}
              label={languageLabel(language)}
              selected={matchesLanguage(knownLanguage, language)}
              onPress={() => onSelectKnown(language)}
              isLast={i === knownOptions.length - 1}
            />
          ))}
        </Section>
      ) : null}

      {knownLanguage ? (
        <Section title="Level" index={2}>
          {levels.map((levelOption, i) => (
            <SelectableRow
              key={levelOption}
              label={levelOption}
              selected={
                level != null && level.toLowerCase() === levelOption.toLowerCase()
              }
              onPress={() => onSelectLevel(levelOption)}
              isLast={i === levels.length - 1}
            />
          ))}
        </Section>
      ) : null}
    </>
  );
};

export default LanguageSelector;
