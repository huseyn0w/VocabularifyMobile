import React from 'react';
import { Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { BUY_ME_A_COFFEE_LABEL, BUY_ME_A_COFFEE_URL } from '../utils/constants';
import { useTranslate } from '../i18n';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import ListRow from '../components/ListRow';
import LinkRow from '../components/LinkRow';

type SettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'SettingsScreen'
>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslate();

  return (
    <ScreenContainer scroll>
      <Section title={t('settings.preferences')} index={0}>
        <ListRow
          label={t('nav.progress')}
          chevron
          onPress={() => navigation.navigate('ProgressScreen')}
        />
        <ListRow
          label={t('nav.learningMode')}
          chevron
          onPress={() => navigation.navigate('LearningModeScreen')}
        />
        <ListRow
          label={t('nav.languageSettings')}
          chevron
          onPress={() => navigation.navigate('LanguageSettingsScreen')}
        />
        <ListRow
          label={t('nav.background')}
          chevron
          onPress={() => navigation.navigate('BackgroundScreen')}
        />
        <ListRow
          label={t('nav.howItWorks')}
          chevron
          onPress={() => navigation.navigate('HowItWorksScreen')}
        />
        <ListRow
          label={t('nav.about')}
          chevron
          isLast
          onPress={() => navigation.navigate('AboutScreen')}
        />
      </Section>

      <Text className="mb-3 ml-1 font-semibold text-sm text-ink-muted">
        {t('settings.support')}
      </Text>
      <LinkRow url={BUY_ME_A_COFFEE_URL} label={BUY_ME_A_COFFEE_LABEL} icon="cafe-outline" />
    </ScreenContainer>
  );
};

export default SettingsScreen;
