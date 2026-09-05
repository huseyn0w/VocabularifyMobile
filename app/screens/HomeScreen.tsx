import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  interpolateColor,
  Extrapolation,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useLanguageContext } from "../context/LanguageContext";
import { useTranslate } from "../i18n";
import { useThemeColors } from "../hooks/useThemeColors";
import { useItems } from "../hooks/useItems";
import { useFlashcardDeck } from "../hooks/useFlashcardDeck";
import ProgressBar from "../components/ProgressBar";
import AmbientBackground, { WordGlow } from "../components/AmbientBackground";
import SentenceText, { SelectedWord } from "../components/SentenceText";
import CoachMarks, { CoachStep, Rect } from "../components/CoachMarks";
import { joinTokens } from "../utils/items";
import { deckKey, getHomeTourSeen, setHomeTourSeen } from "../services/storage";
import { useDeckRevision } from "../services/deckSignal";
import { useTourRequest } from "../services/tourSignal";
import { duration, letterSpacing } from "../theme/tokens";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * width;
// A lesson jump is deliberately harder to trigger than a card change, so a
// sloppy horizontal swipe never skips 9 words.
const LESSON_SWIPE_THRESHOLD = 90;
// How long the walkthrough waits for one region to report its position.
const MEASURE_TIMEOUT = 250;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Type size for a sentence, by how long it is.
 *
 * Desktop scales its sentence off the viewport, which works because its card
 * is 460px wide and a sentence never runs past three lines. The phone card is
 * about 275px inside its padding, and German A1 runs from 20 to 120 characters
 * - at one fixed size the long ones would overflow the card. The steps are set
 * so the 120-character worst case (`Heute ist der 1. Marz ...`) still leaves
 * room for the translation and the gloss line under it.
 */
const sentenceType = (length: number) => {
  if (length <= 60) return { fontSize: 26, lineHeight: 34, source: 16 };
  if (length <= 90) return { fontSize: 22, lineHeight: 30, source: 15 };
  return { fontSize: 19, lineHeight: 26, source: 14 };
};

const HomeScreen: React.FC = () => {
  const colors = useThemeColors();
  const { settings, mode, frequency, autoAdvance } = useLanguageContext();
  const { t } = useTranslate();
  const reducedMotion = useReducedMotion();
  // The Progress screen writes this deck's position from the Settings tab
  // while this screen stays mounted behind it; the signal is how it says so.
  const deckRevision = useDeckRevision();
  // Settings can ask for the walkthrough again from the other tab.
  const tourRequest = useTourRequest();

  const { items, placements, loading } = useItems(settings);
  const {
    currentIndex,
    current,
    total,
    next,
    prev,
    nextLesson,
    prevLesson,
    lesson,
    lessonCount,
    showTranslation,
  } = useFlashcardDeck({
    items,
    placements,
    frequency,
    autoAdvance,
    mode,
    refreshToken: deckRevision,
    deckKey: deckKey(
      settings.learningLanguage,
      settings.knownLanguage,
      settings.level,
    ),
  });

  // Which word's dictionary form is open. Cleared on every card change, so a
  // gloss never outlives the sentence it belongs to.
  const [selected, setSelected] = useState<SelectedWord | null>(null);
  useEffect(() => {
    setSelected(null);
  }, [currentIndex]);

  // The walkthrough points at two regions of this screen, so this screen is
  // what measures them. `measureInWindow` is read once, when the tour opens:
  // the mount animation is a transform, and measuring under it would place the
  // hole where the card was rather than where it settles.
  const cardRef = useRef<View>(null);
  const footerRef = useRef<View>(null);
  const [tour, setTour] = useState<CoachStep[] | null>(null);

  // A measurement that never comes back must not take the walkthrough with
  // it: `measureInWindow` is a native call, and a step with no rect still
  // shows its caption over a plain dim.
  const measure = (ref: React.RefObject<View | null>) =>
    new Promise<Rect | null>((resolve) => {
      const node = ref.current;
      if (!node || typeof node.measureInWindow !== "function") {
        return resolve(null);
      }
      const timer = setTimeout(() => resolve(null), MEASURE_TIMEOUT);
      node.measureInWindow((x, y, width, height) => {
        clearTimeout(timer);
        resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
      });
    });

  const openTour = useCallback(async () => {
    const [card, footer] = await Promise.all([
      measure(cardRef),
      measure(footerRef),
    ]);
    const steps: CoachStep[] = [
      { rect: card, title: "tour.cardTitle", body: "tour.cardBody" },
      { rect: card, title: "tour.swipeTitle", body: "tour.swipeBody" },
    ];
    if (lessonCount > 0) {
      steps.push({
        rect: card,
        title: "tour.lessonTitle",
        body: "tour.lessonBody",
      });
      steps.push({
        rect: card,
        title: "tour.sentenceTitle",
        body: "tour.sentenceBody",
      });
    }
    steps.push({
      rect: footer,
      title: "tour.progressTitle",
      body: "tour.progressBody",
    });
    setTour(steps);
  }, [lessonCount]);

  // Once the deck is actually on screen, not while it is still loading: a hole
  // measured around a spinner would be in the wrong place.
  const checkedFor = useRef(-1);
  useEffect(() => {
    if (loading || currentIndex === null || total === 0) return undefined;
    if (checkedFor.current === tourRequest) return undefined;
    checkedFor.current = tourRequest;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (await getHomeTourSeen()) return;
      if (!cancelled) void openTour();
    }, duration.slower + 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loading, currentIndex, total, openTour, tourRequest]);

  const closeTour = useCallback(() => {
    setTour(null);
    void setHomeTourSeen(true);
  }, []);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Restrained mount entrance: the card settles in from 0.96 + fade (never from 0).
  const mounted = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    mounted.value = reducedMotion
      ? 1
      : withTiming(1, {
          duration: duration.slower,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
  }, [reducedMotion, mounted]);

  // Tasteful translation reveal - fades/slides in when showTranslation flips.
  const revealProgress = useSharedValue(showTranslation ? 1 : 0);
  useEffect(() => {
    if (reducedMotion) {
      revealProgress.value = showTranslation ? 1 : 0;
      return;
    }
    revealProgress.value = withTiming(showTranslation ? 1 : 0, {
      duration: duration.slow,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [showTranslation, reducedMotion, revealProgress]);

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (reducedMotion) return;
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY * 0.25;
    rotate.value = event.nativeEvent.translationX / width;
  };

  const handleGestureStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const dx = event.nativeEvent.translationX;
      const dy = event.nativeEvent.translationY;

      // Sideways moves one card, up and down moves a whole lesson - the
      // gesture equivalent of Desktop's arrows and Shift+arrows.
      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy < -LESSON_SWIPE_THRESHOLD) {
          runOnJS(nextLesson)();
        } else if (dy > LESSON_SWIPE_THRESHOLD) {
          runOnJS(prevLesson)();
        }
      } else if (dx > SWIPE_THRESHOLD) {
        runOnJS(next)();
      } else if (dx < -SWIPE_THRESHOLD) {
        runOnJS(prev)();
      }

      // Momentum-aware, interruptible spring return with a subtle settle.
      const springConfig = {
        damping: 18,
        stiffness: 180,
        mass: 0.6,
        velocity: event.nativeEvent.velocityX,
      };
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 180,
        mass: 0.6,
      });
      rotate.value = withSpring(0, { damping: 18, stiffness: 180 });
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const dragOpacity = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );
    const mountScale = interpolate(
      mounted.value,
      [0, 1],
      [0.96, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value * 8}deg` },
        { scale: mountScale },
      ],
      opacity: dragOpacity * mounted.value,
    };
  });

  // The card sits inside a hairline border at rest, and that border takes on
  // the direction of the drag: green going forward, yellow going back. It
  // reaches full colour at the distance where letting go commits the move, so
  // the colour answers both questions at once - which way, and far enough yet.
  const frameStyle = useAnimatedStyle(() => {
    const dx = translateX.value;
    // translateY is damped to a quarter on the way in, so undo that here to
    // measure against the same raw distance the release handler thresholds on.
    const dy = translateY.value * 4;

    // Same axis the release handler picks, or the colour would promise a move
    // that letting go does not make. Forward is right for a card and up for a
    // lesson, which is why the vertical term is negated.
    const travel =
      Math.abs(dy) > Math.abs(dx)
        ? -dy / LESSON_SWIPE_THRESHOLD
        : dx / SWIPE_THRESHOLD;
    const direction = Math.max(-1, Math.min(1, travel));

    return {
      borderColor: interpolateColor(
        direction,
        [-1, 0, 1],
        [colors.swipeBack, colors.border, colors.swipeForward],
      ),
    };
  });

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate(
              revealProgress.value,
              [0, 1],
              [8, 0],
              Extrapolation.CLAMP,
            ),
      },
    ],
  }));

  if (loading || currentIndex === null) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (total === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8">
        <Text className="text-center font-medium text-2xl text-ink">
          {t("home.noWords")}
        </Text>
        <Text className="mt-2 text-center text-base text-ink-muted">
          {t("home.noWordsHint")}
        </Text>
      </View>
    );
  }

  const progress = (currentIndex + 1) / total;
  const type = sentenceType(
    current?.kind === "sentence" ? joinTokens(current.target).length : 0,
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <AmbientBackground />

      {/* The card area takes the space left over after the footer, so the two
          can never overlap. The old layout pinned the footer 56pt from the
          bottom and let a fixed-aspect card grow into it - on a short phone
          the counter sat on top of the word. */}
      {/* The handler wraps the whole area rather than the card. The card is
          only as tall as its own text, so a drag used to register on the word
          and nowhere else, and every swipe that started in the empty space
          around it did nothing. The transform stays on the card inside, which
          also keeps the touch region still under the finger while it moves. */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View className="flex-1 items-center justify-center px-7">
          <WordGlow />
          {/* Still no surface and no shadow: the word sits on the field, lit
              by the one brass glow behind it, exactly as on Desktop. The
              hairline border is the single exception. */}
          {/* A plain wrapper the walkthrough can measure. The card itself
              carries the drag transform and the mount scale, and
              measureInWindow reports where a transform has put a view, not
              where it rests - so the hole would land wherever the card
              happened to be. This wrapper is the same width and never moves. */}
          <View ref={cardRef} className="w-full">
            <Animated.View
              className="w-full items-center justify-center px-6 py-8"
              style={[
                { minHeight: 220, borderWidth: 1, borderRadius: 28 },
                animatedCardStyle,
                frameStyle,
              ]}
            >
              {current?.kind === "word" && (
                <>
                  <Text
                    className="text-center font-semibold text-ink"
                    style={{
                      fontSize: 46,
                      lineHeight: 52,
                      letterSpacing: letterSpacing.display,
                    }}
                    numberOfLines={3}
                    adjustsFontSizeToFit
                  >
                    {current.target}
                  </Text>
                  <Animated.View style={revealStyle} className="mt-4">
                    <Text className="text-center font-medium text-xl text-ink-muted">
                      {current.source}
                    </Text>
                  </Animated.View>
                </>
              )}

              {current?.kind === "sentence" && (
                <>
                  <SentenceText
                    tokens={current.target}
                    gloss={current.gloss}
                    selectedToken={selected?.token ?? null}
                    onSelectWord={setSelected}
                    style={{
                      textAlign: "center",
                      fontSize: type.fontSize,
                      lineHeight: type.lineHeight,
                      fontWeight: "600",
                      letterSpacing: letterSpacing.sentence,
                      color: colors.ink,
                    }}
                  />
                  <Animated.View style={revealStyle} className="mt-4">
                    <Text
                      className="text-center text-ink-muted"
                      style={{
                        fontSize: type.source,
                        lineHeight: type.source * 1.4,
                      }}
                    >
                      {current.source}
                    </Text>
                  </Animated.View>
                  {/* Desktop shows the dictionary form on hover; a phone has no
                    hover, so the tapped word's form lands here. The slot is
                    always reserved, or the sentence would jump on every tap. */}
                  <View className="mt-6 h-5 justify-center">
                    {selected ? (
                      <Text className="text-center text-sm text-ink">
                        {selected.citation}
                        <Text className="text-ink-subtle">
                          {"  \u00b7  "}
                          {selected.translation}
                        </Text>
                      </Text>
                    ) : (
                      <Text className="text-center text-sm text-ink-subtle">
                        {t("home.tapHint")}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </Animated.View>
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* In the layout flow, not pinned over it. */}
      <View ref={footerRef} className="items-center px-7 pb-10">
        <View className="mb-3 w-full flex-row items-baseline justify-between">
          <Text className="font-semibold text-base text-ink">
            {pad(currentIndex + 1)}
          </Text>
          {lessonCount > 0 && (
            <Text className="font-medium text-sm text-ink-subtle">
              {lesson > 0
                ? t("home.lesson", { n: lesson, total: lessonCount })
                : t("home.extra")}
            </Text>
          )}
          <Text className="font-medium text-sm text-ink-subtle">
            {pad(total)}
          </Text>
        </View>
        <ProgressBar progress={progress} className="w-full" />
        <Text className="mt-5 text-sm tracking-[0.3px] text-ink-subtle">
          {lessonCount > 0 ? t("home.swipeBoth") : t("home.swipeOnly")}
        </Text>
      </View>

      {tour && <CoachMarks steps={tour} onDone={closeTour} />}
    </GestureHandlerRootView>
  );
};

export default HomeScreen;
