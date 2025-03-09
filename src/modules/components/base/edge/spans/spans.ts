import { type Group, type Position, C2D } from '#srcTypes';
import * as Base from '../base/base.js';

type Span = Group.StartMidEnd<number, number, number>;
interface DirectSpan extends Span {
  start: 0;
  end: 0;
}
interface OffsetSpan<O extends Position.Orientation> extends Span {
  offset: Omit<Base.Offset.Offset<O>, 'distance'>;
}
interface SpanMap<O extends Position.Orientation = Position.Orientation> {
  direct: DirectSpan;
  offset: OffsetSpan<O>;
}

interface ResolveCfg<O extends Position.Orientation> {
  orientation: O;
  direction: Base.Directions.Direction;
  path: C2D.Path;
}
const resolve: {
  direct: <O extends Position.Orientation>(cfg: ResolveCfg<O>) => DirectSpan;
  offset: <O extends Position.Orientation>(cfg: ResolveCfg<O>) => OffsetSpan<O>;
  path: <O extends Position.Orientation>(cfg: ResolveCfg<O>) => SpanMap<O>[C2D.PathType];
} = {
  direct: ({ orientation, direction, path }) => {
    if (!C2D.is.directPath(orientation, path)) throw new Error('Path must be direct');
    if (
      !Base.Directions.is[direction](path) ||
      !Base.Directions.is.orientationDirection(orientation, direction)
    )
      throw new Error(
        `Direct Path: ${JSON.stringify(path.source)}-->${JSON.stringify(path.target)} does not follow the required direction: ${direction}`
      );
    const distance = C2D.calculate.pathDistance(orientation, path);
    return { start: 0, mid: distance, end: 0 };
  },
  offset: ({ orientation, direction, path }) => {
    if (C2D.is.directPath(orientation, path)) throw new Error('Path must be offset');
    if (
      !Base.Directions.is[direction](path) ||
      !Base.Directions.is.orientationDirection(orientation, direction)
    )
      throw new Error(
        `Offset Path: ${JSON.stringify(path.source)}-->${JSON.stringify(path.target)} does not follow the required direction: ${direction}`
      );
    const distance = C2D.calculate.pathDistance(orientation, path);
    const offset = Base.Offset.get(orientation, path);
    return {
      offset: { ...offset, distance: undefined },
      start: Math.ceil(distance / 2),
      mid: offset.distance,
      end: Math.floor(distance / 2)
    };
  },
  path: ({ orientation, direction, path }) => {
    const oppositeAxis = C2D.OPPOSITE_AXES[orientation];
    const type = path.source[oppositeAxis] === path.target[oppositeAxis] ? 'direct' : 'offset';
    return resolve[type]({ orientation, direction, path });
  }
};
export { type DirectSpan, type OffsetSpan, type Span, type SpanMap, resolve };
