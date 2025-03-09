import { describe, expect, it } from 'vitest';
import * as Vertical from './vertical.js';

describe('Vertical', () => {
  describe('is', () => {
    it('validates correct configuration', () => {
      const validConfig = {
        top: { char: ' ', count: 1 },
        bottom: { char: ' ', count: 1 }
      };
      expect(Vertical.is.cfg(validConfig)).toBe(true);
    });

    it('invalidates missing properties', () => {
      const invalidConfig = {
        top: { char: ' ', count: 1 }
      };
      expect(Vertical.is.cfg(invalidConfig)).toBe(false);
    });

    it('invalidates incorrect property types', () => {
      const invalidConfig = {
        top: { char: ' ', count: '1' },
        bottom: { char: ' ', count: 1 }
      };
      expect(Vertical.is.cfg(invalidConfig)).toBe(false);
    });
  });

  describe('add', () => {
    const baseMatrix = [
      ['a', 'b'],
      ['c', 'd']
    ];

    describe('top', () => {
      it('adds padding rows to top', () => {
        const result = Vertical.add.top(baseMatrix, 2, '*');
        expect(result).toEqual([
          ['*', '*'],
          ['*', '*'],
          ['a', 'b'],
          ['c', 'd']
        ]);
      });

      it('uses space character when no char provided', () => {
        const result = Vertical.add.top(baseMatrix, 1);
        expect(result).toEqual([
          [' ', ' '],
          ['a', 'b'],
          ['c', 'd']
        ]);
      });

      it('handles zero padding', () => {
        const result = Vertical.add.top(baseMatrix, 0, '*');
        expect(result).toEqual(baseMatrix);
      });
    });

    describe('bottom', () => {
      it('adds padding rows to bottom', () => {
        const result = Vertical.add.bottom(baseMatrix, 2, '*');
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
          ['*', '*'],
          ['*', '*']
        ]);
      });

      it('uses space character when no char provided', () => {
        const result = Vertical.add.bottom(baseMatrix, 1);
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
          [' ', ' ']
        ]);
      });

      it('handles zero padding', () => {
        const result = Vertical.add.bottom(baseMatrix, 0, '*');
        expect(result).toEqual(baseMatrix);
      });
    });
  });

  describe('apply', () => {
    const baseMatrix = [
      ['a', 'b'],
      ['c', 'd']
    ];

    it('applies both top and bottom padding', () => {
      const result = Vertical.apply(baseMatrix, {
        top: { char: '*', count: 1 },
        bottom: { char: '#', count: 1 }
      });
      expect(result).toEqual([
        ['*', '*'],
        ['a', 'b'],
        ['c', 'd'],
        ['#', '#']
      ]);
    });

    it('applies only top padding when specified', () => {
      const result = Vertical.apply(baseMatrix, {
        top: { char: '*', count: 1 }
      });
      expect(result).toEqual([
        ['*', '*'],
        ['a', 'b'],
        ['c', 'd']
      ]);
    });

    it('applies only bottom padding when specified', () => {
      const result = Vertical.apply(baseMatrix, {
        bottom: { char: '#', count: 1 }
      });
      expect(result).toEqual([
        ['a', 'b'],
        ['c', 'd'],
        ['#', '#']
      ]);
    });

    it('uses default values when no options provided', () => {
      const result = Vertical.apply(baseMatrix);
      expect(result).toEqual(baseMatrix);
    });
  });
});
