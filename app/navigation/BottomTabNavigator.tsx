import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTranslate } from '../i18n';
import { getTabBarIconName } from '../utils/utils';
import { fontWeight, fontSize } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const colors = useThemeColors();
  const { t } = useTranslate();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: colors.ink,
          fontWeight: fontWeight.semibold,
          fontSize: fontSize.xl,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = getTabBarIconName(route.name);
          return (
            <Ionicons
              name={focused ? iconName : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarLabelStyle: {
          fontWeight: fontWeight.medium,
          fontSize: fontSize.xs,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      {/* The route names stay English - getTabBarIconName keys off them, and
          they are the navigation contract. Only the visible title changes. */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('nav.home') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ headerShown: false, title: t('nav.settings') }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
