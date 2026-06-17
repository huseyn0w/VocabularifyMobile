import React from 'react';
import { Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { PAYPAY_DONATION_URL } from '../utils/constants';
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

const SettingsScreen: React.FC<Props> = ({ navigation }) => (
  <ScreenContainer scroll>
    <Section title="Preferences" index={0}>
      <ListRow
        label="Learning Mode"
        chevron
        onPress={() => navigation.navigate('LearningModeScreen')}
      />
      <ListRow
        label="Language settings"
        chevron
        onPress={() => navigation.navigate('LanguageSettingsScreen')}
      />
      <ListRow
        label="Background"
        chevron
        onPress={() => navigation.navigate('BackgroundScreen')}
      />
      <ListRow
        label="About"
        chevron
        isLast
        onPress={() => navigation.navigate('AboutScreen')}
      />
    </Section>

    <Text className="mb-3 ml-1 font-semibold text-sm text-ink-muted">Support</Text>
    <LinkRow url={PAYPAY_DONATION_URL} label="Donate via PayPal" icon="heart-outline" />
  </ScreenContainer>
);

export default SettingsScreen;
