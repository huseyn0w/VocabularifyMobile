import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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
import { translate, uiLanguageOf } from "../i18n";
import { CopyKey, NATIVE_LANGUAGE_NAME, UiLanguage } from "../i18n/copy";
import SelectableRow from "../components/SelectableRow";
import HowItWorks from "../components/HowItWorks";
import LevelRow from "../components/LevelRow";

type WelcomeScreenNavigationProp = NavigationProp<RootStackParamList, "Welcome">;

// Step 0 asks which language the learner already speaks, because the answer is
// what every later screen is written in. Step 1 is the explanation, now in
// that language; steps 2 and 3 are the two remaining questions.
const KNOWN_STEP = 0;
const HOW_STEP = 1;
const LEARNING_STEP = 2;
const LEVEL_STEP = 3;
const STEP_COUNT = 4;

const QUESTION: Partial<Record<number, { title: CopyKey; subtitle: CopyKey }>> =
  {
    [KNOWN_STEP]: { title: "welcome.q2Title", subtitle: "welcome.q2Sub" },
    [LEARNING_STEP]: { title: "welcome.q1Title", subtitle: "welcome.q1Sub" },
    [LEVEL_STEP]: { title: "welcome.q3Title", subtitle: "welcome.q3Sub" },
  };

const FADE_OUT = 130;
const FADE_IN = 240;
const CURVE = Easing.bezier(0.22, 1, 0.36, 1);

// Each option carries its own name - "Deutsch", not "German". The first screen
// has no interface language yet, so a learner who reads only one of the seven
// has to be able to find their own line on it.
const languageLabel = (language: Language): string => {
  const code = LANGUAGE_META[language].code as UiLanguage;
  const native = NATIVE_LANGUAGE_NAME[code];
  return `${LANGUAGE_META[language].flag} ${native ?? language}`;
};

/**
 * First run: what the app does, then three questions.
 *
 * The questions were the whole screen before. A learner who opened the app
 * cold picked a pair and a level without ever being told that words arrive in
 * lessons or that sentences follow them, so the first sentence card looked
 * like the app had skipped ahead. The explanation now comes first, once.
 *
 * One question at a time fits without scrolling, and the answer to each is
 * what advances it. The transition is a cross-fade in two halves rather than a
 * slide: the current step fades out, the painted step swaps at the bottom of
 * the fade, and the next one fades in with a small offset in the direction of
 * travel. Doing it in two halves keeps a single element in the layout, so
 * nothing jumps the way two overlapping absolutely-positioned steps would.
 *
 * The whole interface is in the language the learner already speaks, so that
 * is the first thing asked. It used to be the second question, behind the
 * explanation, which meant the four screens of `HowItWorks` were rendered in
 * whatever the stored default happened to be - German - to someone who had
 * told the app nothing yet. Only the picker itself is in English now, and its
 * options are written in their own languages, so there is nothing on it to
 * read.
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

  const [learningLanguage, setLearningLanguage] = useState<Language | null>(
    null,
  );
  const [knownLanguage, setKnownLanguage] = useState<Language | null>(null);

  const uiLanguage = uiLanguageOf(knownLanguage ?? "");
  const t = useCallback(
    (key: CopyKey) => translate(uiLanguage, key),
    [uiLanguage],
  );

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

  // Every language the app can teach from something, which is the set worth
  // offering as a known language.
  const knownOptions = languages.filter((language) =>
    languages.some((target) =>
      (availableCombinations[target] ?? []).includes(language),
    ),
  );
  // And, given one, every target it can be a source for.
  const learnOptions: Language[] = knownLanguage
    ? languages.filter((target) =>
        (availableCombinations[target] ?? []).includes(knownLanguage),
      )
    : [];

  const options: { key: string; label: string; onPress: () => void }[] =
    shownStep === KNOWN_STEP
      ? knownOptions.map((language) => ({
          key: language,
          label: languageLabel(language),
          onPress: () => {
            setKnownLanguage(language);
            // A different source invalidates the target, since not every pair
            // exists.
            setLearningLanguage(null);
            goTo(HOW_STEP);
          },
        }))
      : shownStep === LEARNING_STEP
        ? learnOptions.map((language) => ({
            key: language,
            label: languageLabel(language),
            onPress: () => {
              setLearningLanguage(language);
              goTo(LEVEL_STEP);
            },
          }))
        : [];

  const question = QUESTION[shownStep] ?? null;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <View className="h-11 flex-row items-center justify-between">
          {step > 0 ? (
            <Pressable
              onPress={() => goTo(step - 1)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t("welcome.back")}
              className="flex-row items-center"
            >
              <Ionicons name="chevron-back" size={20} color={colors.inkMuted} />
              <Text className="ml-1 font-medium text-base text-ink-muted">
                {t("welcome.back")}
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          {/* Bars rather than "1 / 4": the filled width is the progress, so it
              needs no reading. */}
          <View className="flex-row items-center">
            {Array.from({ length: STEP_COUNT }, (_, index) => (
              <View
                key={index}
                className="ml-1.5 h-1 w-6 rounded-full"
                style={{
                  backgroundColor: index <= step ? colors.accent : colors.border,
                }}
              />
            ))}
          </View>
        </View>

        <Animated.View style={stepStyle} className="flex-1">
          {shownStep === HOW_STEP ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <View className="mb-7 mt-6">
                <Text
                  className="font-semibold text-4xl leading-[42px] text-ink"
                  style={{ letterSpacing: letterSpacing.display }}
                >
                  Vocabularify
                </Text>
              </View>
              <HowItWorks language={uiLanguage} />
              <Pressable
                onPress={() => goTo(LEARNING_STEP)}
                accessibilityRole="button"
                className="mt-2 items-center rounded-xl border border-border bg-surface px-5 py-4"
              >
                <Text className="font-semibold text-base text-ink">
                  {t("how.continue")}
                </Text>
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <View className="mb-7 mt-6">
                <Text
                  className="font-semibold text-4xl leading-[42px] text-ink"
                  style={{ letterSpacing: letterSpacing.display }}
                >
                  {question ? t(question.title) : ""}
                </Text>
                <Text className="mt-3 text-base leading-6 text-ink-muted">
                  {question ? t(question.subtitle) : ""}
                </Text>
              </View>

              {shownStep === LEVEL_STEP ? (
                <>
                  <View className="overflow-hidden rounded-xl border border-border bg-surface">
                    {levels.map((level, index) => (
                      <LevelRow
                        key={level}
                        level={level}
                        language={uiLanguage}
                        selected={false}
                        onPress={() => finish(level)}
                        isLast={index === levels.length - 1}
                      />
                    ))}
                  </View>
                  <Text className="mt-4 px-1 text-sm leading-5 text-ink-subtle">
                    {t("level.scale")}
                  </Text>
                </>
              ) : (
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
              )}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
