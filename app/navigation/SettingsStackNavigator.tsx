import React from 'react';
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import SettingsScreen from '../screens/SettingsScreen';
import LearningModeScreen from '../screens/LearningModeScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import BackgroundScreen from '../screens/BackgroundScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { fontFamily, fontSize } from '../theme/tokens';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: colors.ink,
          fontFamily: fontFamily.displaySemibold,
          fontSize: fontSize.xl,
        },
        headerTitleAlign: 'center',
        headerTintColor: colors.accent,
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
