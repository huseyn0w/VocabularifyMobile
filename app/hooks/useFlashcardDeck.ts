import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDeckIndex, setDeckIndex } from "../services/storage";
import { Item, ItemPlacement, lessonJump } from "../utils/items";
import { LearningMode } from "../utils/types";
import {
  SENTENCE_DWELL_MULTIPLIER,
  SHOW_TRANSLATION_DELAY,
} from "../utils/constants";

interface UseFlashcardDeckParams {
  items: Item[];
  /** Lesson placement per item. Empty for a deck with no course. */
  placements?: ItemPlacement[];
  frequency: number;
  /** Whether the timer runs at all. Off means a card waits for a swipe. */
  autoAdvance?: boolean;
  mode: LearningMode;
  /** Identifies the deck for position persistence. Null until settings load;
   *  while it is null nothing is read or written. */
  deckKey?: string | null;
  /** Changing this re-reads the stored position. The Progress screen writes
   *  the position from another tab, and this screen stays mounted behind it,
   *  so without a re-read a restart would not take effect until the app was
   *  relaunched. Re-reading what this hook itself wrote is a no-op. */
  refreshToken?: unknown;
}

interface UseFlashcardDeckResult {
  /** Current item index, or null until the persisted position has loaded. */
  currentIndex: number | null;
  /** The current item, or null while loading / when the deck is empty. */
  current: Item | null;
  total: number;
  next: () => void;
  prev: () => void;
  /** Jumps to the first item of the neighbouring lesson. No-ops on a deck
   *  with no course, and at the two ends. */
  nextLesson: () => void;
  prevLesson: () => void;
  /** 1-based lesson holding the current item, and how many there are. Both
   *  0 when the deck has no course. */
  lesson: number;
  lessonCount: number;
  /** Whether the translation line should currently be shown. */
  showTranslation: boolean;
  /** Jumps straight to an item. Used by the Progress screen to restart a
   *  level or return to a saved spot. Out-of-range values are clamped. */
  goTo: (index: number) => void;
}

/**
 * Owns the deck: wrap-around next/prev, lesson jumps, the auto-advance timer,
 * position persistence per deck, and the "show word then translation" reveal.
 *
 * A sentence is read rather than glanced at, so it holds the screen for
 * SENTENCE_DWELL_MULTIPLIER times the configured interval - the same rule
 * Desktop's phrase engine applies.
 */
export function useFlashcardDeck({
  items,
  placements,
  frequency,
  autoAdvance = false,
  mode,
  deckKey = null,
  refreshToken,
}: UseFlashcardDeckParams): UseFlashcardDeckResult {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);

  const total = items.length;

  // Keep the latest count in a ref so the timer callback never closes over a
  // stale value.
  const totalRef = useRef(total);
  totalRef.current = total;

  const placementList = useMemo(() => placements ?? [], [placements]);
  const placementRef = useRef(placementList);
  placementRef.current = placementList;

  // Load this deck's saved position. Runs again on a deck change, so switching
  // pair or level restores where that deck was left.
  useEffect(() => {
    if (total === 0 || !deckKey) return undefined;
    let cancelled = false;
    (async () => {
      const saved = await getDeckIndex(deckKey);
      if (cancelled) return;
      // Guard against a position past the end of a shorter list.
      setCurrentIndex(saved < total ? saved : 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [total, deckKey, refreshToken]);

  // Persist the position whenever it changes.
  useEffect(() => {
    if (currentIndex !== null && total > 0 && deckKey) {
      setDeckIndex(deckKey, currentIndex);
    }
  }, [currentIndex, total, deckKey]);

  // Functional updates -> no dependency on currentIndex, no stale closures.
  const next = useCallback(() => {
    const len = totalRef.current;
    if (len === 0) return;
    setCurrentIndex((prev) => (prev !== null ? (prev + 1) % len : 0));
  }, []);

  const prev = useCallback(() => {
    const len = totalRef.current;
    if (len === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex !== null ? (prevIndex - 1 + len) % len : 0,
    );
  }, []);

  const jump = useCallback((direction: 1 | -1) => {
    setCurrentIndex((prevIndex) =>
      prevIndex === null
        ? 0
        : lessonJump(placementRef.current, prevIndex, direction),
    );
  }, []);

  const nextLesson = useCallback(() => jump(1), [jump]);
  const prevLesson = useCallback(() => jump(-1), [jump]);

  const goTo = useCallback((index: number) => {
    const len = totalRef.current;
    if (len === 0) return;
    setCurrentIndex(Math.max(0, Math.min(len - 1, Math.floor(index))));
  }, []);

  const current =
    currentIndex !== null && currentIndex < total ? items[currentIndex] : null;
  const isSentence = current?.kind === "sentence";

  // Auto-advance, when the learner asked for it. Restarts when the index
  // changes (so a manual swipe resets the countdown), when frequency or deck
  // size changes, and is always cleared on unmount. With it off no timer is
  // scheduled at all, so a card waits indefinitely.
  useEffect(() => {
    if (!autoAdvance || total === 0 || currentIndex === null) return undefined;

    const dwell = isSentence
      ? frequency * SENTENCE_DWELL_MULTIPLIER
      : frequency;
    const timer = setTimeout(() => next(), dwell);
    return () => clearTimeout(timer);
  }, [autoAdvance, frequency, total, next, currentIndex, isSentence]);

  // Reveal-after-delay for "show word then translation".
  useEffect(() => {
    if (mode === LearningMode.ShowWordThenTranslation) {
      setShowTranslation(false);
      const timeout = setTimeout(
        () => setShowTranslation(true),
        SHOW_TRANSLATION_DELAY,
      );
      return () => clearTimeout(timeout);
    }
    setShowTranslation(true);
    return undefined;
  }, [currentIndex, mode]);

  const placement =
    currentIndex !== null ? placementList[currentIndex] : undefined;

  return {
    currentIndex,
    current,
    total,
    next,
    prev,
    nextLesson,
    prevLesson,
    lesson: placement?.lesson ?? 0,
    lessonCount: placement?.lessonCount ?? 0,
    showTranslation,
    goTo,
  };
}

export default useFlashcardDeck;
