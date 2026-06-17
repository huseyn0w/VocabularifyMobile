import loadLanguageFile from '../../app/utils/loadLanguageFile';

describe('loadLanguageFile', () => {
  it('returns a non-empty Word[] for a known key', async () => {
    const words = await loadLanguageFile('english', 'german', 'a1');
    expect(Array.isArray(words)).toBe(true);
    expect(words.length).toBeGreaterThan(0);
  });

  it('returns entries with word_1 / word_2 string fields', async () => {
    const words = await loadLanguageFile('english', 'german', 'a1');
    for (const entry of words.slice(0, 10)) {
      expect(typeof entry.word_1).toBe('string');
      expect(typeof entry.word_2).toBe('string');
    }
  });

  it('returns the fallback (non-empty Word[]) for an unknown key', async () => {
    const words = await loadLanguageFile('klingon', 'elvish', 'z9');
    expect(Array.isArray(words)).toBe(true);
    expect(words.length).toBeGreaterThan(0);
    expect(typeof words[0].word_1).toBe('string');
    expect(typeof words[0].word_2).toBe('string');
  });

  it('returns distinct lists for distinct known keys', async () => {
    const enDe = await loadLanguageFile('english', 'german', 'a1');
    const deEn = await loadLanguageFile('german', 'english', 'a1');
    expect(enDe).not.toBe(deEn);
  });
});
