import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFlashcardDeck } from '../../app/hooks/useFlashcardDeck';
import { LearningMode, Word } from '../../app/utils/types';
import { STORAGE_KEYS } from '../../app/services/storage';
import { SHOW_TRANSLATION_DELAY } from '../../app/utils/constants';

const WORDS: Word[] = [
  { word_1: 'eins', word_2: 'one' },
  { word_1: 'zwei', word_2: 'two' },
  { word_1: 'drei', word_2: 'three' },
];

const FREQUENCY = 5000;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useFlashcardDeck — navigation', () => {
  it('loads the persisted index, then next advances and wraps around at the end', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );

    await waitFor(() => expect(result.current.currentIndex).toBe(0));
    expect(result.current.total).toBe(3);
    expect(result.current.current).toEqual(WORDS[0]);

    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(1);
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(2);
    // Wrap-around back to 0.
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(0);
  });

  it('prev wraps to the end from index 0', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    await waitFor(() => expect(result.current.currentIndex).toBe(0));

    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(WORDS.length - 1);
  });

  it('persists the last index via the storage service when it changes', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    await waitFor(() => expect(result.current.currentIndex).toBe(0));

    act(() => result.current.next());
    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.lastIndex);
      expect(JSON.parse(stored as string)).toBe(1);
    });
  });

  it('starts from the persisted index when one is stored', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.lastIndex, JSON.stringify(2));
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    await waitFor(() => expect(result.current.currentIndex).toBe(2));
    expect(result.current.current).toEqual(WORDS[2]);
  });
});

describe('useFlashcardDeck — auto-advance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('advances the index after `frequency` ms', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );

    // Flush the async persisted-index load under fake timers.
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      jest.advanceTimersByTime(FREQUENCY);
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it('clears the interval on unmount (no advance after unmount)', async () => {
    const { result, unmount } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.currentIndex).toBe(0);

    unmount();
    const indexAtUnmount = result.current.currentIndex;
    act(() => {
      jest.advanceTimersByTime(FREQUENCY * 3);
    });
    // No state changes after unmount.
    expect(result.current.currentIndex).toBe(indexAtUnmount);
  });
});

describe('useFlashcardDeck — translation reveal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('showWordThenTranslation: starts false, becomes true after the reveal delay', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({
        words: WORDS,
        frequency: FREQUENCY,
        mode: LearningMode.ShowWordThenTranslation,
      }),
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.showTranslation).toBe(false);

    act(() => {
      jest.advanceTimersByTime(SHOW_TRANSLATION_DELAY);
    });
    expect(result.current.showTranslation).toBe(true);
  });

  it('showBoth: keeps the translation shown', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: WORDS, frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.showTranslation).toBe(true);
  });
});

describe('useFlashcardDeck — empty deck', () => {
  it('stays null with no words and next/prev are no-ops', async () => {
    const { result } = renderHook(() =>
      useFlashcardDeck({ words: [], frequency: FREQUENCY, mode: LearningMode.ShowBoth }),
    );
    expect(result.current.currentIndex).toBeNull();
    expect(result.current.current).toBeNull();
    expect(result.current.total).toBe(0);

    act(() => result.current.next());
    expect(result.current.currentIndex).toBeNull();
  });
});
