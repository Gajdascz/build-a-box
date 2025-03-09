import { ID, Schema, Text } from '#core';
import { type Obj, type Position, Border, Chars, Dims } from '#srcTypes';
import * as Port from '../port/port.js';

interface BoxState {
  dimensions: Dims.Dimensions;
  matrix: Text.Matrix.Matrix;
  content: string[];
  ports: Port.Module;
}
class Box<O extends Position.Orientation> {
  constructor(
    readonly id: string,
    readonly orientation: O,
    private readonly schema: Schema.Instance<BoxState>,
    private readonly rebuild: (content: string) => Box<O>
  ) {}
  private get current() {
    return this.schema.current;
  }
  private get ports() {
    return this.schema.current.ports;
  }
  getPortCoordinates(position: Port.Position) {
    return this.ports.get(position).coordinates;
  }
  setPort(position: Port.Position, charKey: Port.CharKey) {
    const { ports, matrix } = this.current;
    this.schema.set('matrix', ports.set.position(matrix, position, charKey));
    return this;
  }
  closePorts() {
    this.schema.set('matrix', this.ports.close(this.current.matrix));
    return this;
  }
  setBorderChar(char: string, side: Position.Side, index: number) {
    if (char.length !== 1) throw new Error('Border char must be a single character');
    const { matrix } = this.current;
    let sidePosition = { x: 0, y: 0 };
    if (side === 'left') sidePosition = { x: 0, y: index };
    if (side === 'right') sidePosition = { x: (matrix[0]?.length ?? 1) - 1, y: index };
    if (side === 'top') sidePosition = { x: index, y: 0 };
    if (side === 'bottom') sidePosition = { x: index, y: matrix.length - 1 };
    const updatedMatrix = Text.Matrix.set.cell(matrix, { coordinates: sidePosition, char });
    this.schema.set('matrix', updatedMatrix);
    return this;
  }
  removeBorderSide(side: Position.Side) {
    const { matrix } = this.current;
    let result = matrix;
    if (side === 'left') result = Text.Matrix.set.column(matrix, 0, Chars.C.space);
    if (side === 'right')
      result = Text.Matrix.set.column(matrix, (matrix[0]?.length ?? 1) - 1, Chars.C.space);
    if (side === 'top') result = Text.Matrix.set.row(matrix, 0, Chars.C.space);
    if (side === 'bottom') result = Text.Matrix.set.row(matrix, matrix.length - 1, Chars.C.space);
    this.schema.set('matrix', result);
    return this;
  }
  setContent(content: string) {
    return this.rebuild(content);
  }
  setBorder(border: Border.Style) {
    this.schema.set('matrix', Text.Matrix.Border.set(this.current.matrix, border));
    return this;
  }
  reset() {
    this.schema.reset();
    return this;
  }
  get content() {
    return this.current.content;
  }
  get dimensions() {
    return this.current.dimensions;
  }
  get matrix() {
    return this.current.matrix;
  }
  toString() {
    return Text.Matrix.toString(this.matrix);
  }
}

interface Cfg<N extends string> {
  namespace: N;
  textProcessor?: Omit<Text.Processor.Opts, 'dimensions'>;
  border?: Border.Style;
}
interface BuildOpts<O extends Position.Orientation> {
  orientation: O;
  dimensions?: Dims.TypedInput;
  process?: boolean;
  content?: string | string[];
  textProcessor?: Omit<Obj.NestedPartial<Text.Processor.Opts>, 'dimensions'>;
  border?: Border.Style | Border.Border;
}

class BoxFactory<N extends string> {
  readonly border: Border.Border;
  readonly text: Text.Processor.Instance;
  readonly namespace: N;
  private readonly idGenerator: ID.GeneratorFn<N>;
  constructor({ namespace, border = 'light', textProcessor = {} }: Cfg<N>) {
    this.namespace = namespace;
    this.idGenerator = ID.getGenerator<N>(this.namespace);
    this.border = Border.DEFAULTS[border]();
    this.text = Text.Processor.create({ ...textProcessor, dimensions: { type: 'dynamic' } });
  }
  private createPortChars(border: Border.Border): Readonly<Port.PositionCharsMap> {
    const { top, bottom, bottomLeft, bottomRight, left, right, topLeft, topRight, junctions } =
      border;
    return {
      bottom: {
        closed: bottom,
        cross: junctions.cross,
        inward: junctions.up,
        outward: junctions.down
      },
      top: {
        closed: top,
        cross: junctions.cross,
        inward: junctions.down,
        outward: junctions.up
      },
      left: {
        closed: left,
        cross: junctions.cross,
        inward: junctions.right,
        outward: junctions.left
      },
      right: {
        closed: right,
        cross: junctions.cross,
        inward: junctions.left,
        outward: junctions.right
      },
      topLeft: {
        closed: topLeft,
        cross: junctions.cross,
        inward: junctions.right,
        outward: junctions.left
      },
      topRight: {
        closed: topRight,
        cross: junctions.cross,
        inward: junctions.left,
        outward: junctions.right
      },
      bottomLeft: {
        closed: bottomLeft,
        cross: junctions.cross,
        inward: junctions.right,
        outward: junctions.left
      },
      bottomRight: {
        closed: bottomRight,
        cross: junctions.cross,
        inward: junctions.left,
        outward: junctions.right
      }
    } as const;
  }

  private createSchema({
    content,
    dimensions,
    ports,
    matrix
  }: {
    content: string[];
    dimensions: Dims.Dimensions;
    ports: Port.Module;
    matrix: Text.Matrix.Matrix;
  }) {
    return Schema.create<BoxState>({
      fields: {
        ports: { type: 'object', defaultValue: ports },
        content: {
          type: 'array',
          defaultValue: content,
          validator: (v: unknown) => Array.isArray(v) && v.every((s) => typeof s === 'string')
        },
        dimensions: { type: 'object', defaultValue: dimensions, validator: Dims.is },
        matrix: { type: 'array', defaultValue: matrix, validator: Text.Matrix.is.valid }
      }
    });
  }

  build<O extends Position.Orientation>(
    {
      orientation,
      content = [],
      process = true,
      border = this.border,
      textProcessor = {},
      dimensions = { type: 'dynamic' }
    }: BuildOpts<O>,
    id?: string
  ): Box<O> {
    const boxId = id ?? this.idGenerator();
    const _border = typeof border === 'object' ? border : Border.DEFAULTS[border]();
    const processed =
      process ? this.text.process(content, { ...textProcessor, dimensions }).processed
      : Array.isArray(content) ? content
      : [content];
    const matrix = Text.Matrix.create.from.lines(processed);
    const borderedMatrix = Text.Matrix.Border.add(matrix, _border);
    const _dimensions = Text.Matrix.get.dimensions(borderedMatrix);
    const ports = Port.create.module(_dimensions, this.createPortChars(_border));
    const schema = this.createSchema({
      content: processed,
      dimensions: _dimensions,
      matrix: borderedMatrix,
      ports
    });
    const rebuild = (content: string) =>
      this.build({ orientation, content: content, border: _border, textProcessor }, boxId);
    return new Box(boxId, orientation, schema, rebuild);
  }
}
type FactoryInstance<N extends string> = InstanceType<typeof BoxFactory<N>>;
type BoxInstance<O extends Position.Orientation> = InstanceType<typeof Box<O>>;

const createFactory = <N extends string>(opts: Cfg<N>) => new BoxFactory<N>(opts);

export {
  type Box,
  type BoxInstance,
  type BoxState,
  type BuildOpts,
  type Cfg,
  type FactoryInstance,
  createFactory
};
