import { lowerLeftDiagonal } from './lowerLeftDiagonal.js';
import { lowerRightDiagonal } from './lowerRightDiagonal.js';
import { triangular } from './triangular.js';
import { upperLeftDiagonal } from './upperLeftDiagonal.js';
import { upperRightDiagonal } from './upperRightDiagonal.js';

export const mosaics = {
  lowerLeftDiagonal,
  lowerRightDiagonal,
  triangular,
  upperLeftDiagonal,
  upperRightDiagonal
} as const;
