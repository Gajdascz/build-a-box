import { describe, expect, it } from 'vitest';
import * as Spans from '../../spans/spans.js';
import { generate } from './direct.js';
describe('Direct Path Points', () => {
  describe('generate', () => {
    it('horizontal path', () => {
      const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
      const span = Spans.resolve.direct({
        orientation: 'horizontal',
        direction: 'leftToRight',
        path
      });
      const result = generate({ orientation: 'horizontal', span, path });
      expect(result).toEqual({
        source: [],
        mid: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 }
        ],
        target: []
      });
    });

    it('vertical path', () => {
      const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 5 } };
      const span = Spans.resolve.direct({
        orientation: 'vertical',
        direction: 'topToBottom',
        path
      });
      const result = generate({ orientation: 'vertical', span, path });
      expect(result).toEqual({
        source: [],
        mid: [
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 0, y: 4 }
        ],
        target: []
      });
    });

    it('handles zero length span', () => {
      const span: Spans.DirectSpan = { start: 0, mid: 0, end: 0 };
      const result = generate({
        orientation: 'horizontal',
        span,
        path: { source: { x: 0, y: 0 }, target: { x: 0, y: 0 } }
      });
      expect(result).toEqual({
        source: [],
        mid: [],
        target: []
      });
    });

    describe('error cases', () => {
      it('throws error for offset path with horizontal orientation', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
        const span = Spans.resolve.direct({
          orientation: 'horizontal',
          direction: 'leftToRight',
          path
        });
        expect(() =>
          generate({
            orientation: 'horizontal',
            span,
            path: { ...path, target: { ...path.target, y: 5 } }
          })
        ).toThrow('Path must be direct');
      });

      it('throws error for offset path with vertical orientation', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 5 } };
        const span = Spans.resolve.direct({
          orientation: 'vertical',
          direction: 'topToBottom',
          path
        });

        expect(() =>
          generate({
            orientation: 'vertical',
            span,
            path: { ...path, target: { ...path.target, x: 5 } }
          })
        ).toThrow('Path must be direct');
      });
    });
  });
});
