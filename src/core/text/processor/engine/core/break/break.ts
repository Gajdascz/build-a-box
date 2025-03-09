import { Chars, Obj } from '#srcTypes';
import { Words } from '../../../../base/base.js';

const MIN_TRAIL_BREAK_WIDTH = 2; // Minimum width required for trail behavior (1 char + 1 trailing char)
const BREAK_STR_BEHAVIOR = {
  clip: 'clip',
  clean: 'clean',
  trail: 'trail'
} as const;

type Behavior = keyof typeof BREAK_STR_BEHAVIOR;
const isBehavior = Obj.createGuard.strProp(BREAK_STR_BEHAVIOR);

interface Cfg {
  behavior: Behavior;
  breakWidth: number;
}
interface FormatResultArg {
  firstLine: string;
  remainingWords: string[];
}
interface Result {
  first: string;
  remaining: string[];
}

const formatResult = ({ firstLine, remainingWords }: FormatResultArg): Result => ({
  first: firstLine.trim(),
  remaining: remainingWords.filter(Boolean)
});

const resolveOpts = (
  line: string,
  nextWord: string,
  remainingWords: string[] = [],
  breakWidth: number
) => {
  const firstSegment = line ? `${line}${Chars.C.space}` : '';
  const isSingleLongWord =
    !firstSegment && remainingWords.length === 1 && nextWord.length > breakWidth;
  const breakPoint = isSingleLongWord ? breakWidth : breakWidth - firstSegment.length;
  return { breakPoint, firstSegment };
};
interface ApplyOpts {
  text: string;
  cfg?: Obj.NestedPartial<Cfg>;
}
const apply = ({ text, cfg: { behavior = 'clean', breakWidth = 80 } = {} }: ApplyOpts): Result => {
  if (breakWidth <= 0 || (behavior === 'trail' && breakWidth < MIN_TRAIL_BREAK_WIDTH))
    return formatResult({ firstLine: '', remainingWords: Words.get(text) });

  const { chunk, remainingWords } = Words.buildChunk(text, breakWidth);
  if (chunk.length === breakWidth || behavior === 'clean')
    return formatResult({ firstLine: chunk, remainingWords });

  const nextWord = remainingWords[0] ?? '';
  const { breakPoint, firstSegment } = resolveOpts(
    chunk,
    nextWord,
    remainingWords,
    breakWidth - (behavior === 'trail' ? 1 : 0) // Adjust for hyphen
  );
  const trailChar = behavior === 'trail' ? Chars.C.hyphen : '';
  if (breakPoint <= 0) return formatResult({ firstLine: chunk, remainingWords });
  const { first, second } = Words.split(nextWord, breakPoint);
  return formatResult({
    firstLine: `${firstSegment}${first}${trailChar}`,
    remainingWords: [`${trailChar}${second}`, ...remainingWords.slice(1)]
  });
};
export { type ApplyOpts, type Behavior, type Cfg, type Result, apply, isBehavior };
