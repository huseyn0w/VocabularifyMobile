import React from 'react';
import { Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { useThemeColors } from '../hooks/useThemeColors';

interface LinkRowProps {
  url: string;
  label: string;
  /** Optional leading Ionicons glyph. */
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Tappable row that opens an external URL. Themed paper surface with a leading
 * icon and a trailing "open-outside" affordance — replaces the old
 * translucent-black buttons.
 */
const LinkRow: React.FC<LinkRowProps> = ({ url, label, icon }) => {
  const colors = useThemeColors();

  return (
    <PressableScale
      onPress={() => Linking.openURL(url)}
      className="mb-3 w-full flex-row items-center rounded-lg border border-border bg-surface px-4 py-3.5"
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={colors.accent} style={{ marginRight: 12 }} />
      ) : null}
      <Text className="flex-1 font-medium text-base text-ink">{label}</Text>
      <Ionicons name="open-outline" size={16} color={colors.inkSubtle} />
    </PressableScale>
  );
};

export default LinkRow;
