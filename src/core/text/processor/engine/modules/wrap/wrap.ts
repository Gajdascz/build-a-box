import { type Dims, Obj } from '#srcTypes';
import { Lines } from '../../../../base/base.js';
import { Break, Truncate } from '../../core/core.js';
const VERTICAL_POSITION_OVERFLOW_BEHAVIOR = {
  clip: 'clip',
  ellipsis: 'ellipsis'
} as const;
type WrapVerticalOverflowBehavior = keyof typeof VERTICAL_POSITION_OVERFLOW_BEHAVIOR;
const isWrapVerticalOverflowBehavior = Obj.createGuard.strProp(VERTICAL_POSITION_OVERFLOW_BEHAVIOR);
interface Cfg {
  horizontalBreakBehavior: Break.Behavior;
  verticalOverflowBehavior: WrapVerticalOverflowBehavior;
}
const DEFAULTS: Cfg = {
  horizontalBreakBehavior: 'clean',
  verticalOverflowBehavior: 'clip'
} as const;
const isCfg = (opts: unknown): opts is Cfg =>
  Obj.isDictionary(opts) &&
  isWrapVerticalOverflowBehavior(opts.verticalOverflowBehavior) &&
  Break.isBehavior(opts.horizontalBreakBehavior);
const handleVerticalLimit = (
  result: string[],
  { width, height }: Dims.Dimensions,
  behavior: WrapVerticalOverflowBehavior
) => {
  if (behavior === 'ellipsis') {
    const lastLine = result[height - 1];
    if (lastLine)
      result[height - 1] = Truncate.apply({
        text: lastLine,
        cfg: {
          targetLength: width - 3,
          suffix: { char: '.', length: 3, forceApply: true }
        }
      });
  }
  return result;
};
const handleBreak = (lines: string[], result: string[], breakOpts: Break.Cfg) => {
  if (!lines[0]) return [];
  const { first, remaining } = Break.apply({ text: lines[0], cfg: breakOpts });
  const leftover = remaining.join('\n');
  result.push(first);
  if (leftover.length)
    return lines[1] ? [`${leftover} ${lines[1]}`, ...lines.slice(2)] : [leftover];
  else return lines.slice(1);
};

interface ApplyOpts {
  text: string | string[];
  dimensions: Dims.Dimensions;
  cfg: Cfg;
}
const apply = ({
  text,
  dimensions,
  cfg: { horizontalBreakBehavior, verticalOverflowBehavior }
}: ApplyOpts) => {
  let lines = Lines.transform.normalize(text);
  const result: string[] = [];

  const breakOpts: Break.Cfg = {
    behavior: horizontalBreakBehavior,
    breakWidth: dimensions.width
  };

  while (lines[0]) {
    if (result.length >= dimensions.height)
      return handleVerticalLimit(result, dimensions, verticalOverflowBehavior);
    else lines = handleBreak(lines, result, breakOpts);
  }

  return result;
};

export { type ApplyOpts, type Cfg, apply, DEFAULTS, isCfg };
