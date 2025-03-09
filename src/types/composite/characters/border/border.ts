import { Chars, Obj, Position } from '../../../base/base.js';

const CHARS = { ...Chars.BoxDrawing } as const;
const {
  corners: { bottomLeft, bottomRight, topLeft, topRight },
  junctions: { cross, tConnectDown, tConnectLeft, tConnectRight, tConnectUp },
  lines: { horizontal, vertical }
} = CHARS;

type Border = { [P in Position.Perimeter]: string } & {
  junctions: {
    up: string;
    right: string;
    left: string;
    down: string;
    cross: string;
  };
};
type Edge = Extract<keyof Border, 'left' | 'top' | 'right' | 'bottom'>;
type Corner = Extract<keyof Border, 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>;
type Junction = keyof Border['junctions'];

type Style = 'light' | 'heavy' | 'double' | 'arc';
const DEFAULTS: { [S in Style]: () => Border } = {
  light: () => ({
    top: horizontal.light,
    bottom: horizontal.light,
    left: vertical.light,
    right: vertical.light,
    topLeft: topLeft.light,
    topRight: topRight.light,
    bottomLeft: bottomLeft.light,
    bottomRight: bottomRight.light,
    junctions: {
      cross: cross.light,
      down: tConnectDown.light,
      up: tConnectUp.light,
      left: tConnectLeft.light,
      right: tConnectRight.light
    }
  }),
  heavy: () => ({
    top: horizontal.heavy,
    bottom: horizontal.heavy,
    left: vertical.heavy,
    right: vertical.heavy,
    topLeft: topLeft.heavy,
    topRight: topRight.heavy,
    bottomLeft: bottomLeft.heavy,
    bottomRight: bottomRight.heavy,
    junctions: {
      cross: cross.heavy,
      down: tConnectDown.heavy,
      up: tConnectUp.heavy,
      left: tConnectLeft.heavy,
      right: tConnectRight.heavy
    }
  }),
  double: () => ({
    top: horizontal.double,
    bottom: horizontal.double,
    left: vertical.double,
    right: vertical.double,
    topLeft: topLeft.double,
    topRight: topRight.double,
    bottomLeft: bottomLeft.double,
    bottomRight: bottomRight.double,
    junctions: {
      cross: cross.double,
      down: tConnectDown.double,
      up: tConnectUp.double,
      left: tConnectLeft.double,
      right: tConnectRight.double
    }
  }),
  arc: () => ({
    top: horizontal.light,
    bottom: horizontal.light,
    left: vertical.light,
    right: vertical.light,
    topLeft: topLeft.arc,
    topRight: topRight.arc,
    bottomLeft: bottomLeft.arc,
    bottomRight: bottomRight.arc,
    junctions: {
      cross: cross.light,
      down: tConnectDown.light,
      up: tConnectUp.light,
      left: tConnectLeft.light,
      right: tConnectRight.light
    }
  })
} as const;

const is = (border: unknown): border is Border =>
  Obj.isDictionary(border) &&
  Object.keys(border).every(Position.is.perimeter) &&
  Object.values(border).every(Chars.is.char);

export { CHARS, DEFAULTS, is, type Border, type Corner, type Edge, type Junction, type Style };
