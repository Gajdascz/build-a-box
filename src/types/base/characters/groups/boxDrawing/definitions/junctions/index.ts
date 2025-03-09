import { cross } from './cross.js';
import { tConnectDown } from './tConnectDown.js';
import { tConnectLeft } from './tConnectLeft.js';
import { tConnectRight } from './tConnectRight.js';
import { tConnectUp } from './tConnectUp.js';

export const junctions = {
  cross,
  tConnectDown,
  tConnectLeft,
  tConnectRight,
  tConnectUp
} as const;
