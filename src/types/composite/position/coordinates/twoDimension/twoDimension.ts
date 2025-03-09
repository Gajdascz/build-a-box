import { type Group, type Position, Obj } from '../../../../base/base.js';

interface Coordinates {
  x: number;
  y: number;
}
interface Axes {
  horizontal: 'x';
  vertical: 'y';
}
const AXIS: Axes = { horizontal: 'x', vertical: 'y' } as const;
const OPPOSITE_AXES = { horizontal: 'y', vertical: 'x' } as const;
const AXIS_ORIENTATION = { x: 'horizontal', y: 'vertical' } as const;
type Axis = Axes[Position.Orientation];
type InferAxis<O extends Position.Orientation> = Axes[O];

const PATH_TYPE = { direct: 'direct', offset: 'offset' } as const;
type PathType = keyof typeof PATH_TYPE;
type Path = Group.SourceTarget<Coordinates>;

interface HorizontalAxisPair {
  primary: 'x';
  secondary: 'y';
}
interface VerticalAxisPair {
  primary: 'y';
  secondary: 'x';
}
type AxisPair = HorizontalAxisPair | VerticalAxisPair;

type PairHandler<R = Coordinates> = (a: Coordinates, b: Coordinates) => R;

const is: {
  coordinates: (c: unknown) => c is Coordinates;
  equal: PairHandler<boolean>;
  axis: (c: unknown) => c is Axis;
  directPath: (orientation: Position.Orientation, path: Path) => boolean;
} = {
  coordinates: (c): c is Coordinates =>
    Obj.isDictionary(c) && Number.isSafeInteger(c.x) && Number.isSafeInteger(c.y),
  equal: (a, b) => a.x === b.x && a.y === b.y,
  axis: (c): c is Axis => typeof c === 'string' && Object.values(AXIS).includes(c),
  directPath: (orientation, { source, target }) =>
    orientation === 'horizontal' ? source.y === target.y : source.x === target.x
} as const;
const get: {
  axisPair: { horizontal: () => HorizontalAxisPair; vertical: () => VerticalAxisPair };
} = {
  axisPair: {
    horizontal: (): HorizontalAxisPair => ({ primary: 'x', secondary: 'y' }) as const,
    vertical: (): VerticalAxisPair => ({ primary: 'y', secondary: 'x' }) as const
  }
} as const;
const calculate: {
  add: PairHandler;
  sum: (...args: Coordinates[]) => Coordinates;
  subtract: PairHandler;
  delta: PairHandler;
  midPoint: PairHandler;
  pathDistance: <O extends Position.Orientation>(orientation: O, path: Path) => number;
  min: (coordinates: Coordinates[]) => Coordinates;
} = {
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sum: (...args: Coordinates[]) => args.reduce(calculate.add, { x: 0, y: 0 }),
  subtract: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  delta: (a, b) => ({ x: b.x - a.x, y: b.y - a.y }),
  midPoint: (a, b) => ({ x: Math.floor((a.x + b.x) / 2), y: Math.floor((a.y + b.y) / 2) }),
  pathDistance: (orientation, path) => {
    const axis = AXIS[orientation];
    return Math.abs(path.target[axis] - path.source[axis]);
  },
  min: (coordinates) =>
    coordinates.reduce(
      (acc, coords) => {
        acc.x = Math.min(acc.x, coords.x);
        acc.y = Math.min(acc.y, coords.y);
        return acc;
      },
      { x: Infinity, y: Infinity }
    )
} as const;
const resolve = {
  axisPair: (
    orientation: Position.Orientation,
    { primary = 0, secondary = 0 } = {}
  ): Coordinates => {
    const axes = get.axisPair[orientation]();
    return { [axes.primary]: primary, [axes.secondary]: secondary } as unknown as Coordinates;
  },
  pathType: (orientation: Position.Orientation, path: Path): PathType =>
    is.directPath(orientation, path) ? PATH_TYPE.direct : PATH_TYPE.offset
};

const clone = {
  path: (p: Path): Path => ({ source: { ...p.source }, target: { ...p.target } }),
  coordinates: (c: Coordinates[]): Coordinates[] => c.map((coords) => ({ ...coords }))
};

export {
  AXIS,
  AXIS_ORIENTATION,
  calculate,
  clone,
  get,
  is,
  OPPOSITE_AXES,
  resolve,
  type Axes,
  type Axis,
  type AxisPair,
  type Coordinates,
  type HorizontalAxisPair,
  type InferAxis,
  type PairHandler,
  type Path,
  type PathType,
  type VerticalAxisPair
};
