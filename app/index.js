import '../global.css';
import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { hasLanguageSettings, migrateSettings } from './services/storage';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import WelcomeScreen from './screens/WelcomeScreen';
import 'react-native-gesture-handler';


const Stack = createStackNavigator();

/** Drives the OS status bar to match the resolved (light/dark) theme. */
const ThemedStatusBar = () => {
  const { themeType } = useThemeContext();
  const systemScheme = useColorScheme();
  const resolved =
    themeType === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeType;
  // Dark UI -> light status bar content, and vice versa.
  return <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [initialSettings, setInitialSettings] = useState(null);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    const checkInitialSettings = async () => {
      // Migrate any legacy persisted shape before reading.
      await migrateSettings();
      setInitialSettings(await hasLanguageSettings());
      setLoading(false);
    };

    checkInitialSettings();
  }, []);

  if (loading || !fontsLoaded) {
    // Smoke test: this view is styled entirely via NativeWind `className`.
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ThemedStatusBar />
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
