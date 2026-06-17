import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { useThemeColors } from '../hooks/useThemeColors';

interface ListRowProps {
  label: ReactNode;
  onPress?: () => void;
  /** Renders a trailing accent checkmark when true. */
  selected?: boolean;
  /** Show a trailing chevron (navigation affordance). */
  chevron?: boolean;
  /** Optional custom trailing content (overrides checkmark/chevron). */
  trailing?: ReactNode;
  /** Suppresses the bottom hairline (use for the final row in a Section). */
  isLast?: boolean;
}

/**
 * Pressable row inside a `Section`. Generous touch target, hairline divider
 * between rows, and a subtle press-scale. Trailing slot resolves to a custom
 * node, an accent checkmark (selected), or a chevron (chevron) — in that order.
 */
const ListRow: React.FC<ListRowProps> = ({
  label,
  onPress,
  selected,
  chevron,
  trailing,
  isLast,
}) => {
  const colors = useThemeColors();

  const resolvedTrailing =
    trailing ??
    (selected ? (
      <Ionicons name="checkmark" size={20} color={colors.accent} />
    ) : chevron ? (
      <Ionicons name="chevron-forward" size={18} color={colors.inkSubtle} />
    ) : null);

  return (
    <PressableScale onPress={onPress} disabled={!onPress}>
      <View
        className={`min-h-[56px] flex-row items-center justify-between px-4 py-3.5 ${
          isLast ? '' : 'border-b border-border'
        }`}
      >
        {typeof label === 'string' ? (
          <Text className="flex-1 pr-3 font-medium text-base text-ink">{label}</Text>
        ) : (
          <View className="flex-1 pr-3">{label}</View>
        )}
        {resolvedTrailing}
      </View>
    </PressableScale>
  );
};

export default ListRow;
