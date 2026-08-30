import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useLanguageContext } from "../context/LanguageContext";
import { useThemeColors } from "../hooks/useThemeColors";
import {
  Language,
  LANGUAGE_META,
  RootStackParamList,
  availableCombinations,
  languages,
  levels,
} from "../utils/types";
import { setLanguageSettings } from "../services/storage";
import { letterSpacing } from "../theme/tokens";
import SelectableRow from "../components/SelectableRow";

type WelcomeScreenNavigationProp = NavigationProp<RootStackParamList, "Welcome">;

const STEPS = [
  {
    title: "What do you\nwant to learn?",
    subtitle: "Pick the language you are working on.",
  },
  {
    title: "What do you\nalready speak?",
    subtitle: "Translations will be shown in this language.",
  },
  {
    title: "Where are you\nstarting?",
    subtitle: "A1 is the beginning. You can change this later.",
  },
] as const;

const FADE_OUT = 130;
const FADE_IN = 240;
const CURVE = Easing.bezier(0.22, 1, 0.36, 1);

const languageLabel = (language: Language): string =>
  `${LANGUAGE_META[language].flag} ${language}`;

/**
 * First-run setup, as three steps on one screen rather than three lists
 * stacking down a scroll view.
 *
 * The old screen revealed each section under the last, so by the third choice
 * the first was off-screen and the page had grown to roughly twice the
 * viewport. One question at a time fits without scrolling, and the answer to
 * each is what advances it.
 *
 * The transition is a cross-fade in two halves rather than a slide: the
 * current step fades out, the painted step swaps at the bottom of the fade,
 * and the next one fades in with a small offset in the direction of travel.
 * Doing it in two halves keeps a single element in the layout, so nothing
 * jumps the way two overlapping absolutely-positioned steps would.
 */
const WelcomeScreen: React.FC = () => {
  const { setSettings } = useLanguageContext();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  // What is currently painted. Trails `step` by the length of the fade-out.
  const [shownStep, setShownStep] = useState(0);
  const direction = useRef(1);

  const [learningLanguage, setLearningLanguage] = useState<Language | null>(null);
  const [knownLanguage, setKnownLanguage] = useState<Language | null>(null);

  const fade = useSharedValue(1);
  const shift = useSharedValue(0);

  const goTo = useCallback(
    (next: number) => {
      if (next === step) return;
      direction.current = next > step ? 1 : -1;
      setStep(next);
      if (!reducedMotion) {
        fade.value = withTiming(0, { duration: FADE_OUT, easing: CURVE });
      }
    },
    [step, reducedMotion, fade],
  );

  // The swap is driven by a timer rather than by the fade's completion
  // callback: an interrupted animation never calls back, and a learner stuck
  // on a blank step would have no way out.
  useEffect(() => {
    if (step === shownStep) return undefined;
    if (reducedMotion) {
      setShownStep(step);
      return undefined;
    }
    const timer = setTimeout(() => setShownStep(step), FADE_OUT);
    return () => clearTimeout(timer);
  }, [step, shownStep, reducedMotion]);

  // Fades the newly painted step in. Skips the very first paint, which is
  // already at full opacity, so the screen does not flash on mount.
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    if (reducedMotion) {
      fade.value = 1;
      shift.value = 0;
      return;
    }
    shift.value = direction.current * 14;
    fade.value = withTiming(1, { duration: FADE_IN, easing: CURVE });
    shift.value = withTiming(0, { duration: FADE_IN, easing: CURVE });
  }, [shownStep, reducedMotion, fade, shift]);

  const stepStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: shift.value }],
  }));

  const finish = async (level: string) => {
    if (!learningLanguage || !knownLanguage) return;
    const settings = {
      learningLanguage: learningLanguage.toLowerCase(),
      knownLanguage: knownLanguage.toLowerCase(),
      level: level.toLowerCase(),
    };
    await setLanguageSettings(settings);
    setSettings(settings);
    navigation.navigate("Main");
  };

  // Only languages that can actually be learned from something.
  const learnable = languages.filter(
    (language) => availableCombinations[language].length > 0,
  );
  const knownOptions: Language[] = learningLanguage
    ? availableCombinations[learningLanguage] ?? []
    : [];

  const options: { key: string; label: string; onPress: () => void }[] =
    shownStep === 0
      ? learnable.map((language) => ({
          key: language,
          label: languageLabel(language),
          onPress: () => {
            setLearningLanguage(language);
            // A different target invalidates the source, since not every
            // pair exists.
            setKnownLanguage(null);
            goTo(1);
          },
        }))
      : shownStep === 1
        ? knownOptions.map((language) => ({
            key: language,
            label: languageLabel(language),
            onPress: () => {
              setKnownLanguage(language);
              goTo(2);
            },
          }))
        : levels.map((level) => ({
            key: level,
            label: level,
            onPress: () => finish(level),
          }));

  const { title, subtitle } = STEPS[shownStep];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <View className="h-11 flex-row items-center justify-between">
          {step > 0 ? (
            <Pressable
              onPress={() => goTo(step - 1)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="flex-row items-center"
            >
              <Ionicons name="chevron-back" size={20} color={colors.inkMuted} />
              <Text className="ml-1 font-medium text-base text-ink-muted">
                Back
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          {/* Three bars rather than "1 / 3": the filled width is the progress,
              so it needs no reading. */}
          <View className="flex-row items-center">
            {STEPS.map((_, index) => (
              <View
                key={index}
                className="ml-1.5 h-1 w-6 rounded-full"
                style={{
                  backgroundColor:
                    index <= step ? colors.accent : colors.border,
                }}
              />
            ))}
          </View>
        </View>

        <Animated.View style={stepStyle} className="flex-1">
          <View className="mb-7 mt-6">
            <Text
              className="font-semibold text-4xl leading-[42px] text-ink"
              style={{ letterSpacing: letterSpacing.display }}
            >
              {title}
            </Text>
            <Text className="mt-3 text-base leading-6 text-ink-muted">
              {subtitle}
            </Text>
          </View>

          <View className="overflow-hidden rounded-xl border border-border bg-surface">
            {options.map((option, index) => (
              <SelectableRow
                key={option.key}
                label={option.label}
                selected={false}
                onPress={option.onPress}
                isLast={index === options.length - 1}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
