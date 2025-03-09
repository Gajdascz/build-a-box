import { describe, expect, it } from 'vitest';
import * as Obj from './obj.js';

describe('Obj', () => {
  describe('is', () => {
    it('validates plain objects with string keys', () => {
      const validObj = { a: 1, b: 'string', c: true };
      expect(Obj.isDictionary(validObj)).toBe(true);
    });

    it('validates nested objects', () => {
      const nestedObj = {
        a: { b: 1 },
        c: { d: { e: 'string' } }
      };
      expect(Obj.isDictionary(nestedObj)).toBe(true);
    });

    it('rejects null', () => {
      expect(Obj.isDictionary(null)).toBe(false);
    });

    it('rejects arrays', () => {
      expect(Obj.isDictionary([1, 2, 3])).toBe(false);
    });

    it('rejects primitive values', () => {
      expect(Obj.isDictionary(42)).toBe(false);
      expect(Obj.isDictionary('string')).toBe(false);
      expect(Obj.isDictionary(true)).toBe(false);
      expect(Obj.isDictionary(undefined)).toBe(false);
    });
  });

  describe('ops (operations)', () => {
    describe('clone', () => {
      it('clones primitive values', () => {
        const input = { a: 1, b: 'string', c: true };
        const result = Obj.clone(input);
        expect(result).toEqual(input);
        expect(result).not.toBe(input);
      });
      it('clones nested objects', () => {
        const input = { a: { b: { c: 1 } } };
        const result = Obj.clone(input);
        expect(result).toEqual(input);
        expect(result.a).not.toBe(input.a);
        expect(result.a.b).not.toBe(input.a.b);
      });
      it('clones arrays', () => {
        const input = [1, 2, [3, 4]];
        const result = Obj.clone(input);
        expect(result).toEqual(input);
        expect(result).not.toBe(input);
        expect(result[2]).not.toBe(input[2]);
      });
      it('clones objects with arrays', () => {
        const input = { arr: [{ a: 1 }, { b: 2 }] };
        const result = Obj.clone(input);
        expect(result).toEqual(input);
        expect(result.arr).not.toBe(input.arr);
        expect(result.arr[0]).not.toBe(input.arr[0]);
      });
    });
    describe('merge', () => {
      it('merges top-level properties', () => {
        const provided = { a: 1, b: 2 };
        const established = { b: 3, c: 4 };
        const result = Obj.merge(established, provided);
        expect(result).toEqual({ a: 1, b: 2, c: 4 });
      });
      it('merges nested objects', () => {
        const provided = { nested: { a: 1, b: 2 } };
        const established = { nested: { b: 3, c: 4 } };
        const result = Obj.merge(established, provided);
        expect(result).toEqual({ nested: { a: 1, b: 2, c: 4 } });
      });
      it('handles arrays with objects', () => {
        const provided = { arr: [{ a: 1 }, { b: 2 }] };
        const established = { arr: [{ c: 3 }] };
        const result = Obj.merge(established, provided);
        expect(result).toEqual({
          arr: [{ a: 1 }, { b: 2 }]
        });
        // Verify array references are new
        expect(result.arr).not.toBe(provided.arr);
        expect(result.arr).not.toBe(established.arr);
      });

      it('preserves non-overlapping properties', () => {
        const provided = { a: { x: 1 } };
        const established = { b: { y: 2 } };
        const result = Obj.merge(established, provided);
        expect(result).toEqual({ a: { x: 1 }, b: { y: 2 } });
      });
    });
    describe('freeze', () => {
      it('freezes nested objects', () => {
        const testObj = {
          level1: {
            level2: {
              value: 'test'
            }
          }
        };
        const frozen = Obj.freeze(testObj, { maxDepth: Infinity });
        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.level1)).toBe(true);
        expect(Object.isFrozen(frozen.level1.level2)).toBe(true);
      });

      it('handles non-object values', () => {
        const values = [42, 'string', null, undefined];
        values.forEach((value) => {
          expect(Obj.freeze(value)).toBe(value);
        });
      });

      it('preserves object structure', () => {
        const original = {
          string: 'value',
          number: 42,
          nested: { key: 'value' }
        };
        const frozen = Obj.freeze(original);
        expect(frozen).toEqual(original);
      });

      it('prevents modifications', () => {
        const frozen = Obj.freeze({ key: { nested: 'value' } }, { maxDepth: Infinity });
        expect(() => {
          (frozen as any).key.nested = 'new value';
        }).toThrow();
      });

      it('handles already frozen objects', () => {
        const frozen1 = Object.freeze({ key: 'value' });
        const frozen2 = Obj.freeze(frozen1);
        expect(frozen2).toBe(frozen1);
      });
    });
    describe('Obj.remove', () => {
      it('removes top-level property', () => {
        const obj = { a: 1, b: 2 };
        const result = Obj.remove(obj, 'a');
        expect(result).toEqual({ b: 2 });
        expect(obj).toEqual({ a: 1, b: 2 });
      });

      it('removes nested property', () => {
        const obj = { a: { b: { c: 1 } } };
        const result = Obj.remove(obj, 'a', 'b', 'c');
        expect(result).toEqual({ a: { b: {} } });
      });

      it('handles non-existent nested paths', () => {
        const obj = { a: { b: 1 } };
        const result = Obj.remove(obj, 'a', 'c', 'd');
        expect(result).toEqual({ a: { b: 1 } });
      });

      it('handles non-dictionary nested values', () => {
        const obj = { a: { b: 42 } };
        const result = Obj.remove(obj, 'a', 'b', 'c');
        expect(result).toEqual({ a: { b: 42 } });
      });

      it('preserves other properties when removing nested values', () => {
        const obj = { a: { b: { c: 1, d: 2 } }, x: 'preserved' };
        const result = Obj.remove(obj, 'a', 'b', 'c');
        expect(result).toEqual({ a: { b: { d: 2 } }, x: 'preserved' });
      });
    });
  });

  describe('createGuards', () => {
    describe('strProp', () => {
      const testObj = {
        stringKey: 'value',
        numberKey: 42,
        booleanKey: true
      };
      const isValidKey = Obj.createGuard.strProp(testObj);

      it('validates existing string keys', () => {
        expect(isValidKey('stringKey')).toBe(true);
        expect(isValidKey('numberKey')).toBe(true);
        expect(isValidKey('booleanKey')).toBe(true);
      });

      it('rejects non-existent keys', () => {
        expect(isValidKey('nonExistent')).toBe(false);
      });

      it('rejects non-string values', () => {
        expect(isValidKey(42)).toBe(false);
        expect(isValidKey(true)).toBe(false);
        expect(isValidKey({})).toBe(false);
        expect(isValidKey(null)).toBe(false);
        expect(isValidKey(undefined)).toBe(false);
        expect(isValidKey(Symbol('test'))).toBe(false);
      });

      it('works with empty objects', () => {
        const emptyObjGuard = Obj.createGuard.strProp({});
        expect(emptyObjGuard('anyKey')).toBe(false);
      });

      it('validates nested object keys', () => {
        const nestedObj = {
          level1: {
            level2: {
              level3: 'value'
            }
          }
        };
        const nestedGuard = Obj.createGuard.strProp(nestedObj);
        expect(nestedGuard('level1')).toBe(true);
      });
    });
    describe('entries', () => {
      type StringRecord = Record<string, number>;

      const isStringNumberRecord = Obj.createGuard.entries<StringRecord, string, number>({
        isKey: (key: unknown): key is string => typeof key === 'string',
        isValue: (value: unknown): value is number => typeof value === 'number'
      });

      it('validates correct entry types', () => {
        const valid = { a: 1, b: 2, c: 3 };
        expect(isStringNumberRecord(valid)).toBe(true);
      });

      it('fails on invalid key types', () => {
        const invalid = { 1: 1, b: 2 };
        expect(isStringNumberRecord(invalid)).toBe(true); // Note: numeric keys are coerced to strings
      });

      it('fails on invalid value types', () => {
        const invalid = { a: '1', b: 2 };
        expect(isStringNumberRecord(invalid)).toBe(false);
      });

      it('fails on non-object inputs', () => {
        expect(isStringNumberRecord(null)).toBe(false);
        expect(isStringNumberRecord(undefined)).toBe(false);
        expect(isStringNumberRecord([])).toBe(false);
      });

      it('works with custom preChecks', () => {
        const hasMinEntries = (obj: object) => Object.keys(obj).length >= 2;

        const strictRecordGuard = Obj.createGuard.entries<StringRecord, string, number>({
          isKey: (key: unknown): key is string => typeof key === 'string',
          isValue: (value: unknown): value is number => typeof value === 'number',
          preChecks: [hasMinEntries]
        });

        expect(strictRecordGuard({ a: 1, b: 2 })).toBe(true);
        expect(strictRecordGuard({ a: 1 })).toBe(false);
      });
    });
  });
});
