import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageContext } from '../context/LanguageContext';
import { useThemeContext } from '../context/ThemeContext';
import { Language, availableCombinations, languages, levels, RootStackParamList } from '../utils/types'
import { LANGUAGE_KEY } from '../utils/constants'

type WelcomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const { theme } = useThemeContext();
  const { setSettings } = useLanguageContext();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [fromLanguage, setFromLanguage] = useState<Language | null>(null);
  const [toLanguage, setToLanguage] = useState<Language | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (fromLanguage && toLanguage && level) {
      const settings = { fromLanguage: fromLanguage.toLowerCase(), toLanguage: toLanguage.toLowerCase(), level: level.toLowerCase() };
      await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify(settings));
      setSettings(settings);
      navigation.navigate('Main');
    }
  };

  const showConfirmation = () => {
    Alert.alert(
      "Confirm Selection",
      "Are you sure you want to save these settings?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: handleSaveSettings
        }
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (fromLanguage && toLanguage && level) {
      showConfirmation();
    }
  }, [fromLanguage, toLanguage, level]);

  const filteredToLanguages = fromLanguage ? availableCombinations[fromLanguage] : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome! Set your initial preferences</Text>

        <Text style={[styles.title, { color: theme.text }]}>I want to learn</Text>
        <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
          {languages
            .filter(language => availableCombinations[language].length > 0)
            .map(language => (
              <TouchableOpacity
                key={language}
                style={[styles.item, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setFromLanguage(language);
                  setToLanguage(null);
                  setLevel(null);
                }}
              >
                <Text style={[styles.text, { color: theme.text }]}>
                  {language} {fromLanguage === language && '✓'}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {fromLanguage && (
          <>
            <Text style={[styles.title, { color: theme.text }]}>From</Text>
            <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
              {filteredToLanguages.map(language => (
                <TouchableOpacity
                  key={language}
                  style={[styles.item, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setToLanguage(language);
                    setLevel(null); // Reset level when toLanguage changes
                  }}
                >
                  <Text style={[styles.text, { color: theme.text }]}>
                    {language} {toLanguage === language && '✓'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {toLanguage && (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Level</Text>
            <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
              {levels.map(levelOption => (
                <TouchableOpacity
                  key={levelOption}
                  style={[styles.item, { borderBottomColor: theme.border }]}
                  onPress={() => setLevel(levelOption)}
                >
                  <Text style={[styles.text, { color: theme.text }]}>
                    {levelOption} {level === levelOption && '✓'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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

export default WelcomeScreen;
