import { Text } from '#core';
import { type Dims, C2D, Chars, Obj, Position as Pos } from '#srcTypes';

const CHAR_KEYS = {
  closed: 'closed',
  outward: 'outward',
  inward: 'inward',
  cross: 'cross'
} as const;

type CharKey = keyof typeof CHAR_KEYS;
type Chars = Record<CharKey, string>;

type Position = Pos.Perimeter;
type PositionCharsMap = Record<Position, Chars>;
type PositionCharKeyMap = Record<Position, CharKey>;
type PositionPortMap = Record<Position, Port>;
type PositionSideMap = Record<Pos.Side, Port>;
type PositionCornerMap = Record<Pos.Corner, Port>;
type DirectedPosition = Pos.DirectionType;

interface Port {
  position: Position;
  coordinates: C2D.Coordinates;
  chars: Chars;
  setChar: (matrix: Text.Matrix.Matrix, char: CharKey) => Text.Matrix.Matrix;
}

type PortForEachFn = (callback: (port: Port) => void) => void;

type Module = Readonly<{
  get: (position: Position) => Port;
  ports: Readonly<PositionPortMap>;
  sides: Readonly<PositionSideMap>;
  corners: Readonly<PositionCornerMap>;
  close: (matrix: Text.Matrix.Matrix) => Text.Matrix.Matrix;
  getBy: {
    positions(positions: readonly Position[]): PositionPortMap;
    sides(sides: readonly Pos.Side[]): PositionSideMap;
    corners(corners: readonly Pos.Corner[]): PositionCornerMap;
  };
  set: {
    position: (
      matrix: Text.Matrix.Matrix,
      position: Position,
      charKey: CharKey
    ) => Text.Matrix.Matrix;
    all: (matrix: Text.Matrix.Matrix, char: CharKey) => Text.Matrix.Matrix;
  };
  forEach: { port: PortForEachFn; corner: PortForEachFn; side: PortForEachFn };
}>;

const is = {
  charKey: (key: unknown): key is CharKey => typeof key === 'string' && key in CHAR_KEYS,
  portChars: (chars: unknown): chars is Chars => {
    if (!Obj.isDictionary(chars)) return false;
    const entries = Object.entries(chars);
    return (
      entries.length > 0 && entries.every(([key, value]) => is.charKey(key) && Chars.is.char(value))
    );
  },
  portPosition: Pos.is.perimeter,
  port: (port: unknown): port is Port =>
    Obj.isDictionary(port) &&
    C2D.is.coordinates(port.coordinates) &&
    is.portChars(port.chars) &&
    typeof port.setChar === 'function'
};

interface CreateOpts {
  position: Position;
  coordinates: C2D.Coordinates;
  chars: Chars;
}
const create: {
  port: (opts: CreateOpts) => Port;
  module: (dimensions: Dims.Dimensions, chars: PositionCharsMap) => Module;
} = {
  port: ({ coordinates, chars, position }) =>
    Obj.freeze(
      {
        position,
        coordinates,
        chars,
        setChar: (matrix, charKey) =>
          Text.Matrix.set.cell(matrix, { coordinates, char: chars[charKey] })
      },
      { maxDepth: Infinity }
    ),
  module: ({ height, width }, chars) => {
    const layout = {
      bottom: create.port({
        position: 'bottom',
        coordinates: { x: Math.floor(width / 2), y: height - 1 },
        chars: chars.bottom
      }),
      left: create.port({
        position: 'left',
        coordinates: { x: 0, y: Math.floor(height / 2) },
        chars: chars.left
      }),
      right: create.port({
        position: 'right',
        coordinates: { x: width - 1, y: Math.floor(height / 2) },
        chars: chars.right
      }),
      top: create.port({
        position: 'top',
        coordinates: { x: Math.floor(width / 2), y: 0 },
        chars: chars.top
      }),
      topLeft: create.port({
        position: 'topLeft',
        coordinates: { x: 0, y: 0 },
        chars: chars.topLeft
      }),
      topRight: create.port({
        position: 'topRight',
        coordinates: { x: width - 1, y: 0 },
        chars: chars.topRight
      }),
      bottomLeft: create.port({
        position: 'bottomLeft',
        coordinates: { x: 0, y: height - 1 },
        chars: chars.bottomLeft
      }),
      bottomRight: create.port({
        position: 'bottomRight',
        coordinates: { x: width - 1, y: height - 1 },
        chars: chars.bottomRight
      })
    } as const;
    const sides = {
      top: layout.top,
      bottom: layout.bottom,
      left: layout.left,
      right: layout.right
    } as const;
    const corners = {
      bottomLeft: layout.bottomLeft,
      bottomRight: layout.bottomRight,
      topLeft: layout.topLeft,
      topRight: layout.topRight
    } as const;
    return Obj.freeze(
      {
        get: (position) => layout[position],
        get ports() {
          return { ...layout } as const;
        },
        get sides() {
          return { ...sides } as const;
        },
        get corners() {
          return { ...corners } as const;
        },
        getBy: {
          corners: (c) =>
            c.reduce((acc, curr) => {
              acc[curr] = corners[curr];
              return acc;
            }, {} as PositionCornerMap),
          positions: (p) =>
            p.reduce((acc, curr) => {
              acc[curr] = layout[curr];
              return acc;
            }, {} as PositionPortMap),
          sides: (s) =>
            s.reduce((acc, curr) => {
              acc[curr] = sides[curr];
              return acc;
            }, {} as PositionSideMap)
        },
        set: {
          position: (matrix, position, charKey) => layout[position].setChar(matrix, charKey),
          all: (matrix, style) =>
            Object.values(Pos.G.perimeter).reduce(
              (acc, position) => layout[position].setChar(acc, style),
              matrix
            )
        },
        forEach: {
          port: (callback) => {
            Object.values(layout).forEach(callback);
          },
          corner: (callback) => {
            Object.values(corners).forEach(callback);
          },
          side: (callback) => {
            Object.values(sides).forEach(callback);
          }
        },
        close(matrix) {
          this.forEach.port((port) => port.setChar(matrix, 'closed'));
          return matrix;
        }
      },
      { maxDepth: Infinity }
    );
  }
} as const;

export {
  CHAR_KEYS,
  create,
  is,
  type CharKey,
  type Chars,
  type DirectedPosition,
  type Module,
  type Port,
  type Position,
  type PositionCharKeyMap,
  type PositionCharsMap,
  type PositionPortMap
};
