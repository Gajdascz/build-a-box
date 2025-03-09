import { describe, expect, it } from 'vitest';
import * as Dims from './dimensions.js';

describe('Dimensions Module', () => {
  describe('isDimensions', () => {
    it('validates valid dimensions', () => {
      expect(Dims.is({ width: 10, height: 5 })).toBe(true);
      expect(Dims.is({ width: 0, height: 0 })).toBe(true);
    });

    it('rejects invalid dimensions', () => {
      expect(Dims.is({ width: -1, height: 5 })).toBe(false);
      expect(Dims.is({ width: 10, height: -1 })).toBe(false);
      expect(Dims.is(null)).toBe(false);
      expect(Dims.is({})).toBe(false);
    });
  });

  describe('isDimensionsType', () => {
    it('validates valid dimension types', () => {
      expect(Dims.isType('fixed')).toBe(true);
      expect(Dims.isType('dynamic')).toBe(true);
      expect(Dims.isType('dynamicWidth')).toBe(true);
      expect(Dims.isType('dynamicHeight')).toBe(true);
    });

    it('rejects invalid dimension types', () => {
      expect(Dims.isType('invalid')).toBe(false);
      expect(Dims.isType('')).toBe(false);
    });
  });

  describe('isTypedDimensions', () => {
    it('validates typed dimensions', () => {
      expect(Dims.isTyped({ type: 'fixed', width: 10, height: 5 })).toBe(true);
      expect(
        Dims.isTyped({
          type: 'dynamic',
          width: Infinity,
          height: Infinity
        })
      ).toBe(true);
    });

    it('rejects invalid typed dimensions', () => {
      expect(Dims.isTyped({ type: 'fixed', width: Infinity, height: 5 })).toBe(
        false
      );
      expect(Dims.isTyped({ type: 'invalid', width: 10, height: 5 })).toBe(
        false
      );
    });
  });
});
