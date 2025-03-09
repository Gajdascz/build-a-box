import { checkerBoard } from './checkerBoard.js';
import { diagonal } from './diagonal.js';
import { horizontal } from './horizontal.js';

export const fills = {
  checkerBoard,
  diagonal,
  horizontal
} as const;
