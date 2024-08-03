import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const DEFAULT_LANGUAGE_PATH = '../../languages/de/en/a1.json';
const timerDuration = 10000; // Change this value to configure the timer duration
const LAST_INDEX_KEY = 'lastWordIndex';

interface Word {
  word_1: string;
  word_2: string;
}

const WordCarousel: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem(LAST_INDEX_KEY);
        const wordsList: Word[] = require(DEFAULT_LANGUAGE_PATH);
        setWords(wordsList);
        if (savedIndex !== null) {
          setCurrentIndex(parseInt(savedIndex, 10));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading words:', error);
      }
    };

    loadWords();
    startTimer();
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(LAST_INDEX_KEY, currentIndex.toString());
  }, [currentIndex]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, timerDuration);
  };

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
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
    startTimer();
  };

  const showNextWord = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    startTimer();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View style={[styles.wordContainer, animatedStyle]}>
          <Text style={styles.word}>{words[currentIndex].word_1}</Text>
          <Text style={styles.translation}>{words[currentIndex].word_2}</Text>
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
    backgroundColor: '#fff',
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
    color: 'grey',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default WordCarousel;
