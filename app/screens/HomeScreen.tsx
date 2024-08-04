import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeContext } from '../context/ThemeContext';
import { useLanguageContext } from '../context/LanguageContext';
import loadLanguageFile from '../utils/loadLanguageFile';
import { LAST_INDEX_KEY } from '../utils/constants';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const timerDuration = 10000;

interface Word {
  word_1: string;
  word_2: string;
}

const HomeScreen: React.FC = () => {
  const { theme } = useThemeContext();
  const { settings, mode } = useLanguageContext();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const translateX = useSharedValue(0);

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
  }, [currentIndex, words.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [settings]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (words.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex !== null ? (prevIndex + 1) % words.length : 0));
      }, timerDuration);
    }
  }, [words.length]);

  useEffect(() => {
    if (mode === 'showWordThenTranslation') {
      setShowTranslation(false);
      const timeout = setTimeout(() => {
        setShowTranslation(true);
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setShowTranslation(true);
    }
  }, [currentIndex, mode]);

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value = event.nativeEvent.translationX;
  };

  const handleGestureStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > SWIPE_THRESHOLD) {
        showPreviousWord();
      } else if (event.nativeEvent.translationX < -SWIPE_THRESHOLD) {
        showNextWord();
      }
      translateX.value = withSpring(0);
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
    return {
      transform: [{ translateX: translateX.value }],
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

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
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
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default HomeScreen;
