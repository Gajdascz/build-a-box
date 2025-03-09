import { type C2D, type Dims, type Position, Chars } from '#srcTypes';
import * as Base from '../../base/index.js';
import { normalize } from '../normalize/normalize.js';

interface InsertResult {
  matrix: Base.Matrix;
  endpoint: number;
}
const prep: {
  row: (
    matrix: Base.Matrix,
    char?: string
  ) => { array: string[]; matrixDimensions: Dims.Dimensions };
  insertionIndex: (index: number, correspondingDimension: number) => number;
} = {
  row: (matrix, char = Chars.C.space) => {
    const dims = Base.get.dimensions(matrix);
    return {
      array: Array.from({ length: dims.width }, () => char),
      matrixDimensions: dims
    };
  },
  insertionIndex: (index, correspondingDimension) => {
    const normalized = index === Infinity ? correspondingDimension : index;
    return Math.max(0, Math.min(normalized, correspondingDimension));
  }
} as const;

const insert: {
  row: (matrix: Base.Matrix, y?: number, row?: string[]) => Base.Matrix;
  column: (matrix: Base.Matrix, x?: number, col?: string[]) => Base.Matrix;
  matrix: (
    target: Base.Matrix,
    source: Base.Matrix,
    position: C2D.Coordinates,
    orientation: Position.Orientation
  ) => InsertResult;
  matrixAbove: (target: Base.Matrix, source: Base.Matrix, space?: number) => Base.Matrix;
  matrixBelow: (target: Base.Matrix, source: Base.Matrix, space?: number) => Base.Matrix;
  matrixLeft: (target: Base.Matrix, source: Base.Matrix, space?: number) => Base.Matrix;
  matrixRight: (target: Base.Matrix, source: Base.Matrix, space?: number) => Base.Matrix;
} = {
  row: (matrix, y = Infinity, row = []) => {
    const cloned = Base.clone(matrix);
    const { matrixDimensions, array } = prep.row(cloned);
    if (row.length) {
      if (row.length !== matrixDimensions.width)
        throw new Error('Row length must match matrix width');
      return [...cloned.slice(0, y), row, ...cloned.slice(y)];
    }
    const normalizedIndex = prep.insertionIndex(y, matrixDimensions.height);
    cloned.splice(normalizedIndex, 0, array);
    return cloned;
  },
  column: (matrix, x = Infinity, col = []) => {
    const cloned = Base.clone(matrix);
    const dimensions = Base.get.dimensions(matrix);
    if (col.length) {
      if (col.length !== dimensions.height)
        throw new Error('Column length must match matrix height');
      return cloned.map((row, i) => {
        const val = col[i];
        if (val?.length !== 1) throw new Error('Column value must be a single character');
        row.splice(x, 0, val);
        return row;
      });
    }
    const normalizedIndex = prep.insertionIndex(x, dimensions.width);

    return cloned.map((row) => {
      row.splice(normalizedIndex, 0, Chars.C.space);
      return row;
    });
  },
  matrix: (target, source, position, orientation) => {
    const cloned = Base.clone(target);
    const targetDims = Base.get.dimensions(target);
    const sourceDims = Base.get.dimensions(source);
    if (!Base.is.inBounds(target, position))
      throw new Error(`Position out of bounds: ${JSON.stringify(position)}`);
    if (
      position.y + sourceDims.height > targetDims.height ||
      position.x + sourceDims.width > targetDims.width
    )
      throw new Error(
        `Target Matrix with dimensions: ${JSON.stringify(targetDims)}\n` +
          `cannot fit source matrix with dimensions: ${JSON.stringify(sourceDims)}\n` +
          `at position: ${JSON.stringify(position)}`
      );

    const { y, x } = position;
    const updates: Base.CellUpdate[] = source.flatMap((row, i) =>
      row.map((char, j) => ({ coordinates: { x: x + j, y: y + i }, char }))
    );
    const endpoint =
      (orientation === 'horizontal' ? x + sourceDims.width : y + sourceDims.height) - 1;

    return { matrix: Base.set.cells(cloned, updates), endpoint };
  },
  matrixAbove: (target, source, space = 0) => {
    const [_target, _source] = normalize.width([target, source]);
    if (!_target || !_source) throw new Error('Invalid matrix');
    let result = _target;
    if (space) while (space--) result = insert.row(result, 0);
    let i = _source.length;
    while (i--) result = insert.row(result, 0, _source[i]);
    return result;
  },
  matrixBelow(target, source, space = 0) {
    const [_target, _source] = normalize.width([target, source]);
    if (!_target || !_source) throw new Error('Invalid matrix');
    let result = _target;
    if (space) while (space--) result = insert.row(result);
    let i = 0;
    while (i < _source.length) result = insert.row(result, Infinity, _source[i++]);
    return result;
  },
  matrixLeft: (target, source, space = 0) => {
    const [_target, _source] = normalize.height([target, source]);
    if (!_target || !_source) throw new Error('Invalid matrix');
    let result = _target;
    if (space) while (space--) result = insert.column(result, 0);
    const length = _source[0]?.length ?? 0;
    for (let i = 0; i < length; i++) {
      const colIndex = length - 1 - i;
      const column = _source.map((row) => row[colIndex] ?? ' ');
      result = insert.column(result, 0, column);
    }
    return result;
  },
  matrixRight: (target, source, space = 0) => {
    const [_target, _source] = normalize.height([target, source]);
    if (!_target || !_source) throw new Error('Invalid matrix');
    let result = _target;
    if (space) while (space--) result = insert.column(result);
    const length = _source[0]?.length ?? 0;
    for (let i = 0; i < length; i++) {
      const column = _source.map((row) => row[i] ?? ' ');
      result = insert.column(result, Infinity, column);
    }
    return result;
  }
};
export { type InsertResult, insert };
