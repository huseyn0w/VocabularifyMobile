import React from 'react';
import { View, Text } from 'react-native';
import { LearningMode } from '../utils/types';
import { useLanguageContext } from '../context/LanguageContext';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import ListRow from '../components/ListRow';

const OPTIONS: { mode: LearningMode; title: string; subtitle: string }[] = [
  {
    mode: LearningMode.ShowBoth,
    title: 'Word and translation',
    subtitle: 'Show both at the same time.',
  },
  {
    mode: LearningMode.ShowWordThenTranslation,
    title: 'Word first, then translation',
    subtitle: 'Reveal the translation after a short pause.',
  },
];

const LearningModeScreen: React.FC = () => {
  const { mode, setMode } = useLanguageContext();

  return (
    <ScreenContainer scroll>
      <Section title="Learning mode" index={0}>
        {OPTIONS.map((option, i) => (
          <ListRow
            key={option.mode}
            selected={mode === option.mode}
            isLast={i === OPTIONS.length - 1}
            onPress={() => setMode(option.mode)}
            label={
              <View>
                <Text className="font-medium text-base text-ink">{option.title}</Text>
                <Text className="mt-1 font-sans text-sm text-ink-muted">{option.subtitle}</Text>
              </View>
            }
          />
        ))}
      </Section>
    </ScreenContainer>
  );
};

export default LearningModeScreen;
