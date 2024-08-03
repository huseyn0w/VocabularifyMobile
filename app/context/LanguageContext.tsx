import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'languageSettings';

interface LanguageSettings {
  fromLanguage: string;
  toLanguage: string;
  level: string;
}

interface LanguageContextProps {
  settings: LanguageSettings;
  setSettings: (settings: LanguageSettings) => void;
}

interface LanguageProviderProps {
    children: ReactNode;
  }

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<LanguageSettings>({ fromLanguage: 'en', toLanguage: 'de', level: 'a1' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load language settings', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <LanguageContext.Provider value={{ settings, setSettings }}>
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
