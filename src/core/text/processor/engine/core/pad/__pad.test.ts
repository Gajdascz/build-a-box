import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Pad from './pad.js';

let spies;
describe('Pad', () => {
  beforeEach(() => {
    spies = {
      applyHorizontal: vi.spyOn(Pad.Horizontal, 'apply'),
      applyVertical: vi.spyOn(Pad.Vertical, 'apply'),
      apply: vi.spyOn(Pad, 'apply')
    };
  });

  describe('isCfg', () => {
    it('returns true for valid config', () => {
      const validConfig: Pad.Cfg = {
        horizontal: {
          left: { char: ' ', count: 0 },
          right: { char: ' ', count: 0 }
        },
        vertical: {
          top: { height: 0, fill: { char: ' ', count: 0 } },
          bottom: { height: 0, fill: { char: ' ', count: 0 } }
        }
      };

      expect(Pad.isCfg(validConfig)).toBe(true);
    });

    it('returns false for invalid config', () => {
      expect(Pad.isCfg({})).toBe(false);
      expect(Pad.isCfg(null)).toBe(false);
      expect(Pad.isCfg(undefined)).toBe(false);
    });
  });

  describe('apply', () => {
    it('handles string input', () => {
      const result = Pad.apply('test\nstring');
      expect(result).toEqual(['test', 'string']);
    });

    it('handles array input', () => {
      const input = ['test', 'string'];
      const result = Pad.apply(input);
      expect(result).toEqual(input);
    });

    it('applies horizontal padding when specified', () => {
      const input = ['test'];
      const config = { horizontal: { left: { count: 1 } } };

      Pad.apply(input, config);

      expect(spies.applyHorizontal).toHaveBeenCalledWith(
        input,
        config.horizontal
      );
    });

    it('applies vertical padding when specified', () => {
      const input = ['test'];
      const config = { vertical: { top: { height: 1 } } };
      Pad.apply(input, config);
      expect(spies.applyVertical).toHaveBeenCalledWith(input, config.vertical);
    });

    it('applies both paddings when specified', () => {
      const input = ['test'];
      const config = {
        horizontal: { left: { count: 1 } },
        vertical: { top: { height: 1 } }
      };

      Pad.apply(input, config);

      expect(spies.applyHorizontal).toHaveBeenCalled();
      expect(spies.applyVertical).toHaveBeenCalled();
    });
  });

  describe('getTotals', () => {
    it('calculates correct totals', () => {
      const config: Pad.Cfg = {
        horizontal: {
          left: { count: 2, char: ' ' },
          right: { count: 3, char: ' ' }
        },
        vertical: {
          top: { height: 1, fill: { char: ' ', count: 0 } },
          bottom: { height: 2, fill: { char: ' ', count: 0 } }
        }
      };

      const totals = Pad.getTotals(config);

      expect(totals).toEqual({
        horizontal: 5,
        vertical: 3
      });
    });
  });
});
