// HomeScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ProgressBar } from 'react-native-paper';
import { useThemeContext, themes } from '../context/ThemeContext';
import { useLanguageContext } from '../context/LanguageContext';
import loadLanguageFile from '../utils/loadLanguageFile';
import { LAST_INDEX_KEY, SHOW_TRANSLATION_DELAY } from '../utils/constants';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

interface Word {
  word_1: string;
  word_2: string;
}

const HomeScreen: React.FC = () => {
  const { theme } = useThemeContext();
  const { settings, mode, frequency } = useLanguageContext();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const wordsList: Word[] = await loadLanguageFile(settings.fromLanguage, settings.toLanguage, settings.level);
        setWords(wordsList);

        const savedIndex = await AsyncStorage.getItem(LAST_INDEX_KEY);
        const value = savedIndex ? parseInt(savedIndex, 10) : 0;
        setCurrentIndex(value);

        setLoading(false);
      } catch (error) {
        console.error('Error loading words:', error);
        setLoading(false);
      }
    };

    loadWords();
  }, [settings]);

  useEffect(() => {
    if (currentIndex !== null && words.length > 0) {
      AsyncStorage.setItem(LAST_INDEX_KEY, currentIndex.toString());
    }
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex !== null && words.length > 0) {
      startTimer();
    }
  }, [currentIndex, words.length, frequency]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [settings]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (words.length > 0) {
      intervalRef.current = setInterval(() => {
        runOnJS(showNextWord)();
      }, frequency);
    }
  }, [words.length, frequency]);

  useEffect(() => {
    if (mode === 'showWordThenTranslation') {
      setShowTranslation(false);
      const timeout = setTimeout(() => {
        setShowTranslation(true);
      }, SHOW_TRANSLATION_DELAY);
      return () => clearTimeout(timeout);
    } else {
      setShowTranslation(true);
    }
  }, [currentIndex, mode]);

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
    rotate.value = event.nativeEvent.translationX / width;
  };

  const handleGestureStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > SWIPE_THRESHOLD) {
        runOnJS(showNextWord)();
      } else if (event.nativeEvent.translationX < -SWIPE_THRESHOLD) {
        runOnJS(showPreviousWord)();
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotate.value = withSpring(0);
    }
  };

  const showPreviousWord = () => {
    setCurrentIndex(prevIndex => (prevIndex !== null ? (prevIndex - 1 + words.length) % words.length : 0));
    startTimer();
  };

  const showNextWord = () => {
    setCurrentIndex(prevIndex => (prevIndex !== null ? (prevIndex + 1) % words.length : 0));
    startTimer();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2], // Adjusted range for faster fadeout
      [0, 1, 0]
    );
  
    const isDarkMode = theme === themes.dark;
    const shadowColor = isDarkMode ? '#fff' : '#000';
    const shadowOpacity = isDarkMode ? 0.3 : 0.5;
  
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value * 15}deg` }
      ],
      opacity: opacity,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: shadowOpacity,
      shadowRadius: 20,
      backgroundColor: theme.cardBackground, // Added card background color
    };
  });

  if (loading || currentIndex === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.noWordsText, { color: theme.text }]}>No words available</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const progress = (currentIndex + 1) / words.length;

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsText, { color: theme.text }]}>*Swipe left or right to change words*</Text>
        </View>
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View style={[styles.wordContainer, animatedStyle]}>
            {currentWord && (
              <>
                <Text style={[styles.word, { color: theme.text }]}>{currentWord.word_1}</Text>
                {showTranslation && <Text style={[styles.translation, { color: theme.text }]}>{currentWord.word_2}</Text>}
              </>
            )}
          </Animated.View>
        </PanGestureHandler>
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={theme.text}
            style={{ width: width * 0.8 }}
          />
          <Text style={[styles.progressText, { color: theme.text }]}>{`${currentIndex + 1} / ${words.length}`}</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordContainer: {
    width: width * 0.8,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  translation: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  noWordsText: {
    fontSize: 24,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  progressText: {
    marginTop: 5,
    fontSize: 16,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
