import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { useThemeContext } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { theme } = useThemeContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Main') {
            iconName = 'home';
          } else if (route.name === 'SettingsMain') {
            iconName = 'settings';
          } else {
            iconName = 'home'; // Default icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.background,
        },
      })}
    >
      <Tab.Screen name="Main" component={HomeScreen} />
      <Tab.Screen name="SettingsMain" component={SettingsStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
