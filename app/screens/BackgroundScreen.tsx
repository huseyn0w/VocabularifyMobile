// BackgroundScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';
import { useThemeContext } from '../context/ThemeContext';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'BackgroundScreen'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const BackgroundScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, themeType, setThemeType } = useThemeContext();

  const renderOption = (mode: 'light' | 'dark' | 'system', label: string) => {
    const isSelected = themeType === mode;
    return (
      <TouchableOpacity
        key={mode}
        style={[styles.item, { borderBottomColor: theme.border }]}
        onPress={() => setThemeType(mode)}
      >
        <Text style={[styles.text, { color: theme.text }]}>
          {label}
          {isSelected && ' ✓'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
        {renderOption('light', 'Light')}
        {renderOption('dark', 'Dark')}
        {renderOption('system', 'System')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  section: {
    borderRadius: 10,
    borderWidth: 1,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 18,
  },
});

export default BackgroundScreen;
