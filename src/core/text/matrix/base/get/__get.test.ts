import { describe, expect, it } from 'vitest';
import { create } from '..';
import { get } from './get';

describe('Matrix get', () => {
  describe('dimensions', () => {
    it('returns correct dimensions for non-empty matrix', () => {
      const matrix = create.from.dimensions({ height: 3, width: 2 });
      expect(get.dimensions(matrix)).toEqual({ height: 3, width: 2 });
    });

    it('returns zero width for empty matrix', () => {
      const matrix: string[][] = [];
      expect(get.dimensions(matrix)).toEqual({ height: 0, width: 0 });
    });

    it('handles matrix with empty rows', () => {
      const matrix = [[]];
      expect(get.dimensions(matrix)).toEqual({ height: 1, width: 0 });
    });
  });

  describe('column', () => {
    const matrix = create.from.dimensions({ height: 2, width: 2 });

    it('returns correct column array', () => {
      expect(get.column(matrix, 0)).toEqual([[' '], [' ']]);
      expect(get.column(matrix, 1)).toEqual([[' '], [' ']]);
    });

    it('throws error for invalid column index', () => {
      expect(() => get.column(matrix, -1)).toThrow();
      expect(() => get.column(matrix, 2)).toThrow();
    });

    it('throws error for non-character content', () => {
      const invalidMatrix = [[null]];
      //@ts-expect-error Testing behavior
      expect(() => get.column(invalidMatrix, 0)).toThrow();
    });
  });

  describe('row', () => {
    const matrix = create.from.dimensions({ height: 2, width: 2 });

    it('returns correct row array', () => {
      expect(get.row(matrix, 0)).toEqual([' ', ' ']);
      expect(get.row(matrix, 1)).toEqual([' ', ' ']);
    });

    it('throws error for invalid row index', () => {
      expect(() => get.row(matrix, -1)).toThrow();
      expect(() => get.row(matrix, 2)).toThrow();
    });
  });

  describe('cell', () => {
    const matrix = create.from.dimensions({ height: 2, width: 2 });

    it('returns correct cell value', () => {
      expect(get.cell(matrix, { x: 0, y: 0 })).toBe(' ');
      expect(get.cell(matrix, { x: 1, y: 1 })).toBe(' ');
    });

    it('throws error for invalid coordinates', () => {
      expect(() => get.cell(matrix, { x: -1, y: 0 })).toThrow();
      expect(() => get.cell(matrix, { x: 0, y: -1 })).toThrow();
      expect(() => get.cell(matrix, { x: 2, y: 0 })).toThrow();
      expect(() => get.cell(matrix, { x: 0, y: 2 })).toThrow();
    });
  });
});
