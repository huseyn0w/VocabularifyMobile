import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import ModeScreen from './screens/ModeScreen';
import LanguageScreen from './screens/LanguageScreen';
import AboutScreen from './screens/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="ModeScreen" component={ModeScreen} options={{ title: 'Mode' }} />
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} options={{ title: 'Language' }} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'About' }} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Main" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

registerRootComponent(App);
