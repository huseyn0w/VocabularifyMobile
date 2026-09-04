import React from 'react';
import { View, Text } from 'react-native';
import { LearningMode } from '../utils/types';
import { useLanguageContext } from '../context/LanguageContext';
import { useTranslate } from '../i18n';
import { CopyKey } from '../i18n/copy';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import ListRow from '../components/ListRow';

const OPTIONS: { mode: LearningMode; title: CopyKey; subtitle: CopyKey }[] = [
  {
    mode: LearningMode.ShowBoth,
    title: 'mode.both',
    subtitle: 'mode.bothSub',
  },
  {
    mode: LearningMode.ShowWordThenTranslation,
    title: 'mode.delayed',
    subtitle: 'mode.delayedSub',
  },
];

const LearningModeScreen: React.FC = () => {
  const { mode, setMode } = useLanguageContext();
  const { t } = useTranslate();

  return (
    <ScreenContainer scroll>
      <Section title={t('nav.learningMode')} index={0}>
        {OPTIONS.map((option, i) => (
          <ListRow
            key={option.mode}
            selected={mode === option.mode}
            isLast={i === OPTIONS.length - 1}
            onPress={() => setMode(option.mode)}
            label={
              <View>
                <Text className="font-medium text-base text-ink">{t(option.title)}</Text>
                <Text className="mt-1 text-sm text-ink-muted">{t(option.subtitle)}</Text>
              </View>
            }
          />
        ))}
      </Section>
    </ScreenContainer>
  );
};

export default LearningModeScreen;
