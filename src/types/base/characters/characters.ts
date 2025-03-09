const C = {
  space: ' ',
  dot: '.',
  hyphen: '-'
} as const;

interface Counted {
  char: string;
  count: number;
}

const is = {
  char: (char: unknown): char is string =>
    typeof char === 'string' && char.length === 1,
  counted: (counted: unknown): counted is Counted =>
    typeof counted === 'object' &&
    counted !== null &&
    'char' in counted &&
    'count' in counted &&
    typeof counted.count === 'number' &&
    is.char(counted.char)
} as const;

export * from './groups/groups.js';
export { type Counted, C, is };
