import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_KEY, MODE_KEY } from '../utils/constants';

interface LanguageSettings {
  fromLanguage: string;
  toLanguage: string;
  level: string;
}

interface LanguageContextProps {
  settings: LanguageSettings;
  setSettings: (settings: LanguageSettings) => void;
  mode: string;
  setMode: (mode: string) => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<LanguageSettings>({ fromLanguage: 'en', toLanguage: 'de', level: 'a1' });
  const [mode, setMode] = useState<string>('showBoth');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        const savedMode = await AsyncStorage.getItem(MODE_KEY);
        if (savedMode) {
          setMode(savedMode);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    AsyncStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  return (
    <LanguageContext.Provider value={{ settings, setSettings, mode, setMode }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};
