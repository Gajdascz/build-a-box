import { describe, expect, it } from 'vitest';
import * as Lines from './lines.js';

describe('Lines', () => {
  describe('get', () => {
    describe('lines', () => {
      it('splits text into lines by newline', () => {
        const input = 'line1\nline2\nline3';
        const expected = ['line1', 'line2', 'line3'];
        expect(Lines.get.lines(input)).toEqual(expected);
      });
    });

    describe('longestLength', () => {
      it('finds longest line length from string input', () => {
        const input = 'short\nlonger line\nmedium';
        expect(Lines.get.longestLength(input)).toBe(11);
      });

      it('finds longest line length from array input', () => {
        const input = ['short', 'longer line', 'medium'];
        expect(Lines.get.longestLength(input)).toBe(11);
      });
    });
  });

  describe('transform', () => {
    describe('normalize', () => {
      it('normalizes string input with multiple spaces', () => {
        const input = 'multiple   spaces   here';
        expect(Lines.transform.normalize(input)).toEqual([
          'multiple spaces here'
        ]);
      });

      it('normalizes array input with multiple spaces', () => {
        const input = ['multiple   spaces', '  extra  spaces  '];
        expect(Lines.transform.normalize(input)).toEqual([
          'multiple spaces',
          'extra spaces'
        ]);
      });
    });

    describe('replaceChar', () => {
      it('replaces character at specified coordinates', () => {
        const lines = ['hello', 'world'];
        const coordinates = { x: 1, y: 0 };
        const result = Lines.transform.replaceChar(lines, coordinates, 'X');
        expect(result).toEqual(['hXllo', 'world']);
      });

      it('returns original lines when coordinates are out of bounds', () => {
        const lines = ['hello'];
        const coordinates = { x: 0, y: 1 };
        const result = Lines.transform.replaceChar(lines, coordinates, 'X');
        expect(result).toEqual(['hello']);
      });
    });
  });

  describe('create', () => {
    describe('horizontal', () => {
      it('creates horizontal line with head and tail', () => {
        const opts: Lines.CreateOpts = {
          head: '<',
          body: '-',
          tail: '>',
          length: 5
        };
        expect(Lines.create.horizontal(opts)).toBe('<--->');
      });

      it('creates horizontal line without head/tail', () => {
        const opts: Lines.CreateOpts = {
          body: '-',
          length: 3
        };
        expect(Lines.create.horizontal(opts)).toBe('---');
      });
    });

    describe('vertical', () => {
      it('creates vertical line with head and tail', () => {
        const opts: Lines.CreateOpts = {
          head: '^',
          body: '|',
          tail: 'v',
          length: 3
        };
        expect(Lines.create.vertical(opts)).toBe('^\n|\nv');
      });

      it('creates vertical line without head/tail', () => {
        const opts: Lines.CreateOpts = {
          body: '|',
          length: 2
        };
        expect(Lines.create.vertical(opts)).toBe('|\n|');
      });

      it('returns empty string for zero length', () => {
        const opts: Lines.CreateOpts = {
          body: '|',
          length: 0
        };
        expect(Lines.create.vertical(opts)).toBe('');
      });

      it('handles single line height correctly', () => {
        const opts: Lines.CreateOpts = {
          body: '|',
          length: 1
        };
        expect(Lines.create.vertical(opts)).toBe('|');
      });
    });
  });
});
