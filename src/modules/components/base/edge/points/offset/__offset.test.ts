import { C2D } from '#srcTypes';
import { describe, expect, it } from 'vitest';
import * as Base from '../../base/base.js';
import * as Spans from '../../spans/spans.js';
import { generate } from './offset.js';

describe('Offset Path Points', () => {
  describe('generate', () => {
    describe('horizontal orientation', () => {
      it('generates upward offset path', () => {
        const path = { source: { x: 0, y: 5 }, target: { x: 5, y: 0 } };
        const span = Spans.resolve.offset({
          path,
          orientation: 'horizontal',
          direction: 'leftToRight'
        });
        const result = generate({ orientation: 'horizontal', span, path });
        expect(result).toEqual({
          source: [
            { x: 1, y: 5 },
            { x: 2, y: 5 },
            { x: 3, y: 5 }
          ],
          mid: [
            { x: 3, y: 4 },
            { x: 3, y: 3 },
            { x: 3, y: 2 },
            { x: 3, y: 1 }
          ],
          target: [
            { x: 3, y: 0 },
            { x: 4, y: 0 }
          ]
        });
      });
      it('generates downward offset path', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } };
        const span = Spans.resolve.offset({
          path,
          orientation: 'horizontal',
          direction: 'leftToRight'
        });
        const result = generate({ orientation: 'horizontal', span, path });
        expect(result).toEqual({
          source: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 }
          ],
          mid: [
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 4 }
          ],
          target: [
            { x: 3, y: 5 },
            { x: 4, y: 5 }
          ]
        });
      });
    });
    describe('vertical orientation', () => {
      it('generates leftward offset path', () => {
        const path = { source: { x: 5, y: 0 }, target: { x: 0, y: 5 } };
        const span = Spans.resolve.offset({
          path,
          orientation: 'vertical',
          direction: 'topToBottom'
        });
        const result = generate({ orientation: 'vertical', span, path });
        expect(result).toEqual({
          source: [
            { x: 5, y: 1 },
            { x: 5, y: 2 },
            { x: 5, y: 3 }
          ],
          mid: [
            { x: 4, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 3 },
            { x: 1, y: 3 }
          ],
          target: [
            { x: 0, y: 3 },
            { x: 0, y: 4 }
          ]
        });
      });
      it('generates rightward offset path', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 5 } };
        const span = Spans.resolve.offset({
          path,
          orientation: 'vertical',
          direction: 'topToBottom'
        });
        const result = generate({ orientation: 'vertical', span, path });
        expect(result).toEqual({
          source: [
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 }
          ],
          mid: [
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 4, y: 3 }
          ],
          target: [
            { x: 5, y: 3 },
            { x: 5, y: 4 }
          ]
        });
      });
    });
    describe('edge cases', () => {
      describe('singleOffset', () => {
        it('handles horizontal single offset path (downward)', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 1, y: 1 } };
          const span = Spans.resolve.offset({
            orientation: 'horizontal',
            direction: 'leftToRight',
            path
          });
          const result = generate({ orientation: 'horizontal', span, path });

          expect(result).toEqual({
            source: [{ x: 1, y: 0 }],
            mid: [],
            target: [{ x: 1, y: 1 }]
          });
        });

        it('handles horizontal single offset path (upward)', () => {
          const path = { source: { x: 0, y: 1 }, target: { x: 1, y: 0 } };
          const span = Spans.resolve.offset({
            orientation: 'horizontal',
            direction: 'leftToRight',
            path
          });
          const result = generate({ orientation: 'horizontal', span, path });

          expect(result).toEqual({
            source: [{ x: 1, y: 1 }],
            mid: [],
            target: [{ x: 1, y: 0 }]
          });
        });

        it('handles vertical single offset path (rightward)', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 1, y: 1 } };
          const span = Spans.resolve.offset({
            orientation: 'vertical',
            direction: 'topToBottom',
            path
          });
          const result = generate({ orientation: 'vertical', span, path });

          expect(result).toEqual({
            source: [{ x: 0, y: 1 }],
            mid: [],
            target: [{ x: 1, y: 1 }]
          });
        });

        it('handles vertical single offset path (leftward)', () => {
          const path = { source: { x: 1, y: 0 }, target: { x: 0, y: 1 } };
          const span = Spans.resolve.offset({
            orientation: 'vertical',
            direction: 'topToBottom',
            path
          });
          const result = generate({ orientation: 'vertical', span, path });

          expect(result).toEqual({
            source: [{ x: 1, y: 1 }],
            mid: [],
            target: [{ x: 0, y: 1 }]
          });
        });
      });
    });
    describe('error cases', () => {
      it('throws error for direct path', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 5, y: 0 } };
        const span = Spans.resolve.direct({
          orientation: 'horizontal',
          path,
          direction: 'leftToRight'
        });
        // @ts-expect-error Testing behavior
        expect(() => generate({ orientation: 'horizontal', span: { ...span }, path })).toThrow(
          'Path must be offset'
        );
      });
    });
  });
});
