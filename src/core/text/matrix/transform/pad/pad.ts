import { Obj } from '#srcTypes';
import * as Base from '../../base/index.js';
import * as Horizontal from './horizontal/horizontal.js';
import * as Vertical from './vertical/vertical.js';

interface Cfg {
  horizontal: Horizontal.Cfg;
  vertical: Vertical.Cfg;
}
type Opts = Obj.NestedPartial<Cfg>;
const is = {
  cfg: (cfg: unknown): cfg is Cfg =>
    Obj.isDictionary(cfg) && Horizontal.is.cfg(cfg.horizontal) && Vertical.is.cfg(cfg.vertical)
} as const;
const DEFAULTS: Cfg = {
  horizontal: Horizontal.DEFAULTS,
  vertical: Vertical.DEFAULTS
} as const;
const apply = (matrix: Base.Matrix, opts?: Obj.NestedPartial<Cfg>): Base.Matrix => {
  let result = Base.clone(matrix);
  const { horizontal, vertical } = Obj.merge(DEFAULTS, opts);
  if (vertical.top.count > 0 || vertical.bottom.count > 0)
    result = Vertical.apply(result, vertical);
  if (horizontal.left.count > 0 || horizontal.right.count > 0)
    result = Horizontal.apply(result, horizontal);

  return result;
};

export * as Horizontal from './horizontal/horizontal.js';
export * as Vertical from './vertical/vertical.js';
export { apply, DEFAULTS, is, type Cfg, type Opts };
