import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguageContext } from '../context/LanguageContext';
import { useThemeContext } from '../context/ThemeContext';

const languages = ['English', 'German', 'Russian', 'French'] as const;
const levels = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

type Language = typeof languages[number];

const availableCombinations: Record<Language, Language[]> = {
  English: ['German', 'French', 'Russian'],
  German: ['English', 'Russian'],
  Russian: ['German'],
  French: ['English']
};

const LanguageScreen: React.FC = () => {
  const { settings, setSettings } = useLanguageContext();
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

  const filteredToLanguages = availableCombinations[settings.fromLanguage.charAt(0).toUpperCase() + settings.fromLanguage.slice(1) as Language] || [];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>I want to learn</Text>
      <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
        {languages.map(language => (
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
          <Text style={[styles.title, { color: theme.text }]}>From Language</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  heading: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
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

export default LanguageScreen;
