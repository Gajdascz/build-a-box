import * as Obj from '../obj/obj.js';

/** Module Constants */
const C = {
  top: 'top',
  middle: 'middle',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  center: 'center',
  up: 'up',
  down: 'down',
  vertical: 'vertical',
  horizontal: 'horizontal',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
  incoming: 'incoming',
  outgoing: 'outgoing',
  downRight: 'downRight', // ┌
  leftDown: 'leftDown', // ┐
  upRight: 'upRight', // └
  leftUp: 'leftUp' // ┘
} as const;

type Position = keyof typeof C;

const {
  bottom,
  center,
  down,
  horizontal,
  left,
  middle,
  right,
  top,
  up,
  vertical,
  bottomLeft,
  bottomRight,
  topLeft,
  topRight,
  downRight,
  leftDown,
  leftUp,
  upRight,
  incoming,
  outgoing
} = C;

/** Grouped Constants */
const G = Obj.freeze(
  {
    directionType: { incoming, outgoing },
    horizontal: { left, center, right },
    vertical: { top, middle, bottom },
    direction: { up, down, left, right },
    side: { top, bottom, left, right },
    orientation: { vertical, horizontal },
    corner: { bottomLeft, bottomRight, topLeft, topRight },
    perimeter: {
      top,
      bottom,
      left,
      right,
      bottomLeft,
      bottomRight,
      topLeft,
      topRight
    },
    /**
     * - DownRight: ┌
     * - LeftDown: ┐
     * - UpRight: └
     * - LeftUp: ┘
     */
    angle: { downRight, leftDown, leftUp, upRight },
    horizontalSide: { left, right },
    verticalSide: { top, bottom }
  },
  { maxDepth: Infinity }
);
type GroupedConstants = typeof G;
type DirectionType = keyof GroupedConstants['directionType'];
type Horizontal = keyof GroupedConstants['horizontal'];
type Vertical = keyof GroupedConstants['vertical'];
type Direction = keyof GroupedConstants['direction'];
type Side = keyof GroupedConstants['side'];
type Orientation = keyof GroupedConstants['orientation'];
type Corner = keyof GroupedConstants['corner'];
type Perimeter = keyof GroupedConstants['perimeter'];
/**
 * - DownRight: ┌
 * - LeftDown: ┐
 * - UpRight: └
 * - LeftUp: ┘
 */
type Angle = keyof GroupedConstants['angle'];
type HorizontalSide = keyof GroupedConstants['horizontalSide'];
type VerticalSide = keyof GroupedConstants['verticalSide'];

const is = Obj.freeze(
  {
    verticalSide: Obj.createGuard.strProp(G.verticalSide),
    horizontalSide: Obj.createGuard.strProp(G.horizontalSide),
    position: Obj.createGuard.strProp(C),
    directionType: Obj.createGuard.strProp(G.directionType),
    horizontal: Obj.createGuard.strProp(G.horizontal),
    vertical: Obj.createGuard.strProp(G.vertical),
    direction: Obj.createGuard.strProp(G.direction),
    side: Obj.createGuard.strProp(G.side),
    orientation: Obj.createGuard.strProp(G.orientation),
    corner: Obj.createGuard.strProp(G.corner),
    perimeter: Obj.createGuard.strProp(G.perimeter),
    angle: Obj.createGuard.strProp(G.angle)
  },
  { maxDepth: Infinity }
);
export { C, G, is };
export type {
  Angle,
  Corner,
  Direction,
  DirectionType,
  Horizontal,
  HorizontalSide,
  Orientation,
  Perimeter,
  Position,
  Side,
  Vertical,
  VerticalSide
};
