import fs from 'fs';
import path from 'path';
import loadLanguageFile from '../../app/utils/loadLanguageFile';
import {
  languages,
  availableCombinations,
  levels,
  LANGUAGE_META,
} from '../../app/utils/types';

const LANGUAGES_DIR = path.resolve(__dirname, '../../languages');
const EXPECTED = ['English', 'French', 'German', 'Italian', 'Russian', 'Spanish', 'Turkish'];

describe('language parity', () => {
  it('exposes all 7 Desktop languages', () => {
    expect([...languages].sort()).toEqual(EXPECTED);
  });

  it('every language is learnable from every other (full 42-pair matrix)', () => {
    let pairs = 0;
    for (const learning of languages) {
      for (const known of availableCombinations[learning]) {
        expect(known).not.toBe(learning);
        pairs++;
      }
    }
    expect(pairs).toBe(42);
  });

  it('every availableCombinations pair × level loads the exact on-disk file', async () => {
    let count = 0;
    for (const learning of languages) {
      for (const known of availableCombinations[learning]) {
        const toCode = LANGUAGE_META[learning].code;
        const fromCode = LANGUAGE_META[known].code;
        for (const level of levels) {
          const lvl = level.toLowerCase();
          const filePath = path.join(LANGUAGES_DIR, toCode, fromCode, `${lvl}.json`);
          const onDisk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const loaded = await loadLanguageFile(
            learning.toLowerCase(),
            known.toLowerCase(),
            lvl,
          );
          expect(loaded.length).toBe(onDisk.length);
          expect(loaded[0]).toEqual(onDisk[0]);
          expect(typeof loaded[0].word_1).toBe('string');
          expect(typeof loaded[0].word_2).toBe('string');
          count++;
        }
      }
    }
    expect(count).toBe(210);
  });

  it('every on-disk level file is reachable via availableCombinations (no orphans)', () => {
    const nameForCode = (code: string): string | undefined =>
      languages.find((l) => LANGUAGE_META[l].code === code);
    const codeLevels = ['a1', 'a2', 'b1', 'b2', 'c1'];
    let diskFiles = 0;
    for (const toCode of fs.readdirSync(LANGUAGES_DIR)) {
      if (toCode.startsWith('_') || !fs.statSync(path.join(LANGUAGES_DIR, toCode)).isDirectory()) {
        continue;
      }
      const learning = nameForCode(toCode);
      expect(learning).toBeDefined();
      for (const fromCode of fs.readdirSync(path.join(LANGUAGES_DIR, toCode))) {
        const fromDir = path.join(LANGUAGES_DIR, toCode, fromCode);
        if (fromCode.startsWith('_') || !fs.statSync(fromDir).isDirectory()) continue;
        const known = nameForCode(fromCode);
        for (const file of fs.readdirSync(fromDir)) {
          const lvl = file.replace('.json', '');
          if (!codeLevels.includes(lvl)) continue; // skip custom.json etc.
          expect(known).toBeDefined();
          expect(availableCombinations[learning as keyof typeof availableCombinations]).toContain(
            known,
          );
          diskFiles++;
        }
      }
    }
    expect(diskFiles).toBe(210);
  });
});

describe('course parity', () => {
  // A lessons file is copied in from Desktop, so a stale or half-finished copy
  // is the failure worth catching: the deck would silently drop words off the
  // end of a lesson, or show a sentence whose words the learner has not met.
  const lessonFiles: { pair: string; file: string; words: string }[] = [];
  for (const toCode of fs.readdirSync(LANGUAGES_DIR)) {
    const toDir = path.join(LANGUAGES_DIR, toCode);
    if (toCode.startsWith('_') || !fs.statSync(toDir).isDirectory()) continue;
    for (const fromCode of fs.readdirSync(toDir)) {
      const fromDir = path.join(toDir, fromCode);
      if (fromCode.startsWith('_') || !fs.statSync(fromDir).isDirectory()) continue;
      for (const file of fs.readdirSync(fromDir)) {
        if (!file.endsWith('.lessons.json')) continue;
        lessonFiles.push({
          pair: `${toCode}/${fromCode}/${file}`,
          file: path.join(fromDir, file),
          words: path.join(fromDir, file.replace('.lessons.json', '.json')),
        });
      }
    }
  }

  // A1 has a course for every one of the 42 pairs. A2 so far has one only for
  // German, which is the level being written; the other six targets still have
  // no A2 course and must not silently gain one.
  it('ships a course for all 42 pairs at A1 and for German at A2', () => {
    const a1 = lessonFiles.filter((f) => f.pair.endsWith('a1.lessons.json'));
    const a2 = lessonFiles.filter((f) => f.pair.endsWith('a2.lessons.json'));
    expect(a1).toHaveLength(42);
    expect(a2).toHaveLength(6);
    expect(a2.every((f) => f.pair.startsWith('de/'))).toBe(true);
    expect(lessonFiles).toHaveLength(48);
  });

  it.each(lessonFiles)('$pair fits its word file', ({ pair, file, words }) => {
    const course = JSON.parse(fs.readFileSync(file, 'utf8'));
    const wordList = JSON.parse(fs.readFileSync(words, 'utf8'));

    expect(Array.isArray(course.lessons)).toBe(true);
    expect(course.lessons.length).toBeGreaterThan(0);

    const covered = course.lessons.reduce(
      (sum: number, lesson: { count: number }) => sum + lesson.count,
      0,
    );
    // A course may cover fewer words than the dictionary holds - the levels
    // still awaiting their own course use the shared 188-word one, and
    // buildItems appends the remainder. It must never claim more.
    expect(covered).toBeLessThanOrEqual(wordList.length);

    // German A1 is the one course written per target, so it covers its whole
    // word file. Locking that in catches a partial re-copy from Desktop.
    if (pair.startsWith('de/')) {
      expect(covered).toBe(wordList.length);
    }

    for (const lesson of course.lessons) {
      for (const sentence of lesson.sentences) {
        expect(typeof sentence.id).toBe('string');
        expect(typeof sentence.source).toBe('string');
        expect(sentence.source.length).toBeGreaterThan(0);
        // Every token backed by a concept can name where it came from.
        for (const token of sentence.target) {
          if (typeof token === 'string') continue;
          expect(sentence.gloss[token.c]).toBeDefined();
        }
      }
    }
  });
});
