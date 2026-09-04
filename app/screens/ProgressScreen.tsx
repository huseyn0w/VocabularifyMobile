import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useLanguageContext } from "../context/LanguageContext";
import { useItems } from "../hooks/useItems";
import { useTranslate } from "../i18n";
import {
  clearDeckPin,
  deckKey as makeDeckKey,
  getDeckIndex,
  getDeckPin,
  setDeckIndex,
  setDeckPin,
} from "../services/storage";
import { markDeckMoved } from "../services/deckSignal";
import ScreenContainer from "../components/ScreenContainer";
import Section from "../components/Section";
import ListRow from "../components/ListRow";
import ProgressBar from "../components/ProgressBar";

/**
 * Where the learner is in the current level, and the two things they may want
 * to do about it: start the level over, or mark this spot and come back.
 *
 * The screen writes the position straight to storage rather than through the
 * deck hook, because the deck lives in the Home tab and this screen is in
 * Settings. `markDeckMoved` is what tells the deck to re-read what it wrote,
 * since both tabs stay mounted.
 */
const ProgressScreen: React.FC = () => {
  const { t } = useTranslate();
  const { settings } = useLanguageContext();
  const { items, placements, loading } = useItems(settings);

  const key = makeDeckKey(
    settings.learningLanguage,
    settings.knownLanguage,
    settings.level,
  );

  const [index, setIndex] = useState<number | null>(null);
  const [pin, setPin] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const [saved, pinned] = await Promise.all([
      getDeckIndex(key),
      getDeckPin(key),
    ]);
    setIndex(saved);
    setPin(pinned);
  }, [key]);

  // A stack screen mounts when it is pushed, so this reads the position the
  // learner left the deck at every time they open the screen.
  useEffect(() => {
    reload();
  }, [reload]);

  const total = items.length;
  const current = index === null ? 0 : Math.min(index, Math.max(0, total - 1));
  const placement = placements[current];
  const lesson = placement?.lesson ?? 0;
  const lessonCount = placement?.lessonCount ?? 0;
  const pinnedLesson = pin !== null ? (placements[pin]?.lesson ?? 0) : 0;

  const restart = () => {
    Alert.alert(
      t("progress.restartConfirmTitle"),
      t("progress.restartConfirmBody"),
      [
        { text: t("progress.cancel"), style: "cancel" },
        {
          text: t("progress.confirm"),
          style: "destructive",
          onPress: async () => {
            await setDeckIndex(key, 0);
            markDeckMoved();
            setIndex(0);
          },
        },
      ],
    );
  };

  const savePin = async () => {
    await setDeckPin(key, current);
    setPin(current);
  };

  const jumpToPin = async () => {
    if (pin === null) return;
    await setDeckIndex(key, pin);
    markDeckMoved();
    setIndex(pin);
  };

  const forgetPin = async () => {
    await clearDeckPin(key);
    setPin(null);
  };

  if (loading || total === 0) {
    return (
      <ScreenContainer scroll>
        <Section title={t("progress.here")} index={0}>
          <ListRow isLast label={t("home.noWords")} />
        </Section>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Section title={t("progress.here")} index={0}>
        <View className="px-4 py-4">
          <Text className="font-medium text-base text-ink">
            {settings.level.toUpperCase()}
            {lessonCount > 0
              ? `  ·  ${t("progress.lesson", { n: lesson, total: lessonCount })}`
              : ""}
          </Text>
          <Text className="mt-1 text-sm text-ink-muted">
            {t("progress.card", { n: current + 1, total })}
          </Text>
          <ProgressBar progress={(current + 1) / total} className="mt-4 w-full" />
        </View>
      </Section>

      <Section title={t("progress.actions")} index={1}>
        <ListRow
          onPress={savePin}
          label={
            <View>
              <Text className="font-medium text-base text-ink">
                {t("progress.pin")}
              </Text>
              <Text className="mt-1 text-sm text-ink-muted">
                {t("progress.pinSub")}
              </Text>
            </View>
          }
        />
        {pin !== null && (
          <ListRow
            onPress={jumpToPin}
            label={
              <View>
                <Text className="font-medium text-base text-ink">
                  {t("progress.jump")}
                </Text>
                <Text className="mt-1 text-sm text-ink-muted">
                  {t("progress.jumpSub", {
                    n: pin + 1,
                    lesson: pinnedLesson,
                  })}
                </Text>
              </View>
            }
          />
        )}
        {pin !== null && (
          <ListRow onPress={forgetPin} label={t("progress.clearPin")} />
        )}
        <ListRow
          isLast
          onPress={restart}
          label={
            <View>
              <Text className="font-medium text-base text-ink">
                {t("progress.restart")}
              </Text>
              <Text className="mt-1 text-sm text-ink-muted">
                {t("progress.restartSub")}
              </Text>
            </View>
          }
        />
      </Section>
    </ScreenContainer>
  );
};

export default ProgressScreen;
