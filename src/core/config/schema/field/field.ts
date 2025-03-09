import { Obj, Primitive } from '#srcTypes';

type Type = 'primitive' | 'object' | 'array';

interface BaseOpts<V> {
  defaultValue: V;
  is?: (v: unknown) => v is V;
  currentValue?: V;
}
interface Base<V> {
  get default(): V;
  get current(): V;
  set(value: unknown): this;
  reset(): this;
  clone(): Field<V>;
  process(value: unknown): V;
}
const getDefaultGuard = <V>(type: unknown) =>
  Primitive.is.type(type) ? Primitive.is[type]<V>
  : Array.isArray(type) ? (Array.isArray as (v: unknown) => v is V)
  : Obj.is<V>;

abstract class Field<V> implements Base<V> {
  is: (v: unknown) => v is V;
  protected _default: V;
  protected _current: V;
  constructor({ defaultValue, is, currentValue = defaultValue }: BaseOpts<V>) {
    this._default = defaultValue;
    this._current = currentValue;
    const defaultGuard = getDefaultGuard<V>(typeof this._default);
    this.is = is ? (v: unknown): v is V => defaultGuard(v) && is(v) : defaultGuard;
    if (!this.is(this._default)) throw new Error(`Invalid default value: ${this._default}`);
    if (!this.is(this._current)) throw new Error(`Invalid current value: ${this._current}`);
  }
  set(value: unknown) {
    this._current = this.process(value);
    return this;
  }
  abstract get default(): V;
  abstract get current(): V;
  abstract clone(): Field<V>;
  abstract process(value: unknown): V;
  reset() {
    this._current = this._default;
    return this;
  }
}
class PrimitiveField<V> extends Field<V> {
  constructor(opts: BaseOpts<V>) {
    if (typeof opts.defaultValue === 'object')
      throw new Error(
        `Object value provided to Primitive Field: ${JSON.stringify(opts.defaultValue)}`
      );
    super(opts);
  }
  get default() {
    return this._default;
  }
  get current() {
    return this._current;
  }
  process(v: unknown) {
    return this.is(v) ? v : this._current;
  }
  clone() {
    return new PrimitiveField<V>({
      defaultValue: this._default,
      currentValue: this._current,
      is: this.is
    });
  }
}
interface ObjectOpts<V> extends BaseOpts<V> {
  merge?: Obj.MergeFn<V>;
}
class ObjectField<V> extends Field<V> {
  readonly merge: (v: unknown) => V;
  readonly isPartial = (provided: unknown): provided is Obj.FullPartialUnion<V> =>
    Obj.isPartialOf<V>(provided, this.current);
  constructor(opts: ObjectOpts<V>) {
    super(opts);

    this._default = Obj.freeze(this._default, {
      maxDepth: Infinity,
      clone: true
    });
    this._current = Obj.clone(this._current);
    const merge = opts.merge;
    this.merge =
      merge ?
        (v: unknown) => merge(this._current, v)
      : (v: unknown) => Obj.merge<V>(this._current, v);
  }
  get current() {
    return Obj.clone(this._current);
  }
  get default() {
    return this._default;
  }
  process(v: unknown) {
    if (!Obj.isDictionary(v)) return this._current;
    const merged = this.merge(v);
    return this.is(merged) ? merged : this._current;
  }
  clone() {
    return new ObjectField<V>({
      defaultValue: Obj.clone(this._default),
      currentValue: this.current,
      is: this.is,
      merge: this.merge
    });
  }
}
interface ArrayOpts<V> extends BaseOpts<V[]> {
  isElement?: (v: unknown) => v is V;
}

class ArrayField<V> extends Field<V[]> {
  constructor(opts: ArrayOpts<V>) {
    if (!Array.isArray(opts.defaultValue))
      throw new Error(`Array required for ArrayField: ${String(opts.defaultValue)}`);
    const valueType = typeof opts.defaultValue[0];
    const isElement =
      opts.isElement ?? (Primitive.is.type(valueType) ? Primitive.is[valueType] : Obj.is);
    super({
      ...opts,
      is: (v: unknown): v is V[] => Array.isArray(v) && v.every(isElement)
    });
    this._default = Obj.clone(this._default);
    this._current = Obj.clone(this._current);
  }
  get current() {
    return Obj.clone<V[]>(this._current);
  }
  get default() {
    return Obj.clone<V[]>(this._default);
  }
  process(v: unknown) {
    if (!Array.isArray(v)) return this._current;
    const merged = Obj.merge(this._current, v);
    return this.is(merged) ? merged : this._current;
  }
  clone() {
    return new ArrayField<V>({
      defaultValue: Obj.clone(this._default),
      currentValue: this.current,
      is: this.is
    });
  }
}

interface Obj<V> {
  type: 'object';
  instance: InstanceType<typeof ObjectField<V>>;
}
interface Primitive<V> {
  type: 'primitive';
  instance: InstanceType<typeof PrimitiveField<V>>;
}
interface Arr<V> {
  type: 'array';
  instance: InstanceType<typeof ArrayField<V>>;
}
type Typed<V> = Obj<V> | Primitive<V> | Arr<V>;

const create = {
  primitive: <V>(opts: BaseOpts<V>): Primitive<V> => ({
    type: 'primitive',
    instance: new PrimitiveField<V>(opts)
  }),
  object: <V>(opts: ObjectOpts<V>): Obj<V> => ({
    type: 'object',
    instance: new ObjectField<V>(opts)
  }),
  array: <V>(opts: ArrayOpts<V>): Arr<V> => ({
    type: 'array',
    instance: new ArrayField<V>(opts)
  })
} as const;

const is = {
  type: (t: unknown): t is Type =>
    typeof t === 'string' && (t === 'primitive' || t === 'object' || t === 'array'),
  baseOpts: <V>(opts: unknown): opts is BaseOpts<V> =>
    Obj.isDictionary(opts) && Primitive.is.type(typeof opts.defaultValue),
  objectOpts: <V>(opts: unknown): opts is ObjectOpts<V> =>
    Obj.isDictionary(opts) && Obj.isDictionary(opts.defaultValue),
  primitive: <V>(field: unknown): field is Primitive<V> =>
    Obj.isDictionary(field) &&
    field.type === 'primitive' &&
    field.instance instanceof PrimitiveField,
  object: <V>(field: unknown): field is Obj<V> =>
    Obj.isDictionary(field) && field.type === 'object' && field.instance instanceof ObjectField,
  array: <V>(field: unknown): field is Arr<V> =>
    Obj.isDictionary(field) && field.type === 'array' && field.instance instanceof ArrayField,
  typed: <V>(field: unknown): field is Typed<V> =>
    Obj.isDictionary(field) && is.type(field.type) && is[field.type](field)
} as const;

export { type BaseOpts, type ObjectOpts, type Type, type Typed, create, is };
