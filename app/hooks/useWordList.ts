import { useEffect, useState } from 'react';
import loadLanguageFile from '../utils/loadLanguageFile';
import { LanguageSettings, Word } from '../utils/types';

interface UseWordListResult {
  words: Word[];
  loading: boolean;
  error: Error | null;
}

/**
 * Loads the word list for the given language settings. Re-loads whenever the
 * learning/known language or level changes.
 */
export function useWordList(settings: LanguageSettings): UseWordListResult {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { learningLanguage, knownLanguage, level } = settings;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await loadLanguageFile(learningLanguage, knownLanguage, level);
        if (!cancelled) {
          setWords(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setWords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [learningLanguage, knownLanguage, level]);

  return { words, loading, error };
}

export default useWordList;
