import React from 'react';
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import SettingsScreen from '../screens/SettingsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import HowItWorksScreen from '../screens/HowItWorksScreen';
import LearningModeScreen from '../screens/LearningModeScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import BackgroundScreen from '../screens/BackgroundScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslate } from '../i18n';
import { fontWeight, fontSize } from '../theme/tokens';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => {
  const colors = useThemeColors();
  const { t } = useTranslate();

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
          fontWeight: fontWeight.semibold,
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
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: t('nav.settings') }} />
      <Stack.Screen name="ProgressScreen" component={ProgressScreen} options={{ title: t('nav.progress') }} />
      <Stack.Screen name="LearningModeScreen" component={LearningModeScreen} options={{ title: t('nav.learningMode') }} />
      <Stack.Screen name="LanguageSettingsScreen" component={LanguageSettingsScreen} options={{ title: t('nav.languageSettings') }} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: t('nav.about') }} />
      <Stack.Screen name="BackgroundScreen" component={BackgroundScreen} options={{ title: t('nav.background') }} />
      <Stack.Screen name="HowItWorksScreen" component={HowItWorksScreen} options={{ title: t('nav.howItWorks') }} />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
