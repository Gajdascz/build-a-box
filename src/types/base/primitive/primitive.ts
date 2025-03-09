const C = {
  string: 'string',
  number: 'number',
  bigint: 'bigint',
  boolean: 'boolean',
  symbol: 'symbol',
  function: 'function'
} as const;
type Type = keyof typeof C;
const isType = (p: unknown): p is Type => typeof p === 'string' && p in C;
type Value = string | number | boolean | symbol | bigint | undefined;
const is = Object.freeze({
  type: isType,
  string: <V = string>(v: unknown): v is V => typeof v === 'string',
  number: <V = number>(v: unknown): v is V => typeof v === 'number',
  boolean: <V = boolean>(v: unknown): v is V => typeof v === 'boolean',
  function: <V = (...args: any[]) => unknown>(v: unknown): v is V =>
    typeof v === 'function',
  symbol: <V = symbol>(v: unknown): v is V => typeof v === 'symbol',
  bigint: <V = bigint>(v: unknown): v is V => typeof v === 'bigint'
} as const);

export { type Type, type Value, C, is };
