import { type C2D, Chars } from '#srcTypes';
import * as Words from '../words/words.js';

type Lines = string[];
const get = {
  lines: (text: string): Lines => text.split('\n'),
  longestLength: (text: string | string[]): number =>
    (Array.isArray(text) ? text : get.lines(text)).reduce(
      (acc, curr) => Math.max(acc, curr.length),
      0
    )
} as const;

const transform: {
  normalize: (text: string | string[]) => Lines;
  replaceChar: (
    lines: string[],
    coordinates: C2D.Coordinates,
    char: string
  ) => Lines;
} = {
  normalize: (text) => {
    const lines = Array.isArray(text) ? text : get.lines(text);
    return lines
      .map((str) => Words.get(str))
      .map((line) => line.join(Chars.C.space));
  },
  replaceChar: (lines, coordinates, char) => {
    const newLines = [...lines];
    const targetLine = newLines[coordinates.y];
    if (!targetLine) return lines;
    newLines[coordinates.y] =
      targetLine.substring(0, coordinates.x) +
      char +
      targetLine.substring(coordinates.x + 1);
    return newLines;
  }
} as const;

interface CreateOpts {
  head?: string;
  body: string;
  tail?: string;
  length: number;
}
const create: {
  horizontal: (opts: CreateOpts) => string;
  vertical: (opts: CreateOpts) => string;
} = {
  horizontal: ({ body, length, head = '', tail = '' }) =>
    `${head}${body.repeat(Math.abs(length - (head.length + tail.length)))}${tail}`,
  vertical: ({ body, length, head = '', tail = '' }) => {
    if (length <= 0) return '';
    const resolvedHead = head ? `${head}\n` : '';
    const lineHeight = Math.abs(length - ((head ? 1 : 0) + (tail ? 1 : 0)));
    const line =
      lineHeight > 1 ? `${body}\n`.repeat(lineHeight - 1) + body : body;
    const resolvedTail = tail ? `\n${tail}` : '';
    return `${resolvedHead}${line}${resolvedTail}`;
  }
} as const;

const resolve = (lines: string[] | string) =>
  Array.isArray(lines) ? lines : get.lines(lines);

export { type CreateOpts, type Lines, create, get, resolve, transform };
