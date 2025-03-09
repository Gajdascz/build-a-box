import { describe, expect, it } from 'vitest';
import * as Edge from './edge.js';

const defaultCfg = { endsStyle: 'none', chars: Edge.Chars.resolve.chars('light') } as const;
describe('edge', () => {
  describe('horizontal path', () => {
    const horizontalCfg = {
      ...defaultCfg,
      orientation: 'horizontal'
    } as const;
    describe('build', () => {
      it('horizontal line matrix', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 4, y: 0 } };
        const edge = Edge.build.direct({
          ...horizontalCfg,
          endsStyle: 'bidirectional',
          path
        });
        expect(edge).toEqual([['<', '─', '>']]);
      });

      it('throws error for invalid direction', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 2 } };
        expect(() => Edge.build.direct({ ...horizontalCfg, path })).toThrow();
      });
    });
    describe('offset', () => {
      describe('0 -> 3', () => {
        it('downward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 3, y: 3 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([
            ['─', '┐'],
            [' ', '│'],
            [' ', '│'],
            [' ', '└']
          ]);
        });
        it('upward', () => {
          const path = { source: { x: 0, y: 3 }, target: { x: 3, y: 0 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([
            [' ', '┌'],
            [' ', '│'],
            [' ', '│'],
            ['─', '┘']
          ]);
        });
      });
      describe('0 -> 2', () => {
        it('downward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 2, y: 2 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([['┐'], ['│'], ['└']]);
        });

        it('upward', () => {
          const path = { source: { x: 0, y: 2 }, target: { x: 2, y: 0 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([['┌'], ['│'], ['┘']]);
        });
      });
      describe('0 -> 1', () => {
        it('downward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 1, y: 1 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([['┐'], ['└']]);
        });
        it('upward', () => {
          const path = { source: { x: 0, y: 1 }, target: { x: 1, y: 0 } };
          const offset = Edge.Offset.get('horizontal', path);
          const edge = Edge.build.offset({ ...horizontalCfg, path, offset });
          expect(edge).toEqual([['┌'], ['┘']]);
        });
      });
    });
  });
  describe('vertical path', () => {
    const verticalCfg = { ...defaultCfg, orientation: 'vertical' } as const;
    describe('direct', () => {
      it('builds vertical line matrix', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 4 } };
        const edge = Edge.build.direct({
          ...verticalCfg,
          endsStyle: 'bidirectional',
          path
        });
        expect(edge).toEqual([['^'], ['│'], ['v']]);
      });

      it('throws error for invalid direction', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 2, y: 0 } };
        expect(() => Edge.build.direct({ ...verticalCfg, path })).toThrow();
      });
    });

    describe('offset', () => {
      describe('3x3', () => {
        it('rightward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 3, y: 3 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([
            ['│', ' ', ' ', ' '],
            ['└', '─', '─', '┐']
          ]);
        });
        it('leftward', () => {
          const path = { source: { x: 3, y: 0 }, target: { x: 0, y: 3 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([
            [' ', ' ', ' ', '│'],
            ['┌', '─', '─', '┘']
          ]);
        });
      });

      describe('2x2 path', () => {
        it('rightward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 2, y: 2 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([['└', '─', '┐']]);
        });

        it('leftward', () => {
          const path = { source: { x: 2, y: 0 }, target: { x: 0, y: 2 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([['┌', '─', '┘']]);
        });
      });

      describe('1x1 path', () => {
        it('rightward', () => {
          const path = { source: { x: 0, y: 0 }, target: { x: 1, y: 1 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([['└', '┐']]);
        });
        it('leftward', () => {
          const path = { source: { x: 1, y: 0 }, target: { x: 0, y: 1 } };
          const offset = Edge.Offset.get('vertical', path);
          const edge = Edge.build.offset({ ...verticalCfg, path, offset });
          expect(edge).toEqual([['┌', '┘']]);
        });
      });
    });
  });
});
