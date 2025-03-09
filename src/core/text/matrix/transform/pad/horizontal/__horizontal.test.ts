import { describe, expect, it } from 'vitest';
import * as Horizontal from './horizontal.js';

describe('Horizontal', () => {
  describe('is', () => {
    it('validates correct configuration', () => {
      const validConfig = {
        left: { char: ' ', count: 1 },
        right: { char: ' ', count: 1 }
      };
      expect(Horizontal.is.cfg(validConfig)).toBe(true);
    });

    it('invalidates missing properties', () => {
      const invalidConfig = {
        left: { char: ' ', count: 1 }
      };
      expect(Horizontal.is.cfg(invalidConfig)).toBe(false);
    });

    it('invalidates incorrect property types', () => {
      const invalidConfig = {
        left: { char: ' ', count: '1' },
        right: { char: ' ', count: 1 }
      };
      expect(Horizontal.is.cfg(invalidConfig)).toBe(false);
    });
  });

  describe('add', () => {
    const baseMatrix = [
      ['a', 'b'],
      ['c', 'd']
    ];

    describe('left', () => {
      it('adds padding to left side', () => {
        const result = Horizontal.add.left(baseMatrix, 2, '*');
        expect(result).toEqual([
          ['*', '*', 'a', 'b'],
          ['*', '*', 'c', 'd']
        ]);
      });

      it('handles zero padding', () => {
        const result = Horizontal.add.left(baseMatrix, 0, '*');
        expect(result).toEqual(baseMatrix);
      });
    });

    describe('right', () => {
      it('adds padding to right side', () => {
        const result = Horizontal.add.right(baseMatrix, 2, '*');
        expect(result).toEqual([
          ['a', 'b', '*', '*'],
          ['c', 'd', '*', '*']
        ]);
      });

      it('handles zero padding', () => {
        const result = Horizontal.add.right(baseMatrix, 0, '*');
        expect(result).toEqual(baseMatrix);
      });
    });
  });

  describe('apply', () => {
    const baseMatrix = [
      ['a', 'b'],
      ['c', 'd']
    ];

    it('applies both left and right padding', () => {
      const result = Horizontal.apply(baseMatrix, {
        left: { char: '*', count: 1 },
        right: { char: '#', count: 1 }
      });
      expect(result).toEqual([
        ['*', 'a', 'b', '#'],
        ['*', 'c', 'd', '#']
      ]);
    });

    it('applies only left padding when specified', () => {
      const result = Horizontal.apply(baseMatrix, {
        left: { char: '*', count: 1 },
        right: { char: '#', count: 0 }
      });
      expect(result).toEqual([
        ['*', 'a', 'b'],
        ['*', 'c', 'd']
      ]);
    });

    it('applies only right padding when specified', () => {
      const result = Horizontal.apply(baseMatrix, {
        left: { char: '*', count: 0 },
        right: { char: '#', count: 1 }
      });
      expect(result).toEqual([
        ['a', 'b', '#'],
        ['c', 'd', '#']
      ]);
    });

    it('uses default values when no options provided', () => {
      const result = Horizontal.apply(baseMatrix, {});
      expect(result).toEqual(baseMatrix);
    });
  });
});
