import { describe, expect, it } from 'vitest';
import * as Words from './words.js';

describe('Words', () => {
  describe('get', () => {
    it('splits text into words', () => {
      const input = 'hello world example';
      expect(Words.get(input)).toEqual(['hello', 'world', 'example']);
    });

    it('handles multiple spaces between words', () => {
      const input = 'hello    world   example';
      expect(Words.get(input)).toEqual(['hello', 'world', 'example']);
    });

    it('handles leading and trailing spaces', () => {
      const input = '   hello world   ';
      expect(Words.get(input)).toEqual(['hello', 'world']);
    });

    it('returns empty array for empty string', () => {
      expect(Words.get('')).toEqual([]);
    });

    it('returns empty array for whitespace-only string', () => {
      expect(Words.get('   ')).toEqual([]);
    });
  });

  describe('buildChunk', () => {
    it('returns full text when shorter than maxLength', () => {
      const result = Words.buildChunk('hello world', 15);
      expect(result).toEqual({
        chunk: 'hello world',
        remainingWords: []
      });
    });

    it('splits text at word boundary within maxLength', () => {
      const result = Words.buildChunk('hello world example', 11);
      expect(result).toEqual({
        chunk: 'hello world',
        remainingWords: ['example']
      });
    });

    it('handles single word longer than maxLength', () => {
      const result = Words.buildChunk('supercalifragilistic', 5);
      expect(result).toEqual({
        chunk: '',
        remainingWords: ['supercalifragilistic']
      });
    });

    it('handles exact length match', () => {
      const result = Words.buildChunk('hello world', 11);
      expect(result).toEqual({
        chunk: 'hello world',
        remainingWords: []
      });
    });

    it('returns empty chunk for invalid input', () => {
      const result = Words.buildChunk(null as unknown as string, 10);
      expect(result).toEqual({
        chunk: '',
        remainingWords: []
      });
    });

    it('handles first word exactly matching maxLength', () => {
      const result = Words.buildChunk('hello world', 5);
      expect(result).toEqual({
        chunk: 'hello',
        remainingWords: ['world']
      });
    });
  });
});
