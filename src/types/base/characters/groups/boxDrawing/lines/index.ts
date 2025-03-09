import { diagonal } from './diagonal.js';
import { half } from './half.js';
import { horizontal } from './horizontal.js';
import { mixed } from './mixed.js';
import { vertical } from './vertical.js';

export const lines = {
  diagonal,
  half,
  horizontal,
  mixed,
  vertical
} as const;
