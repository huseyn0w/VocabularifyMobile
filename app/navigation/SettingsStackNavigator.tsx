import React from 'react';
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import SettingsScreen from '../screens/SettingsScreen';
import LearningModeScreen from '../screens/LearningModeScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import BackgroundScreen from '../screens/BackgroundScreen';
import { useThemeContext } from '../context/ThemeContext';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => {
  const { theme } = useThemeContext();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.headerBackground,
        },
        headerTitleStyle: {
          color: theme.text,
        },
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="LearningModeScreen" component={LearningModeScreen} options={{ title: 'Learning mode' }} />
      <Stack.Screen name="LanguageSettingsScreen" component={LanguageSettingsScreen} options={{ title: 'Language Settings' }} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'About' }} />
      <Stack.Screen name="BackgroundScreen" component={BackgroundScreen} options={{ title: 'Background' }} />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
