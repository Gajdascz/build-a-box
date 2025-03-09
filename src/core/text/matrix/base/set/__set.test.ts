import { describe, expect, it } from 'vitest';
import { create } from '..';
import { set } from './set';

describe('Matrix set', () => {
  describe('column', () => {
    const matrix = create.from.dimensions({ height: 3, width: 3 });

    it('sets entire column to specified character', () => {
      const result = set.column(matrix, 1, 'x');
      expect(result[0][1]).toBe('x');
      expect(result[1][1]).toBe('x');
      expect(result[2][1]).toBe('x');
    });

    it('preserves other columns', () => {
      const result = set.column(matrix, 1, 'x');
      expect(result[0][0]).toBe(' ');
      expect(result[0][2]).toBe(' ');
    });

    it('returns new matrix instance', () => {
      const result = set.column(matrix, 1, 'x');
      expect(result).not.toBe(matrix);
    });

    it('throws error for invalid column index', () => {
      expect(() => set.column(matrix, -1, 'x')).toThrow();
      expect(() => set.column(matrix, 3, 'x')).toThrow();
    });
  });

  describe('row', () => {
    const matrix = create.from.dimensions({ height: 3, width: 3 });

    it('sets entire row to specified character', () => {
      const result = set.row(matrix, 1, 'x');
      expect(result[1]).toEqual(['x', 'x', 'x']);
    });

    it('preserves other rows', () => {
      const result = set.row(matrix, 1, 'x');
      expect(result[0]).toEqual([' ', ' ', ' ']);
      expect(result[2]).toEqual([' ', ' ', ' ']);
    });

    it('returns new matrix instance', () => {
      const result = set.row(matrix, 1, 'x');
      expect(result).not.toBe(matrix);
    });

    it('throws error for invalid row index', () => {
      expect(() => set.row(matrix, -1, 'x')).toThrow();
      expect(() => set.row(matrix, 3, 'x')).toThrow();
    });
  });

  describe('cell', () => {
    const matrix = create.from.dimensions({ height: 3, width: 3 });

    it('sets specific cell to character', () => {
      const result = set.cell(matrix, { coordinates: { x: 1, y: 1 }, char: 'x' });
      expect(result[1][1]).toBe('x');
    });

    it('preserves other cells', () => {
      const result = set.cell(matrix, { coordinates: { x: 1, y: 1 }, char: 'x' });
      expect(result[0][0]).toBe(' ');
      expect(result[0][1]).toBe(' ');
      expect(result[1][0]).toBe(' ');
    });

    it('returns new matrix instance', () => {
      const result = set.cell(matrix, { coordinates: { x: 1, y: 1 }, char: 'x' });
      expect(result).not.toBe(matrix);
    });

    it('throws error for invalid coordinates', () => {
      expect(() => set.cell(matrix, { coordinates: { x: -1, y: 0 }, char: 'x' })).toThrow();
      expect(() => set.cell(matrix, { coordinates: { x: 0, y: -1 }, char: 'x' })).toThrow();
      expect(() => set.cell(matrix, { coordinates: { x: 3, y: 0 }, char: 'x' })).toThrow();
      expect(() => set.cell(matrix, { coordinates: { x: 0, y: 3 }, char: 'x' })).toThrow();
    });
  });
});
