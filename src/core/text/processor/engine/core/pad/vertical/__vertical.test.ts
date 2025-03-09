import { describe, expect, it } from 'vitest';
import * as Vertical from './vertical.js';

describe('Vertical Padding Module', () => {
  const testLines = ['test', 'lines'];
  const defaultOpts = { height: 2, fill: { char: '-', count: 4 } };

  describe('getVerticalPadding', () => {
    it('returns empty array when height is 0 or negative', () => {
      expect(
        Vertical.get({ height: 0, fill: { char: '-', count: 4 } })
      ).toEqual([]);
      expect(
        Vertical.get({ height: -1, fill: { char: '-', count: 4 } })
      ).toEqual([]);
    });

    it('returns array of padding lines with specified height and fill', () => {
      const result = Vertical.get(defaultOpts);
      expect(result).toEqual(['----', '----']);
    });
  });

  describe('padTop', () => {
    it('returns original lines when height is 0', () => {
      expect(
        Vertical.add.top(testLines, {
          height: 0,
          fill: { char: '-', count: 4 }
        })
      ).toEqual(testLines);
    });

    it('adds padding lines to top', () => {
      const result = Vertical.add.top(testLines, defaultOpts);
      expect(result).toEqual(['----', '----', 'test', 'lines']);
    });
  });

  describe('padBottom', () => {
    it('returns original lines when height is 0', () => {
      expect(
        Vertical.add.bottom(testLines, {
          height: 0,
          fill: { char: '-', count: 4 }
        })
      ).toEqual(testLines);
    });

    it('adds padding lines to bottom', () => {
      const result = Vertical.add.bottom(testLines, defaultOpts);
      expect(result).toEqual(['test', 'lines', '----', '----']);
    });
  });

  describe('padVertical', () => {
    it('adds padding to both top and bottom', () => {
      const result = Vertical.apply(testLines, {
        top: defaultOpts,
        bottom: { height: 1, fill: { char: '=', count: 4 } }
      });
      expect(result).toEqual(['----', '----', 'test', 'lines', '====']);
    });
  });

  describe('isVerticalPadding', () => {
    it('validates valid vertical padding options', () => {
      expect(
        Vertical.is.cfg({
          top: { height: 2, fill: { char: '-', count: 4 } },
          bottom: { height: 1, fill: { char: '=', count: 4 } }
        })
      ).toBe(true);
    });

    it('rejects invalid vertical padding options', () => {
      expect(Vertical.is.cfg(null)).toBe(false);
      expect(Vertical.is.cfg({})).toBe(false);
      expect(Vertical.is.cfg({ height: 'invalid' })).toBe(false);
    });
  });
});
