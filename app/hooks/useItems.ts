import { useEffect, useMemo, useState } from "react";
import loadLanguageFile, { loadLessonsFile } from "../utils/loadLanguageFile";
import {
  buildItems,
  buildPlacements,
  Item,
  ItemPlacement,
  LessonSpec,
} from "../utils/items";
import { LanguageSettings, Word } from "../utils/types";

interface UseItemsResult {
  items: Item[];
  /** Which lesson each item belongs to, parallel to `items`. */
  placements: ItemPlacement[];
  /** True when this deck has a course; false for a plain word list. */
  hasLessons: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Loads a deck: the word list for the chosen pair and level, plus its course
 * file when one exists, assembled into the item list the screen cycles
 * through. Re-loads whenever the pair or level changes.
 *
 * A level with no course file yields the flat word list the app has always
 * shown, so nothing regresses for the four levels still awaiting lessons.
 */
export function useItems(settings: LanguageSettings): UseItemsResult {
  const [words, setWords] = useState<Word[]>([]);
  const [lessons, setLessons] = useState<LessonSpec[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { learningLanguage, knownLanguage, level } = settings;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [list, course] = await Promise.all([
          loadLanguageFile(learningLanguage, knownLanguage, level),
          // The generated loader gained this export later than the default
          // one; a test that stubs only the default must not crash the deck.
          typeof loadLessonsFile === "function"
            ? loadLessonsFile(learningLanguage, knownLanguage, level)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setWords(list);
        setLessons(course);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setWords([]);
          setLessons(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [learningLanguage, knownLanguage, level]);

  const items = useMemo(
    () => buildItems(words, lessons ?? undefined),
    [words, lessons],
  );
  const placements = useMemo(
    () => buildPlacements(words, lessons ?? undefined),
    [words, lessons],
  );

  return {
    items,
    placements,
    hasLessons: (lessons?.length ?? 0) > 0,
    loading,
    error,
  };
}

export default useItems;
