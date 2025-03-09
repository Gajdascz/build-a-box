import { describe, expect, it } from 'vitest';

import * as Spans from './spans.js';

describe('Spans', () => {
  describe('create', () => {
    describe('direct', () => {
      it('horizontal paths', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
        const horizontalSpan = Spans.resolve.direct({
          direction: 'leftToRight',
          orientation: 'horizontal',
          path
        });
        expect(horizontalSpan).toEqual({ start: 0, mid: 5, end: 0 });
      });

      it('vertical paths', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 5 } };
        const verticalSpan = Spans.resolve.direct({
          direction: 'topToBottom',
          orientation: 'vertical',
          path
        });
        expect(verticalSpan).toEqual({ start: 0, mid: 5, end: 0 });
      });
    });

    describe('offset', () => {
      it('should calculate correct spans for horizontal offset paths', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } };
        const span = Spans.resolve.offset({
          path,
          orientation: 'horizontal',
          direction: 'leftToRight'
        });
        expect(span.start).toEqual(3);
        expect(span.mid).toEqual(5);
        expect(span.end).toEqual(2);
      });

      it('should calculate correct spans for vertical offset paths', () => {
        const span = Spans.resolve.offset({
          direction: 'topToBottom',
          orientation: 'vertical',
          path: { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } }
        });
        expect(span.start).toEqual(3);
        expect(span.mid).toEqual(5);
        expect(span.end).toEqual(2);
      });
    });
  });

  describe('resolve', () => {
    describe('direct', () => {
      it('should resolve direct path', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
        const span = Spans.resolve.direct({
          orientation: 'horizontal',
          direction: 'leftToRight',
          path
        });

        expect(span).toEqual({ start: 0, mid: 5, end: 0 });
      });

      it('should throw error if path is not direct', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } };
        expect(() =>
          Spans.resolve.direct({ orientation: 'horizontal', direction: 'leftToRight', path })
        ).toThrow('Path must be direct');
      });
    });

    describe('offset', () => {
      it('should resolve offset path', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } };

        const span = Spans.resolve.offset({
          orientation: 'horizontal',
          direction: 'leftToRight',
          path
        });

        expect(span).toHaveProperty('offset');
        expect(span.start).toEqual(3);
        expect(span.mid).toEqual(5);
        expect(span.end).toEqual(2);
      });

      it('should throw error if path is direct', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
        expect(() =>
          Spans.resolve.offset({ orientation: 'horizontal', direction: 'leftToRight', path })
        ).toThrow('Path must be offset');
      });
    });
  });
});
