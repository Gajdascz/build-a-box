import { double } from './double.js';
import { quadruple } from './quadruple.js';
import { quintuple } from './quintuple.js';
import { single } from './single.js';
import { triple } from './triple.js';

export const sextants = {
  double,
  quadruple,
  quintuple,
  single,
  triple
} as const;
