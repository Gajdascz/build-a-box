import { describe, expect, it } from 'vitest';
import * as Wrap from './wrap.js';

describe('Wrap Module', () => {
  const dimensions = { width: 10, height: 5 };
  const defaultWrapCfg: Wrap.Cfg = {
    horizontalBreakBehavior: 'clip',
    verticalOverflowBehavior: 'clip'
  };
  describe('apply', () => {
    it('wraps text within dimensions using clip behavior', () => {
      const text = 'this is a long line that needs wrapping';
      const result = Wrap.apply({ text, dimensions, cfg: defaultWrapCfg });
      expect(result).toHaveLength(4);
      expect(result[0]).toBe('this is a');
      expect(result[1]).toBe('long line');
    });

    it('handles vertical overflow with ellipsis', () => {
      const text = 'line1\nline2\nline3\nline4\nline5\nline6';
      const result = Wrap.apply({
        text,
        dimensions: { width: 10, height: 3 },
        cfg: { ...defaultWrapCfg, verticalOverflowBehavior: 'ellipsis' }
      });
      expect(result).toHaveLength(3);
      expect(result[2]).toMatch(/\.\.\.$/);
    });

    it('handles empty input', () => {
      const result = Wrap.apply({ text: '', dimensions, cfg: defaultWrapCfg });
      expect(result).toHaveLength(0);
    });
  });
  describe('isCfg', () => {
    it('validates correct configuration', () => {
      const validConfig: Wrap.Cfg = {
        horizontalBreakBehavior: 'clip',
        verticalOverflowBehavior: 'clip'
      };
      expect(Wrap.isCfg(validConfig)).toBe(true);
    });
    it('validates all valid vertical overflow behaviors', () => {
      const configs: Wrap.Cfg[] = [
        {
          horizontalBreakBehavior: 'clean',
          verticalOverflowBehavior: 'clip'
        },
        {
          horizontalBreakBehavior: 'trail',
          verticalOverflowBehavior: 'ellipsis'
        }
      ];
      configs.forEach((config) => {
        expect(Wrap.isCfg(config)).toBe(true);
      });
    });
    it('validates all valid horizontal break behaviors', () => {
      const configs: Wrap.Cfg[] = [
        {
          horizontalBreakBehavior: 'clean',
          verticalOverflowBehavior: 'clip'
        },
        {
          horizontalBreakBehavior: 'trail',
          verticalOverflowBehavior: 'clip'
        }
      ];
      configs.forEach((config) => {
        expect(Wrap.isCfg(config)).toBe(true);
      });
    });
    it('rejects invalid vertical overflow behaviors', () => {
      const invalidConfig = {
        horizontalBreakBehavior: 'word',
        verticalOverflowBehavior: 'invalid'
      };
      expect(Wrap.isCfg(invalidConfig)).toBe(false);
    });
    it('rejects invalid horizontal break behaviors', () => {
      const invalidConfig = {
        horizontalBreakBehavior: 'invalid',
        verticalOverflowBehavior: 'clip'
      };
      expect(Wrap.isCfg(invalidConfig)).toBe(false);
    });
    it('rejects non-object inputs', () => {
      const invalidInputs = [null, undefined, 42, 'string', [], true];
      invalidInputs.forEach((input) => {
        expect(Wrap.isCfg(input)).toBe(false);
      });
    });
    it('rejects objects with missing properties', () => {
      const invalidConfigs = [
        { horizontalBreakBehavior: 'word' },
        { verticalOverflowBehavior: 'clip' },
        {}
      ];
      invalidConfigs.forEach((config) => {
        expect(Wrap.isCfg(config)).toBe(false);
      });
    });
  });
});
