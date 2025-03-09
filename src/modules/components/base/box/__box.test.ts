import { describe, expect, it } from 'vitest';
import {
  type BoxInstance,
  type BoxState,
  type BuildOpts,
  type Cfg,
  type FactoryInstance,
  createFactory
} from './box.js';

interface TestSnapshotOpts {
  log?: boolean;
  description?: string;
  displayResult?: boolean;
  matrixAs?: 'table' | 'string' | 'json';
}

const borderStyles = ['light', 'heavy', 'double', 'arc'] as const;
type BorderStyle = (typeof borderStyles)[number];

const contents = {
  letters: {
    two: [{ content: 'A' }, { content: 'B' }],
    three: [{ content: 'A' }, { content: 'B' }, { content: 'C' }],
    four: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }],
    five: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }, { content: 'E' }]
  },
  strings: {
    singleLine: [
      { content: 'longer than medium' },
      { content: 'still longer than medium' },
      { content: 'now much longer than medium' },
      { content: 'now much longer than medium plus some more' },
      { content: 'short again' }
    ],
    multiLine: [
      { content: 'Javascript\nPerl' },
      { content: 'C++\nJava\nPython\nRuby\nRust' },
      { content: 'C' },
      { content: 'Data Structure\n and\n Algorithm Analysis\n in C' },
      { content: 'Typescript\nCSS\nHTML' }
    ]
  }
} as const;

const test = {
  snapshot: <O extends string>(
    box: BoxInstance<O>,
    {
      description = '',
      displayResult = true,
      log = true,
      matrixAs = undefined
    }: TestSnapshotOpts = {}
  ) => {
    const string = box.toString();
    const matrix = box.matrix;
    if (log) {
      if (description) console.log(description);
      if (displayResult) console.log(string);
      if (matrixAs && typeof console !== 'undefined') {
        console.log(matrixAs === 'string' ? matrix.map((row) => row.join('')).join('\n') : matrix);
      }
    }
    expect(string).toMatchSnapshot();
    return { matrix, string };
  },
  empty: (matrix: unknown, string: unknown) => {
    expect(matrix).toEqual([]);
    expect(string).toBe('');
  }
} as const;

describe('Box Module', () => {
  const defaultContent = 'test content';
  const namespace = 'test';

  describe('BoxFactory', () => {
    it('creates factory with default options', () => {
      const factory = createFactory({ namespace });
      expect(factory.namespace).toBe(namespace);
      expect(factory.border).toBeDefined();
      expect(factory.text).toBeDefined();
    });

    it('creates factory with custom options', () => {
      const factory = createFactory({ namespace, border: 'heavy' });
      expect(factory.border).toBeDefined();
    });

    describe('build method', () => {
      const factory = createFactory({ namespace });
      it('builds box with default border', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultContent
        });
        expect(box.id).toMatch(new RegExp(`^${namespace}`));
        expect(box.orientation).toBe('horizontal');
        expect(box.content).toEqual([defaultContent]);
      });

      it('builds box with custom border', () => {
        const box = factory.build({
          orientation: 'vertical',
          content: defaultContent,
          border: 'heavy'
        });
        expect(box.orientation).toBe('vertical');
      });

      it('builds box with custom text processor', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultContent,
          dimensions: { type: 'fixed', width: 20, height: 3 }
        });
        expect(box.dimensions.width).toBe(defaultContent.length + 2);
        expect(box.dimensions.height).toBe(3);
      });
    });
  });

  describe('Box', () => {
    const factory = createFactory({ namespace });
    const createTestBox = () =>
      factory.build({ orientation: 'horizontal', content: defaultContent });
    it('gets port coordinates', () => {
      const box = createTestBox();
      const coords = box.getPortCoordinates('top');
      expect(coords).toBeDefined();
      expect(typeof coords.x).toBe('number');
      expect(typeof coords.y).toBe('number');
    });

    it('sets port character', () => {
      const box = createTestBox();
      const originalMatrix = [...box.matrix];
      box.setPort('top', 'cross');
      expect(box.matrix).not.toEqual(originalMatrix);
    });

    it('updates content', () => {
      const box = createTestBox();
      const newContent = 'new content';
      const updatedBox = box.setContent(newContent);
      expect(updatedBox.content).toEqual([newContent]);
      expect(updatedBox.id).toBe(box.id);
    });

    it('resets state', () => {
      const box = createTestBox();
      const originalMatrix = [...box.matrix];
      box.setPort('top', 'cross');
      box.reset();
      expect(box.matrix).toEqual(originalMatrix);
    });

    it('converts to string', () => {
      const box = createTestBox();
      const str = box.toString();
      expect(typeof str).toBe('string');
      expect(str.length).toBeGreaterThan(0);
      expect(str).toContain(defaultContent);
    });

    it('maintains dimensions', () => {
      const box = createTestBox();
      const width = defaultContent.length + 2;
      expect(box.dimensions).toEqual({ width, height: 3 });
    });

    describe('Border Character Manipulation', () => {
      const factory = createFactory({ namespace });
      const defaultText = 'Test Content';

      it('sets individual border characters', () => {
        const box = factory.build({ orientation: 'horizontal', content: defaultText });

        box.setBorderChar('*', 'top', 2);
        box.setBorderChar('#', 'left', 1);
        box.setBorderChar('@', 'right', 1);
        box.setBorderChar('$', 'bottom', 2);

        const result = box.toString();

        test.snapshot(box, {
          description: 'Box with custom border characters',
          displayResult: true
        });

        const lines = result.split('\n');
        expect(lines[0].charAt(2)).toBe('*');
        expect(lines[1].charAt(0)).toBe('#');
        expect(lines[1].charAt(lines[1].length - 1)).toBe('@');
        expect(lines[2].charAt(2)).toBe('$');
      });

      it('throws error when setting border char with more than one character', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultText
        });

        expect(() => box.setBorderChar('@@', 'top', 2)).toThrow(
          'Border char must be a single character'
        );
      });

      it('removes entire border sides', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultText
        });

        const originalString = box.toString();

        box.removeBorderSide('left');
        const noLeftBorder = box.toString();

        test.snapshot(box, {
          description: 'Box with left border removed',
          displayResult: true
        });

        expect(noLeftBorder).not.toBe(originalString);
        expect(noLeftBorder.split('\n').every((line) => line.startsWith(' '))).toBe(true);

        box.removeBorderSide('right');
        test.snapshot(box, {
          description: 'Box with left and right borders removed',
          displayResult: true
        });

        box.removeBorderSide('top');
        test.snapshot(box, {
          description: 'Box with only bottom border remaining',
          displayResult: true
        });

        box.removeBorderSide('bottom');
        test.snapshot(box, {
          description: 'Box with all borders removed',
          displayResult: true
        });
      });

      it('maintains content when border sides are removed', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultText
        });

        box
          .removeBorderSide('top')
          .removeBorderSide('right')
          .removeBorderSide('bottom')
          .removeBorderSide('left');

        expect(box.toString()).toContain(defaultText);
      });

      it('can reset after border modifications', () => {
        const box = factory.build({
          orientation: 'horizontal',
          content: defaultText
        });

        const originalString = box.toString();

        box.setBorderChar('*', 'top', 2).removeBorderSide('left');

        expect(box.toString()).not.toBe(originalString);

        box.reset();
        expect(box.toString()).toBe(originalString);
      });
    });

    describe('Box with Various Contents', () => {
      it('renders single-line content with different lengths', () => {
        const factory = createFactory({ namespace });

        contents.strings.singleLine.forEach((item, index) => {
          const box = factory.build({
            orientation: 'horizontal',
            content: item.content
          });
          test.snapshot(box, {
            description: `Single-line box #${index + 1}: "${item.content}"`,
            displayResult: true
          });
        });
      });

      it('renders multi-line content correctly', () => {
        const factory = createFactory({ namespace });

        contents.strings.multiLine.forEach((item, index) => {
          const box = factory.build({
            orientation: 'horizontal',
            content: item.content
          });
          test.snapshot(box, {
            description: `Multi-line box #${index + 1}`,
            displayResult: true,
            matrixAs: 'string'
          });
        });
      });

      it('renders single character content', () => {
        const factory = createFactory({ namespace });

        contents.letters.five.forEach((item, index) => {
          const box = factory.build({
            orientation: 'horizontal',
            content: item.content
          });
          test.snapshot(box, {
            description: `Single character box #${index + 1}: "${item.content}"`,
            displayResult: true
          });
        });
      });
    });

    describe('Box with Different Border Styles', () => {
      it('renders content with various border styles', () => {
        const styles: BorderStyle[] = ['light', 'heavy', 'double'];

        styles.forEach((style) => {
          const factory = createFactory({ namespace, border: style });
          const box = factory.build({
            orientation: 'horizontal',
            content: defaultContent
          });
          test.snapshot(box, {
            description: `Box with ${style} border style`,
            displayResult: true
          });
        });
      });
    });

    describe('Box Orientation Variations', () => {
      it('renders horizontal boxes', () => {
        const factory = createFactory({ namespace });
        const box = factory.build({
          orientation: 'horizontal',
          content: 'Horizontal Box Content'
        });
        test.snapshot(box, {
          description: 'Horizontal box rendering',
          displayResult: true
        });
      });

      it('renders vertical boxes', () => {
        const factory = createFactory({ namespace });
        const box = factory.build({
          orientation: 'vertical',
          content: 'Vertical\nBox\nContent'
        });
        test.snapshot(box, {
          description: 'Vertical box rendering',
          displayResult: true,
          matrixAs: 'string'
        });
      });
    });
  });

  describe('Factory ID Generation', () => {
    it('generates unique IDs for boxes', () => {
      const factory = createFactory({ namespace });
      const box1 = factory.build({
        orientation: 'horizontal',
        content: 'test'
      });
      const box2 = factory.build({
        orientation: 'horizontal',
        content: 'test'
      });
      expect(box1.id).not.toBe(box2.id);
      expect(box1.id).toMatch(new RegExp(`^${namespace}`));
      expect(box2.id).toMatch(new RegExp(`^${namespace}`));
    });

    it('maintains ID when rebuilding box', () => {
      const factory = createFactory({ namespace });
      const originalBox = factory.build({
        orientation: 'horizontal',
        content: 'test'
      });
      const rebuiltBox = originalBox.setContent('new content');
      expect(rebuiltBox.id).toBe(originalBox.id);
    });
  });
});
