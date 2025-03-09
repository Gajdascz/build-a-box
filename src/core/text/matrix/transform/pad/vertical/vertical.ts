import { Chars, Obj } from '#srcTypes';
import * as Base from '../../../base/index.js';

interface Cfg {
  top: Chars.Counted;
  bottom: Chars.Counted;
}
const is = {
  cfg: (cfg: unknown): cfg is Cfg =>
    Obj.isDictionary(cfg) && Chars.is.counted(cfg.top) && Chars.is.counted(cfg.bottom)
} as const;
type Opts = Obj.NestedPartial<Cfg>;
const DEFAULTS: Cfg = {
  top: { char: Chars.C.space, count: 0 },
  bottom: { char: Chars.C.space, count: 0 }
} as const;

const add: {
  top: (matrix: Base.Matrix, count: number, char?: string) => Base.Matrix;
  bottom: (matrix: Base.Matrix, count: number, char?: string) => Base.Matrix;
} = {
  top: (matrix, count, char = Chars.C.space) => {
    const { width } = Base.get.dimensions(matrix);
    const padding = Base.create.from.dimensions({ width, height: count }, char);
    return [...padding, ...matrix];
  },
  bottom: (matrix, count, char = Chars.C.space) => {
    const { width } = Base.get.dimensions(matrix);
    const padding = Base.create.from.dimensions({ width, height: count }, char);
    return [...matrix, ...padding];
  }
} as const;

const apply = (matrix: Base.Matrix, opts?: Opts) => {
  let result = Base.clone(matrix);
  const { bottom, top } = Obj.merge(DEFAULTS, opts);
  if (top.count > 0) result = add.top(result, top.count, top.char);
  if (bottom.count > 0) result = add.bottom(result, bottom.count, bottom.char);
  return result;
};

export { add, apply, DEFAULTS, is, type Cfg, type Opts };
