import { Obj } from '#srcTypes';
import { Lines } from '../../../../base/base.js';
import * as Horizontal from './horizontal/horizontal.js';
import * as Vertical from './vertical/vertical.js';

interface Cfg {
  horizontal: Horizontal.Cfg;
  vertical: Vertical.Cfg;
}
type Opts = Obj.NestedPartial<Cfg>;
const DEFAULTS: Cfg = {
  horizontal: Horizontal.DEFAULTS,
  vertical: Vertical.DEFAULTS
} as const;
const isCfg = (cfg: unknown): cfg is Cfg =>
  Obj.isDictionary(cfg) && Horizontal.is.cfg(cfg.horizontal) && Vertical.is.cfg(cfg.vertical);
const apply = (str: string | string[], { horizontal, vertical }: Opts = {}): string[] => {
  let lines = Array.isArray(str) ? str : Lines.transform.normalize(str);
  if (horizontal) lines = Horizontal.apply(lines, horizontal);
  if (vertical) lines = Vertical.apply(lines, vertical);
  return lines;
};
const getTotals = ({ horizontal, vertical }: Cfg) => ({
  horizontal: horizontal.left.count + horizontal.right.count,
  vertical: vertical.top.height + vertical.bottom.height
});

export * as Horizontal from './horizontal/horizontal.js';
export * as Vertical from './vertical/vertical.js';
export { apply, DEFAULTS, getTotals, isCfg, type Cfg };
