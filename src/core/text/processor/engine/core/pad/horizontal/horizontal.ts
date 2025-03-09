import { Chars, Obj } from '#srcTypes';
import { Lines } from '../../../../../base/base.js';

interface Cfg {
  left: Chars.Counted;
  right: Chars.Counted;
}
type Opts = Obj.NestedPartial<Cfg>;

const DEFAULT_PADDING = { char: Chars.C.space, count: 0 };
const DEFAULTS: Cfg = {
  left: DEFAULT_PADDING,
  right: DEFAULT_PADDING
} as const;
const is = {
  cfg: (padding: unknown): padding is Cfg =>
    Obj.isDictionary(padding) && Chars.is.counted(padding.left) && Chars.is.counted(padding.right)
} as const;

const get = (opts?: Obj.NestedPartial<Chars.Counted>): string => {
  const { char, count } = Obj.merge(DEFAULT_PADDING, opts);
  return count > 0 ? char.repeat(count) : '';
};
const add = {
  left: (lines: string[] | string, opts?: Opts['left']): string[] =>
    Lines.resolve(lines).map((line) => get(opts) + line),
  right: (lines: string[] | string, opts?: Opts['right']): string[] =>
    Lines.resolve(lines).map((line) => line + get(opts))
} as const;

const apply = (lines: string[] | string, opts?: Opts): string[] => {
  const { left, right } = Obj.merge(DEFAULTS, opts);
  let result = Lines.resolve(lines);
  if (left.count > 0) result = add.left(result, left);
  if (right.count > 0) result = add.right(result, right);
  return result;
};

export { add, apply, DEFAULTS, get, is, type Cfg, type Opts };
