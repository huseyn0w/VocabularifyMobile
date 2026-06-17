import React from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { Language } from '../utils/types';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import SelectableRow from '../components/SelectableRow';
import LanguageSelector from '../components/LanguageSelector';

const frequencies = [
  { label: '3 seconds', value: 3000 },
  { label: '5 seconds', value: 5000 },
  { label: '7 seconds', value: 7000 },
  { label: '10 seconds', value: 10000 },
];

const LanguageSettingsScreen: React.FC = () => {
  const { settings, setSettings, frequency, setFrequency } = useLanguageContext();

  const selectLearningLanguage = (value: Language) => {
    setSettings({
      ...settings,
      learningLanguage: value.toLowerCase(),
      knownLanguage: '',
      level: '',
    });
  };

  const selectKnownLanguage = (value: Language) => {
    setSettings({ ...settings, knownLanguage: value.toLowerCase() });
  };

  const selectLevel = (value: string) => {
    setSettings({ ...settings, level: value.toLowerCase() });
  };

  return (
    <ScreenContainer scroll>
      <LanguageSelector
        learningLanguage={settings.learningLanguage || null}
        knownLanguage={settings.knownLanguage || null}
        level={settings.level || null}
        onSelectLearning={selectLearningLanguage}
        onSelectKnown={selectKnownLanguage}
        onSelectLevel={selectLevel}
      />

      <Section title="Word frequency" index={3}>
        {frequencies.map((freq, i) => (
          <SelectableRow
            key={freq.value}
            label={freq.label}
            selected={frequency === freq.value}
            onPress={() => setFrequency(freq.value)}
            isLast={i === frequencies.length - 1}
          />
        ))}
      </Section>
    </ScreenContainer>
  );
};

export default LanguageSettingsScreen;
