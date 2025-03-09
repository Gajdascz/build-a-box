import { Obj } from '#srcTypes';
import * as Field from './field/field.js';

type Fields<T> = { [K in keyof T]: Field.Typed<T[K]> };

const isFields = <T>(i: unknown): i is Fields<T> => {
  if (!Obj.isDictionary(i)) return false;
  const fields = Object.values(i);
  return fields.length > 0 && Object.values(i).every((f) => Field.is.typed(f));
};

type FieldEntry<T> = [keyof T, Field.Typed<T[keyof T]>];
type FieldEntries<T> = FieldEntry<T>[];

type FieldDefinitions<T> = {
  [K in keyof T]: {
    type: Field.Type;
    defaultValue: T[K];
    currentValue?: T[K];
    validator?: (v: unknown) => v is T[K];
    merge?: Obj.MergeFn<T[K]>;
  };
};
const createField = <T, K extends keyof T = keyof T>(
  def: FieldDefinitions<T>[K]
): Field.Typed<T[K]> => {
  switch (def.type) {
    case 'object':
      return { type: 'object', instance: Field.create.object(def).instance };
    case 'array':
      return {
        type: 'array',
        instance: Field.create.array<T[K]>({
          defaultValue: Array.isArray(def.defaultValue) ? def.defaultValue : [def.defaultValue]
        }).instance
      };
    case 'primitive':
      return {
        type: 'primitive',
        instance: Field.create.primitive(def).instance
      };
  }
};
type DefinitionEntries<T> = [keyof T, FieldDefinitions<T>[keyof T]][];

const getDefinitionEntries = <T>(cfg: FieldDefinitions<T>) =>
  Object.entries(cfg) as DefinitionEntries<T>;

interface ProcessorHooks<T> {
  pre?: (cfg: unknown) => Obj.FullPartialUnion<T>;
  post?: (cfg: T) => T;
}
interface CreateOpts<T> {
  fields: FieldDefinitions<T> | Fields<T>;
  processorHooks?: ProcessorHooks<T>;
  partial?: Obj.FullPartialUnion<T>;
}
class Schema<T> {
  private readonly _fields = {} as Fields<T>;
  private readonly _hooks: ProcessorHooks<T>;
  constructor({ fields, processorHooks = {}, partial }: CreateOpts<T>) {
    if (isFields<T>(fields)) this._fields = fields;
    else
      getDefinitionEntries<T>(fields).forEach(
        ([key, def]) => (this._fields[key] = createField(def))
      );
    this._hooks = processorHooks;
    if (partial) this.update(partial);
  }
  private get entries() {
    return Object.entries(this._fields) as FieldEntries<T>;
  }
  get current() {
    return Object.fromEntries(this.entries.map(([k, f]) => [k, f.instance.current])) as T;
  }
  get default() {
    return Object.fromEntries(this.entries.map(([k, f]) => [k, f.instance.default])) as T;
  }
  get keys() {
    return Object.keys(this._fields) as (keyof T)[];
  }
  get length() {
    return this.keys.length;
  }
  has(id: string): id is Obj.StrProperty<T> {
    return id in this._fields;
  }
  reset() {
    this.entries.forEach(([k, f]) => f.instance.reset());
    return this;
  }
  set(id: keyof T, value: unknown) {
    this._fields[id].instance.set(value);
    return this;
  }
  update(partial: unknown) {
    if (Obj.isDictionary(partial))
      this.entries.forEach(([k, f]) => {
        if (Obj.isStrKeyOf(k, partial)) f.instance.set(partial[k]);
      });

    return this;
  }
  is(cfg: unknown): cfg is T {
    if (!Obj.isDictionary(cfg) || this.length !== Object.keys(cfg).length) return false;
    return this.entries.every(([k, f]) => Obj.isStrKeyOf(k, cfg) && f.instance.is(cfg[k]));
  }
  partialHasKeys(partial: unknown): partial is Record<keyof T, unknown> {
    if (!Obj.isDictionary(partial)) return false;
    const partialKeys = Object.keys(partial);
    return partialKeys.length > 0 && partialKeys.every(this.has.bind(this));
  }
  clone() {
    return new Schema({
      processorHooks: Obj.clone(this._hooks),
      fields: this.entries.reduce((acc, [k, f]) => {
        switch (f.type) {
          case 'object':
            acc[k] = { type: 'object', instance: f.instance.clone() };
            break;
          case 'array':
            acc[k] = { type: 'array', instance: f.instance.clone() };
            break;
          case 'primitive':
            acc[k] = { type: 'primitive', instance: f.instance.clone() };
        }
        return acc;
      }, {} as Fields<T>)
    });
  }
  process(partial: unknown): T {
    if (!this.partialHasKeys(partial)) return this.current;
    const { post, pre } = this._hooks;
    const preProcessed = pre ? pre(partial) : partial;
    const processed = this.entries.reduce<T>(
      (acc, [k, f]) => ({
        ...acc,
        [k]: f.instance.process(preProcessed[k])
      }),
      preProcessed as T
    );
    return post ? post(processed) : processed;
  }
}
const create = <T>(opts: CreateOpts<T>) => new Schema<T>(opts);
type Instance<T> = InstanceType<typeof Schema<T>>;

export {
  type CreateOpts,
  type FieldDefinitions,
  type Fields,
  type Instance,
  type ProcessorHooks,
  create,
  isFields
};
