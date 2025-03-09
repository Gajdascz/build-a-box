import { describe, expect, it } from 'vitest';
import { is } from './directions.js';

describe('direction', () => {
  describe('is', () => {
    describe('leftToRight', () => {
      it('True when source x is less than target x', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 1, y: 0 } };
        expect(is.leftToRight(path)).toBe(true);
      });

      it('False when source x is greater than target x', () => {
        const path = { source: { x: 1, y: 0 }, target: { x: 0, y: 0 } };
        expect(is.leftToRight(path)).toBe(false);
      });
    });
    describe('topToBottom', () => {
      it('True when source y is less than target y', () => {
        const path = { source: { x: 0, y: 0 }, target: { x: 0, y: 1 } };
        expect(is.topToBottom(path)).toBe(true);
      });

      it('False when source y is greater than target y', () => {
        const path = { source: { x: 0, y: 1 }, target: { x: 0, y: 0 } };
        expect(is.topToBottom(path)).toBe(false);
      });
    });
  });
});
