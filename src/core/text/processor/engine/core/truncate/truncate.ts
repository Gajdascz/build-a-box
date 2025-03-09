interface Affix {
  char: string;
  length: number;
}
interface Cfg {
  targetLength: number;
  suffix?: Affix & { forceApply: boolean };
}

interface ApplyOpts {
  text: string;
  cfg: Partial<Cfg>;
}
const apply = ({
  text,
  cfg: { targetLength = text.length, suffix = undefined } = {}
}: ApplyOpts) => {
  if (
    !suffix ||
    suffix.char.length !== 1 ||
    suffix.length < 1 ||
    targetLength - suffix.length <= 0
  ) {
    return text.slice(0, targetLength).trim();
  }

  // Return original text if it fits within target length
  if (text.length <= targetLength && !suffix.forceApply) return text;

  const effectiveLength = targetLength - suffix.length;
  if (effectiveLength <= 0) return text.slice(0, targetLength);

  return text.slice(0, effectiveLength).trim() + suffix.char.repeat(suffix.length);
};

export { type Cfg, apply };
