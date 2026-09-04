import React from 'react';
import { Text, View } from 'react-native';
import { useLanguageContext } from '../context/LanguageContext';
import { Language } from '../utils/types';
import { useTranslate } from '../i18n';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import ListRow from '../components/ListRow';
import SelectableRow from '../components/SelectableRow';
import LanguageSelector from '../components/LanguageSelector';

const FREQUENCIES = [3000, 5000, 7000, 10000];

const LanguageSettingsScreen: React.FC = () => {
  const { settings, setSettings, frequency, setFrequency, autoAdvance, setAutoAdvance } =
    useLanguageContext();
  const { t } = useTranslate();

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

      {/* Pace, not "word frequency". The old list of intervals was the only
          control here and it was always on, so a learner who wanted to sit on
          a word had to fight the timer. The choice comes first now, and the
          intervals only appear once the timer is wanted. */}
      <Section title={t('pace.title')} index={3}>
        <ListRow
          selected={!autoAdvance}
          onPress={() => setAutoAdvance(false)}
          label={
            <View>
              <Text className="font-medium text-base text-ink">{t('pace.manual')}</Text>
              <Text className="mt-1 text-sm text-ink-muted">{t('pace.manualSub')}</Text>
            </View>
          }
        />
        <ListRow
          isLast
          selected={autoAdvance}
          onPress={() => setAutoAdvance(true)}
          label={
            <View>
              <Text className="font-medium text-base text-ink">{t('pace.auto')}</Text>
              <Text className="mt-1 text-sm text-ink-muted">{t('pace.autoSub')}</Text>
            </View>
          }
        />
      </Section>

      {autoAdvance ? (
        <>
          <Section title={t('pace.interval')} index={4}>
            {FREQUENCIES.map((value, i) => (
              <SelectableRow
                key={value}
                label={t('pace.seconds', { n: value / 1000 })}
                selected={frequency === value}
                onPress={() => setFrequency(value)}
                isLast={i === FREQUENCIES.length - 1}
              />
            ))}
          </Section>
          <Text className="-mt-3 mb-6 px-1 text-sm leading-5 text-ink-subtle">
            {t('pace.sentenceNote')}
          </Text>
        </>
      ) : null}
    </ScreenContainer>
  );
};

export default LanguageSettingsScreen;
