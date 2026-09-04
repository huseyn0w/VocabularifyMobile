import React from "react";
import { View, Text } from "react-native";
import ListRow from "./ListRow";
import { translate } from "../i18n";
import { CopyKey, UiLanguage } from "../i18n/copy";

interface LevelRowProps {
  /** "A1" … "C1", as the generated level list spells it. */
  level: string;
  language: UiLanguage;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}

/**
 * One level, with what it actually means.
 *
 * "A1" is a label from the Common European Framework and says nothing to
 * anyone who has not met it. The row carries the code, the plain name for it,
 * and one line on what a learner at that level can do, so the choice can be
 * made without looking the scale up.
 */
const LevelRow: React.FC<LevelRowProps> = ({
  level,
  language,
  selected,
  onPress,
  isLast,
}) => {
  const code = level.toLowerCase();
  const name = translate(language, `level.${code}.name` as CopyKey);
  const description = translate(language, `level.${code}.desc` as CopyKey);

  return (
    <ListRow
      selected={selected}
      onPress={onPress}
      isLast={isLast}
      label={
        <View>
          <Text className="font-medium text-base text-ink">
            {level.toUpperCase()}
            <Text className="text-ink-muted">{`  ·  ${name}`}</Text>
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ink-muted">
            {description}
          </Text>
        </View>
      }
    />
  );
};

export default LevelRow;
