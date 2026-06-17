import React, { ReactNode } from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  FadeInDown,
  Easing,
  useReducedMotion,
  FadeIn,
} from 'react-native-reanimated';
import { duration } from '../theme/tokens';

interface SectionProps {
  /** Optional heading rendered above the grouped container. */
  title?: string;
  children: ReactNode;
  /** Stagger order — multiplies the entrance delay for a quick cascade. */
  index?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grouped-list container: a rounded, hairline-bordered surface with an optional
 * small-caps editorial title. Wraps `ListRow` / `SelectableRow` items.
 * Enters with a quick, restrained fade/slide that staggers by `index`.
 */
const Section: React.FC<SectionProps> = ({ title, children, index = 0, className, style }) => {
  const reducedMotion = useReducedMotion();

  const entering = reducedMotion
    ? FadeIn.duration(duration.base)
    : FadeInDown.duration(duration.base)
        .delay(index * 60)
        .easing(Easing.bezier(0.23, 1, 0.32, 1).factory());

  return (
    <Animated.View entering={entering} className={`mb-6 ${className ?? ''}`} style={style}>
      {title ? (
        <Text className="mb-3 ml-1 font-semibold text-sm text-ink-muted">{title}</Text>
      ) : null}
      <View className="overflow-hidden rounded-xl border border-border bg-surface">
        {children}
      </View>
    </Animated.View>
  );
};

export default Section;
