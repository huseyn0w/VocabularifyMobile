import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguageContext } from '../context/LanguageContext';
import { useThemeContext } from '../context/ThemeContext';
import { Language, availableCombinations, languages, levels } from '../utils/types';

const frequencies = [
  { label: '3 seconds', value: 3000 },
  { label: '5 seconds', value: 5000 },
  { label: '7 seconds', value: 7000 },
  { label: '10 seconds', value: 10000 },
];

const LanguageSettingsScreen: React.FC = () => {
  const { settings, setSettings, frequency, setFrequency } = useLanguageContext();
  const { theme } = useThemeContext();

  const selectFromLanguage = (value: Language) => {
    setSettings({ ...settings, fromLanguage: value.toLowerCase(), toLanguage: '', level: '' });
  };

  const selectToLanguage = (value: Language) => {
    setSettings({ ...settings, toLanguage: value.toLowerCase() });
  };

  const selectLevel = (value: string) => {
    setSettings({ ...settings, level: value });
  };

  const selectFrequency = async (value: number) => {
    setFrequency(value);
  };

  const filteredToLanguages = availableCombinations[
    settings.fromLanguage.charAt(0).toUpperCase() + settings.fromLanguage.slice(1) as Language
  ] || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>I want to learn</Text>
        <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
          {languages
            .filter(language => availableCombinations[language].length > 0)
            .map(language => (
              <TouchableOpacity
                key={language}
                style={[styles.item, { borderBottomColor: theme.border }]}
                onPress={() => selectFromLanguage(language)}
              >
                <Text style={[styles.text, { color: theme.text }]}>
                  {language} {settings.fromLanguage === language.toLowerCase() && '✓'}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {settings.fromLanguage && (
          <>
            <Text style={[styles.title, { color: theme.text }]}>From</Text>
            <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
              {filteredToLanguages.map(language => (
                <TouchableOpacity
                  key={language}
                  style={[styles.item, { borderBottomColor: theme.border }]}
                  onPress={() => selectToLanguage(language)}
                >
                  <Text style={[styles.text, { color: theme.text }]}>
                    {language} {settings.toLanguage === language.toLowerCase() && '✓'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {settings.toLanguage && (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Level</Text>
            <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.item, { borderBottomColor: theme.border }]}
                  onPress={() => selectLevel(level.toLowerCase())}
                >
                  <Text style={[styles.text, { color: theme.text }]}>
                    {level} {settings.level === level.toLowerCase() && '✓'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.title, { color: theme.text }]}>Change Word Frequency</Text>
        <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
          {frequencies.map(freq => (
            <TouchableOpacity
              key={freq.value}
              style={[styles.item, { borderBottomColor: theme.border }]}
              onPress={() => selectFrequency(freq.value)}
            >
              <Text style={[styles.text, { color: theme.text }]}>
                {freq.label} {frequency === freq.value && '✓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  section: {
    marginVertical: 10,
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

export default LanguageSettingsScreen;
