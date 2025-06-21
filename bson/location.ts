export type Location = {
  readonly startIndex: number;
  readonly endIndex: number;
};

export type WithLocation<T> = {
  readonly value: T;
  readonly location: Location;
};

export const mapLocation = <T, U>(
  withLocation: WithLocation<T>,
  f: (value: T) => U,
): WithLocation<U> => {
  return {
    value: f(withLocation.value),
    location: withLocation.location,
  };
};
