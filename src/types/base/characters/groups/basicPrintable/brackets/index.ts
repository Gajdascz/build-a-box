import { angle } from './angle.js';
import { curly } from './curly.js';
import { paren } from './paren.js';
import { square } from './square.js';

export const brackets = { angle, curly, paren, square } as const;
