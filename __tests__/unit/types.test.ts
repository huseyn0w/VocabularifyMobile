import {
  LearningMode,
  availableCombinations,
  languages,
  levels,
} from '../../app/utils/types';

describe('LearningMode constants', () => {
  it('exposes the two expected modes', () => {
    expect(LearningMode.ShowBoth).toBe('showBoth');
    expect(LearningMode.ShowWordThenTranslation).toBe('showWordThenTranslation');
    expect(Object.values(LearningMode)).toHaveLength(2);
  });
});

describe('language metadata', () => {
  it('lists the supported languages and levels', () => {
    expect([...languages].sort()).toEqual([
      'English', 'French', 'German', 'Italian', 'Russian', 'Spanish', 'Turkish',
    ]);
    expect(levels).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
  });

  it('availableCombinations only references known languages', () => {
    for (const [from, targets] of Object.entries(availableCombinations)) {
      expect(languages).toContain(from);
      for (const target of targets) {
        expect(languages).toContain(target);
        // A language is never combinable with itself.
        expect(target).not.toBe(from);
      }
    }
  });

  it('exposes at least one learnable language (non-empty combination list)', () => {
    const learnable = languages.filter(
      (language) => availableCombinations[language].length > 0,
    );
    expect(learnable.length).toBeGreaterThan(0);
    expect(learnable).toContain('English');
  });
});
