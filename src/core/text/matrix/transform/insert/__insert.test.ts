import { describe, expect, it } from 'vitest';
import { get } from '../../base/get/get.js';
import * as Base from '../../base/index.js';
import { insert } from './insert.js';
describe('Base insert', () => {
  describe('row', () => {
    const matrix = Base.create.from.dimensions({ height: 2, width: 2 });

    it('inserts row at beginning when index is 0', () => {
      const result = insert.row(matrix, 0);
      expect(get.dimensions(result)).toEqual({ height: 3, width: 2 });
      expect(result[0]).toEqual([' ', ' ']);
    });

    it('inserts row at end when index is Infinity', () => {
      const result = insert.row(matrix);
      expect(get.dimensions(result)).toEqual({ height: 3, width: 2 });
      expect(result[2]).toEqual([' ', ' ']);
    });

    it('inserts row at specified index', () => {
      const result = insert.row(matrix, 1);
      expect(get.dimensions(result)).toEqual({ height: 3, width: 2 });
      expect(result[1]).toEqual([' ', ' ']);
    });

    it('handles negative indices by inserting at beginning', () => {
      const result = insert.row(matrix, -1);
      expect(get.dimensions(result)).toEqual({ height: 3, width: 2 });
      expect(result[0]).toEqual([' ', ' ']);
    });
  });
  describe('column', () => {
    const matrix = Base.create.from.dimensions({ height: 2, width: 2 });

    it('inserts column at beginning when index is 0', () => {
      const result = insert.column(matrix, 0);
      expect(get.dimensions(result)).toEqual({ height: 2, width: 3 });
      result.forEach((row) => {
        expect(row[0]).toBe(' ');
      });
    });

    it('inserts column at end when index is Infinity', () => {
      const result = insert.column(matrix);
      expect(get.dimensions(result)).toEqual({ height: 2, width: 3 });
      result.forEach((row) => {
        expect(row[2]).toBe(' ');
      });
    });

    it('inserts column at specified index', () => {
      const result = insert.column(matrix, 1);
      expect(get.dimensions(result)).toEqual({ height: 2, width: 3 });
      result.forEach((row) => {
        expect(row[1]).toBe(' ');
      });
    });

    it('handles negative indices by inserting at beginning', () => {
      const result = insert.column(matrix, -1);
      expect(get.dimensions(result)).toEqual({ height: 2, width: 3 });
      result.forEach((row) => {
        expect(row[0]).toBe(' ');
      });
    });
  });
  describe('matrix insertion', () => {
    describe('basic functionality', () => {
      it('should insert target matrix into source matrix at given position', () => {
        const target = [
          ['A', 'B', 'C'],
          ['D', 'E', 'F'],
          ['G', 'H', 'I']
        ];
        const source = [
          ['1', '2'],
          ['3', '4']
        ];
        const position = { x: 0, y: 0 };

        const result = insert.matrix(target, source, position, 'horizontal');
        expect(result.matrix).toEqual([
          ['1', '2', 'C'],
          ['3', '4', 'F'],
          ['G', 'H', 'I']
        ]);
      });

      it('should handle insertion at non-zero position', () => {
        const target = [
          ['A', 'B', 'C'],
          ['D', 'E', 'F'],
          ['G', 'H', 'I']
        ];
        const source = [['X']];
        const position = { x: 1, y: 1 };

        const result = insert.matrix(target, source, position, 'horizontal');

        expect(result.matrix).toEqual([
          ['A', 'B', 'C'],
          ['D', 'X', 'F'],
          ['G', 'H', 'I']
        ]);
      });
    });

    describe('endpoint calculation', () => {
      it('should calculate horizontal endpoint correctly', () => {
        const source = [
          ['A', 'B'],
          ['C', 'D']
        ];
        const target = [['1', '2']];
        const position = { x: 0, y: 0 };

        const { endpoint, matrix } = insert.matrix(source, target, position, 'horizontal');
        expect(endpoint).toEqual(1);
      });

      it('should calculate vertical endpoint correctly', () => {
        const source = [
          ['A', 'B'],
          ['C', 'D']
        ];
        const target = [['1'], ['2']];
        const position = { x: 0, y: 0 };

        const { endpoint } = insert.matrix(source, target, position, 'vertical');

        expect(endpoint).toEqual(1);
      });
    });

    describe('error handling', () => {
      it('should throw error when position is out of bounds', () => {
        const source = [['A']];
        const target = [['1']];
        const position = { x: 1, y: 1 };

        expect(() => insert.matrix(source, target, position, 'horizontal')).toThrow();
      });

      it('should throw error when target matrix exceeds source bounds', () => {
        const source = [['A', 'B']];
        const target = [['1', '2', '3']];
        const position = { x: 0, y: 0 };

        expect(() => insert.matrix(source, target, position, 'horizontal')).toThrow();
      });
    });

    describe('edge cases', () => {
      it('should handle empty source matrix', () => {
        const source: string[][] = [];
        const target = [['1']];
        const position = { x: 0, y: 0 };

        expect(() => insert.matrix(source, target, position, 'horizontal')).toThrow();
      });

      it('should handle empty target matrix', () => {
        const source = [['A']];
        const target: string[][] = [];
        const position = { x: 0, y: 0 };

        const result = insert.matrix(source, target, position, 'horizontal');
        expect(result.matrix).toEqual([['A']]);
      });

      it('should handle insertion at matrix boundaries', () => {
        const source = [
          ['A', 'B'],
          ['C', 'D']
        ];
        const target = [['X']];

        // Test corners
        const topLeft = insert.matrix(source, target, { x: 0, y: 0 }, 'horizontal');
        const topRight = insert.matrix(source, target, { x: 1, y: 0 }, 'horizontal');
        const bottomLeft = insert.matrix(source, target, { x: 0, y: 1 }, 'horizontal');
        const bottomRight = insert.matrix(source, target, { x: 1, y: 1 }, 'horizontal');

        expect(topLeft.matrix[0][0]).toBe('X');
        expect(topRight.matrix[0][1]).toBe('X');
        expect(bottomLeft.matrix[1][0]).toBe('X');
        expect(bottomRight.matrix[1][1]).toBe('X');
      });
    });
  });
  describe('directional matrix insertion', () => {
    const target = [
      ['A', 'B'],
      ['C', 'D']
    ];

    const source = [
      ['X', 'Y'],
      ['Z', 'W']
    ];

    describe('matrixAbove', () => {
      it('should insert source matrix above target matrix without spacing', () => {
        const result = insert.matrixAbove(target, source);
        expect(result).toEqual([
          ['X', 'Y'],
          ['Z', 'W'],
          ['A', 'B'],
          ['C', 'D']
        ]);
      });

      it('should insert source matrix above target matrix with spacing', () => {
        const result = insert.matrixAbove(target, source, 2);
        expect(result).toEqual([
          ['X', 'Y'],
          ['Z', 'W'],
          [' ', ' '],
          [' ', ' '],
          ['A', 'B'],
          ['C', 'D']
        ]);
      });

      it('should normalize matrices with different widths', () => {
        const narrowSource = [['X'], ['Y']];
        const result = insert.matrixAbove(target, narrowSource);
        expect(result).toEqual([
          ['X', ' '],
          ['Y', ' '],
          ['A', 'B'],
          ['C', 'D']
        ]);
      });
    });

    describe('matrixBelow', () => {
      it('should insert source matrix below target matrix without spacing', () => {
        const result = insert.matrixBelow(target, source);

        expect(result).toEqual([
          ['A', 'B'],
          ['C', 'D'],
          ['X', 'Y'],
          ['Z', 'W']
        ]);
      });

      it('should insert source matrix below target matrix with spacing', () => {
        const result = insert.matrixBelow(target, source, 2);

        expect(result).toEqual([
          ['A', 'B'],
          ['C', 'D'],
          [' ', ' '],
          [' ', ' '],
          ['X', 'Y'],
          ['Z', 'W']
        ]);
      });

      it('should normalize matrices with different widths', () => {
        const widerSource = [['X', 'Y', 'Z']];
        const result = insert.matrixBelow(target, widerSource);
        expect(result).toEqual([
          ['A', 'B', ' '],
          ['C', 'D', ' '],
          ['X', 'Y', 'Z']
        ]);
      });
    });

    describe('matrixLeft', () => {
      it('should insert source matrix to the left of target matrix without spacing', () => {
        const result = insert.matrixLeft(target, source);
        expect(result).toEqual([
          ['X', 'Y', 'A', 'B'],
          ['Z', 'W', 'C', 'D']
        ]);
      });

      it('should insert source matrix to the left of target matrix with spacing', () => {
        const result = insert.matrixLeft(target, source, 2);
        expect(result).toEqual([
          ['X', 'Y', ' ', ' ', 'A', 'B'],
          ['Z', 'W', ' ', ' ', 'C', 'D']
        ]);
      });

      it('should normalize matrices with different heights', () => {
        const tallerSource = [['X'], ['Y'], ['Z']];
        const result = insert.matrixLeft(target, tallerSource);
        expect(result).toEqual([
          ['X', 'A', 'B'],
          ['Y', 'C', 'D'],
          ['Z', ' ', ' ']
        ]);
      });
    });

    describe('matrixRight', () => {
      it('should insert source matrix to the right of target matrix without spacing', () => {
        const result = insert.matrixRight(target, source);

        expect(result).toEqual([
          ['A', 'B', 'X', 'Y'],
          ['C', 'D', 'Z', 'W']
        ]);
      });

      it('should insert source matrix to the right of target matrix with spacing', () => {
        const result = insert.matrixRight(target, source, 2);

        expect(result).toEqual([
          ['A', 'B', ' ', ' ', 'X', 'Y'],
          ['C', 'D', ' ', ' ', 'Z', 'W']
        ]);
      });

      it('should normalize matrices with different heights', () => {
        const shorterSource = [['X', 'Y']];
        const result = insert.matrixRight(target, shorterSource);

        expect(result).toEqual([
          ['A', 'B', 'X', 'Y'],
          ['C', 'D', ' ', ' ']
        ]);
      });
    });
  });
});
