import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getLanguageSettings,
  setLanguageSettings as persistLanguageSettings,
  getMode,
  setMode as persistMode,
  getFrequency,
  setFrequency as persistFrequency,
  DEFAULT_LANGUAGE_SETTINGS,
} from '../services/storage';
import { LanguageSettings, LearningMode } from '../utils/types';
import { DEFAULT_FREQUENCY } from '../utils/constants';

interface LanguageContextProps {
  settings: LanguageSettings;
  setSettings: (settings: LanguageSettings) => void;
  mode: LearningMode;
  setMode: (mode: LearningMode) => void;
  frequency: number;
  setFrequency: (frequency: number) => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<LanguageSettings>(DEFAULT_LANGUAGE_SETTINGS);
  const [mode, setMode] = useState<LearningMode>(LearningMode.ShowBoth);
  const [frequency, setFrequency] = useState<number>(DEFAULT_FREQUENCY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Reads + migrates the legacy { fromLanguage, toLanguage } shape.
        const savedSettings = await getLanguageSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
        setMode(await getMode());
        setFrequency(await getFrequency());
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setHydrated(true);
      }
    };

    loadSettings();
  }, []);

  // Persist only after the initial hydration so we don't overwrite stored
  // values with defaults on first mount.
  useEffect(() => {
    if (hydrated) {
      persistLanguageSettings(settings);
    }
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) {
      persistMode(mode);
    }
  }, [mode, hydrated]);

  useEffect(() => {
    if (hydrated) {
      persistFrequency(frequency);
    }
  }, [frequency, hydrated]);

  return (
    <LanguageContext.Provider value={{ settings, setSettings, mode, setMode, frequency, setFrequency }}>
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
