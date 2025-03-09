import { Text } from '#core';
import type { C2D, Position } from '#srcTypes';
import * as Base from './base/base.js';
import * as Points from './points/points.js';
import * as Segments from './segments/segments.js';
import * as Spans from './spans/spans.js';

interface Cfg<O extends Position.Orientation> {
  orientation: O;
  chars: Base.Chars.EdgeChars;
  path: C2D.Path;
  endsStyle?: Base.Chars.EndsStyle;
}
const DIRECTION = { horizontal: 'leftToRight', vertical: 'topToBottom' } as const;
const build = {
  direct: <O extends Position.Orientation>({
    chars,
    orientation,
    path,
    endsStyle = 'none'
  }: Cfg<O>) => {
    const direction = DIRECTION[orientation];
    const span = Spans.resolve.direct({ path, direction, orientation });
    if (!Base.Chars.is.validLength(endsStyle, span.mid))
      throw new Error('Span does not fit ends style');
    const points = Points.generate.direct({ orientation, path, span });
    const segments = Segments.create.direct(
      Base.Chars.resolve.segmentChars(chars, endsStyle, orientation),
      points
    );
    const mid = Segments.normalize.single(segments.mid);
    const dimensions = Segments.calculate.dimensions.direct(
      { source: undefined, mid, target: undefined },
      orientation
    );
    const matrix = Text.Matrix.create.from.dimensions(dimensions);
    return Text.Matrix.set.cells(matrix, mid);
  },
  offset: <O extends Position.Orientation>({
    chars,
    offset,
    orientation,
    path,
    endsStyle = 'none'
  }: Cfg<O> & { offset: Base.Offset.Offset<O> }) => {
    const direction = DIRECTION[orientation];
    const span = Spans.resolve.offset({ direction, orientation, path });
    const points = Points.generate.offset({ orientation, path, span });
    const segmentChars = Base.Chars.resolve.offset.pathSegmentsChars({
      chars,
      endsStyle,
      lengths: { mid: span.mid, source: span.start, target: span.end },
      offset,
      orientation
    });
    const segments = Segments.create.offset(segmentChars, points);
    const { mid, source, target } = Segments.normalize.offset(segments);
    const dimensions = Segments.calculate.dimensions.offset({ source, mid, target });
    const matrix = Text.Matrix.create.from.dimensions(dimensions);
    return Text.Matrix.set.cells(matrix, [...source, ...mid, ...target]);
  }
} as const;

interface ConfiguredBuilders<O extends Position.Orientation> {
  direct: (path: C2D.Path) => Text.Matrix.Matrix;
  offset: (path: C2D.Path, offset: Base.Offset.Offset<O>) => Text.Matrix.Matrix;
}
const get = {
  chars: Base.Chars.resolve.chars,
  configuredBuilders: <O extends Position.Orientation>({
    chars,
    orientation,
    endsStyle = 'none'
  }: Omit<Cfg<O>, 'path'>): ConfiguredBuilders<O> => {
    return {
      direct: (path) => build.direct({ chars, orientation, endsStyle, path }),
      offset: (path, offset) => build.offset({ chars, orientation, endsStyle, path, offset })
    };
  }
} as const;

export * from './base/base.js';
export type * as Points from './points/points.js';
export type * as Segments from './segments/segments.js';
export type * as Spans from './spans/spans.js';
export { type Cfg, type ConfiguredBuilders, build, get };
