import { type Dims, type Group, type Position, C2D } from '#srcTypes';
import type * as Base from '../base/base.js';
import type * as Points from '../points/points.js';

interface SegmentPoint {
  coordinates: C2D.Coordinates;
  char: string;
}
type Segment = SegmentPoint[];
type Direct = Group.SourceMidTarget<undefined, Segment, undefined>;
type Offset = Group.SourceMidTarget<Segment>;
type Segments = Direct | Offset;
interface SegmentsMap {
  direct: Direct;
  offset: Offset;
}

const create: {
  segment: (coordinates: C2D.Coordinates[], chars: Base.Chars.EdgeSegmentChars) => Segment;
  direct: (chars: Base.Chars.EdgeSegmentChars, points: Points.Direct.DirectPoints) => Direct;
  offset: (chars: Base.Chars.OffsetPathSegmentsChars, points: Points.Offset.OffsetPoints) => Offset;
} = {
  segment: (coordinates, chars) => {
    if (coordinates.length === 0) return [];
    const head = chars.head || chars.body;
    const tail = chars.tail || chars.body;
    if (coordinates.length === 1) return [{ coordinates: coordinates[0]!, char: head }];
    if (coordinates.length === 2)
      return [
        { coordinates: coordinates[0]!, char: head },
        { coordinates: coordinates[1]!, char: tail }
      ];
    const [start, ...middle] = coordinates;
    if (!start) return [];
    const end = middle.pop()!;
    return [
      { coordinates: start, char: head },
      ...middle.map((coordinates) => ({ coordinates, char: chars.body })),
      { coordinates: end, char: tail }
    ];
  },
  direct: (chars, points) => ({
    type: 'direct',
    source: undefined,
    mid: create.segment(points.mid, chars),
    target: undefined
  }),
  offset: (chars, points) => ({
    type: 'offset',
    source: create.segment(points.source, chars.source),
    mid: create.segment(points.mid, chars.mid),
    target: create.segment(points.target, chars.target)
  })
} as const;

const calculate = {
  bounds: (coordinates: C2D.Coordinates[]): Dims.Dimensions => {
    if (coordinates.length === 0) return { width: 0, height: 0 };
    const dims = coordinates.reduce(
      (acc, p) => {
        if (p.x > acc.width) acc.width = p.x;
        if (p.y > acc.height) acc.height = p.y;
        return acc;
      },
      { width: 0, height: 0 }
    );
    return { width: dims.width + 1, height: dims.height + 1 };
  },
  dimensions: {
    direct: (segments: Direct, orientation: Position.Orientation): Dims.Dimensions =>
      orientation === 'horizontal' ?
        { width: segments.mid.length, height: 1 }
      : { width: 1, height: segments.mid.length },
    offset: (segments: Offset): Dims.Dimensions =>
      calculate.bounds([
        ...segments.source.map(({ coordinates }) => coordinates),
        ...segments.mid.map(({ coordinates }) => coordinates),
        ...segments.target.map(({ coordinates }) => coordinates)
      ])
  }
} as const;

const normalize = {
  single: (segment: Segment): Segment => {
    const mins = C2D.calculate.min(segment.map(({ coordinates }) => coordinates));
    segment.reduce(
      (acc, { coordinates }) => {
        if (coordinates.x < acc.x) acc.x = coordinates.x;
        if (coordinates.y < acc.y) acc.y = coordinates.y;
        return acc;
      },
      { x: 0, y: 0 }
    );
    return segment.map(({ coordinates, char }) => ({
      coordinates: { x: coordinates.x - mins.x, y: coordinates.y - mins.y },
      char
    }));
  },
  offset: (segments: Offset): Offset => {
    const mins = C2D.calculate.min([
      ...segments.source.map(({ coordinates }) => coordinates),
      ...segments.mid.map(({ coordinates }) => coordinates),
      ...segments.target.map(({ coordinates }) => coordinates)
    ]);
    return {
      source: segments.source.map(({ coordinates, char }) => ({
        coordinates: { x: coordinates.x - mins.x, y: coordinates.y - mins.y },
        char
      })),
      mid: segments.mid.map(({ coordinates, char }) => ({
        coordinates: { x: coordinates.x - mins.x, y: coordinates.y - mins.y },
        char
      })),
      target: segments.target.map(({ coordinates, char }) => ({
        coordinates: { x: coordinates.x - mins.x, y: coordinates.y - mins.y },
        char
      }))
    };
  }
} as const;

export {
  type Direct,
  type Offset,
  type Segment,
  type SegmentPoint,
  type Segments,
  type SegmentsMap,
  calculate,
  create,
  normalize
};
