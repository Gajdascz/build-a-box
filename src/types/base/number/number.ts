const isNonNegativeInt = (num: unknown): num is number =>
  Number.isSafeInteger(num) && (num as number) >= 0;
const isNonNegativeNum = (num: unknown): num is number =>
  typeof num === 'number' && num >= 0;

const isInfinity = (num: unknown): num is number => num === Infinity;

const isOdd = (num: unknown) => typeof num === 'number' && num % 2 > 0;

const isEven = (num: unknown) => !isOdd(num);

const roundToInteger = (value: number, point = 10) =>
  Math.round(Math.round(value * point) / point);

const subtractAbsolute = (start: number, ...numbers: number[]) =>
  Math.abs(
    numbers.map(Math.abs).reduce((acc, curr) => (acc -= curr), Math.abs(start))
  );
const sumAbsolute = (start: number, ...numbers: number[]) =>
  Math.abs(
    numbers.map(Math.abs).reduce((acc, curr) => (acc += curr), Math.abs(start))
  );

export {
  isEven,
  isInfinity,
  isNonNegativeInt,
  isNonNegativeNum,
  isOdd,
  roundToInteger,
  subtractAbsolute,
  sumAbsolute
};
