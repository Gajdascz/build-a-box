import { describe, expect, it } from 'vitest';
import { create } from './textProcessor.js';

describe('TextProcessor', () => {
  describe('initialization', () => {
    it('creates instance with dynamic dimensions', () => {
      const processor = create({ dimensions: { type: 'dynamic' } });
      expect(processor.schema.current.dimensions.type).toBe('dynamic');
    });

    it('creates instance with fixed dimensions', () => {
      const processor = create({
        dimensions: { type: 'fixed', width: 10, height: 5 }
      });
      expect(processor.schema.current.dimensions.width).toBe(10);
      expect(processor.schema.current.dimensions.height).toBe(5);
    });
  });

  describe('process method', () => {
    it('processes string input with default config', () => {
      const processor = create({ dimensions: { type: 'dynamic' } });
      const result = processor.process('test content');
      expect(result.processed).toEqual(['test content']);
      expect(result.dimensions.content.width).toBe(12);
      expect(result.dimensions.content.height).toBe(1);
    });

    it('processes array input with custom dimensions', () => {
      const processor = create({
        dimensions: { type: 'fixed', width: 5, height: 2 },
        padding: {
          horizontal: {
            left: { char: '>', count: 1 },
            right: { char: '<', count: 1 }
          }
        }
      });
      const result = processor.process(['test', 'content']);
      expect(result.dimensions.padded.width).toBe(7); // 5 + 2 padding
      expect(result.processed[0]).toMatch(/^>.*<$/); // Verify padding chars
    });

    it('handles wrapping with padding', () => {
      const processor = create({
        dimensions: { type: 'fixed', width: 10, height: 3 },
        padding: {
          vertical: { top: { height: 1, fill: { char: '-', count: 1 } } }
        }
      });
      const result = processor.process('this is a long text that should wrap');
      expect(result.processed[0]).toMatch(/^-+$/); // Top padding
      expect(result.processed.length).toBe(4); // height 3 + 1 padding
    });

    it('processes with runtime config override', () => {
      const processor = create({ dimensions: { type: 'dynamic' } });
      const result = processor.process('test', {
        dimensions: { type: 'fixed', width: 4, height: 1 }
      });
      expect(result.processed[0].length).toBe(4);
    });
  });

  describe('dimension resolution', () => {
    it('resolves infinite dimensions correctly', () => {
      const processor = create({
        dimensions: { type: 'fixed', width: Infinity, height: Infinity }
      });
      const result = processor.process(['line1', 'line2']);
      expect(result.dimensions.content.width).toBe(5); // length of 'line1'/'line2'
      expect(result.dimensions.content.height).toBe(2);
    });

    it('accounts for padding in dimension calculations', () => {
      const processor = create({
        dimensions: { type: 'fixed', width: 10, height: 3 },
        padding: {
          horizontal: {
            left: { char: ' ', count: 2 },
            right: { char: ' ', count: 2 }
          }
        }
      });
      const result = processor.process('test');
      expect(result.dimensions.padded.width).toBe(14); // 10 + 4 padding
    });
  });
});
