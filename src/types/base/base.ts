export * as Chars from './characters/characters.js';
export type * as Group from './groups/groups.js';
export * as Num from './number/number.js';
export * as Obj from './obj/obj.js';
export * as Position from './position/position.js';
export * as Primitive from './primitive/primitive.js';
export type BoolConditional<B extends boolean, T, F> = B extends true ? T : F;
export type TypeGuard<V> = (v: unknown) => v is V;
export type GenericFn = (...a: any[]) => unknown;
