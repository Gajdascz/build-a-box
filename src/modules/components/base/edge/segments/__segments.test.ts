import { describe, expect, it } from 'vitest';
import * as Base from '../base/base.js';
import * as Points from '../points/points.js';
import * as Spans from '../spans/spans.js';
import { type Direct, type Offset, calculate, create } from './segments.js';

describe('segments', () => {
  describe('resolve', () => {
    it('resolves empty segment when no coordinates exist', () => {
      const points: Points.Direct.DirectPoints = {
        source: [],
        mid: [],
        target: []
      };
      const result = create.segment(points.source, { head: '<', body: '-', tail: '>' });
      expect(result).toEqual([]);
    });
    it('resolves segment with only head when single coordinate', () => {
      const points = { source: [{ x: 0, y: 0 }], mid: [], target: [] };
      const result = create.segment(points.source, { head: '<', body: '-', tail: '>' });
      expect(result).toEqual([{ coordinates: { x: 0, y: 0 }, char: '<' }]);
    });
    it('resolves empty segment when two coordinates are equal', () => {
      const points = {
        source: [],
        mid: [],
        target: []
      };
      const result = create.segment(points.source, { head: '<', body: '-', tail: '>' });
      expect(result).toEqual([]);
    });
    it('resolves full segment with head, body, and tail', () => {
      const path = { source: { x: 0, y: 0 }, target: { x: 4, y: 0 } };
      const span = Spans.resolve.direct({
        orientation: 'horizontal',
        direction: 'leftToRight',
        path
      });
      const points = Points.generate.direct({ orientation: 'horizontal', path, span });
      const result = create.segment(points.mid, { head: '<', body: '-', tail: '>' });
      expect(result).toEqual([
        { coordinates: { x: 1, y: 0 }, char: '<' },
        { coordinates: { x: 2, y: 0 }, char: '-' },
        { coordinates: { x: 3, y: 0 }, char: '>' }
      ]);
    });
  });
  describe('create', () => {
    describe('direct', () => {
      it('direct path segments', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 4, y: 0 } };
        const span = Spans.resolve.direct({
          orientation: 'horizontal',
          direction: 'leftToRight',
          path
        });
        const points = Points.generate.direct({
          orientation: 'horizontal',
          path,
          span
        });
        const chars = Base.Chars.resolve.chars('light');
        const segmentChars = Base.Chars.resolve.segmentChars(chars, 'none', 'horizontal');
        const result = create.direct(segmentChars, points);

        expect(result.source).toBeUndefined();
        expect(result.mid).toHaveLength(3);
        expect(result.target).toBeUndefined();
      });
    });
    describe('offset', () => {
      it('resolves offset path segments', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 2, y: 2 } };
        const offset = Base.Offset.get('horizontal', path);
        const span = Spans.resolve.offset({
          orientation: 'horizontal',
          direction: 'leftToRight',
          path
        });
        const points = Points.generate.offset({ orientation: 'horizontal', span, path });
        const chars = Base.Chars.resolve.chars('light');
        const segmentsChars = Base.Chars.resolve.offset.pathSegmentsChars({
          orientation: 'horizontal',
          chars,
          endsStyle: 'bidirectional',
          lengths: { source: span.start, target: span.end, mid: span.mid },
          offset
        });
        const result = create.offset(segmentsChars, points);
        expect(result.source[0].char).toBe('┐');
        expect(result.mid[0].char).toBe('│');
        expect(result.target[0].char).toBe('└');
      });
    });
  });
  describe('calculate', () => {
    describe('dimensions', () => {
      describe('direct', () => {
        it('calculates dimensions for single point', () => {
          const segments: Direct = {
            source: undefined,
            mid: [{ coordinates: { x: 0, y: 0 }, char: '-' }],
            target: undefined
          };

          const dims = calculate.dimensions.direct(segments, 'horizontal');
          expect(dims).toEqual({ width: 1, height: 1 });
        });

        it('calculates dimensions for horizontal line', () => {
          const segments: Direct = {
            source: undefined,
            mid: [
              { coordinates: { x: 0, y: 0 }, char: '<' },
              { coordinates: { x: 1, y: 0 }, char: '-' },
              { coordinates: { x: 2, y: 0 }, char: '>' }
            ],
            target: undefined
          };

          const dims = calculate.dimensions.direct(segments, 'horizontal');
          expect(dims).toEqual({ width: 3, height: 1 });
        });

        it('calculates dimensions for vertical line', () => {
          const segments: Direct = {
            source: undefined,
            mid: [
              { coordinates: { x: 0, y: 0 }, char: '^' },
              { coordinates: { x: 0, y: 1 }, char: '|' },
              { coordinates: { x: 0, y: 2 }, char: 'v' }
            ],
            target: undefined
          };

          const dims = calculate.dimensions.direct(segments, 'vertical');
          expect(dims).toEqual({ width: 1, height: 3 });
        });
      });
      describe('offset', () => {
        it('calculates dimensions for horizontal path with down offset', () => {
          const segments: Offset = {
            source: [
              { coordinates: { x: 0, y: 0 }, char: '-' },
              { coordinates: { x: 1, y: 0 }, char: '┐' }
            ],
            mid: [
              { coordinates: { x: 1, y: 1 }, char: '│' },
              { coordinates: { x: 1, y: 2 }, char: '└' }
            ],
            target: [
              { coordinates: { x: 2, y: 2 }, char: '-' },
              { coordinates: { x: 3, y: 2 }, char: '-' }
            ]
          };

          const dims = calculate.dimensions.offset(segments);
          expect(dims).toEqual({ width: 4, height: 3 });
        });

        it('calculates dimensions for vertical path with right offset', () => {
          const segments: Offset = {
            source: [
              { coordinates: { x: 0, y: 0 }, char: '│' },
              { coordinates: { x: 0, y: 1 }, char: '┘' }
            ],
            mid: [
              { coordinates: { x: 1, y: 1 }, char: '-' },
              { coordinates: { x: 2, y: 1 }, char: '┌' }
            ],
            target: [
              { coordinates: { x: 2, y: 2 }, char: '│' },
              { coordinates: { x: 2, y: 3 }, char: '│' }
            ]
          };

          const dims = calculate.dimensions.offset(segments);
          expect(dims).toEqual({ width: 3, height: 4 });
        });

        it('handles empty segments', () => {
          const segments: Offset = {
            source: [],
            mid: [],
            target: []
          };

          const dims = calculate.dimensions.offset(segments);
          expect(dims).toEqual({ width: 0, height: 0 });
        });

        it('handles negative coordinates', () => {
          const segments: Offset = {
            source: [{ coordinates: { x: -1, y: -1 }, char: '┌' }],
            mid: [{ coordinates: { x: 0, y: 0 }, char: '|' }],
            target: [{ coordinates: { x: 1, y: 1 }, char: '┘' }]
          };

          const dims = calculate.dimensions.offset(segments);
          expect(dims).toEqual({ width: 2, height: 2 });
        });
      });
    });
  });
});
