import React, { ReactNode } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { duration } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  /** Target scale while pressed. Defaults to a subtle 0.97. */
  pressedScale?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable pressable that gives subtle, restrained press feedback: a quick
 * scale-down to ~0.97 on press-in and an ease-out settle on release.
 *
 * Respects reduced-motion — when enabled, the scale transform is skipped and
 * only the standard pressable behavior remains.
 */
const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  pressedScale = 0.97,
  style,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (!reducedMotion) {
          scale.value = withTiming(pressedScale, {
            duration: duration.fast,
            easing: Easing.bezier(0.23, 1, 0.32, 1),
          });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reducedMotion) {
          scale.value = withTiming(1, {
            duration: duration.base,
            easing: Easing.bezier(0.23, 1, 0.32, 1),
          });
        }
        onPressOut?.(e);
      }}
      style={[reducedMotion ? undefined : animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
