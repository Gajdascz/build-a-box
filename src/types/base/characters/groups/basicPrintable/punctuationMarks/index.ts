import { apostrophe } from './apostrophe.js';
import { asterisk } from './asterisk.js';
import { colon } from './colon.js';
import { comma } from './comma.js';
import { exclamation } from './exclamation.js';
import { fullStop } from './fullStop.js';
import { graveAccent } from './graveAccent.js';
import { questionMark } from './questionMark.js';
import { quotationMark } from './quotationMark.js';
import { quote } from './quote.js';
import { semicolon } from './semicolon.js';
import { tilde } from './tilde.js';

export const punctuationMarks = {
  apostrophe,
  asterisk,
  colon,
  comma,
  exclamation,
  fullStop,
  graveAccent,
  questionMark,
  quotationMark,
  quote,
  semicolon,
  tilde
} as const;
