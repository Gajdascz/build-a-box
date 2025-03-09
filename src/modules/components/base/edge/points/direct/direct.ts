import { type Group, type Position, C2D } from '#srcTypes';
import type * as Spans from '../../spans/spans.js';

type DirectPoints = Group.SourceMidTarget<[], C2D.Coordinates[], []>;

interface Opts<O extends Position.Orientation> {
  orientation: O;
  span: Spans.DirectSpan;
  path: C2D.Path;
}

const generate = <O extends Position.Orientation>({
  orientation,
  path,
  span
}: Opts<O>): DirectPoints => {
  if (!C2D.is.directPath(orientation, path)) throw new Error('Path must be direct');
  const primary = C2D.AXIS[orientation];
  /** Skip the first point in the path, as it is the source point. */
  const start = path.source[primary] + 1;
  /** Exclude end point in the path, as it is the target point. */
  const length = span.mid > 1 ? span.mid - 1 : span.mid;
  return {
    source: [],
    mid: Array.from({ length }, (_, i) =>
      C2D.resolve.axisPair(orientation, { primary: start + i, secondary: 0 })
    ),
    target: []
  };
};

export { type DirectPoints, type Opts, generate };
