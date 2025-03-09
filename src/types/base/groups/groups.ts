type SourceTargetKey = 'source' | 'target';
interface SourceTarget<S, T = S> {
  source: S;
  target: T;
}
type SourceMidTargetKey = SourceTargetKey | 'mid';
interface SourceMidTarget<S, M = S, T = S> extends SourceTarget<S, T> {
  mid: M;
}

type StartEndKey = 'start' | 'end';
interface StartEnd<S, E = S> {
  start: S;
  end: E;
}
type StartMidEndKey = StartEndKey | 'mid';
interface StartMidEnd<S, M = S, T = S> extends StartEnd<S, T> {
  mid: M;
}

type HeadTailKey = 'head' | 'tail';
interface HeadTail<H = string, T = H> {
  head: H;
  tail: T;
}
type HeadBodyTailKey = HeadTailKey | 'body';
interface HeadBodyTail<H = string, B = H, T = H> extends HeadTail<H, T> {
  body: B;
}
type IncomingOutgoingKey = 'incoming' | 'outgoing';
interface IncomingOutgoing<I, O = I> {
  incoming: I;
  outgoing: O;
}

type PrimarySecondaryKey = 'primary' | 'secondary';
interface PrimarySecondary<P, S = P> {
  primary: P;
  secondary: S;
}
type HeaderFooterKey = 'header' | 'footer';
interface HeaderFooter<H, F = H> {
  header: H;
  footer: F;
}
type HeaderBodyFooterKey = HeaderFooterKey | 'body';
interface HeaderBodyFooter<H, B = H, F = H> extends HeaderFooter<H, F> {
  body: B;
}

export type {
  HeadBodyTail,
  HeadBodyTailKey,
  HeaderBodyFooter,
  HeaderBodyFooterKey,
  HeaderFooter,
  HeaderFooterKey,
  HeadTail,
  HeadTailKey,
  IncomingOutgoing,
  IncomingOutgoingKey,
  PrimarySecondary,
  PrimarySecondaryKey,
  SourceMidTarget,
  SourceMidTargetKey,
  SourceTarget,
  SourceTargetKey,
  StartEnd,
  StartEndKey,
  StartMidEnd,
  StartMidEndKey
};
