import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { useThemeColors } from '../hooks/useThemeColors';
import { getTabBarIconName } from '../utils/utils';
import { fontFamily, fontSize } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const colors = useThemeColors();

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
          fontFamily: fontFamily.displaySemibold,
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
          fontFamily: fontFamily.sansMedium,
          fontSize: fontSize.xs,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
