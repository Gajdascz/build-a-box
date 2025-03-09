import { describe, expect, it } from 'vitest';
import { type EdgeChars, is, resolve } from './chars.js';
describe('chars', () => {
  const chars = resolve.chars('light');
  describe('is', () => {
    describe('lineStyle', () => {
      it('returns true for valid line styles', () => {
        expect(is.lineStyle('light')).toBe(true);
        expect(is.lineStyle('heavy')).toBe(true);
        expect(is.lineStyle('double')).toBe(true);
        expect(is.lineStyle('arc')).toBe(true);

        expect(is.lineStyle('invalid')).toBe(false);
        expect(is.lineStyle(123)).toBe(false);
        expect(is.lineStyle(null)).toBe(false);
        expect(is.lineStyle(undefined)).toBe(false);
      });
    });

    describe('endsStyle', () => {
      it('returns true for valid ends styles', () => {
        expect(is.endsStyle('none')).toBe(true);
        expect(is.endsStyle('directed')).toBe(true);
        expect(is.endsStyle('bidirectional')).toBe(true);

        expect(is.endsStyle('invalid')).toBe(false);
        expect(is.endsStyle(123)).toBe(false);
        expect(is.endsStyle(null)).toBe(false);
        expect(is.endsStyle(undefined)).toBe(false);
      });
    });

    describe('validLength', () => {
      it('validates lengths based on style minimums', () => {
        expect(is.validLength('none', 0)).toBe(true);
        expect(is.validLength('none', 1)).toBe(true);

        expect(is.validLength('directed', 1)).toBe(false);
        expect(is.validLength('directed', 2)).toBe(true);
        expect(is.validLength('directed', 3)).toBe(true);

        expect(is.validLength('bidirectional', 2)).toBe(false);
        expect(is.validLength('bidirectional', 3)).toBe(true);
        expect(is.validLength('bidirectional', 4)).toBe(true);
      });
    });
  });
  describe('resolve', () => {
    describe('segmentChars', () => {
      it('resolves horizontal characters with directed ends style', () => {
        const segment = resolve.segmentChars(chars, 'directed', 'horizontal');
        expect(segment).toEqual({
          head: '',
          body: chars.lines.horizontal,
          tail: chars.arrowHeads.right
        });
      });

      it('resolves horizontal characters with bidirectional ends style', () => {
        const segment = resolve.segmentChars(chars, 'bidirectional', 'horizontal');
        expect(segment).toEqual({
          head: chars.arrowHeads.left,
          body: chars.lines.horizontal,
          tail: chars.arrowHeads.right
        });
      });

      it('resolves vertical characters with different ends styles', () => {
        const segment = resolve.segmentChars(chars, 'none', 'vertical');
        expect(segment).toEqual({ head: '', body: chars.lines.vertical, tail: '' });
        const directedResult = resolve.segmentChars(chars, 'directed', 'vertical');
        expect(directedResult).toEqual({
          head: '',
          body: chars.lines.vertical,
          tail: 'v'
        });

        const bidirectionalResult = resolve.segmentChars(chars, 'bidirectional', 'vertical');
        expect(bidirectionalResult).toEqual({
          head: '^',
          body: chars.lines.vertical,
          tail: 'v'
        });
      });
    });
    describe('offset.angles', () => {
      const mockAngles = {
        downRight: '┌',
        leftDown: '┐',
        upRight: '└',
        leftUp: '┘'
      };
      describe('vertical orientation', () => {
        it('returns correct angles for left direction', () => {
          const result = resolve.offset.angles('vertical', 'left', mockAngles);
          expect(result).toEqual({ source: '┘', target: '┌' });
        });

        it('returns correct angles for right direction', () => {
          const result = resolve.offset.angles('vertical', 'right', mockAngles);
          expect(result).toEqual({ source: '└', target: '┐' });
        });

        it('handles up direction (even though it should not be used in practice)', () => {
          const result = resolve.offset.angles('vertical', 'up', mockAngles);
          expect(result).toBeDefined();
        });

        it('handles down direction (even though it should not be used in practice)', () => {
          const result = resolve.offset.angles('vertical', 'down', mockAngles);
          expect(result).toBeDefined();
        });
      });
      describe('horizontal orientation', () => {
        it('returns correct angles for up direction', () => {
          const result = resolve.offset.angles('horizontal', 'up', mockAngles);
          expect(result).toEqual({ source: '┘', target: '┌' });
        });
        it('returns correct angles for down direction', () => {
          const result = resolve.offset.angles('horizontal', 'down', mockAngles);
          expect(result).toEqual({ source: '┐', target: '└' });
        });
      });
    });
    describe('offset.segment', () => {
      const mockChars: EdgeChars = {
        lines: { horizontal: '─', vertical: '│' },
        angles: { downRight: '┌', leftDown: '┐', upRight: '└', leftUp: '┘' },
        arrowHeads: { right: '>', left: '<', up: '^', down: 'v' }
      } as const;
      const mockOffset = {
        direction: 'left',
        distance: 1,
        stepValue: -1,
        axis: 'x',
        orientation: 'horizontal'
      } as const;
      describe('source', () => {
        it('returns empty segments when length is 0', () => {
          const result = resolve.offset.segment.source({
            chars: mockChars,
            length: 0,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '', body: '', tail: '' });
        });

        it('returns segment with source angle as head when length is 1', () => {
          const result = resolve.offset.segment.source({
            chars: mockChars,
            length: 1,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '┘', body: '', tail: '' });
        });

        it('returns segment with normal head, body, and source angle as tail when length > 1', () => {
          const result = resolve.offset.segment.source({
            chars: mockChars,
            length: 3,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '', body: '│', tail: '┘' });
        });

        it('uses correct angles for different orientation and direction combinations', () => {
          const upResult = resolve.offset.segment.source({
            chars: mockChars,
            length: 1,
            offset: { ...mockOffset, direction: 'up' },
            orientation: 'horizontal'
          });

          expect(upResult.head).toBe('┘');

          const downResult = resolve.offset.segment.source({
            chars: mockChars,
            length: 1,
            offset: { ...mockOffset, direction: 'down' },
            orientation: 'horizontal'
          });

          expect(downResult.head).toBe('┐');
        });
      });

      describe('mid', () => {
        it('returns empty segments when length is 0', () => {
          const result = resolve.offset.segment.mid({
            chars: mockChars,
            length: 0,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '', body: '', tail: '' });
        });

        it('returns segment with empty head, line as body, and empty tail when length > 1', () => {
          const result = resolve.offset.segment.mid({
            chars: mockChars,
            length: 2,
            offset: { ...mockOffset, orientation: 'horizontal' },
            orientation: 'vertical'
          });
          expect(result).toEqual({ head: '', body: '─', tail: '' });
        });
      });
      describe('target', () => {
        it('returns empty segments when length is 0', () => {
          const result = resolve.offset.segment.target({
            chars: mockChars,
            length: 0,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '', body: '', tail: '' });
        });
        it('returns segment with target angle as head when length is 1', () => {
          const result = resolve.offset.segment.target({
            chars: mockChars,
            length: 1,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '┌', body: '', tail: '' });
        });
        it('returns segment with normal head, body, and target angle as tail when length > 1', () => {
          const result = resolve.offset.segment.target({
            chars: mockChars,
            length: 3,
            offset: mockOffset,
            orientation: 'vertical'
          });

          expect(result).toEqual({ head: '┌', body: '│', tail: '' });
        });
        it('uses correct angles for different orientation and direction combinations', () => {
          const upResult = resolve.offset.segment.target({
            chars: mockChars,
            length: 1,
            offset: { ...mockOffset, direction: 'up' },
            orientation: 'horizontal'
          });

          expect(upResult.head).toBe('┌');

          const downResult = resolve.offset.segment.target({
            chars: mockChars,
            length: 1,
            offset: { ...mockOffset, direction: 'down' },
            orientation: 'horizontal'
          });

          expect(downResult.head).toBe('└');
        });
      });
    });
    describe('offset.pathSegmentsChars', () => {
      const mockChars: EdgeChars = {
        lines: { horizontal: '─', vertical: '│' },
        angles: { downRight: '┌', leftDown: '┐', upRight: '└', leftUp: '┘' },
        arrowHeads: { right: '>', left: '<', up: '^', down: 'v' }
      } as const;
      const mockOffset = {
        direction: 'left',
        distance: 1,
        stepValue: -1,
        axis: 'x',
        orientation: 'horizontal'
      } as const;
      it('returns segments for each part of the path', () => {
        const result = resolve.offset.pathSegmentsChars({
          chars: mockChars,
          orientation: 'vertical',
          lengths: { source: 2, mid: 3, target: 2 },
          offset: { ...mockOffset },
          endsStyle: 'none'
        });
        expect(result.source).toEqual({ head: '', body: '│', tail: '┘' });
        expect(result.mid).toEqual({ head: '', body: '─', tail: '' });
        expect(result.target).toEqual({ head: '┌', body: '│', tail: '' });
      });
      it('returns segments for minimal valid length path with "none" style', () => {
        const result = resolve.offset.pathSegmentsChars({
          chars: mockChars,
          orientation: 'vertical',
          lengths: { source: 0, mid: 0, target: 0 },
          offset: mockOffset,
          endsStyle: 'none'
        });

        expect(result.source).toEqual({ head: '', body: '', tail: '' });
        expect(result.mid).toEqual({ head: '', body: '', tail: '' });
        expect(result.target).toEqual({ head: '', body: '', tail: '' });
      });
      it('returns segments for minimal valid length path with "directed" style', () => {
        const result = resolve.offset.pathSegmentsChars({
          chars: mockChars,
          orientation: 'vertical',
          lengths: { source: 1, mid: 0, target: 1 },
          offset: mockOffset,
          endsStyle: 'directed'
        });

        expect(result.source).toEqual({ head: '┘', body: '', tail: '' });
        expect(result.mid).toEqual({ head: '', body: '', tail: '' });
        expect(result.target).toEqual({ head: '┌', body: '', tail: '' });
      });
      it('returns segments for minimal valid length path with "bidirectional" style', () => {
        const result = resolve.offset.pathSegmentsChars({
          chars: mockChars,
          orientation: 'vertical',
          lengths: { source: 1, mid: 1, target: 1 },
          offset: mockOffset,
          endsStyle: 'bidirectional'
        });

        expect(result.source).toEqual({ head: '┘', body: '', tail: '' });
        expect(result.mid).toEqual({ head: '', body: '─', tail: '' });
        expect(result.target).toEqual({ head: '┌', body: '', tail: '' });
      });

      it('throws error when total length is less than minimum for the endsStyle', () => {
        // For "bidirectional" style, minimum length is 3
        expect(() => {
          resolve.offset.pathSegmentsChars({
            chars: mockChars,
            orientation: 'vertical',
            lengths: { source: 1, mid: 0, target: 1 }, // Total length 2, minimum is 3
            offset: mockOffset,
            endsStyle: 'bidirectional'
          });
        }).toThrowError();

        // For "directed" style, minimum length is 2
        expect(() => {
          resolve.offset.pathSegmentsChars({
            chars: mockChars,
            orientation: 'vertical',
            lengths: { source: 0, mid: 0, target: 1 }, // Total length 1, minimum is 2
            offset: mockOffset,
            endsStyle: 'directed'
          });
        }).toThrowError();
      });
    });
  });
});
