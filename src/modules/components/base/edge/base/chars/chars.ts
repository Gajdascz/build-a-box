import { type C2D, type Group, type Position, Chars } from '#srcTypes';
const angles = {
  downRight: Chars.BoxDrawing.corners.topLeft,
  leftDown: Chars.BoxDrawing.corners.topRight,
  upRight: Chars.BoxDrawing.corners.bottomLeft,
  leftUp: Chars.BoxDrawing.corners.bottomRight
} as const;
const chars = {
  ...Chars.BoxDrawing,
  angles,
  lines: Chars.BoxDrawing.lines,
  junctions: Chars.BoxDrawing.junctions,
  arrowHeads: { basic: { right: '>', left: '<', down: 'v', up: '^' } }
} as const;
const {
  arrowHeads: { basic },
  junctions: { cross, tConnectDown, tConnectLeft, tConnectRight, tConnectUp },
  lines: { horizontal, vertical }
} = chars;
type EdgeSegmentChars = Group.HeadBodyTail;

interface EdgeChars {
  lines: Record<Position.Orientation, string>;
  angles: Record<Position.Angle, string>;
  arrowHeads: Record<Position.Direction, string>;
}

const C = {
  lineStyles: { light: 'light', heavy: 'heavy', double: 'double', arc: 'arc' },
  endsStyles: { none: 'none', directed: 'directed', bidirectional: 'bidirectional' },
  styleMins: { none: 0, directed: 2, bidirectional: 3 }
} as const;
type LineStyle = keyof typeof C.lineStyles;
type EndsStyle = keyof typeof C.endsStyles;

const segmentEndsStyleResolver: {
  [S in EndsStyle]: (
    chars: Omit<EdgeChars, 'angles' | 'segment'>,
    orientation: Position.Orientation
  ) => EdgeSegmentChars;
} = {
  none: ({ lines }, orientation) => ({ head: '', body: lines[orientation], tail: '' }),
  directed: ({ arrowHeads: { right, down }, lines }, orientation) =>
    orientation === 'vertical' ?
      { head: '', body: lines.vertical, tail: down }
    : { head: '', body: lines.horizontal, tail: right },
  bidirectional: ({ arrowHeads: { down, left, right, up }, lines }, orientation) =>
    orientation === 'horizontal' ?
      { head: left, body: lines.horizontal, tail: right }
    : { head: up, body: lines.vertical, tail: down }
} as const;

const charStyleSetGenerator: {
  [S in LineStyle]: () => EdgeChars;
} = {
  light: () => {
    const styleSet = {
      lines: { horizontal: horizontal.light, vertical: vertical.light },
      junctions: {
        tUp: tConnectUp.light,
        tRight: tConnectRight.light,
        tDown: tConnectDown.light,
        tLeft: tConnectLeft.light,
        cross: cross.light
      },
      angles: {
        downRight: angles.downRight.light,
        leftDown: angles.leftDown.light,
        upRight: angles.upRight.light,
        leftUp: angles.leftUp.light
      },
      arrowHeads: { ...basic }
    };
    return { ...styleSet };
  },
  heavy: () => {
    const styleSet = {
      lines: { horizontal: horizontal.heavy, vertical: vertical.heavy },
      junctions: {
        tUp: tConnectUp.heavy,
        tRight: tConnectRight.heavy,
        tDown: tConnectDown.heavy,
        tLeft: tConnectLeft.heavy,
        cross: cross.heavy
      },
      angles: {
        downRight: angles.downRight.heavy,
        leftDown: angles.leftDown.heavy,
        upRight: angles.upRight.heavy,
        leftUp: angles.leftUp.heavy
      },
      arrowHeads: { ...basic }
    };
    return { ...styleSet };
  },
  double: () => {
    const styleSet = {
      lines: { horizontal: horizontal.double, vertical: vertical.double },
      junctions: {
        tUp: tConnectUp.double,
        tRight: tConnectRight.double,
        tDown: tConnectDown.double,
        tLeft: tConnectLeft.double,
        cross: cross.double
      },
      angles: {
        downRight: angles.downRight.double,
        leftDown: angles.leftDown.double,
        upRight: angles.upRight.double,
        leftUp: angles.leftUp.double
      },
      arrowHeads: { ...basic }
    };
    return { ...styleSet };
  },
  arc: () => {
    const styleSet = {
      lines: { horizontal: horizontal.light, vertical: vertical.light },
      junctions: {
        tUp: tConnectUp.light,
        tRight: tConnectRight.light,
        tDown: tConnectDown.light,
        tLeft: tConnectLeft.light,
        cross: cross.light
      },
      angles: {
        downRight: angles.downRight.arc,
        leftDown: angles.leftDown.arc,
        upRight: angles.upRight.arc,
        leftUp: angles.leftUp.arc
      },
      arrowHeads: { ...basic }
    };
    return { ...styleSet };
  }
} as const;

type OffsetAngles = Group.SourceTarget<string>;

interface BaseResolveOpts<O extends Position.Orientation> {
  orientation: O;
  chars: EdgeChars;
  length: number;
}
interface OffsetResolveOpts<O extends Position.Orientation> extends BaseResolveOpts<O> {
  endsStyle?: EndsStyle;
  offset: {
    direction: Position.Direction;
    distance: number;
    stepValue: -1 | 1;
    axis: C2D.Axis;
    orientation: Position.Orientation;
  };
}
interface OffsetPathSegmentsResolveOpts<O extends Position.Orientation>
  extends Omit<OffsetResolveOpts<O>, 'length'> {
  lengths: Group.SourceMidTarget<number>;
}
type OffsetPathSegmentsChars = Group.SourceMidTarget<EdgeSegmentChars>;
const resolve: {
  offset: {
    /**
     * Resolves angles for path segments.
     *
     * ```
     * Vertical
     * --------
     * ┌─────────────────────────────────────┐
     * │ left offset                        │
     * |─────────────────────────────────────|
     * | source = leftUp                    |
     * │ target = downRight                 │
     * │                ──┬──               │
     * │                  │                 │
     * │     target->(┌)─(┘)<- source           │
     * │              │                     │
     * │            ──┴──                   │
     * └─────────────────────────────────────┘
     * ┌─────────────────────────────────────┐
     * │ right offset                       |
     * |─────────────────────────────────────|
     * | source = upRight                   |
     * │ target = downRight                 │
     * │            ──┬──                   │
     * │              │                     │
     * │     source->(└)─(┐)<-target            |
     * │                  │                 |
     * │                  │                 │
     * │                ──┴──               │
     * └─────────────────────────────────────┘
     * ```
     *
     * ```
     * Horizontal
     * --------
     * ┌─────────────────────────────────────┐
     * │ up offset                          │
     * |─────────────────────────────────────|
     * | source = leftUp                    |
     * | target = downRight                 |
     * |                                    |
     * | target->(┌)───┤                    |
     * │              |                     |
     * |              |                     │
     * │  ├──────────(┘)<-source            |
     * │                                    │
     * └─────────────────────────────────────┘
     * ┌─────────────────────────────────────┐
     * │ down offset                        │
     * |─────────────────────────────────────|
     * | source = leftDown                  |
     * | target = upRight                   |
     * |                                    |
     * |       ├─────(┐)<-source            |
     * |              |                     |
     * |              |                     |
     * |     target->(└)─────┤                  |
     * │                                    │
     * └─────────────────────────────────────┘
     * ```
     */
    angles: <O extends Position.Orientation>(
      orientation: O,
      direction: Position.Direction,
      { downRight, leftDown, leftUp, upRight }: EdgeChars['angles']
    ) => OffsetAngles;
    pathSegmentsChars: <O extends Position.Orientation>(
      opts: OffsetPathSegmentsResolveOpts<O>
    ) => OffsetPathSegmentsChars;
    segment: {
      source: <O extends Position.Orientation>(opts: OffsetResolveOpts<O>) => EdgeSegmentChars;
      mid: <O extends Position.Orientation>(opts: OffsetResolveOpts<O>) => EdgeSegmentChars;
      target: <O extends Position.Orientation>(opts: OffsetResolveOpts<O>) => EdgeSegmentChars;
    };
  };
  chars: (lineStyle?: LineStyle) => EdgeChars;
  segmentChars: (
    chars: EdgeChars,
    endsStyle: EndsStyle,
    orientation: Position.Orientation
  ) => EdgeSegmentChars;
} = {
  chars: (lineStyle = 'light') => charStyleSetGenerator[lineStyle](),
  segmentChars: (chars, endsStyle, orientation) =>
    segmentEndsStyleResolver[endsStyle](chars, orientation),
  offset: {
    angles: (orientation, direction, { downRight, leftDown, leftUp, upRight }): OffsetAngles => {
      if (orientation === 'vertical')
        return direction === 'left' ?
            { source: leftUp, target: downRight }
          : { source: upRight, target: leftDown };
      return direction === 'up' ?
          { source: leftUp, target: downRight }
        : { source: leftDown, target: upRight };
    },
    segment: {
      source: <O extends Position.Orientation>({
        chars,
        length,
        offset,
        orientation,
        endsStyle = 'none'
      }: OffsetResolveOpts<O>) => {
        if (length === 0) return { head: '', body: '', tail: '' };
        const angles = resolve.offset.angles(orientation, offset.direction, chars.angles);
        const { body, head } = resolve.segmentChars(chars, endsStyle, orientation);
        if (length === 1) return { head: angles.source, body: '', tail: '' };
        return { head, body, tail: angles.source };
      },
      mid: <O extends Position.Orientation>({ chars, length, offset }: OffsetResolveOpts<O>) => {
        if (length === 0) return { head: '', body: '', tail: '' };
        return { head: '', body: chars.lines[offset.orientation], tail: '' };
      },
      target: <O extends Position.Orientation>({
        chars,
        length,
        offset,
        orientation,
        endsStyle = 'none'
      }: OffsetResolveOpts<O>) => {
        if (length === 0) return { head: '', body: '', tail: '' };
        const angles = resolve.offset.angles(orientation, offset.direction, chars.angles);
        const { body,  tail } = resolve.segmentChars(chars, endsStyle, orientation);
        const targetChars = { head: angles.target, body, tail };
        if (length === 1) {
          targetChars.head = angles.target;
          targetChars.body = '';
          targetChars.tail = '';
        }
        return targetChars;
      }
    },
    pathSegmentsChars: ({ chars, orientation, lengths, offset, endsStyle = 'none' }) => {
      const total = lengths.source + lengths.mid + lengths.target;
      if (!is.validLength(endsStyle, total))
        throw new Error(
          `Offset Segment with Style: ${endsStyle} requires a minimum length of ${C.styleMins[endsStyle]}`
        );
      const _lengths = {
        source: lengths.source,
        mid: lengths.mid,
        target: lengths.target
      };
      if (lengths.mid === 1 && lengths.target === 0) {
        _lengths.mid = 0;
        _lengths.target = 1;
      }
      return {
        source: resolve.offset.segment.source({
          chars,
          endsStyle,
          length: _lengths.source,
          offset,
          orientation
        }),
        mid: resolve.offset.segment.mid({ chars, length: _lengths.mid, offset, orientation }),
        target: resolve.offset.segment.target({
          chars,
          length: _lengths.target,
          offset,
          endsStyle,
          orientation
        })
      };
    }
  }
} as const;

const is = {
  lineStyle: (style: unknown): style is LineStyle =>
    typeof style === 'string' && style in C.lineStyles,
  endsStyle: (style: unknown): style is EndsStyle =>
    typeof style === 'string' && style in C.endsStyles,
  validLength: (style: EndsStyle, length: number): boolean => length >= C.styleMins[style]
} as const;
export {
  type BaseResolveOpts,
  type EdgeChars,
  type EdgeSegmentChars,
  type EndsStyle,
  type LineStyle,
  type OffsetAngles,
  type OffsetPathSegmentsChars,
  type OffsetPathSegmentsResolveOpts,
  type OffsetResolveOpts,
  C,
  chars,
  is,
  resolve
};
