import { describe, expect, it } from 'vitest';
import * as BoxDiagram from '../box.js';
import { charMap, contents, styles, test, utils } from './utils.js';

const defaultCfg: BoxDiagram.Cfg<'test', 'horizontal'> = {
  box: {
    factory: { namespace: 'test', border: styles.border.light }
  },
  orientation: 'horizontal',
  edge: {
    endsStyle: 'none',
    lineStyle: 'light'
  },
  spacing: 5
} as const;
describe('BoxDiagram: Class', () => {
  describe('initialization', () => {
    it('default configuration', () => {
      const diagram = BoxDiagram.create(defaultCfg);
      expect(diagram).toBeDefined();
      expect(diagram.namespace).toBe('test');
      expect(diagram.orientation).toBe('horizontal');
      expect(diagram.get.boxCount()).toBe(0);
    });
    it('custom configuration', () => {
      const diagram = BoxDiagram.create({
        ...defaultCfg,
        edge: { endsStyle: 'bidirectional' },
        spacing: 'min',
        box: { ...defaultCfg.box, initial: [{ content: ['A'] }, { content: ['B'] }] }
      });
      expect(diagram.namespace).toBe('test');
      expect(diagram.orientation).toBe('horizontal');
      expect(diagram.spacing).toBe(3);
      expect(diagram.get.boxCount()).toBe(2);
    });
  });
  describe('box operations', () => {
    describe('add', () => {
      it('single', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add({ content: ['Test Box'] });
        expect(diagram.get.boxCount()).toBe(1);
        const box = diagram.get.box(0);
        expect(box?.content).toContain('Test Box');
      });
      it('multiple', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add([{ content: ['Box 1'] }, { content: ['Box 2'] }, { content: ['Box 3'] }]);
        expect(diagram.get.boxCount()).toBe(3);
        expect(diagram.get.box(0)?.content).toContain('Box 1');
        expect(diagram.get.box(2)?.content).toContain('Box 3');
      });
      it('empty content', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add({ content: [''] });
        expect(diagram.get.boxCount()).toBe(1);
        const box = diagram.get.box(0);
        expect(box?.content.length).toBe(0);
      });
    });
    describe('remove', () => {
      it('by id', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add([{ content: ['Box 1'] }, { content: ['Box 2'] }]);
        const box = diagram.get.box(0);
        expect(box).toBeDefined();
        if (box) {
          diagram.remove(box.id);
          expect(diagram.get.boxCount()).toBe(1);
          expect(diagram.has.box(box.id)).toBe(false);
        }
      });
      it('handles non-existent', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        expect(() => diagram.remove('non-existent-id')).not.toThrow();
      });
      it('clears all', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add([{ content: ['Box 1'] }, { content: ['Box 2'] }]);
        expect(diagram.get.boxCount()).toBe(2);
        diagram.clear();
        expect(diagram.get.boxCount()).toBe(0);
      });
    });
    describe('move', () => {
      it('to index', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add([{ content: ['Box 1'] }, { content: ['Box 2'] }, { content: ['Box 3'] }]);
        const box = diagram.get.box(0);
        expect(box).toBeDefined();
        if (box) {
          diagram.move.toIndex(box.id, 2);
          expect(diagram.get.boxIndex(box.id)).toBe(2);
          expect(diagram.get.box(2)?.content).toContain('Box 1');
        }
      });
      it('relative to other boxes', () => {
        const diagram = BoxDiagram.create(defaultCfg);
        diagram.add([{ content: ['Box 1'] }, { content: ['Box 2'] }, { content: ['Box 3'] }]);
        const box1 = diagram.get.box(0);
        const box2 = diagram.get.box(1);
        expect(box1 && box2).toBeDefined();
        if (box1 && box2) {
          diagram.move.afterBox(box1.id, box2.id);
          expect(diagram.get.boxIndex(box1.id)).toBe(1);
          expect(diagram.get.box(1)?.content).toContain('Box 1');
        }
      });
    });
  });
});
