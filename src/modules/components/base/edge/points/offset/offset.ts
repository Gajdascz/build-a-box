import { type Group, type Position, C2D } from '#srcTypes';
import type * as Spans from '../../spans/spans.js';

type OffsetPoints = Group.SourceMidTarget<C2D.Coordinates[]>;

interface Opts<O extends Position.Orientation> {
  orientation: O;
  span: Spans.SpanMap['offset'];
  path: C2D.Path;
}

const is = {
  singleOffset: <O extends Position.Orientation>(spans: Spans.OffsetSpan<O>) =>
    spans.end === 0 && spans.mid === 1 && spans.start === 1
} as const;
const resolve = {
  source: <O extends Position.Orientation>(
    orientation: O,
    path: C2D.Path,
    span: Spans.OffsetSpan<O>
  ) => {
    const { secondary, primary } = C2D.get.axisPair[orientation]();
    const staticOpposite = path.source[secondary];
    /** +1 to skip path source */
    const srcPrimary = path.source[primary] + 1;
    const length = span.start;
    return Array.from({ length }, (_, i) =>
      C2D.resolve.axisPair(orientation, { primary: srcPrimary + i, secondary: staticOpposite })
    );
  },
  mid: <O extends Position.Orientation>(
    orientation: O,
    span: Spans.OffsetSpan<O>,
    sourceEnd: C2D.Coordinates
  ) => {
    const { secondary, primary } = C2D.get.axisPair[orientation]();
    const sourceEndPrimary = sourceEnd[primary];
    const sourceEndOpposite = sourceEnd[secondary];
    return Array.from({ length: span.mid }, (_, i) =>
      C2D.resolve.axisPair(orientation, {
        primary: sourceEndPrimary,
        // (i + 1) to ensures the first mid point is offset by exactly one stepValue from sourceEnd.
        secondary: sourceEndOpposite + (i + 1) * span.offset.stepValue
      })
    );
  },
  target: <O extends Position.Orientation>(
    orientation: O,
    span: Spans.OffsetSpan<O>,
    midEnd: C2D.Coordinates
  ) => {
    const { secondary, primary } = C2D.get.axisPair[orientation]();
    return Array.from({ length: span.end }, (_, i) =>
      C2D.resolve.axisPair(orientation, {
        primary: midEnd[primary] + i,
        secondary: midEnd[secondary]
      })
    );
  },
  singleOffset: <O extends Position.Orientation>(orientation: O, path: C2D.Path) => {
    const { secondary, primary } = C2D.get.axisPair[orientation]();
    /** +1 to skip path source */
    const source = [
      C2D.resolve.axisPair(orientation, {
        primary: path.source[primary] + 1,
        secondary: path.source[secondary]
      })
    ];
    const target = [
      C2D.resolve.axisPair(orientation, {
        primary: path.target[primary],
        secondary: path.target[secondary]
      })
    ];
    return { source, mid: [], target };
  }
} as const;

const generate = <O extends Position.Orientation>({ orientation, span, path }: Opts<O>) => {
  if (C2D.is.directPath(orientation, path)) throw new Error('Path must be offset');
  if (is.singleOffset(span)) return resolve.singleOffset(orientation, path);
  const source = resolve.source(orientation, path, span);
  const srcEnd = source[source.length - 1]!;
  if (span.mid === 0) return { source, mid: [], target: [] };
  const mid = resolve.mid(orientation, span, srcEnd);
  const midEnd = mid.pop()!;
  const target = resolve.target(orientation, span, midEnd);
  return { source, mid, target };
};

export { type OffsetPoints, type Opts, generate };
