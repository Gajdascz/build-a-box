const REGISTRY = new Map<string, { counter: number }>();

type GeneratorFn<Namespace extends string> = () => `${Namespace}-${number}`;

const getGenerator = <N extends string = string>(
  namespace: N
): GeneratorFn<N> => {
  REGISTRY.set(namespace, { counter: 0 });
  const state = REGISTRY.get(namespace)!;
  return () => {
    state.counter += 1;
    return `${namespace}-${state.counter}`;
  };
};
export { type GeneratorFn, getGenerator, REGISTRY };
