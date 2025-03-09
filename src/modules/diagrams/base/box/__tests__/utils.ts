import { Text } from '#core';
import { type Border, type Position, Obj } from '#srcTypes';
import { describe, expect, it } from 'vitest';
import type { Edge } from '../../../../components/components.js';
import * as BoxDiagram from '../box.js';

const styles: {
  edgeEnds: Record<Edge.Chars.EndsStyle, Edge.Chars.EndsStyle>;
  edgeLine: Record<Edge.Chars.LineStyle, Edge.Chars.LineStyle>;
  border: Record<Border.Style, Border.Style>;
} = {
  edgeEnds: { bidirectional: 'bidirectional', none: 'none', directed: 'directed' },
  edgeLine: { light: 'light', heavy: 'heavy', arc: 'arc', double: 'double' },
  border: { light: 'light', heavy: 'heavy', arc: 'arc', double: 'double' }
} as const;
const charMap = {
  lines: { horizontal: '─', vertical: '│' },
  angles: { upRight: '└', leftUp: '┘', downRight: '┌', leftDown: '┐' },
  corners: { bottomLeft: '└', bottomRight: '┘', topLeft: '┌', topRight: '┐' },
  arrowHeads: { down: 'v', left: '<', right: '>', up: '^' },
  directionType: { closed: 'x', outward: '>', inward: '<', cross: '+' }
} as const;
const contents = {
  letters: {
    two: [{ content: ['A'] }, { content: ['B'] }],
    three: [{ content: ['A'] }, { content: ['B'] }, { content: ['C'] }],
    four: [{ content: ['A'] }, { content: ['B'] }, { content: ['C'] }, { content: ['D'] }],
    five: [
      { content: ['A'] },
      { content: ['B'] },
      { content: ['C'] },
      { content: ['D'] },
      { content: ['E'] }
    ]
  },
  strings: {
    singleLine: [
      { content: ['longer than medium'] },
      { content: ['still longer than medium'] },
      { content: ['now much longer than medium'] },
      { content: ['now much longer than medium plus some more'] },
      { content: ['short again'] }
    ],
    multiLine: [
      { content: ['Javascript', 'Perl'] },
      { content: ['C++', 'Java', 'Python', 'Rust', 'Ruby'] },
      { content: ['C'] },
      { content: ['Data Structure', 'and', 'Algorithm Analysis', 'in C'] },
      { content: ['Typescript', 'CSS', 'HTML'] },
      { content: ['=============================================================='] }
    ],
    multiLine2: [
      { content: ['lorem'] },
      { content: ['words words words', '12', 'r', 'AAAAAAAAAA'] },
      { content: ['test', 'test', 'test'] },
      { content: ['a sentence', '()=>function'] },
      { content: ['()', '=>', '()', '=>', '()=>string'] }
    ]
  }
};

type ContentsType = keyof typeof contents;
type LettersContentsType = keyof typeof contents.letters;
type StringsContentsType = keyof typeof contents.strings;

const utils = {
  logMatrixAs: {
    table: (matrix: string[][]) => {
      console.table(matrix);
    },
    json: (matrix: string[][]) => {
      console.log(JSON.stringify(matrix, null, 2));
    },
    string: (matrix: string[][]) => {
      console.log(Text.Matrix.toString(matrix));
    }
  },
  mergeCfg: <O extends Position.Orientation>(
    defaultCfg: BoxDiagram.Cfg<'test', O>,
    overrides: Omit<Obj.NestedPartial<BoxDiagram.Cfg<'test', O>>, 'orientation'> = {}
  ) => Obj.merge<BoxDiagram.Cfg<'test', O>>(defaultCfg, overrides)
} as const;

interface TestSnapshotOpts {
  log?: boolean;
  description?: string;
  displayResult?: boolean;
  matrixAs?: 'table' | 'string' | 'json';
}
const test = {
  snapshot: <O extends Position.Orientation>(
    diagram: BoxDiagram.Instance<'test', O>,
    {
      description = '',
      displayResult = true,
      log = true,
      matrixAs = undefined
    }: TestSnapshotOpts = {}
  ) => {
    const { matrix, toString } = diagram.build();
    const string = toString();
    if (log) {
      if (description) console.log(description);
      if (displayResult) console.log(string);
      if (matrixAs) utils.logMatrixAs[matrixAs](matrix);
    }
    expect(string).toMatchSnapshot();
    return { matrix, string };
  },
  empty: <O extends Position.Orientation>(cfg: BoxDiagram.Cfg<'test', O>) => {
    const diagram = BoxDiagram.create(cfg);
    const { matrix, toString } = diagram.build();
    expect(matrix).toEqual([]);
    expect(toString()).toBe('');
  },
  spacing: <O extends Position.Orientation>(
    cfg: BoxDiagram.Cfg<'test', O>,
    contents: { content: string | string[] }[]
  ) => {
    [1, 2, 3, 5].forEach((spacing) => {
      it(`spacing ${spacing}`, () => {
        const diagram = BoxDiagram.create({ ...cfg, spacing });
        diagram.add([...contents]);
        test.snapshot(diagram, { description: `spacing ${spacing}` });
      });
    });
  },
  endsStyles: <O extends Position.Orientation>(
    cfg: BoxDiagram.Cfg<'test', O>,
    contents: { content: string | string[] }[]
  ) => {
    Object.entries(styles.edgeEnds).forEach(([endsStyle, value]) => {
      it(`endsStyle: ${endsStyle}`, () => {
        const diagram = BoxDiagram.create({ ...cfg, edge: { ...cfg.edge, endsStyle: value } });
        diagram.add([...contents]);
        test.snapshot(diagram, { description: `endsStyle: ${endsStyle}` });
      });
    });
  }
};
const execSuite = <O extends Position.Orientation>(orientation: O) => {
  const defaultCfg: BoxDiagram.Cfg<'test', O> = {
    box: { factory: { namespace: 'test', border: styles.border.light } },
    orientation,
    spacing: 3
  } as const;
  describe(`BoxDiagram: Render[${orientation}]`, () => {
    it('empty', () => {
      test.empty(defaultCfg);
    });
    it('single', () => {
      const diagram = BoxDiagram.create(defaultCfg);
      diagram.add({ content: ['single'] });
      expect(diagram.build().toString()).toMatchSnapshot();
    });
    describe('direct', () => {
      describe('Letter Pairs', () => {
        test.spacing(defaultCfg, contents.letters.two);
        test.endsStyles(defaultCfg, contents.letters.two);
      });
    });
    it('multiple', () => {
      const diagram = BoxDiagram.create(defaultCfg);
      diagram.add([...contents.strings.singleLine]);
      test.snapshot(diagram, { description: 'multiple' });
    });
  });
  describe('offset', () => {
    describe(`${contents.strings.multiLine.length} boxes`, () => {
      test.spacing(defaultCfg, contents.strings.multiLine);
      test.endsStyles(defaultCfg, contents.strings.multiLine);
    });
    describe(`${contents.strings.multiLine.length + contents.strings.multiLine2.length} boxes`, () => {
      test.spacing(defaultCfg, [...contents.strings.multiLine, ...contents.strings.multiLine2]);
    });
    test.endsStyles(defaultCfg, [...contents.strings.multiLine, ...contents.strings.multiLine2]);
  });
};
export { type TestSnapshotOpts, charMap, contents, execSuite, styles, test, utils };
export type { ContentsType, LettersContentsType, StringsContentsType };
