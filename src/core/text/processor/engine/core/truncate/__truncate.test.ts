import { describe, expect, it } from 'vitest';
import * as Truncate from './truncate.js';

const suffix = { char: '.', length: 3, forceApply: false };

describe('truncateStr', () => {
  describe('Default Behavior', () => {
    it('returns original text when target length equals text length', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: { targetLength: 5 }
        })
      ).toBe('hello');
    });

    it('returns original text when target length greater than text length', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: { targetLength: 10 }
        })
      ).toBe('hello');
    });

    it('returns original text when target length plus affix length equals target length', () => {
      const testStr = 'hello world';
      expect(Truncate.apply({ text: testStr, cfg: {} })).toBe(testStr);
    });
  });

  describe('Truncation with Default Affix', () => {
    it('truncates text with default affix (3 dots)', () => {
      expect(
        Truncate.apply({
          text: 'hello world',
          cfg: { targetLength: 6, suffix }
        })
      ).toBe('hel...');
    });

    it('handles exact truncation points', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: { targetLength: 4, suffix }
        })
      ).toBe('h...');
    });
  });

  describe('Custom Affix Configuration', () => {
    it('truncates with custom affix character', () => {
      expect(
        Truncate.apply({
          text: 'hello world',
          cfg: {
            targetLength: 6,
            suffix: { char: '-', length: 3, forceApply: false }
          }
        })
      ).toBe('hel---');
    });

    it('truncates with custom affix length', () => {
      expect(
        Truncate.apply({
          text: 'hello world',
          cfg: {
            targetLength: 6,
            suffix: { char: '.', length: 2, forceApply: false }
          }
        })
      ).toBe('hell..');
    });

    it('handles single character affix', () => {
      expect(
        Truncate.apply({
          text: 'hello world',
          cfg: {
            targetLength: 6,
            suffix: { char: '>', length: 1, forceApply: false }
          }
        })
      ).toBe('hello>');
    });
  });

  describe('Invalid Inputs', () => {
    it('clips original text when effective length is negative', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: {
            targetLength: 3,
            suffix: { char: '.', length: 4, forceApply: false }
          }
        })
      ).toBe('hel');
    });

    it('returns clipped text when affix length is zero or negative', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: {
            targetLength: 3,
            suffix: { char: '.', length: 0, forceApply: false }
          }
        })
      ).toBe('hel');
    });

    it('returns original text when affix char is invalid', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: {
            targetLength: 3,
            suffix: { char: '', length: 3, forceApply: false }
          }
        })
      ).toBe('hel');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string input', () => {
      expect(
        Truncate.apply({
          text: '',
          cfg: { targetLength: 0 }
        })
      ).toBe('');
    });

    it('handles whitespace-only string', () => {
      expect(
        Truncate.apply({
          text: ' ',
          cfg: { targetLength: 2 }
        })
      ).toBe('');
    });

    it('handles exact length matches', () => {
      expect(
        Truncate.apply({
          text: 'hello',
          cfg: { targetLength: 5 }
        })
      ).toBe('hello');
    });
  });
});
