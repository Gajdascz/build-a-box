import * as Direct from './direct/direct.js';
import * as Offset from './offset/offset.js';

const generate = { direct: Direct.generate, offset: Offset.generate } as const;
export type * as Direct from './direct/direct.js';
export type * as Offset from './offset/offset.js';

export { generate };
