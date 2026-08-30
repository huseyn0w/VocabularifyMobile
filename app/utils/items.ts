/**
 * The display item model, shared in spirit with Desktop's `src/shared/items.ts`.
 *
 * A deck used to be a flat list of words. With a course file it becomes a list
 * of items: the words of a lesson, then the sentences built from them, then the
 * next lesson. The shapes here mirror Desktop's byte for byte, because both
 * apps read the same generated `languages/<to>/<from>/<level>.lessons.json`.
 * Keep the two in sync when either changes.
 */

import type { Word } from "./types";

/** One piece of a sentence. An object is a word backed by a learned concept:
 *  `t` is the surface form exactly as it appears (capitalisation included, so
 *  a sentence-initial token differs from its bank entry by case) and `c` is
 *  the concept id. A bare string is glue - punctuation, or an obligatory
 *  function word such as an article.
 *
 *  `g` overrides the citation form shown on tap, for the case where one
 *  concept is carried by two different verbs in one language: the bank holds
 *  a single `to be`, but Spanish splits it into `ser` and `estar`. Without the
 *  override, tapping `estoy` would claim its dictionary form is `ser`. */
export type SentenceToken = string | { t: string; c: string; g?: string };

// A sentence has no separate plain-text field: joining its tokens IS the
// sentence, so the join rule has exactly one implementation, here.
// U+202F, the narrow no-break space, leads a token that already carries its
// own spacing - French spells it into the token before !, ?, : and ;, and this
// class stops a second space being added in front of it.
const NO_SPACE_BEFORE = /^[\u202f,.!?;:)\]}»…]/;
const NO_SPACE_AFTER = /[([{«¡¿'’]$/;

/** A token with its spacing already decided, so the renderer draws one element
 *  per token and prepends a space when `space` is set. */
export interface LaidOutToken {
  text: string;
  /** The concept id when this token is a learned word, null for glue. */
  concept: string | null;
  /** The token's own citation form, when it differs from the concept's.
   *  Null whenever the concept's own citation is the honest answer. */
  lemma: string | null;
  /** Whether a space goes in front of this token. */
  space: boolean;
}

export function layoutTokens(tokens: SentenceToken[]): LaidOutToken[] {
  const out: LaidOutToken[] = [];
  let previous = "";
  for (const token of tokens) {
    const text = typeof token === "string" ? token : token?.t;
    if (typeof text !== "string" || !text) {
      continue;
    }
    const space =
      previous !== "" &&
      !NO_SPACE_BEFORE.test(text) &&
      !NO_SPACE_AFTER.test(previous);
    const lemma =
      typeof token === "string" || typeof token.g !== "string" ? null : token.g;
    out.push({
      text,
      concept: typeof token === "string" ? null : token.c,
      lemma,
      space,
    });
    previous = text;
  }
  return out;
}

export function joinTokens(tokens: SentenceToken[]): string {
  return layoutTokens(tokens)
    .map((token) => (token.space ? ` ${token.text}` : token.text))
    .join("");
}

/** The citation form of a concept plus its translation, so a conjugated token
 *  can show what it came from without loading the bank: `bin` -> `sein`/`быть`. */
export interface SentenceGloss {
  /** Citation form in the language being learned. */
  t: string;
  /** Its translation in the known language. */
  s: string;
}

export interface SentenceSpec {
  id: string;
  /** Tokens in the language being learned. */
  target: SentenceToken[];
  /** The whole sentence in the known language, already joined. */
  source: string;
  /** Keyed by concept id; only the concepts this sentence uses. */
  gloss: Record<string, SentenceGloss>;
}

export interface LessonSpec {
  /** How many words of the word file belong to this lesson. Per pair: a
   *  concept can be dropped when its target word collides with an earlier
   *  one, so this is not simply the number of concepts in the lesson. */
  count: number;
  sentences: SentenceSpec[];
}

export interface LessonsFile {
  lessons: LessonSpec[];
}

export type Item =
  | { kind: "word"; source: string; target: string }
  | {
      kind: "sentence";
      id: string;
      source: string;
      target: SentenceToken[];
      gloss: Record<string, SentenceGloss>;
    };

/** Which lesson an item belongs to, and where the lesson boundaries fall.
 *  `lesson` is 1-based; 0 means the item sits outside every lesson (the tail
 *  of a dictionary a lessons file does not cover, or no lessons at all). */
export interface ItemPlacement {
  lesson: number;
  lessonCount: number;
}

/** Produces the list the deck cycles through. Without `lessons` this is the
 *  flat word list the app has always shown, so a level with no course file
 *  keeps working unchanged. */
export function buildItems(words: Word[], lessons?: LessonSpec[]): Item[] {
  const cards: Item[] = words.map((entry) => ({
    kind: "word",
    // `word_1` is the known language, `word_2` the one being learned - the
    // same orientation Desktop reads these files with.
    source: entry.word_1,
    target: entry.word_2,
  }));

  if (!lessons || lessons.length === 0) {
    return cards;
  }

  const items: Item[] = [];
  let cursor = 0;
  for (const lesson of lessons) {
    const take = Math.max(0, Math.min(lesson.count, cards.length - cursor));
    items.push(...cards.slice(cursor, cursor + take));
    cursor += take;
    for (const sentence of lesson.sentences) {
      items.push({
        kind: "sentence",
        id: sentence.id,
        source: sentence.source,
        target: sentence.target,
        gloss: sentence.gloss,
      });
    }
  }

  // A lessons file that covers fewer words than the dictionary must never hide
  // the rest, so the remainder is appended.
  if (cursor < cards.length) {
    items.push(...cards.slice(cursor));
  }
  return items;
}

/** Lesson number per item index, parallel to `buildItems`' output. The screen
 *  shows "lesson 24 of 147" beside the item counter, and the deck uses it to
 *  jump a whole lesson at a time. */
export function buildPlacements(
  words: Word[],
  lessons?: LessonSpec[],
): ItemPlacement[] {
  const total = buildItems(words, lessons).length;
  if (!lessons || lessons.length === 0) {
    return Array.from({ length: total }, () => ({ lesson: 0, lessonCount: 0 }));
  }

  const out: ItemPlacement[] = [];
  const lessonCount = lessons.length;
  let cursor = 0;
  lessons.forEach((lesson, index) => {
    const take = Math.max(0, Math.min(lesson.count, words.length - cursor));
    for (let i = 0; i < take + lesson.sentences.length; i++) {
      out.push({ lesson: index + 1, lessonCount });
    }
    cursor += take;
  });
  while (out.length < total) {
    out.push({ lesson: 0, lessonCount });
  }
  return out;
}

/** The index of the first item of the lesson `direction` steps away from the
 *  one holding `index`. Used by the lesson-skip gesture. Returns `index` when
 *  there are no lessons, or when the move would fall off either end. */
export function lessonJump(
  placements: ItemPlacement[],
  index: number,
  direction: 1 | -1,
): number {
  const here = placements[index];
  if (!here || here.lesson === 0) return index;
  const target = here.lesson + direction;
  if (target < 1 || target > here.lessonCount) return index;
  const found = placements.findIndex((p) => p.lesson === target);
  return found === -1 ? index : found;
}
