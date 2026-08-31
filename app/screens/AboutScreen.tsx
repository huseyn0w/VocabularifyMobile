import React from "react";
import { View, Text } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import {
  BUY_ME_A_COFFEE_LABEL,
  BUY_ME_A_COFFEE_URL,
  IMPRINT_URL,
  PRIVACY_URL,
  PROJECT_URL,
  REPO_DESKTOP_URL,
  REPO_MOBILE_URL,
} from "../utils/constants";
import { duration, letterSpacing } from "../theme/tokens";
import ScreenContainer from "../components/ScreenContainer";
import LinkRow from "../components/LinkRow";

const AboutScreen: React.FC = () => {
  const reducedMotion = useReducedMotion();

  const entering = reducedMotion
    ? FadeIn.duration(duration.base)
    : FadeInDown.duration(duration.slow).easing(
        Easing.bezier(0.23, 1, 0.32, 1).factory(),
      );

  return (
    <ScreenContainer scroll>
      <Animated.View entering={entering} className="mb-8 mt-6">
        <Text
          className="font-semibold text-5xl leading-[52px] text-ink"
          style={{ letterSpacing: letterSpacing.display }}
        >
          Vocabularify
        </Text>
        <Text className="mt-4 text-base leading-6 text-ink-muted">
          A quiet way to expand your vocabulary - one word at a time, at your
          own pace.
        </Text>
      </Animated.View>

      <View className="mb-8">
        <LinkRow url={PROJECT_URL} label="Project page" icon="globe-outline" />
        <LinkRow
          url={REPO_MOBILE_URL}
          label="GitHub project"
          icon="logo-github"
        />
        <LinkRow
          url={REPO_DESKTOP_URL}
          label="Desktop version"
          icon="desktop-outline"
        />
        <LinkRow
          url={BUY_ME_A_COFFEE_URL}
          label={BUY_ME_A_COFFEE_LABEL}
          icon="cafe-outline"
        />
      </View>

      {/* Datenschutz and Impressum keep their German names in every language,
          the same way BerlinArea lists them: they name specific documents
          under German law, and a translated label would point at neither. */}
      <View className="mb-8">
        <LinkRow
          url={PRIVACY_URL}
          label="Datenschutz"
          icon="shield-checkmark-outline"
        />
        <LinkRow
          url={IMPRINT_URL}
          label="Impressum"
          icon="document-text-outline"
        />
      </View>

      <View className="mt-auto items-center pt-6">
        <Text className="font-medium text-sm text-ink-muted">
          Created by Elman Huseynov
        </Text>
        <Text className="mt-1 text-xs text-ink-subtle">
          All rights reserved.
        </Text>
      </View>
    </ScreenContainer>
  );
};

export default AboutScreen;
