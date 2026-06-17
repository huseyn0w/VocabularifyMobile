import React, { useEffect } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { duration } from '../theme/tokens';

interface ProgressBarProps {
  /** Progress as a fraction between 0 and 1. */
  progress: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Slim determinate progress bar. The fill width animates with an ease-in-out
 * morph as progress changes (on-screen morph, not an entrance). Uses the accent
 * token for the fill and the border token for the track. Respects reduced
 * motion by snapping instead of animating.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className, style }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const value = useSharedValue(clamped);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      value.value = clamped;
    } else {
      value.value = withTiming(clamped, {
        duration: duration.slow,
        easing: Easing.bezier(0.77, 0, 0.175, 1),
      });
    }
  }, [clamped, reducedMotion, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View
      className={`h-1 overflow-hidden rounded-full bg-border ${className ?? ''}`}
      style={style}
    >
      <Animated.View className="h-full rounded-full bg-accent" style={fillStyle} />
    </View>
  );
};

export default ProgressBar;
