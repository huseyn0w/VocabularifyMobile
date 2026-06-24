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
