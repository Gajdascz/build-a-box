import { type Group, type Position, Num, Obj } from '../../../base/base.js';

const C = {
  TYPES: {
    fixed: 'fixed',
    dynamic: 'dynamic',
    dynamicWidth: 'dynamicWidth',
    dynamicHeight: 'dynamicHeight'
  },
  DEFAULT_FIXED: { width: 10, height: 3 }
} as const;
const isType = Obj.createGuard.strProp(C.TYPES);

interface Dimensions {
  width: number;
  height: number;
}
type Type = keyof typeof C.TYPES;

interface TypeMap {
  fixed: { type: 'fixed'; width: number; height: number };
  dynamic: { type: 'dynamic'; width: number; height: number };
  dynamicWidth: { type: 'dynamicWidth'; height: number; width: number };
  dynamicHeight: { type: 'dynamicHeight'; width: number; height: number };
}
type Typed<V extends Type = Type> = TypeMap[V];
interface TypeInputMap {
  fixed: { type: 'fixed'; width: number; height: number };
  dynamic: { type: 'dynamic'; height?: number; width?: number };
  dynamicWidth: { type: 'dynamicWidth'; height: number; width?: number };
  dynamicHeight: { type: 'dynamicHeight'; width: number; height?: number };
}
type TypedInput<V extends Type = Type> = TypeInputMap[V];

type StrategyMap = {
  [T in Type]: {
    default: TypeMap[T];
    guard: (dims: unknown) => dims is TypeMap[T];
    resolve: (input?: { type: string; width?: number; height?: number }) => TypeMap[T];
  };
};

const is = (dims: unknown): dims is Dimensions =>
  Obj.isDictionary(dims) && Num.isNonNegativeNum(dims.width) && Num.isNonNegativeNum(dims.height);

const isEqual = (d1: Dimensions, d2: Dimensions) => d1.width === d2.width && d1.height === d1.width;

const STRATEGY: StrategyMap = Obj.freeze({
  fixed: {
    default: { type: 'fixed', ...C.DEFAULT_FIXED },
    guard: (dims: unknown): dims is TypeMap['fixed'] =>
      Obj.isDictionary(dims) &&
      Num.isNonNegativeInt(dims.width) &&
      Num.isNonNegativeInt(dims.height),
    resolve: (input?): TypeMap['fixed'] => ({
      type: 'fixed',
      width: input?.width ?? STRATEGY.fixed.default.width,
      height: input?.height ?? STRATEGY.fixed.default.height
    })
  },
  dynamic: {
    default: { type: 'dynamic', width: Infinity, height: Infinity },
    guard: (dims: unknown): dims is TypeMap['dynamic'] =>
      Obj.isDictionary(dims) && Num.isInfinity(dims.width) && Num.isInfinity(dims.height),
    resolve: (input?) => STRATEGY.dynamic.default
  },
  dynamicWidth: {
    default: {
      type: 'dynamicWidth',
      width: Infinity,
      height: C.DEFAULT_FIXED.height
    },
    guard: (dims: unknown): dims is TypeMap['dynamicWidth'] =>
      Obj.isDictionary(dims) && dims.width === Infinity && Num.isNonNegativeInt(dims.height),
    resolve: (input?) => ({
      type: 'dynamicWidth',
      width: Infinity,
      height: input?.height ?? STRATEGY.fixed.default.height
    })
  },
  dynamicHeight: {
    default: {
      type: 'dynamicHeight',
      width: C.DEFAULT_FIXED.width,
      height: Infinity
    },
    guard: (dims: unknown): dims is TypeMap['dynamicHeight'] =>
      Obj.isDictionary(dims) && Num.isNonNegativeInt(dims.width) && Num.isInfinity(dims.height),
    resolve: (input?) => ({
      type: 'dynamicHeight',
      height: Infinity,
      width: input?.width ?? STRATEGY.fixed.default.width
    })
  }
} as const);

const isTyped = (dims: unknown): dims is Typed =>
  Obj.isDictionary(dims) && isType(dims.type) && STRATEGY[dims.type].guard(dims);

interface CreateTypedCfgOpts<K extends string> {
  key: K;
  dimensions: Typed | TypedInput;
}

const createTypedCfg = <K extends string>({ dimensions, key }: CreateTypedCfgOpts<K>) => {
  const value = STRATEGY[dimensions.type].resolve(dimensions);
  return { key, value, validator: isTyped } as const;
};

const add = (d1: Dimensions, d2: Dimensions) => ({
  width: d1.width + d2.width,
  height: d1.height + d2.height
});
const sum = (dimensions: Dimensions[]) => dimensions.reduce(add, { width: 0, height: 0 });

const subtract = (d1: Dimensions, d2: Dimensions) => ({
  width: d1.width - d2.width,
  height: d1.height - d2.height
});
const calculate = {
  oriented: (dimensions: Dimensions[], orientation: Position.Orientation): Dimensions => {
    const primary = orientation === 'horizontal' ? 'width' : 'height';
    const secondary = primary === 'width' ? 'height' : 'width';
    return dimensions.reduce<Dimensions>(
      (acc, curr) => {
        acc[primary] += curr[primary];
        acc[secondary] = Math.max(acc[secondary], curr[secondary]);
        return acc;
      },
      { width: 0, height: 0 }
    );
  }
} as const;
const get = {
  orientedDimensionKeys: (
    orientation: Position.Orientation
  ): { width: Group.PrimarySecondaryKey; height: Group.PrimarySecondaryKey } =>
    orientation === 'horizontal' ?
      { width: 'primary', height: 'secondary' }
    : { width: 'secondary', height: 'primary' }
} as const;

export {
  add,
  C,
  calculate,
  createTypedCfg,
  get,
  is,
  isEqual,
  isType,
  isTyped,
  STRATEGY,
  subtract,
  sum,
  type CreateTypedCfgOpts,
  type Dimensions,
  type Type,
  type Typed,
  type TypedInput
};
