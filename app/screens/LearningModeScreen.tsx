import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const LearningModeScreen: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>This is the mode screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default LearningModeScreen;
