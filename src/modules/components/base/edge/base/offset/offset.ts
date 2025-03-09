import { type Position, C2D } from '#srcTypes';

type OffsetDirection = 'up' | 'down' | 'left' | 'right';

interface OffsetDirections {
  horizontal: 'up' | 'down';
  vertical: 'left' | 'right';
}
interface Offset<O extends Position.Orientation> {
  direction: OffsetDirections[O];
  distance: number;
  stepValue: -1 | 1;
  axis: C2D.Axis;
  orientation: Position.Orientation;
}

const has = ({ source, target }: C2D.Path, orientation: Position.Orientation) => {
  const axis = C2D.OPPOSITE_AXES[orientation];
  return source[axis] !== target[axis];
};

const resolve = {
  direction: {
    horizontal: (delta: number): OffsetDirections['horizontal'] => (delta < 0 ? 'up' : 'down'),
    vertical: (delta: number): OffsetDirections['vertical'] => (delta < 0 ? 'left' : 'right'),
    stepValue: (direction: OffsetDirections[keyof OffsetDirections]) =>
      direction === 'up' || direction === 'left' ? -1 : 1
  }
} as const;

const get = <O extends Position.Orientation>(pathOrientation: O, path: C2D.Path) => {
  const offsetAxis = C2D.OPPOSITE_AXES[pathOrientation];
  const delta = C2D.calculate.delta(path.source, path.target)[offsetAxis];
  const distance = Math.abs(delta);
  const direction = resolve.direction[pathOrientation](delta);
  const stepValue = resolve.direction.stepValue(direction);
  const offsetOrientation = C2D.AXIS_ORIENTATION[offsetAxis];
  return {
    distance,
    direction,
    stepValue,
    axis: offsetAxis,
    orientation: offsetOrientation
  } as Offset<O>;
};

export { type Offset, type OffsetDirection, type OffsetDirections, get, has, resolve };
