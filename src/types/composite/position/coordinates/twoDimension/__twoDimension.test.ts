import { describe, expect, it } from 'vitest';
import { AXIS, OPPOSITE_AXES, calculate, get, is } from './twoDimension.js';

describe('Base Module', () => {
  const coordinates = {
    origin: { x: 0, y: 0 },
    positive: { x: 10, y: 20 },
    negative: { x: -5, y: -10 },
    mixed: { x: -3, y: 7 }
  };

  describe('calculate', () => {
    describe('sum', () => {
      it('sums multiple coordinates', () => {
        const result = calculate.sum(coordinates.positive, coordinates.negative, coordinates.mixed);
        expect(result).toEqual({ x: 2, y: 17 });
      });

      it('handles empty array', () => {
        const result = calculate.sum();
        expect(result).toEqual({ x: 0, y: 0 });
      });

      it('handles single coordinate', () => {
        const result = calculate.sum(coordinates.positive);
        expect(result).toEqual(coordinates.positive);
      });
    });

    describe('add', () => {
      it('adds two coordinates', () => {
        const result = calculate.add(coordinates.positive, coordinates.negative);
        expect(result).toEqual({ x: 5, y: 10 });
      });
    });

    describe('subtract', () => {
      it('subtracts two coordinates', () => {
        const result = calculate.subtract(coordinates.positive, coordinates.negative);
        expect(result).toEqual({ x: 15, y: 30 });
      });
    });

    describe('delta', () => {
      it('calculates delta between coordinates', () => {
        const result = calculate.delta(coordinates.origin, coordinates.positive);
        expect(result).toEqual({ x: 10, y: 20 });
      });

      it('handles negative deltas', () => {
        const result = calculate.delta(coordinates.positive, coordinates.origin);
        expect(result).toEqual({ x: -10, y: -20 });
      });
    });

    describe('midPoint', () => {
      it('calculates midpoint between coordinates', () => {
        const result = calculate.midPoint(coordinates.origin, coordinates.positive);
        expect(result).toEqual({ x: 5, y: 10 });
      });

      it('handles odd distances', () => {
        const result = calculate.midPoint({ x: 0, y: 0 }, { x: 5, y: 7 });
        expect(result).toEqual({ x: 2, y: 3 });
      });
    });
  });

  describe('is', () => {
    describe('coordinates', () => {
      it('validates valid coordinates', () => {
        expect(is.coordinates(coordinates.positive)).toBe(true);
        expect(is.coordinates(coordinates.negative)).toBe(true);
        expect(is.coordinates(coordinates.origin)).toBe(true);
      });

      it('rejects invalid coordinates', () => {
        expect(is.coordinates({ x: 'invalid', y: 0 })).toBe(false);
        expect(is.coordinates({ x: 0 })).toBe(false);
        expect(is.coordinates(null)).toBe(false);
        expect(is.coordinates(undefined)).toBe(false);
        expect(is.coordinates({})).toBe(false);
      });
    });

    describe('equal', () => {
      it('identifies equal coordinates', () => {
        expect(is.equal(coordinates.origin, { x: 0, y: 0 })).toBe(true);
      });

      it('identifies unequal coordinates', () => {
        expect(is.equal(coordinates.origin, coordinates.positive)).toBe(false);
      });
    });

    describe('axis', () => {
      it('validates valid axes', () => {
        expect(is.axis('x')).toBe(true);
        expect(is.axis('y')).toBe(true);
      });

      it('rejects invalid axes', () => {
        expect(is.axis('z')).toBe(false);
        expect(is.axis('')).toBe(false);
        expect(is.axis(null)).toBe(false);
      });
    });
  });

  describe('get', () => {
    describe('axisPair', () => {
      it('gets horizontal axis pair', () => {
        expect(get.axisPair.horizontal()).toEqual({
          primary: 'x',
          secondary: 'y'
        });
      });

      it('gets vertical axis pair', () => {
        expect(get.axisPair.vertical()).toEqual({
          primary: 'y',
          secondary: 'x'
        });
      });
    });
  });

  describe('constants', () => {
    it('validates AXIS constant', () => {
      expect(AXIS).toEqual({
        horizontal: 'x',
        vertical: 'y'
      });
    });

    it('validates OPPOSITE_AXES constant', () => {
      expect(OPPOSITE_AXES).toEqual({
        horizontal: 'y',
        vertical: 'x'
      });
    });
  });
});
