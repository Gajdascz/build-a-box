import { type C2D, type Dims, Chars } from '#srcTypes';
import { Words } from '../../base/base.js';

type Matrix = string[][];
const clone = (matrix: Matrix) => matrix.map((row) => [...row]);
const toString = (matrix: Matrix): string => matrix.map((row) => row.join('')).join('\n');

const create: {
  column: (height: number, char?: string) => Matrix;
  row: (width: number, char?: string) => Matrix;
  from: {
    dimensions: (dimensions: Dims.Dimensions, char?: string) => Matrix;
    lines: (lines: string[] | string) => Matrix;
    text: (text: string, width: number) => Matrix;
  };
} = {
  column: (height, char = Chars.C.space) => {
    if (!Chars.is.char(char)) throw new Error();
    return Array.from({ length: height }, () => [char]);
  },
  row: (width, char = Chars.C.space) => {
    if (!Chars.is.char(char)) throw new Error();
    return [Array.from({ length: width }, () => char)];
  },
  from: {
    dimensions: (dimensions, char = Chars.C.space) => {
      const row = create.row(dimensions.width, char).flat();
      return Array.from({ length: dimensions.height }).map(() => [...row]);
    },
    lines: (lines) => {
      if (lines.length === 0) return [];
      const _lines = Array.isArray(lines) ? lines : lines.split('\n');
      const charArrays = _lines.map((line) => line.split(''));
      const maxLength = Math.max(...charArrays.map((line) => line.length));
      return charArrays.map((line) => {
        const padding = Array.from({ length: maxLength - line.length }, () => Chars.C.space);
        return [...line, ...padding];
      });
    },
    text: (text, width) => {
      const words = Words.get(text);
      const lines: string[] = [];
      while (words.length > 0) {
        const { chunk, remainingWords } = Words.buildChunk(words.join(Chars.C.space), width);
        if (chunk) lines.push(chunk);
        words.length = 0;
        words.push(...remainingWords);
      }
      return create.from.lines(lines);
    }
  }
} as const;
const is = {
  valid: (matrix: unknown): matrix is Matrix =>
    Array.isArray(matrix) && matrix.every((row) => Array.isArray(row) && row.every(Chars.is.char)),
  inBounds: (matrix: Matrix, { x, y }: C2D.Coordinates) => {
    const dimensions = { height: matrix.length, width: matrix[0]?.length ?? 0 };
    if (x === Infinity) x = dimensions.width;
    if (y === Infinity) y = dimensions.height;
    return x >= 0 && x < dimensions.width && y >= 0 && y < dimensions.height;
  },
  row: (matrix: Matrix, y: number) => Array.isArray(matrix[y]) && matrix[y].every(Chars.is.char),
  column: (matrix: Matrix, x: number) => matrix.every((row) => Chars.is.char(row[x]))
} as const;

export { type Matrix, clone, create, is, toString };
