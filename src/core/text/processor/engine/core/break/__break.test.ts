import { describe, expect, it } from 'vitest';
import * as Break from './break.js';

describe('String Breaking Module', () => {
  const defaultCfg = {
    behavior: 'clean' as const,
    breakWidth: 10
  };

  describe('Basic Breaking', () => {
    it('handles empty string', () => {
      const result = Break.apply({ cfg: defaultCfg, text: '' });
      expect(result).toEqual({ first: '', remaining: [] });
    });

    it('returns full string when within break width', () => {
      const result = Break.apply({ cfg: defaultCfg, text: 'short' });
      expect(result).toEqual({ first: 'short', remaining: [] });
    });
  });

  describe('Break Behaviors', () => {
    const longText = 'this is a very long text to break';
    const longWord = 'supercalifragilisticexpialidocious';

    it('clean break at word boundaries', () => {
      const result = Break.apply({
        cfg: { ...defaultCfg, behavior: 'clean' },
        text: longText
      });
      expect(result.first.length).toBeLessThanOrEqual(defaultCfg.breakWidth);
      expect(result.first).toBe('this is a');
      expect(result.remaining).toEqual(['very', 'long', 'text', 'to', 'break']);
    });

    it('clip break without trailing character', () => {
      const result = Break.apply({
        cfg: { behavior: 'clip', breakWidth: 5 },
        text: longWord
      });
      expect(result.first).toBe(longWord.slice(0, 5));
      expect(result.remaining[0]).toBe(longWord.slice(5));
      expect(result.first.endsWith('-')).toBe(false);
    });

    it('trail break with hyphen', () => {
      const result = Break.apply({
        cfg: { behavior: 'trail', breakWidth: 5 },
        text: longWord
      });
      expect(result.first).toBe(longWord.slice(0, 4) + '-');
      expect(result.remaining[0]).toBe('-' + longWord.slice(4));
    });
  });

  describe('Break Point Resolution', () => {
    it('respects behavior-specific break points', () => {
      const word = 'breaking';
      const clip = Break.apply({
        text: word,
        cfg: { behavior: 'clip', breakWidth: 5 }
      });
      const trail = Break.apply({
        text: word,
        cfg: { behavior: 'trail', breakWidth: 5 }
      });

      expect(clip.first).toBe('break');
      expect(trail.first).toBe('brea-');
    });
  });

  describe('Behavior Validation', () => {
    it('validates break string behaviors', () => {
      expect(Break.isBehavior('clip')).toBe(true);
      expect(Break.isBehavior('clean')).toBe(true);
      expect(Break.isBehavior('clip')).toBe(true);
      expect(Break.isBehavior('invalid')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles single character width with clip', () => {
      const result = Break.apply({
        text: 'test',
        cfg: { behavior: 'clip', breakWidth: 1 }
      });
      expect(result.first).toBe('t');
      expect(result.remaining).toEqual(['est']);
    });
    it('handles single character width with trail', () => {
      const result = Break.apply({
        text: 'test',
        cfg: { behavior: 'trail', breakWidth: 1 }
      });
      expect(result.first).toBe('');
      expect(result.remaining).toEqual(['test']);
    });
    it('handles two character width with trail', () => {
      const result = Break.apply({
        text: 'test',
        cfg: { behavior: 'trail', breakWidth: 2 }
      });
      expect(result.first).toBe('t-');
      expect(result.remaining).toEqual(['-est']);
    });
    it('handles two character width with clip', () => {
      const result = Break.apply({
        text: 'test',
        cfg: { behavior: 'clip', breakWidth: 2 }
      });
      expect(result.first).toBe('te');
      expect(result.remaining).toEqual(['st']);
    });
    it('handles breakWidth smaller than MIN_BREAK_WIDTH', () => {
      const result = Break.apply({
        text: 'test',
        cfg: { breakWidth: 1, behavior: 'clip' }
      });
      expect(result.first).not.toContain('-');
    });
    it('handles multiple spaces between words with different behaviors', () => {
      const text = 'word1    word2';
      const clean = Break.apply({
        text,
        cfg: { behavior: 'clean', breakWidth: 6 }
      });
      const clip = Break.apply({
        text,
        cfg: { behavior: 'clip', breakWidth: 6 }
      });
      const trail = Break.apply({
        text,
        cfg: { behavior: 'trail', breakWidth: 6 }
      });

      expect(clean.first).toBe('word1');
      expect(clip.first).toBe('word1');
      expect(trail.first).toBe('word1');
    });
    it('handles string starting with spaces', () => {
      const result = Break.apply({ text: '   word', cfg: defaultCfg });
      expect(result.first).toBe('word');
    });
    it('handles exact word length with trail', () => {
      const result = Break.apply({
        text: 'word word',
        cfg: { behavior: 'trail', breakWidth: 4 }
      });
      expect(result.first).toBe('word');
      expect(result.remaining).toEqual(['word']);
    });
  });

  describe('Break Point Resolution', () => {
    it('handles exact word length matches', () => {
      const result = Break.apply({
        text: 'word word',
        cfg: { ...defaultCfg, breakWidth: 4 }
      });
      expect(result.first).toBe('word');
      expect(result.remaining).toEqual(['word']);
    });

    it('preserves remaining words order', () => {
      const result = Break.apply({
        text: 'one two three',
        cfg: { ...defaultCfg, breakWidth: 5 }
      });
      expect(result.remaining).toEqual(['two', 'three']);
    });
  });

  describe('Format Break Result', () => {
    it('filters empty strings from remaining words', () => {
      const result = Break.apply({ text: 'word  \n  next', cfg: defaultCfg });
      expect(result.remaining).not.toContain('');
    });

    it('trims whitespace from first line', () => {
      const result = Break.apply({ text: '  word  ', cfg: defaultCfg });
      expect(result.first).toBe('word');
    });
  });
});
