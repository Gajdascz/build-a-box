import { bottomLeft } from './bottomLeft.js';
import { bottomRight } from './bottomRight.js';
import { topLeft } from './topLeft.js';
import { topRight } from './topRight.js';

export const corners = {
  bottomLeft,
  bottomRight,
  topLeft,
  topRight
} as const;
