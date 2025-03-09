type NestedPartial<T> = T extends object ? { [P in keyof T]?: NestedPartial<T[P]> } : T;

type FullPartialUnion<T> = {
  [P in keyof T]?: T[P] | NestedPartial<T[P]>;
};
type NestedWritable<T> = T extends object ? { -readonly [P in keyof T]: T[P] } : T;

type StrProperty<T> = Extract<keyof T, string>;
type StrValueMap<T> = Record<keyof T, string>;
type TypeGuard<V> = (v: unknown, ...args: any[]) => v is V;

const is = <V = object>(provided: unknown): provided is V =>
  typeof provided === 'object' && provided !== null;

const isStrKeyOf = <V extends object = object>(key: unknown, obj: V): key is StrProperty<V> =>
  typeof key === 'string' && key in obj;

const isPartialOf = <V = object>(
  partial: unknown,
  established: V
): partial is FullPartialUnion<V> =>
  is(partial) &&
  is(established) &&
  Object.entries(partial).every(
    ([key, value]) => key in established && typeof (established as Dictionary)[key] === typeof value
  );

type ValidatorMap<T> = {
  [K in keyof T]: (record: unknown) => record is T[K];
};

interface CreateEntriesGuardOpts<K, V> {
  isKey: TypeGuard<K>;
  isValue: TypeGuard<V>;
  preChecks?: PreChecks;
}
const createGuard = {
  strProp:
    <T extends object>(record: T) =>
    (value: unknown): value is StrProperty<T> =>
      typeof value === 'string' && value in record,
  entries:
    <T, KeyType, ValueType>({
      isKey,
      isValue,
      preChecks = []
    }: CreateEntriesGuardOpts<KeyType, ValueType>) =>
    (record: unknown): record is T => {
      if (is(record) && preChecks.every((fn) => fn(record))) {
        const entries = Object.entries(record);
        return entries.length > 0 && entries.every(([key, value]) => isKey(key) && isValue(value));
      }
      return false;
    }
} as const;

type PreChecks = ((record: object) => boolean)[];

const clone = <T>(obj: T): T => {
  if (!is(obj)) return obj;
  if (Array.isArray(obj)) return obj.map((item: unknown) => (is(item) ? clone(item) : item)) as T;
  const result = {} as Dictionary;
  for (const [key, value] of Object.entries(obj)) {
    result[key] = is(value) ? clone(value) : value;
  }
  return result as T;
};

interface FreezeOpts {
  clone: boolean;
  maxDepth: number;
}
const freeze = <T>(obj: T, opts: Partial<FreezeOpts> = {}): Readonly<T> => {
  if (Object.isFrozen(obj)) return obj;
  const target = opts.clone ? clone(obj) : obj;
  const freeze = (obj: unknown, depth: number): Readonly<T> => {
    if (depth === 0 || !is(obj) || Object.isFrozen(obj)) return obj as Readonly<T>;

    return Object.freeze(
      Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          is(value) ? freeze(value, depth - 1) : value
        ])
      )
    ) as Readonly<T>;
  };
  return freeze(target, opts.maxDepth ?? 1);
};
type MergeFn<R> = (current: R, next: unknown) => R;

const merge = <R>(current: R, next: unknown): R => {
  if (!is(next)) return current;
  const result = clone<R>(current) as Dictionary;
  return Object.entries(next).reduce((acc, [key, value]) => {
    if (!value) return acc;
    if (Array.isArray(value)) {
      acc[key] = clone(value);
      return acc;
    }
    if (is(value) && key in result) acc[key] = merge(result[key] as object, value);
    else acc[key] = value;
    return acc;
  }, result) as R;
};

const remove = <T extends object>(obj: T, firstKey: keyof T, ...nestedKeys: string[]) => {
  const result = clone(obj);
  if (!nestedKeys.length) delete result[firstKey];
  else {
    let current = result[firstKey] as Dictionary;
    const targetKey = nestedKeys.pop();
    if (targetKey) {
      for (const key of nestedKeys) {
        if (isDictionary(current) && isDictionary(current[key])) current = current[key];
        else return result;
      }
      delete current[targetKey];
    }
  }
  return result;
};

type Dictionary = Record<string, unknown>;
const isDictionary = (d: unknown): d is Dictionary =>
  is(d) && !Array.isArray(d) && Object.keys(d).every((key) => typeof key === 'string');

const cloneDictionary = <T extends Dictionary>(d: T): T => clone(d);
const mergeDictionary = <T extends Dictionary>(
  established: T,
  provided: NestedPartial<T> | T | Dictionary
): T => merge<T>(established, provided);
export {
  type CreateEntriesGuardOpts,
  type Dictionary,
  type FreezeOpts,
  type FullPartialUnion,
  type MergeFn,
  type NestedPartial,
  type NestedWritable,
  type StrProperty,
  type StrValueMap,
  type ValidatorMap,
  clone,
  cloneDictionary,
  createGuard,
  freeze,
  is,
  isDictionary,
  isPartialOf,
  isStrKeyOf,
  merge,
  mergeDictionary,
  remove
};
