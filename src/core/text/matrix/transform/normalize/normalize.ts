import * as Base from '../../base/index.js';
import * as Pad from '../pad/pad.js';

export const normalize = {
  width: (matrices: Base.Matrix[]) => {
    if (!matrices.length) return [];
    const normalizedWidth = Math.max(
      ...matrices.map((matrix) => Base.get.dimensions(matrix).width)
    );
    return matrices.map((matrix) => {
      const { width } = Base.get.dimensions(matrix);
      if (width === normalizedWidth) return matrix;
      else return Pad.Horizontal.add.right(matrix, normalizedWidth - width);
    });
  },
  height: (matrices: Base.Matrix[]) => {
    if (!matrices.length) return [];
    const normalizedHeight = Math.max(
      ...matrices.map((matrix) => Base.get.dimensions(matrix).height)
    );
    return matrices.map((matrix) => {
      const { height } = Base.get.dimensions(matrix);
      if (height === normalizedHeight) return matrix;
      return Pad.Vertical.add.bottom(matrix, normalizedHeight - height);
    });
  }
} as const;
