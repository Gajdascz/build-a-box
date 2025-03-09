import { describe, expect, it } from 'vitest';
import { normalize } from './normalize.js';

describe('normalize', () => {
  describe('width', () => {
    it('returns empty array for empty input', () => {
      expect(normalize.width([])).toEqual([]);
    });

    it('normalizes matrices to widest width', () => {
      const matrices = [
        [['a'], ['b']],
        [
          ['c', 'd'],
          ['e', 'f']
        ]
      ];
      const expected = [
        [
          ['a', ' '],
          ['b', ' ']
        ],
        [
          ['c', 'd'],
          ['e', 'f']
        ]
      ];
      expect(normalize.width(matrices)).toEqual(expected);
    });

    it('preserves matrices that already match max width', () => {
      const matrices = [
        [
          ['a', 'b'],
          ['c', 'd']
        ],
        [
          ['e', 'f'],
          ['g', 'h']
        ]
      ];
      expect(normalize.width(matrices)).toEqual(matrices);
    });

    it('handles single matrix input', () => {
      const matrices = [
        [
          ['a', 'b'],
          ['c', 'd']
        ]
      ];
      expect(normalize.width(matrices)).toEqual(matrices);
    });
  });

  describe('height', () => {
    it('returns empty array for empty input', () => {
      expect(normalize.height([])).toEqual([]);
    });

    it('normalizes matrices to tallest height', () => {
      const matrices = [
        [['a', 'b']],
        [
          ['c', 'd'],
          ['e', 'f']
        ]
      ];
      const expected = [
        [
          ['a', 'b'],
          [' ', ' ']
        ],
        [
          ['c', 'd'],
          ['e', 'f']
        ]
      ];
      expect(normalize.height(matrices)).toEqual(expected);
    });

    it('preserves matrices that already match max height', () => {
      const matrices = [
        [
          ['a', 'b'],
          ['c', 'd']
        ],
        [
          ['e', 'f'],
          ['g', 'h']
        ]
      ];
      expect(normalize.height(matrices)).toEqual(matrices);
    });

    it('handles single matrix input', () => {
      const matrices = [
        [
          ['a', 'b'],
          ['c', 'd']
        ]
      ];
      expect(normalize.height(matrices)).toEqual(matrices);
    });
  });
});
