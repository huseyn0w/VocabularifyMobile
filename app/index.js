import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { LANGUAGE_KEY } from './utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import WelcomeScreen from './screens/WelcomeScreen';
import 'react-native-gesture-handler';


const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [initialSettings, setInitialSettings] = useState(null);

  useEffect(() => {
    const checkInitialSettings = async () => {
      const settings = await AsyncStorage.getItem(LANGUAGE_KEY);
      setInitialSettings(settings !== null);
      setLoading(false);
    };

    checkInitialSettings();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!initialSettings && (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
};

registerRootComponent(App);
