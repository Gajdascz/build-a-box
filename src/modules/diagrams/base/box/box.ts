import { Text } from '#core';
import { type Group, type Position, C2D, Dims } from '#srcTypes';
import { LinkedList } from '@toolbox-ts/dsa';
import { type Port, Box, Edge } from '../../../components/components.js';
type AddBoxOpts<O extends Position.Orientation> =
  | Omit<Box.BuildOpts<O>, 'orientation'>
  | Omit<Box.BuildOpts<O>, 'orientation'>[];

type BoxInstancePair<O extends Position.Orientation> = Group.SourceTarget<Box.BoxInstance<O>>;

interface Opts<N extends string, O extends Position.Orientation> {
  box: { factory: Box.Cfg<N>; initial?: AddBoxOpts<O> };
  spacing: number | 'min';
  orientation: O;
  edge?: {
    endsStyle?: Edge.Chars.EndsStyle;
    lineStyle?: Edge.Chars.LineStyle;
  };
}
interface Cfg<N extends string, O extends Position.Orientation> extends Opts<N, O> {
  spacing: number;
}
interface PortPositions {
  outgoing: Port.Position;
  incoming: Port.Position;
}
const getPortPositions = (orientation: Position.Orientation): PortPositions =>
  orientation === 'horizontal' ?
    { outgoing: 'right', incoming: 'left' }
  : { outgoing: 'bottom', incoming: 'top' };

interface BuildState {
  matrix: Text.Matrix.Matrix;
  cursor: C2D.Coordinates;
  placed: Set<string>;
  endpoint: number;
}
interface BuildResult {
  matrix: Text.Matrix.Matrix;
  toString: () => string;
  toCodeBlock: () => string;
}
class Diagram<N extends string, O extends Position.Orientation> {
  readonly namespace: N;
  readonly orientation: O;
  readonly spacing: number;
  private readonly portPositions: { outgoing: Port.Position; incoming: Port.Position };
  private readonly box: {
    readonly factory: Box.FactoryInstance<N>;
    readonly list: LinkedList.Doubly.API<Box.BoxInstance<O>>;
  };
  private readonly edge: {
    readonly endsStyle: Edge.Chars.EndsStyle;
    readonly lineStyle: Edge.Chars.LineStyle;
    readonly chars: Edge.Chars.EdgeChars;
    readonly factory: Edge.ConfiguredBuilders<O>;
  };
  private readonly axis: {
    primary: C2D.Axis;
    secondary: C2D.Axis;
  };
  private readonly dimension: {
    primary: keyof Dims.Dimensions;
    secondary: keyof Dims.Dimensions;
  };
  constructor({
    box: {
      factory: { namespace, border, textProcessor },
      initial
    },
    spacing,
    orientation,
    edge: { endsStyle = 'none', lineStyle = 'light' } = {}
  }: Opts<N, O>) {
    this.orientation = orientation;
    this.namespace = namespace;
    this.spacing = typeof spacing === 'string' ? Edge.Chars.C.styleMins[endsStyle] : spacing;
    this.box = {
      factory: Box.createFactory<N>({ namespace, border, textProcessor }),
      list: LinkedList.Doubly.create()
    } as const;
    const edgeChars = Edge.Chars.resolve.chars(lineStyle);

    this.edge = {
      endsStyle: endsStyle,
      lineStyle: lineStyle,
      chars: edgeChars,
      factory: Edge.get.configuredBuilders({
        chars: edgeChars,
        orientation,
        endsStyle: endsStyle
      })
    } as const;
    this.portPositions = getPortPositions(orientation);
    this.axis = C2D.get.axisPair[this.orientation]();
    const dims =
      orientation === 'horizontal' ?
        ({ primary: 'width', secondary: 'height' } as const)
      : ({ primary: 'height', secondary: 'width' } as const);
    this.dimension = { primary: dims.primary, secondary: dims.secondary };
    if (initial) this.add(initial);
  }
  private *boxPairs() {
    for (const { data,  index } of this.box.list.forward()) {
      const next = this.box.list.get(index + 1)?.data;
      yield { source: data, target: next };
    }
  }
  private *boxes(direction: 'forward' | 'reverse' = 'forward') {
    for (const box of this.box.list[direction]()) yield box.data;
  }
  private readonly ports = {
    setPair: ({ source, target }: BoxInstancePair<O>) => {
      const outgoing = this.portPositions.outgoing;
      const incoming = this.portPositions.incoming;
      return {
        source: source.setPort(outgoing, 'outward').getPortCoordinates(outgoing),
        target: target.setPort(incoming, 'outward').getPortCoordinates(incoming)
      };
    },
    close: () => {
      [...this.boxes()].forEach((box) => box.closePorts());
      return this;
    }
  } as const;
  get dimensions() {
    const dimsArray = [...this.box.list.forward()].map(({ data: { dimensions } }) => dimensions);
    const boxesTotal = Dims.calculate.oriented(dimsArray, this.orientation);
    const spacingTotal = this.spacing * (this.box.list.size - 1);
    const primary = this.dimension.primary;
    return { ...boxesTotal, [primary]: boxesTotal[primary] + spacingTotal };
  }
  readonly move = {
    toIndex: (id: string, index: number): this => {
      this.box.list.moveToIndex(id, index);
      return this;
    },
    beforeBox: (id: string, targetId: string): this => {
      this.box.list.moveToTarget(id, targetId, 'before');
      return this;
    },
    afterBox: (id: string, targetId: string): this => {
      this.box.list.moveToTarget(id, targetId, 'after');
      return this;
    }
  } as const;
  readonly get = {
    box: (target: string | number): Box.BoxInstance<O> | undefined =>
      typeof target === 'number' ?
        this.box.list.get(target)?.data
      : this.box.list.find(target)?.data,
    boxes: (): Box.BoxInstance<O>[] => {
      const result = [];
      for (const x of this.box.list.forward()) result.push(x.data);
      return result;
    },
    boxCount: () => this.box.list.size,
    boxIndex: (id: string) => this.box.list.getIndex(id),
    firstBox: () => this.box.list.head,
    lastBox: () => this.box.list.tail
  } as const;
  readonly has = { box: (id: string) => this.box.list.has(id) } as const;
  add(boxes: AddBoxOpts<O>): this {
    (Array.isArray(boxes) ? boxes : [boxes]).forEach((boxOpts) => {
      const box = this.box.factory.build({ ...boxOpts, orientation: this.orientation });
      this.box.list.append({ id: box.id, data: box });
    });
    return this;
  }
  remove(id: string): this {
    this.box.list.remove(id);
    return this;
  }
  clear(): this {
    this.box.list.reset();
    return this;
  }
  reset(): this {
    this.get.boxes().forEach((box) => box.reset());
    return this;
  }
  private updateCursor = (
    { cursor, endpoint, matrix, placed }: BuildState,
    { primaryMod = 0, secondaryMod = 0 } = {}
  ) => ({
    matrix,
    placed,
    endpoint: endpoint + primaryMod,
    cursor: {
      ...cursor,
      ...this.resolve.axes(endpoint + primaryMod, 0 + secondaryMod)
    }
  });
  private readonly resolve = {
    axes: (primary: number, secondary: number) =>
      C2D.resolve.axisPair(this.orientation, { primary, secondary }),
    pairPortCoords: ({ source, target }: BoxInstancePair<O>) => ({
      source: source.getPortCoordinates(this.portPositions.outgoing),
      target: target.getPortCoordinates(this.portPositions.incoming)
    }),
    edge: {
      path: (state: BuildState, { sourceOffset = 0, targetOffset = 0 } = {}) => {
        const sourcePos = state.endpoint;
        /** +1 to include target port in path */
        const targetPos = state.endpoint + this.spacing + 1;
        return {
          source: this.resolve.axes(sourcePos, sourceOffset),
          target: this.resolve.axes(targetPos, targetOffset)
        };
      },
      matrix: (edgePath: C2D.Path) => {
        const pathType = C2D.resolve.pathType(this.orientation, edgePath);
        if (pathType === 'direct') return this.edge.factory.direct(edgePath);
        return this.edge.factory.offset(edgePath, Edge.Offset.get(this.orientation, edgePath));
      }
    }
  } as const;
  private readonly insert = {
    box: (state: BuildState, box: Box.BoxInstance<O>): BuildState => {
      if (state.placed.has(box.id)) return state;
      const result = Text.Matrix.insert.matrix(
        state.matrix,
        box.matrix,
        state.cursor,
        this.orientation
      );
      state.matrix = result.matrix;
      state.endpoint = result.endpoint;
      state.placed.add(box.id);
      const outgoingPortOffset = box.getPortCoordinates(this.portPositions.outgoing)[
        this.axis.secondary
      ];
      return this.updateCursor(state, { secondaryMod: outgoingPortOffset });
    },
    edge: (
      state: BuildState,
      sourceBox: Box.BoxInstance<O>,
      targetBox: Box.BoxInstance<O>
    ): BuildState => {
      const portCoords = this.resolve.pairPortCoords({ source: sourceBox, target: targetBox });
      const offsetAxis = this.axis.secondary;
      /** Move cursor to cell adjacent to port */
      const edgePath = this.resolve.edge.path(state, {
        sourceOffset: portCoords.source[offsetAxis],
        targetOffset: portCoords.target[offsetAxis]
      });
      const portInsertionPoint = Math.min(edgePath.source[offsetAxis], edgePath.target[offsetAxis]);
      state = this.updateCursor(state, {
        primaryMod: 1,
        secondaryMod: portInsertionPoint
      });

      const edge = this.resolve.edge.matrix(edgePath);
      const { endpoint, matrix } = Text.Matrix.insert.matrix(
        state.matrix,
        edge,
        state.cursor,
        this.orientation
      );
      state = this.updateCursor({ ...state, matrix, endpoint }, { primaryMod: 1 });
      return state;
    }
  } as const;
  build(): BuildResult {
    if (this.box.list.size === 0) return { matrix: [], toString: () => '', toCodeBlock: () => '' };
    let state: BuildState = {
      matrix: Text.Matrix.create.from.dimensions(this.dimensions),
      placed: new Set<string>(),
      cursor: { x: 0, y: 0 },
      endpoint: 0
    };
    this.boxPairs().forEach(({ source, target }) => {
      if (!target) source.setPort(this.portPositions.outgoing, 'closed');
      else if (this.edge.endsStyle === 'directed') {
        source.setPort(this.portPositions.outgoing, 'outward');
        target.setPort(this.portPositions.incoming, 'closed');
      } else if (this.edge.endsStyle === 'bidirectional') {
        source.setPort(this.portPositions.outgoing, 'closed');
        target.setPort(this.portPositions.incoming, 'closed');
      } else {
        source.setPort(this.portPositions.outgoing, 'outward');
        target.setPort(this.portPositions.incoming, 'outward');
      }
    });
    this.boxPairs().forEach(({ source, target }) => {
      if (target) {
        state = this.insert.box(state, source);
        state = this.insert.edge(state, source, target);
        state = this.insert.box(state, target);
      } else state = this.insert.box(state, source);
    });
    this.ports.close();
    const matrix = state.matrix;
    const toString = () => Text.Matrix.toString(state.matrix);
    const toCodeBlock = () => `\`\`\`\n${toString()}\n\`\`\``;
    return { matrix, toString, toCodeBlock };
  }
}

const create = <N extends string, O extends Position.Orientation>(cfg: Opts<N, O>): Diagram<N, O> =>
  new Diagram<N, O>(cfg);
type Instance<N extends string, O extends Position.Orientation> = InstanceType<
  typeof Diagram<N, O>
>;
export { create };
export type { AddBoxOpts, BuildResult, Cfg, Instance, Opts };

