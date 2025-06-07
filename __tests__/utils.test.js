import { shuffleArray } from '../utils.js';

describe('shuffleArray', () => {
  test('returns array with same elements in any order', () => {
    const original = [1,2,3,4,5];
    const copy = [...original];
    const result = shuffleArray(copy);
    expect(result).toHaveLength(original.length);
    expect(result.sort()).toEqual([...original].sort());
  });
});
