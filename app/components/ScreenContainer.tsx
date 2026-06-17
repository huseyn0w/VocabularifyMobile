import React, { ReactNode } from 'react';
import { View, ScrollView, ViewStyle, StyleProp } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  /** When true, content is wrapped in a ScrollView. */
  scroll?: boolean;
  /** Extra className applied to the outer container. */
  className?: string;
  /** Extra className applied to the scroll content container. */
  contentClassName?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Full-screen container that paints the warm "paper" background. Optionally
 * scrolls. Provides generous, editorial padding so screens breathe.
 */
const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll = false,
  className,
  contentClassName,
  style,
  contentContainerStyle,
}) => {
  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 bg-bg ${className ?? ''}`}
        style={style}
        contentContainerStyle={contentContainerStyle}
        contentContainerClassName={`grow px-5 pt-4 pb-10 ${contentClassName ?? ''}`}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-1 bg-bg px-5 pt-4 ${className ?? ''}`} style={style}>
      {children}
    </View>
  );
};

export default ScreenContainer;
