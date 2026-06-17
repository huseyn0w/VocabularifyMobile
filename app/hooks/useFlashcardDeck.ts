import { useCallback, useEffect, useRef, useState } from 'react';
import { getLastIndex, setLastIndex } from '../services/storage';
import { LearningMode, Word } from '../utils/types';
import { SHOW_TRANSLATION_DELAY } from '../utils/constants';

interface UseFlashcardDeckParams {
  words: Word[];
  frequency: number;
  mode: LearningMode;
}

interface UseFlashcardDeckResult {
  /** Current card index, or null until the persisted index has loaded. */
  currentIndex: number | null;
  /** The current word, or null while loading / when the deck is empty. */
  current: Word | null;
  total: number;
  next: () => void;
  prev: () => void;
  /** Whether the translation (`word_2`) should currently be shown. */
  showTranslation: boolean;
}

/**
 * Owns the flashcard deck logic: wrap-around next/prev, the auto-advance
 * interval, last-index persistence, and the "show word then translation"
 * reveal-after-delay behavior.
 */
export function useFlashcardDeck({
  words,
  frequency,
  mode,
}: UseFlashcardDeckParams): UseFlashcardDeckResult {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep the latest word count in a ref so the interval callback never closes
  // over a stale value.
  const wordsLengthRef = useRef(words.length);
  wordsLengthRef.current = words.length;

  // Load the persisted last index once the deck has words.
  const total = words.length;
  useEffect(() => {
    if (total === 0) return;
    let cancelled = false;
    (async () => {
      const saved = await getLastIndex();
      if (cancelled) return;
      // Guard against an out-of-range index for a shorter list.
      const safeIndex = saved < total ? saved : 0;
      setCurrentIndex(safeIndex);
    })();
    return () => {
      cancelled = true;
    };
  }, [total]);

  // Persist the index whenever it changes (and is valid).
  useEffect(() => {
    if (currentIndex !== null && total > 0) {
      setLastIndex(currentIndex);
    }
  }, [currentIndex, total]);

  // Functional updates -> no dependency on currentIndex, no stale closures.
  const next = useCallback(() => {
    const len = wordsLengthRef.current;
    if (len === 0) return;
    setCurrentIndex((prev) => (prev !== null ? (prev + 1) % len : 0));
  }, []);

  const prev = useCallback(() => {
    const len = wordsLengthRef.current;
    if (len === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex !== null ? (prevIndex - 1 + len) % len : 0,
    );
  }, []);

  // Auto-advance interval. Restarts when the index changes (so a manual swipe
  // resets the countdown, matching the original behavior), when frequency or
  // word count changes, and is always cleared on unmount / before re-creation.
  useEffect(() => {
    if (total === 0 || currentIndex === null) return;

    intervalRef.current = setInterval(() => {
      next();
    }, frequency);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [frequency, total, next, currentIndex]);

  // Reveal-after-delay behavior for "show word then translation" mode.
  useEffect(() => {
    if (mode === LearningMode.ShowWordThenTranslation) {
      setShowTranslation(false);
      const timeout = setTimeout(() => {
        setShowTranslation(true);
      }, SHOW_TRANSLATION_DELAY);
      return () => clearTimeout(timeout);
    }
    setShowTranslation(true);
    return undefined;
  }, [currentIndex, mode]);

  const current =
    currentIndex !== null && currentIndex < total ? words[currentIndex] : null;

  return { currentIndex, current, total, next, prev, showTranslation };
}

export default useFlashcardDeck;
