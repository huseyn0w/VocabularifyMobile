import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE_PATH = 'languages/de/en/a1.json';

const languages = [
  { label: 'German from English (A1)', value: 'languages/de/en/a1.json' },
  { label: 'German from Russian (A1)', value: 'languages/de/ru/a1.json' },
];

const Settings: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGE_PATH);

  const saveLanguageSetting = async (language: string) => {
    try {
      await AsyncStorage.setItem(LANG_KEY, language);
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      {languages.map((lang) => (
        <Button
          key={lang.value}
          title={lang.label}
          onPress={() => saveLanguageSetting(lang.value)}
          disabled={selectedLanguage === lang.value}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Settings;
