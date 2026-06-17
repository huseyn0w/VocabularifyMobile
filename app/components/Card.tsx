import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { shadow } from '../theme/tokens';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Apply the soft elevation shadow. Defaults to true. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Elevated, rounded paper surface. Soft depth from a hairline border plus a
 * restrained shadow token (never heavy). Used for the flashcard and any
 * standalone content block.
 */
const Card: React.FC<CardProps> = ({ children, className, elevated = true, style }) => (
  <View
    className={`items-center justify-center rounded-2xl border border-border bg-card ${className ?? ''}`}
    style={[elevated ? shadow.lg.native : null, style]}
  >
    {children}
  </View>
);

export default Card;
