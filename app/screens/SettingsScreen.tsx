import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';
import { useThemeContext } from '../context/ThemeContext';

type SettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'SettingsScreen'
>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('ModeScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('LanguageScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('AboutScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('BackgroundScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Background</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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

export default SettingsScreen;
