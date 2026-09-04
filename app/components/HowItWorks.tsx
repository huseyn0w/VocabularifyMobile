import React from "react";
import { View, Text } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useTranslate } from "../i18n";
import { CopyKey } from "../i18n/copy";
import { duration, letterSpacing } from "../theme/tokens";
import { useThemeColors } from "../hooks/useThemeColors";

const STEPS: { title: CopyKey; body: CopyKey }[] = [
  { title: "how.step1Title", body: "how.step1Body" },
  { title: "how.step2Title", body: "how.step2Body" },
  { title: "how.step3Title", body: "how.step3Body" },
  { title: "how.step4Title", body: "how.step4Body" },
];

/**
 * What the app is doing and why, in four steps.
 *
 * Shown once before the first-run questions and reachable from Settings
 * afterwards. Nobody reads a manual, so this is four short paragraphs, not a
 * tour: the lead sentence carries the whole idea and the rest fills it in.
 *
 * The numbers are drawn as plain digits in the accent colour rather than in
 * filled circles. A row of filled circles reads as progress through a wizard,
 * which these are not.
 */
const HowItWorks: React.FC = () => {
  const { t } = useTranslate();
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();

  const entering = (index: number) =>
    reducedMotion
      ? FadeIn.duration(duration.base)
      : FadeInDown.duration(duration.slow)
          .delay(index * 70)
          .easing(Easing.bezier(0.23, 1, 0.32, 1).factory());

  return (
    <View>
      <Animated.Text
        entering={entering(0)}
        className="text-xl leading-7 text-ink"
        style={{ letterSpacing: letterSpacing.sentence }}
      >
        {t("how.lead")}
      </Animated.Text>

      <View className="mt-8">
        {STEPS.map((step, index) => (
          <Animated.View
            key={step.title}
            entering={entering(index + 1)}
            className="mb-7 flex-row"
          >
            <Text
              className="w-7 font-semibold text-base"
              style={{ color: colors.accent }}
            >
              {index + 1}
            </Text>
            <View className="flex-1">
              <Text className="font-semibold text-base text-ink">
                {t(step.title)}
              </Text>
              <Text className="mt-1.5 text-base leading-6 text-ink-muted">
                {t(step.body)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default HowItWorks;
