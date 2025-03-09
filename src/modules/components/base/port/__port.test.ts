import { Text } from '#core';
import { Position } from '#srcTypes';
import { describe, expect, it } from 'vitest';
import { create, is } from './port';

describe('Port Module', () => {
  const chars = { closed: 'x', outward: '>', inward: '<', cross: '+' } as const;
  const dimensions = { width: 5, height: 5 };

  const positionMaps = {
    chars: {
      top: chars,
      bottom: chars,
      left: chars,
      right: chars,
      topLeft: chars,
      topRight: chars,
      bottomLeft: chars,
      bottomRight: chars
    },
    cfgs: {
      top: { position: 'top', coordinates: { x: 2, y: 0 }, chars },
      bottom: { position: 'bottom', coordinates: { x: 2, y: 0 }, chars },
      left: { position: 'left', coordinates: { x: 0, y: 2 }, chars },
      right: { position: 'right', coordinates: { x: 5, y: 2 }, chars },
      topLeft: { position: 'topLeft', coordinates: { x: 0, y: 5 }, chars },
      topRight: { position: 'topRight', coordinates: { x: 5, y: 5 }, chars },
      bottomLeft: {
        position: 'bottomLeft',
        coordinates: { x: 0, y: 0 },
        chars
      },
      bottomRight: {
        position: 'bottomRight',
        coordinates: { x: 5, y: 0 },
        chars
      }
    }
  } as const;

  const testMatrix = Text.Matrix.create.from.dimensions(dimensions);

  describe('Port Creation', () => {
    it('creates a port with correct structure', () => {
      const port = create.port(positionMaps.cfgs.top);
      expect(port.position).toBe('top');
      expect(port.coordinates).toEqual({ x: 2, y: 0 });
      expect(port.chars).toEqual(chars);
      expect(typeof port.setChar).toBe('function');
    });

    it('creates immutable port instance', () => {
      const port = create.port(positionMaps.cfgs.top);
      expect(() => (port.coordinates.x = 3)).toThrow();
    });
  });

  describe('Port Module Creation', () => {
    const portModule = create.module(dimensions, positionMaps.chars);

    it('creates module with correct port positions', () => {
      const ports = portModule.ports;
      const portKeys = Object.keys(ports as object);
      const positions = Object.values(Position.G.perimeter);
      expect(portKeys.length === positions.length && portKeys.every((key) => key in positions));
    });

    it('calculates correct coordinates for all ports', () => {
      const { top, bottom, left, right } = portModule.sides;

      expect(top.coordinates).toEqual({ x: 2, y: 0 });
      expect(bottom.coordinates).toEqual({ x: 2, y: 4 });
      expect(left.coordinates).toEqual({ x: 0, y: 2 });
      expect(right.coordinates).toEqual({ x: 4, y: 2 });
    });
  });

  describe('Port Operations', () => {
    const portModule = create.module(dimensions, positionMaps.chars);

    it('sets character at port position', () => {
      const result: Text.Matrix.Matrix = portModule.set.position(testMatrix, 'top', 'closed');
      expect(Text.Matrix.get.cell(result, { x: 2, y: 0 })).toBe('x');
    });

    it('sets all ports to specified character', () => {
      const result: Text.Matrix.Matrix = portModule.set.all(testMatrix, 'cross');
      // Check all port positions have cross character
      portModule.forEach.port(({ coordinates: { x, y } }) => {
        expect(Text.Matrix.get.cell(result, { x, y })).toBe('+');
      });
    });
  });

  describe('Port Retrieval', () => {
    const portModule = create.module(dimensions, positionMaps.chars);

    it('retrieves specific port', () => {
      const port = portModule.get('top');
      expect(port.position).toBe('top');
      expect(port.coordinates).toEqual({ x: 2, y: 0 });
    });

    it('retrieves ports by positions', () => {
      const positions = ['top', 'bottom'] as const;
      const ports = portModule.getBy.positions(positions);
      expect(Object.keys(ports as object)).toEqual(positions);
    });

    it('retrieves side ports', () => {
      const sides = portModule.sides;
      expect(Object.keys(sides as object)).toEqual(['top', 'bottom', 'left', 'right']);
    });

    it('retrieves corner ports', () => {
      const corners = portModule.corners;
      expect(Object.keys(corners as object)).toEqual([
        'bottomLeft',
        'bottomRight',
        'topLeft',
        'topRight'
      ]);
    });
  });

  describe('Type Guards', () => {
    it('validates char keys', () => {
      expect(is.charKey('closed')).toBe(true);
      expect(is.charKey('invalid')).toBe(false);
    });

    it('validates port chars', () => {
      expect(is.portChars(chars)).toBe(true);
      expect(is.portChars({ invalid: 'x' })).toBe(false);
    });

    it('validates port position', () => {
      expect(is.portPosition('top')).toBe(true);
      expect(is.portPosition('invalid')).toBe(false);
    });

    it('validates port object', () => {
      const port = create.port({
        position: 'top',
        coordinates: { x: 2, y: 0 },
        chars
      });
      expect(is.port(port)).toBe(true);
      expect(is.port({})).toBe(false);
    });
  });
});
