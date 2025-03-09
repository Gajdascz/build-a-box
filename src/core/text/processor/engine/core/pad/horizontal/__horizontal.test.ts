import { describe, expect, it } from 'vitest';
import * as Horizontal from './horizontal.js';

describe('Horizontal Padding Module', () => {
  const testLines = ['test', 'lines'];
  const defaultFill = { char: '-', count: 2 };
  describe('getHorizontalPadding', () => {
    it('generates padding string of specified count and character', () => {
      expect(Horizontal.get(defaultFill)).toBe('--');
      expect(Horizontal.get({ char: '*', count: 3 })).toBe('***');
    });
    it('returns empty string for zero or negative count', () => {
      expect(Horizontal.get({ ...defaultFill, count: 0 })).toBe('');
      expect(Horizontal.get({ ...defaultFill, count: -1 })).toBe('');
    });
  });
  describe('padLeft', () => {
    it('adds padding to start of each line', () => {
      const result = Horizontal.add.left(testLines, defaultFill);
      expect(result).toEqual(['--test', '--lines']);
    });
    it('handles empty lines array', () => {
      expect(Horizontal.add.left([], defaultFill)).toEqual([]);
    });
  });
  describe('padRight', () => {
    it('adds padding to end of each line', () => {
      const result = Horizontal.add.right(testLines, defaultFill);
      expect(result).toEqual(['test--', 'lines--']);
    });
    it('handles empty lines array', () => {
      expect(Horizontal.add.right([], defaultFill)).toEqual([]);
    });
  });
  describe('apply', () => {
    it('adds padding to both sides of each line', () => {
      const result = Horizontal.apply(testLines, {
        left: { char: '<', count: 1 },
        right: { char: '>', count: 1 }
      });
      expect(result).toEqual(['<test>', '<lines>']);
    });
    it('handles different padding counts on each side', () => {
      const result = Horizontal.apply(testLines, {
        left: { char: '-', count: 2 },
        right: { char: '+', count: 3 }
      });
      expect(result).toEqual(['--test+++', '--lines+++']);
    });
  });
});
