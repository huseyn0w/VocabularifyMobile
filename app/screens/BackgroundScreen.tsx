// BackgroundScreen.tsx
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { useThemeContext } from '../context/ThemeContext';
import { useTranslate } from '../i18n';
import { CopyKey } from '../i18n/copy';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import SelectableRow from '../components/SelectableRow';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'BackgroundScreen'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

type ThemeOption = 'light' | 'dark' | 'system';

const OPTIONS: { option: ThemeOption; label: CopyKey }[] = [
  { option: 'light', label: 'theme.light' },
  { option: 'dark', label: 'theme.dark' },
  { option: 'system', label: 'theme.system' },
];

const BackgroundScreen: React.FC<Props> = () => {
  const { themeType, setThemeType } = useThemeContext();
  const { t } = useTranslate();

  return (
    <ScreenContainer scroll>
      <Section title={t('theme.title')} index={0}>
        {OPTIONS.map((item, i) => (
          <SelectableRow
            key={item.option}
            label={t(item.label)}
            selected={themeType === item.option}
            onPress={() => setThemeType(item.option)}
            isLast={i === OPTIONS.length - 1}
          />
        ))}
      </Section>
    </ScreenContainer>
  );
};

export default BackgroundScreen;
