import { beforeEach, describe, expect, it } from 'vitest';
import * as Base from '../../base/index.js';
import * as Pad from './pad.js';

describe('Matrix Padding Operations', () => {
  let matrix: Base.Matrix;

  beforeEach(() => {
    matrix = Base.create.from.dimensions({ width: 2, height: 2 }, 'x');
  });

  describe('apply', () => {
    it('returns original matrix when no padding specified', () => {
      const result = Pad.apply(matrix, Pad.DEFAULTS);
      expect(result).toEqual(matrix);
    });

    it('applies horizontal padding only', () => {
      const result = Pad.apply(matrix, {
        horizontal: {
          left: { char: '<', count: 1 },
          right: { char: '>', count: 1 }
        }
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['<', 'x', 'x', '>']);
      expect(result[1]).toEqual(['<', 'x', 'x', '>']);
    });

    it('applies vertical padding only', () => {
      const result = Pad.apply(matrix, {
        vertical: {
          top: { char: '^', count: 1 },
          bottom: { char: 'v', count: 1 }
        }
      });

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(['^', '^']);
      expect(result[1]).toEqual(['x', 'x']);
      expect(result[2]).toEqual(['x', 'x']);
      expect(result[3]).toEqual(['v', 'v']);
    });

    it('applies both horizontal and vertical padding', () => {
      const result = Pad.apply(matrix, {
        horizontal: {
          left: { char: '<', count: 1 },
          right: { char: '>', count: 1 }
        },
        vertical: {
          top: { char: '^', count: 1 },
          bottom: { char: 'v', count: 1 }
        }
      });

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(['<', '^', '^', '>']);
      expect(result[1]).toEqual(['<', 'x', 'x', '>']);
      expect(result[2]).toEqual(['<', 'x', 'x', '>']);
      expect(result[3]).toEqual(['<', 'v', 'v', '>']);
    });

    it('preserves original matrix', () => {
      const result = Pad.apply(matrix, {
        horizontal: {
          left: { count: 1 },
          right: { count: 1 }
        },
        vertical: {
          top: { count: 1 },
          bottom: { count: 1 }
        }
      });

      expect(matrix).toHaveLength(2);
      expect(matrix[0]).toEqual(['x', 'x']);
    });

    it('uses default space character when not specified', () => {
      const result = Pad.apply(matrix, {
        horizontal: {
          left: { count: 1 },
          right: { count: 1 }
        },
        vertical: {
          top: { count: 1 },
          bottom: { count: 1 }
        }
      });

      expect(result[0]).toEqual([' ', ' ', ' ', ' ']);
      expect(result[3]).toEqual([' ', ' ', ' ', ' ']);
    });
  });
});
