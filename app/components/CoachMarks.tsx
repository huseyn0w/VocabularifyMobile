import React, { useState } from "react";
import { View, Text, Pressable, Modal, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { useTranslate } from "../i18n";
import { CopyKey } from "../i18n/copy";
import { useThemeColors } from "../hooks/useThemeColors";
import { duration, radii } from "../theme/tokens";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CoachStep {
  /** Which measured region to cut out. A step with no rect dims the whole
   *  screen and shows only its caption. */
  rect: Rect | null;
  title: CopyKey;
  body: CopyKey;
}

interface Props {
  steps: CoachStep[];
  onDone: () => void;
}

const HOLE_PAD = 10;
const CAPTION_GAP = 16;
const CAPTION_MAX = 190;

/**
 * The first-run walkthrough over a screen that is already on the display.
 *
 * A learner who opens the deck cold sees one large word and nothing else: no
 * button, no label, no hint that a swipe does anything or that the words are
 * grouped into lessons. The four screens of `HowItWorks` say all of that in
 * prose before the deck exists, which is the wrong moment - there is nothing
 * to point at yet.
 *
 * So this dims the screen and cuts a hole around one region at a time. The
 * caller measures the regions, because only the caller knows which views they
 * are; a step whose measurement failed passes `rect: null` and still shows its
 * caption over a plain dim, which is worth more than dropping the step.
 *
 * The dim is four rectangles around the hole rather than one view with a mask:
 * React Native has no cross-platform mask, and four views need no library.
 */
const CoachMarks: React.FC<Props> = ({ steps, onDone }) => {
  const { t } = useTranslate();
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (steps.length === 0) return null;

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;
  const dim = { backgroundColor: "rgba(0,0,0,0.72)" } as const;

  const hole = step.rect
    ? {
        x: Math.max(0, step.rect.x - HOLE_PAD),
        y: Math.max(0, step.rect.y - HOLE_PAD),
        width: step.rect.width + HOLE_PAD * 2,
        height: step.rect.height + HOLE_PAD * 2,
      }
    : null;

  // Under the hole when there is room for the caption, above it otherwise.
  const below = hole ? hole.y + hole.height + CAPTION_GAP : screenH * 0.5;
  const captionTop =
    hole && screenH - below < CAPTION_MAX
      ? Math.max(24, hole.y - CAPTION_GAP - CAPTION_MAX)
      : below;

  const caption = (
    <Animated.View
      key={index}
      entering={reducedMotion ? undefined : FadeIn.duration(duration.base)}
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: captionTop,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 20,
      }}
    >
      <Text className="font-semibold text-lg text-ink">{t(step.title)}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-muted">
        {t(step.body)}
      </Text>

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {steps.map((_, i) => (
            <View
              key={i}
              className="mr-1.5 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: i === index ? colors.accent : colors.border,
              }}
            />
          ))}
        </View>

        <View className="flex-row items-center">
          {!isLast && (
            <Pressable
              onPress={onDone}
              hitSlop={12}
              accessibilityRole="button"
              className="mr-5"
            >
              <Text className="font-medium text-base text-ink-subtle">
                {t("tour.skip")}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => (isLast ? onDone() : setIndex(index + 1))}
            accessibilityRole="button"
            className="rounded-xl px-4 py-2.5"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="font-semibold text-base" style={{ color: colors.accentForeground }}>
              {t(isLast ? "tour.done" : "tour.next")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDone}>
      <View style={{ flex: 1 }}>
        {hole ? (
          <>
            <View
              style={[
                dim,
                { position: "absolute", left: 0, top: 0, width: screenW, height: hole.y },
              ]}
            />
            <View
              style={[
                dim,
                {
                  position: "absolute",
                  left: 0,
                  top: hole.y + hole.height,
                  width: screenW,
                  height: Math.max(0, screenH - hole.y - hole.height),
                },
              ]}
            />
            <View
              style={[
                dim,
                { position: "absolute", left: 0, top: hole.y, width: hole.x, height: hole.height },
              ]}
            />
            <View
              style={[
                dim,
                {
                  position: "absolute",
                  left: hole.x + hole.width,
                  top: hole.y,
                  width: Math.max(0, screenW - hole.x - hole.width),
                  height: hole.height,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: hole.x,
                top: hole.y,
                width: hole.width,
                height: hole.height,
                borderRadius: radii["2xl"],
                borderWidth: 2,
                borderColor: colors.accent,
              }}
            />
          </>
        ) : (
          <View style={[dim, { flex: 1 }]} />
        )}
        {caption}
      </View>
    </Modal>
  );
};

export default CoachMarks;
