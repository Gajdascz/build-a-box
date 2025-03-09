import { diamond } from './diamond.js';
import { lowerLeftTo } from './lowerLeft.js';
import { middleLeftTo } from './middleLeft.js';
import { middleRightTo } from './middleRight.js';
import { upperCentreTo } from './upperCenter.js';
import { upperLeftTo } from './upperLeft.js';
import { upperRightTo } from './upperRight.js';

export const cellDiagonals = {
  diamond,
  lowerLeftTo,
  middleLeftTo,
  middleRightTo,
  upperCentreTo,
  upperLeftTo,
  upperRightTo
} as const;
