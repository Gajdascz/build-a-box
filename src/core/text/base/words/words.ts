const get = (text: string): string[] =>
  text.split(/\s+/).filter((text) => text.length > 0);

const buildChunk = (
  text: string,
  maxLength: number
): { chunk: string; remainingWords: string[] } => {
  if (typeof text !== 'string') return { chunk: '', remainingWords: [] };
  if (text.length <= maxLength) return { chunk: text, remainingWords: [] };
  const words = get(text);
  let currentChunk: string = words[0]!;
  if (currentChunk.length > maxLength)
    return { chunk: '', remainingWords: words };
  if (currentChunk.length === maxLength)
    return { chunk: currentChunk, remainingWords: words.slice(1) };
  for (let i = 1; i < words.length; i++) {
    const nextWord = words[i];
    const nextChunk = `${currentChunk} ${nextWord}`;
    if (nextChunk.length === maxLength)
      return { chunk: nextChunk, remainingWords: words.slice(i + 1) };
    if (nextChunk.length > maxLength)
      return { chunk: currentChunk, remainingWords: words.slice(i) };
    currentChunk = nextChunk;
  }
  return { chunk: currentChunk, remainingWords: [] };
};

const split = (
  word: string,
  breakPoint: number
): { first: string; second: string } => ({
  first: word.slice(0, breakPoint),
  second: word.slice(breakPoint)
});

export { buildChunk, get, split };
