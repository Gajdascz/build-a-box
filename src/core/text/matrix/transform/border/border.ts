import { type C2D, Border, Obj } from '#srcTypes';
import * as Base from '../../base/index.js';
import { insert } from '../insert/insert.js';

const perimeter = {
  add: (matrix: Base.Matrix) => {
    const result = insert.row(insert.row(matrix, 0));
    return insert.column(insert.column(result, 0));
  },
  validate: (matrix: Base.Matrix) => {
    const { height, width } = Base.get.dimensions(matrix);
    return height < 2 || width < 2 ? false : true;
  }
} as const;

const resolveChars = (
  charsOrStyle: Obj.NestedPartial<Border.Border> | Border.Style = 'light',
  style: Border.Style = 'light'
) =>
  typeof charsOrStyle === 'string' ?
    Border.DEFAULTS[charsOrStyle]()
  : Obj.merge(Border.DEFAULTS[style](), charsOrStyle);

const get: {
  coordinates: (matrix: Base.Matrix) => {
    corners: {
      topLeft: C2D.Coordinates;
      topRight: C2D.Coordinates;
      bottomLeft: C2D.Coordinates;
      bottomRight: C2D.Coordinates;
    };
    edges: {
      top: C2D.Coordinates[];
      bottom: C2D.Coordinates[];
      left: C2D.Coordinates[];
      right: C2D.Coordinates[];
    };
  };
} = {
  coordinates: (matrix) => {
    const { height, width } = Base.get.dimensions(matrix);
    const lastRow = height - 1;
    const lastCol = width - 1;
    return {
      corners: {
        topLeft: { y: 0, x: 0 },
        topRight: { y: 0, x: lastCol },
        bottomLeft: { y: lastRow, x: 0 },
        bottomRight: { y: lastRow, x: lastCol }
      },
      edges: {
        top: Array.from({ length: width - 2 }, (_, i) => ({
          y: 0,
          x: i + 1
        })),
        bottom: Array.from({ length: width - 2 }, (_, i) => ({
          y: lastRow,
          x: i + 1
        })),
        left: Array.from({ length: height - 2 }, (_, i) => ({
          y: i + 1,
          x: 0
        })),
        right: Array.from({ length: height - 2 }, (_, i) => ({
          y: i + 1,
          x: lastCol
        }))
      }
    } as const;
  }
} as const;

const set = (
  matrix: Base.Matrix,
  borderChars: Obj.NestedPartial<Border.Border> | Border.Style = 'light'
): Base.Matrix => {
  let result = Base.clone(matrix);
  if (!perimeter.validate(result)) result = perimeter.add(result);
  const chars = resolveChars(borderChars);
  const { corners, edges } = get.coordinates(matrix);
  (Object.keys(corners) as Border.Corner[]).forEach(
    (corner) =>
      (result = Base.set.cell(result, { coordinates: corners[corner], char: chars[corner] }))
  );
  (Object.keys(edges) as Border.Edge[]).forEach((edge) => {
    const line = chars[edge];
    edges[edge].forEach(
      (coordinates) => (result = Base.set.cell(result, { coordinates, char: line }))
    );
  });
  return result;
};

const add = (
  matrix: Base.Matrix,
  borderChars: Obj.NestedPartial<Border.Border> | Border.Style = 'light'
): Base.Matrix => set(perimeter.add(matrix), borderChars);
export { add, get, set };
