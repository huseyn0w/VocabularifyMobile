import React, { useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { useLanguageContext } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useWordList } from '../hooks/useWordList';
import { useFlashcardDeck } from '../hooks/useFlashcardDeck';
import ProgressBar from '../components/ProgressBar';
import { duration } from '../theme/tokens';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const CARD_WIDTH = width * 0.84;

const HomeScreen: React.FC = () => {
  const colors = useThemeColors();
  const { settings, mode, frequency } = useLanguageContext();
  const reducedMotion = useReducedMotion();

  const { words, loading } = useWordList(settings);
  const { currentIndex, current, total, next, prev, showTranslation } =
    useFlashcardDeck({ words, frequency, mode });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Tasteful translation reveal — fades/slides in when showTranslation flips.
  const revealProgress = useSharedValue(showTranslation ? 1 : 0);
  useEffect(() => {
    if (reducedMotion) {
      revealProgress.value = showTranslation ? 1 : 0;
      return;
    }
    revealProgress.value = withTiming(showTranslation ? 1 : 0, {
      duration: duration.slow,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  }, [showTranslation, reducedMotion, revealProgress]);

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (reducedMotion) return;
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY * 0.25;
    rotate.value = event.nativeEvent.translationX / width;
  };

  const handleGestureStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > SWIPE_THRESHOLD) {
        runOnJS(next)();
      } else if (event.nativeEvent.translationX < -SWIPE_THRESHOLD) {
        runOnJS(prev)();
      }
      // Momentum-aware, interruptible spring return with a subtle settle.
      const springConfig = {
        damping: 18,
        stiffness: 180,
        mass: 0.6,
        velocity: event.nativeEvent.velocityX,
      };
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, { damping: 18, stiffness: 180, mass: 0.6 });
      rotate.value = withSpring(0, { damping: 18, stiffness: 180 });
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value * 8}deg` },
      ],
      opacity,
    };
  });

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate(revealProgress.value, [0, 1], [8, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  if (loading || currentIndex === null) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (total === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8">
        <Text className="text-center font-display text-2xl text-ink">No words available</Text>
        <Text className="mt-2 text-center font-sans text-base text-ink-muted">
          Choose a language pair in Settings to begin.
        </Text>
      </View>
    );
  }

  const progress = (currentIndex + 1) / total;

  return (
    <GestureHandlerRootView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center bg-bg">
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            className="items-center justify-center rounded-2xl border border-border bg-card"
            style={[
              {
                width: CARD_WIDTH,
                aspectRatio: 0.72,
                paddingHorizontal: 28,
                shadowColor: colors.ink,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.12,
                shadowRadius: 28,
                elevation: 12,
              },
              animatedCardStyle,
            ]}
          >
            {current && (
              <>
                <Text
                  className="text-center font-display-semibold text-4xl text-ink"
                  numberOfLines={3}
                  adjustsFontSizeToFit
                >
                  {current.word_1}
                </Text>
                <Animated.View style={revealStyle} className="mt-4">
                  <Text className="text-center font-sans text-xl text-ink-muted">
                    {current.word_2}
                  </Text>
                </Animated.View>
              </>
            )}
          </Animated.View>
        </PanGestureHandler>

        <View className="absolute inset-x-0 bottom-14 items-center px-8">
          <ProgressBar progress={progress} style={{ width: CARD_WIDTH }} />
          <Text className="mt-3 font-medium text-sm text-ink-subtle">
            {`${currentIndex + 1} / ${total}`}
          </Text>
          <Text className="mt-6 font-sans text-xs uppercase tracking-[1.5px] text-ink-subtle">
            Swipe to change words
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;
