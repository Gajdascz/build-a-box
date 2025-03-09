import { describe, expect, it } from 'vitest';
import { get, has, resolve } from './offset.js';

describe('offset', () => {
  describe('has', () => {
    it('returns true when path has horizontal offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: 1, y: 1 }
      };
      expect(has(path, 'horizontal')).toBe(true);
    });

    it('returns false when path has no horizontal offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: 1, y: 0 }
      };
      expect(has(path, 'horizontal')).toBe(false);
    });

    it('returns true when path has vertical offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: 1, y: 1 }
      };
      expect(has(path, 'vertical')).toBe(true);
    });

    it('returns false when path has no vertical offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: 0, y: 1 }
      };
      expect(has(path, 'vertical')).toBe(false);
    });
  });

  describe('resolve.direction', () => {
    describe('horizontal', () => {
      it('returns "down" for positive offset', () => {
        expect(resolve.direction.horizontal(1)).toBe('down');
      });

      it('returns "up" for negative offset', () => {
        expect(resolve.direction.horizontal(-1)).toBe('up');
      });
    });

    describe('vertical', () => {
      it('returns "right" for positive offset', () => {
        expect(resolve.direction.vertical(1)).toBe('right');
      });

      it('returns "left" for negative offset', () => {
        expect(resolve.direction.vertical(-1)).toBe('left');
      });
    });
  });

  describe('get', () => {
    it('gets horizontal offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: 2, y: 1 }
      };
      const result = get('horizontal', path);
      expect(result).toEqual({
        distance: 1,
        direction: 'down',
        stepValue: 1,
        orientation: 'vertical',
        axis: 'y'
      });
    });

    it('gets vertical offset', () => {
      const path = {
        source: { x: 0, y: 0 },
        target: { x: -1, y: 2 }
      };
      const result = get('vertical', path);
      expect(result).toEqual({
        distance: 1,
        direction: 'left',
        orientation: 'horizontal',
        stepValue: -1,
        axis: 'x'
      });
    });

    it('handles negative offsets', () => {
      const path = {
        source: { x: 0, y: 2 },
        target: { x: 2, y: 0 }
      };
      const result = get('horizontal', path);
      expect(result).toEqual({
        distance: 2,
        direction: 'up',
        orientation: 'vertical',
        stepValue: -1,
        axis: 'y'
      });
    });
  });
});
