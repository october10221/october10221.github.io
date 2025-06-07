import { vocabulary } from '../vocabulary.js';

describe('vocabulary data', () => {
  test('contains at least 100 entries', () => {
    expect(vocabulary.length).toBeGreaterThanOrEqual(100);
  });

  test('each entry has required fields', () => {
    for (const item of vocabulary) {
      expect(item).toHaveProperty('word');
      expect(item).toHaveProperty('correct');
      expect(Array.isArray(item.others)).toBe(true);
    }
  });
});
