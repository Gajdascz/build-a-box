import type { C2D, Group, Position } from '#srcTypes';

type Direction = 'leftToRight' | 'topToBottom';
interface Directions {
  horizontal: 'leftToRight';
  vertical: 'topToBottom';
}
type InferDirection<O extends Position.Orientation> = Directions[O];
type Path = Group.SourceTarget<C2D.Coordinates>;

const is = {
  /**
   * ```
   *    01234
   *  0 x->x
   *  1
   *  2
   * ```
   */
  leftToRight: (path: Path) => path.source.x < path.target.x,
  /**
   * ```
   *    012
   *  0 x
   *  1 |
   *  2 v
   *  3 x
   * ```
   */
  topToBottom: (path: Path) => path.source.y < path.target.y,
  orientationDirection: (
    orientation: Position.Orientation,
    direction: unknown
  ): direction is Position.Direction =>
    (orientation === 'horizontal' && direction === 'leftToRight') ||
    (orientation === 'vertical' && direction === 'topToBottom')
} as const;

export { type Direction, type Directions, type InferDirection, is };
