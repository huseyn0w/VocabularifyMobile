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
import { duration, letterSpacing, shadow } from '../theme/tokens';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const CARD_WIDTH = width * 0.84;

const pad = (n: number) => String(n).padStart(2, '0');

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

  // Restrained mount entrance: the card settles in from 0.96 + fade (never from 0).
  const mounted = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    mounted.value = reducedMotion
      ? 1
      : withTiming(1, { duration: duration.slower, easing: Easing.bezier(0.23, 1, 0.32, 1) });
  }, [reducedMotion, mounted]);

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
    const dragOpacity = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );
    const mountScale = interpolate(mounted.value, [0, 1], [0.96, 1], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value * 8}deg` },
        { scale: mountScale },
      ],
      opacity: dragOpacity * mounted.value,
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
                shadowColor: colors.accentSoft,
                ...shadow.glow.native,
              },
              animatedCardStyle,
            ]}
          >
            {current && (
              <>
                <Text
                  className="text-center font-display-semibold text-5xl text-ink"
                  style={{ letterSpacing: letterSpacing.display }}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                >
                  {current.word_1}
                </Text>
                <Animated.View style={revealStyle} className="mt-5">
                  <Text className="text-center font-display text-2xl text-ink-muted">
                    {current.word_2}
                  </Text>
                </Animated.View>
              </>
            )}
          </Animated.View>
        </PanGestureHandler>

        <View className="absolute inset-x-0 bottom-14 items-center px-8">
          <View
            className="mb-3 flex-row items-baseline self-stretch justify-between"
            style={{ width: CARD_WIDTH, alignSelf: 'center' }}
          >
            <Text className="font-semibold text-base text-ink">{pad(currentIndex + 1)}</Text>
            <Text className="font-medium text-sm text-ink-subtle">{pad(total)}</Text>
          </View>
          <ProgressBar progress={progress} style={{ width: CARD_WIDTH }} />
          <Text className="mt-6 font-sans text-sm tracking-[0.3px] text-ink-subtle">
            swipe to continue
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;
