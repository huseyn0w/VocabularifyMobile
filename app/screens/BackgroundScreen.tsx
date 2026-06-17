// BackgroundScreen.tsx
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { useThemeContext } from '../context/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Section from '../components/Section';
import SelectableRow from '../components/SelectableRow';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'BackgroundScreen'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

type ThemeOption = 'light' | 'dark' | 'system';

const OPTIONS: { option: ThemeOption; label: string }[] = [
  { option: 'light', label: 'Light' },
  { option: 'dark', label: 'Dark' },
  { option: 'system', label: 'System' },
];

const BackgroundScreen: React.FC<Props> = () => {
  const { themeType, setThemeType } = useThemeContext();

  return (
    <ScreenContainer scroll>
      <Section title="Appearance" index={0}>
        {OPTIONS.map((item, i) => (
          <SelectableRow
            key={item.option}
            label={item.label}
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
