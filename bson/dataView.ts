import { Location, WithLocation } from "./location.ts";

export type ReadonlyDataView = {
  readonly __dataView: DataView;
  __readonlyDataViewSymbolBland: never;
};

export const toReadonlyDataView = (dataView: DataView): ReadonlyDataView => {
  return {
    __dataView: dataView,
    __readonlyDataViewSymbolBland: undefined as never,
  };
};

export type WithLocationAndNext<T> = {
  readonly withLocationValue: WithLocation<T>;
  readonly next: ReadonlyDataView;
};

export const createOutOfRangeErrorMessage = (parameter: {
  readonly oldLeft: number;
  readonly oldRight: number;
  readonly rawNewLeft: number;
  readonly rawNewRight: number;
}): string => {
  const { oldLeft, oldRight, rawNewLeft, rawNewRight } = parameter;
  const message = `Out of range: oldLeft=${oldLeft}, oldRight=${oldRight}, rawNewLeft=${rawNewLeft}, rawNewRight=${rawNewRight}`;
  return message;
};

/**
 * DataView の範囲をさらに狭めたものを返す.
 *
 * 範囲外を指定した場合は 範囲内に収めたものを返し, leftOverflow または rightOverflow が true になる.
 * @param dataView
 * @param localOffset
 * @param length
 * @returns
 */
export const setLocalOffsetAndLengthDataView = (
  dataView: ReadonlyDataView,
  localOffset: number,
  length: number
): ReadonlyDataView => {
  const oldLeft = dataView.__dataView.byteOffset;
  const oldRight =
    dataView.__dataView.byteOffset + dataView.__dataView.byteLength;
  const rawNewLeft = oldLeft + localOffset;
  const rawNewRight = rawNewLeft + length;
  const newLeft = Math.min(Math.max(oldLeft, rawNewLeft), oldRight);
  const newRight = Math.min(Math.max(newLeft, rawNewRight), oldRight);

  if (rawNewLeft !== newLeft || rawNewRight !== newRight) {
    throw new RangeError(
      createOutOfRangeErrorMessage({
        oldLeft,
        oldRight,
        rawNewLeft,
        rawNewRight,
      })
    );
  }
  return toReadonlyDataView(
    new DataView(dataView.__dataView.buffer, newLeft, newRight - newLeft)
  );
};

export const setLocalOffsetDataView = (
  dataView: ReadonlyDataView,
  localOffset: number
): ReadonlyDataView => {
  return setLocalOffsetAndLengthDataView(
    dataView,
    localOffset,
    dataView.__dataView.byteLength - localOffset
  );
};

export const getLocation = (dataView: ReadonlyDataView): Location => {
  return {
    startIndex: dataView.__dataView.byteOffset,
    endIndex: dataView.__dataView.byteOffset + dataView.__dataView.byteLength,
  };
};

/**
 * 1byte の Uint8 を取得する
 */
export const getUint8 = (
  dataView: ReadonlyDataView
): WithLocationAndNext<number> => {
  const value = dataView.__dataView.getUint8(0);
  return {
    withLocationValue: {
      value,
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: dataView.__dataView.byteOffset + 1,
      },
    },
    next: setLocalOffsetDataView(dataView, 1),
  };
};

/**
 * 4byte の Int32 を取得する
 */
export const getInt32 = (
  dataView: ReadonlyDataView
): WithLocationAndNext<number> => {
  const value = dataView.__dataView.getInt32(0, true);
  return {
    withLocationValue: {
      value,
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: dataView.__dataView.byteOffset + 4,
      },
    },
    next: setLocalOffsetDataView(dataView, 4),
  };
};

/**
 * 8byte の Float64 を取得する
 */
export const getFloat64 = (
  dataView: ReadonlyDataView
): WithLocationAndNext<number> => {
  const value = dataView.__dataView.getFloat64(0, true);
  return {
    withLocationValue: {
      value,
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: dataView.__dataView.byteOffset + 8,
      },
    },
    next: setLocalOffsetDataView(dataView, 8),
  };
};

export const indexOf = (
  dataView: ReadonlyDataView,
  value: number
): number | undefined => {
  const binary = new Uint8Array(
    dataView.__dataView.buffer,
    dataView.__dataView.byteOffset,
    dataView.__dataView.byteLength
  );
  const localIndex = binary.indexOf(value);
  if (localIndex === -1) {
    return undefined;
  }
  return localIndex;
};

/**
 * 全てのバイトを文字列として取得する
 */
export const getString = (
  dataView: ReadonlyDataView
): WithLocation<{
  readonly value: string;
  readonly originalIfInvalidUtf8Error: Uint8Array | undefined;
}> => {
  const sliced = new Uint8Array(
    dataView.__dataView.buffer,
    dataView.__dataView.byteOffset,
    dataView.__dataView.byteLength
  );
  try {
    return {
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: dataView.__dataView.byteOffset + sliced.length,
      },
      value: {
        value: new TextDecoder(undefined, { fatal: true }).decode(sliced),
        originalIfInvalidUtf8Error: undefined,
      },
    };
  } catch (_e) {
    return {
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: dataView.__dataView.byteOffset + sliced.length,
      },
      value: {
        value: new TextDecoder().decode(sliced),
        originalIfInvalidUtf8Error: sliced,
      },
    };
  }
};
