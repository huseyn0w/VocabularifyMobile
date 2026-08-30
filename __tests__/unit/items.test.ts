import {
  buildItems,
  buildPlacements,
  joinTokens,
  layoutTokens,
  lessonJump,
  LessonSpec,
} from "../../app/utils/items";
import { Word } from "../../app/utils/types";

const WORDS: Word[] = [
  { word_1: "привет", word_2: "hallo" },
  { word_1: "я", word_2: "ich" },
  { word_1: "ты", word_2: "du" },
  { word_1: "быть", word_2: "sein" },
];

const sentence = (id: string) => ({
  id,
  target: [{ t: "Hallo", c: "hello" }, "!"],
  source: "Привет!",
  gloss: { hello: { t: "hallo", s: "привет" } },
});

describe("layoutTokens", () => {
  it("separates words with a space and hugs punctuation to the word before it", () => {
    const out = layoutTokens([
      { t: "Mir", c: "i" },
      { t: "geht", c: "to go" },
      { t: "es", c: "it" },
      ",",
      { t: "danke", c: "thank you" },
      ".",
    ]);
    expect(out.map((t) => t.space)).toEqual([
      false,
      true,
      true,
      false,
      true,
      false,
    ]);
    expect(joinTokens([
      { t: "Mir", c: "i" },
      { t: "geht", c: "to go" },
      ",",
      { t: "danke", c: "thank you" },
      ".",
    ])).toBe("Mir geht, danke.");
  });

  it("adds no space after an opening bracket or quote", () => {
    expect(joinTokens(["«", { t: "Ja", c: "yes" }, "»", "."])).toBe("«Ja».");
  });

  it("leaves a token that carries its own narrow space alone", () => {
    // French spells U+202F into the token before ! ? : and ;
    expect(joinTokens([{ t: "Salut", c: "hello" }, " !"])).toBe(
      "Salut !",
    );
  });

  it("marks glue with a null concept and carries a lemma override through", () => {
    const out = layoutTokens([
      "der",
      { t: "estoy", c: "to be", g: "estar" },
    ]);
    expect(out[0].concept).toBeNull();
    expect(out[0].lemma).toBeNull();
    expect(out[1].concept).toBe("to be");
    expect(out[1].lemma).toBe("estar");
  });

  it("drops a token with no text rather than emitting an empty element", () => {
    expect(layoutTokens(["", { t: "ja", c: "yes" }]).map((t) => t.text)).toEqual([
      "ja",
    ]);
  });
});

describe("buildItems", () => {
  it("returns the flat word list when there is no course", () => {
    const items = buildItems(WORDS);
    expect(items).toHaveLength(4);
    // word_1 is the known language, word_2 the one being learned.
    expect(items[0]).toEqual({
      kind: "word",
      source: "привет",
      target: "hallo",
    });
  });

  it("interleaves each lesson's words with the sentences built from them", () => {
    const lessons: LessonSpec[] = [
      { count: 2, sentences: [sentence("a1_001")] },
      { count: 2, sentences: [sentence("a1_002"), sentence("a1_003")] },
    ];
    const items = buildItems(WORDS, lessons);
    expect(items.map((i) => (i.kind === "word" ? i.target : i.id))).toEqual([
      "hallo",
      "ich",
      "a1_001",
      "du",
      "sein",
      "a1_002",
      "a1_003",
    ]);
  });

  it("appends the words a short course does not cover rather than hiding them", () => {
    const items = buildItems(WORDS, [{ count: 2, sentences: [] }]);
    expect(items).toHaveLength(4);
    expect(items[3]).toEqual({ kind: "word", source: "быть", target: "sein" });
  });

  it("does not read past the end of a word list shorter than the course claims", () => {
    const items = buildItems(WORDS.slice(0, 1), [
      { count: 9, sentences: [sentence("a1_001")] },
    ]);
    expect(items.map((i) => i.kind)).toEqual(["word", "sentence"]);
  });
});

describe("buildPlacements", () => {
  const lessons: LessonSpec[] = [
    { count: 2, sentences: [sentence("a1_001")] },
    { count: 2, sentences: [sentence("a1_002")] },
  ];

  it("gives every item its lesson, and one entry per item", () => {
    const items = buildItems(WORDS, lessons);
    const placements = buildPlacements(WORDS, lessons);
    expect(placements).toHaveLength(items.length);
    expect(placements.map((p) => p.lesson)).toEqual([1, 1, 1, 2, 2, 2]);
    expect(placements[0].lessonCount).toBe(2);
  });

  it("marks uncovered tail words as belonging to no lesson", () => {
    const placements = buildPlacements(WORDS, [{ count: 2, sentences: [] }]);
    expect(placements.map((p) => p.lesson)).toEqual([1, 1, 0, 0]);
  });

  it("reports no lessons at all for a deck with no course", () => {
    expect(buildPlacements(WORDS).every((p) => p.lessonCount === 0)).toBe(true);
  });
});

describe("lessonJump", () => {
  const lessons: LessonSpec[] = [
    { count: 2, sentences: [sentence("a1_001")] },
    { count: 2, sentences: [sentence("a1_002")] },
  ];
  const placements = buildPlacements(WORDS, lessons);

  it("lands on the first item of the neighbouring lesson", () => {
    expect(lessonJump(placements, 1, 1)).toBe(3);
    expect(lessonJump(placements, 4, -1)).toBe(0);
  });

  it("stays put at either end", () => {
    expect(lessonJump(placements, 0, -1)).toBe(0);
    expect(lessonJump(placements, 5, 1)).toBe(5);
  });

  it("stays put on a deck with no course", () => {
    expect(lessonJump(buildPlacements(WORDS), 2, 1)).toBe(2);
  });
});
