import React from "react";
import { Text, TextStyle, StyleProp } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import {
  layoutTokens,
  SentenceGloss,
  SentenceToken,
} from "../utils/items";

interface SentenceTextProps {
  tokens: SentenceToken[];
  /** Citation form and translation per concept id. */
  gloss: Record<string, SentenceGloss>;
  /** Fired with the citation form of a tapped word, or null for glue. */
  onSelectWord: (selected: SelectedWord | null) => void;
  /** Which token is currently open, so it can be marked. */
  selectedToken: number | null;
  style?: StyleProp<TextStyle>;
}

export interface SelectedWord {
  /** Index into the laid-out token list. */
  token: number;
  /** Dictionary form in the language being learned. */
  citation: string;
  /** Its translation in the known language. */
  translation: string;
}

/**
 * A sentence, drawn one token at a time.
 *
 * A word the learner has already met as a card carries a thin brass underline
 * - the only affordance, as on Desktop. Desktop reveals the dictionary form on
 * hover; a phone has no hover, so the word is tappable and the form appears
 * under the sentence.
 *
 * Note: `textDecorationColor` is iOS-only. On Android the underline takes the
 * text colour, which reads heavier but still marks the same words.
 */
const SentenceText: React.FC<SentenceTextProps> = ({
  tokens,
  gloss,
  onSelectWord,
  selectedToken,
  style,
}) => {
  const colors = useThemeColors();
  const layout = layoutTokens(tokens);

  return (
    <Text style={style}>
      {layout.map((token, index) => {
        const entry = token.concept ? gloss[token.concept] : undefined;
        const lead = token.space ? " " : "";

        if (!entry) {
          return (
            <Text key={index}>
              {lead}
              {token.text}
            </Text>
          );
        }

        // A token that inflects from a different lemma than the concept's
        // citation form says so itself; the translation stays the concept's.
        const citation = token.lemma ?? entry.t;
        const open = selectedToken === index;

        return (
          <Text key={index}>
            {lead}
            <Text
              testID={`sentence-token-${index}`}
              suppressHighlighting
              onPress={() =>
                onSelectWord(
                  open
                    ? null
                    : {
                        token: index,
                        citation,
                        translation: entry.s,
                      },
                )
              }
              style={{
                textDecorationLine: "underline",
                textDecorationColor: colors.tokenLine,
                color: open ? colors.accent : undefined,
              }}
            >
              {token.text}
            </Text>
          </Text>
        );
      })}
    </Text>
  );
};

export default SentenceText;
