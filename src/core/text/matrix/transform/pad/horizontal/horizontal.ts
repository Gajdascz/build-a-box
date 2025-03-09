import { Chars, Obj } from '#srcTypes';
import * as Base from '../../../base/index.js';

interface Cfg {
  left: Chars.Counted;
  right: Chars.Counted;
}
const is = {
  cfg: (cfg: unknown): cfg is Cfg =>
    Obj.isDictionary(cfg) && Chars.is.counted(cfg.left) && Chars.is.counted(cfg.right)
} as const;
type Opts = Obj.NestedPartial<Cfg>;
const DEFAULTS: Cfg = {
  left: { char: Chars.C.space, count: 0 },
  right: { char: Chars.C.space, count: 0 }
} as const;

const add: {
  left: (matrix: Base.Matrix, count: number, fillChar?: string) => Base.Matrix;
  right: (matrix: Base.Matrix, count: number, fillChar?: string) => Base.Matrix;
} = {
  left: (matrix, count, fillChar = Chars.C.space) => {
    const padding = Array.from({ length: count }, () => fillChar);
    return matrix.map<string[]>((row) => [...padding, ...row]);
  },
  right: (matrix, count, fillChar = Chars.C.space) => {
    const padding = Array.from({ length: count }, () => fillChar);
    return matrix.map<string[]>((row) => [...row, ...padding]);
  }
} as const;

const apply = (matrix: Base.Matrix, opts: Opts) => {
  let result = Base.clone(matrix);
  const { left, right } = Obj.merge(DEFAULTS, opts);
  if (left.count > 0) result = add.left(result, left.count, left.char);
  if (right.count > 0) result = add.right(result, right.count, right.char);
  return result;
};

export { add, apply, DEFAULTS, is, type Cfg, type Opts };
