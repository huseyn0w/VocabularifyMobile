import React, { ReactNode } from 'react';
import { Text, ViewStyle, StyleProp } from 'react-native';
import PressableScale from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  children?: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const containerByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-surface border border-border',
  ghost: 'bg-transparent',
};

const textByVariant: Record<ButtonVariant, string> = {
  primary: 'text-accent-foreground',
  secondary: 'text-ink',
  ghost: 'text-accent',
};

/**
 * Pressable button with restrained press feedback. The primary variant uses the
 * single terracotta accent; secondary/ghost stay quiet. Renders `children` if
 * provided, otherwise the `title`.
 */
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  children,
  variant = 'primary',
  className,
  style,
}) => (
  <PressableScale
    onPress={onPress}
    style={style}
    className={`min-h-[52px] items-center justify-center rounded-lg px-5 py-3.5 ${containerByVariant[variant]} ${className ?? ''}`}
  >
    {children ?? (
      <Text className={`font-semibold text-base ${textByVariant[variant]}`}>{title}</Text>
    )}
  </PressableScale>
);

export default Button;
