import { Chars, Num, Obj } from '#srcTypes';
import { Lines } from '../../../../../base/base.js';

interface SideCfg {
  height: number;
  fill: Chars.Counted;
}
type SideOpts = Obj.NestedPartial<SideCfg>;
interface Cfg {
  top: SideCfg;
  bottom: SideCfg;
}
type Opts = Obj.NestedPartial<Cfg>;

const DEFAULT_PADDING = {
  height: 0,
  fill: { char: Chars.C.space, count: 0 }
};
const DEFAULTS: Cfg = {
  top: DEFAULT_PADDING,
  bottom: DEFAULT_PADDING
} as const;
const is = {
  sideOpts: (opt: unknown): opt is SideOpts =>
    Obj.isDictionary(opt) && Num.isNonNegativeInt(opt.height) && Chars.is.counted(opt.fill),
  cfg: (cfg: unknown): cfg is Cfg =>
    Obj.isDictionary(cfg) && is.sideOpts(cfg.top) && is.sideOpts(cfg.bottom)
} as const;
const get = (opts?: SideOpts): string[] => {
  const {
    fill: { char, count },
    height
  } = Obj.merge(DEFAULT_PADDING, opts);
  return height > 0 ? Array<string>(height).fill(char.repeat(count)) : [];
};
const add = {
  top: (lines: string[] | string, opts?: SideOpts): string[] => {
    const l = Lines.resolve(lines);
    return l.length <= 0 ? l : [...get(opts), ...l];
  },
  bottom: (lines: string[] | string, opts?: SideOpts): string[] => {
    const l = Lines.resolve(lines);
    return l.length <= 0 ? l : [...l, ...get(opts)];
  }
} as const;

const apply = (lines: string | string[], opts?: Opts): string[] => {
  const { bottom, top } = Obj.merge(DEFAULTS, opts);
  let result = Lines.resolve(lines);
  if (top.height > 0) result = add.top(result, top);
  if (bottom.height > 0) result = add.bottom(result, bottom);
  return result;
};
export { add, apply, DEFAULTS, get, is, type Cfg, type Opts, type SideCfg, type SideOpts };
