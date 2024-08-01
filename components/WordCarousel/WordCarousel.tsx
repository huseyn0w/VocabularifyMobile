import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

const words = ['Hello', 'World', 'React', 'Native', 'Expo', 'TypeScript', 'JavaScript', 'Mobile', 'Development', 'Awesome'];

const WordSwiper: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerDuration = 10000; // Change this value to configure the timer duration
  const translateX = useSharedValue(0);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, []);

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

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View style={[styles.wordContainer, animatedStyle]}>
          <Text style={styles.word}>{words[currentIndex]}</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
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
});

export default WordSwiper;
