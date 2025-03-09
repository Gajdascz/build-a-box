import type { Border } from '#srcTypes';
import { describe, expect, it } from 'vitest';
import { add, get, set } from './border';

describe('border', () => {
  const sampleMatrix = [
    ['a', 'b'],
    ['c', 'd']
  ];

  describe('get.coordinates', () => {
    it('correctly maps corner coordinates', () => {
      const { corners } = get.coordinates(sampleMatrix);

      expect(corners.topLeft).toEqual({ y: 0, x: 0 });
      expect(corners.topRight).toEqual({ y: 0, x: 1 });
      expect(corners.bottomLeft).toEqual({ y: 1, x: 0 });
      expect(corners.bottomRight).toEqual({ y: 1, x: 1 });
    });

    it('correctly maps edge coordinates', () => {
      const { edges } = get.coordinates([
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);

      expect(edges.top).toHaveLength(1);
      expect(edges.top[0]).toEqual({ y: 0, x: 1 });

      expect(edges.bottom).toHaveLength(1);
      expect(edges.bottom[0]).toEqual({ y: 1, x: 1 });

      expect(edges.left).toHaveLength(0);
      expect(edges.right).toHaveLength(0);
    });
  });

  describe('set', () => {
    it('applies default light border style', () => {
      const result = set(sampleMatrix, 'light');
      expect(result[0][0]).toBe('┌');
      expect(result[0][1]).toBe('┐');
      expect(result[1][0]).toBe('└');
      expect(result[1][1]).toBe('┘');
    });

    it('applies custom border characters', () => {
      const customBorder: Border.Border = {
        top: '=',
        bottom: '=',
        left: '|',
        right: '|',
        topLeft: '+',
        topRight: '+',
        bottomLeft: '+',
        bottomRight: '+',
        junctions: { up: '+', down: '+', left: '+', right: '+', cross: '+' }
      };

      const result = add(sampleMatrix, customBorder);

      expect(result[0][0]).toBe('+');
      expect(result[0][2]).toBe('=');
    });
  });

  describe('add', () => {
    it('adds border with default light style', () => {
      const result = add(sampleMatrix);

      expect(result).toHaveLength(4);
      expect(result[0]).toHaveLength(4);
      expect(result[0][0]).toBe('┌');
    });

    it('adds border with custom style', () => {
      const result = add(sampleMatrix, 'double');
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveLength(4);
      expect(result[0][0]).toBe('╔');
    });

    it('handles empty matrix', () => {
      const result = add([]);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[0][0]).toBe('┌');
      expect(result[0][1]).toBe('┐');
    });
  });
});
