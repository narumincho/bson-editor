import { Location, WithLocation } from "./location.ts";

const readonlyDataViewSymbolBland = Symbol("readonlyDataViewSymbolBland");

export type ReadonlyDataView = {
  readonly __dataView: DataView;
  readonly __readonlyDataViewSymbolBland: typeof readonlyDataViewSymbolBland;
};

export const toReadonlyDataView = (dataView: DataView): ReadonlyDataView => {
  return {
    __dataView: dataView,
    __readonlyDataViewSymbolBland: readonlyDataViewSymbolBland,
  };
};

export type WithLocationAndNext<T> = {
  readonly withLocationValue: WithLocation<T>;
  readonly next: ReadonlyDataView;
};

const emptyDataView = toReadonlyDataView(new DataView(new ArrayBuffer(0)));

/**
 * DataView を2つに分割する
 * @param localOffset 分割する位置
 */
export const createLocationAndNextDataView = (
  dataView: ReadonlyDataView,
  localOffset: number,
): {
  readonly left: ReadonlyDataView;
  readonly right: ReadonlyDataView;
  readonly overflow: boolean;
} => {
  console.log(dataView.__dataView.byteLength, localOffset);
  if (dataView.__dataView.byteLength < localOffset) {
    return {
      left: dataView,
      right: emptyDataView,
      overflow: true,
    };
  }
  return {
    left: toReadonlyDataView(
      new DataView(
        dataView.__dataView.buffer,
        dataView.__dataView.byteOffset,
        localOffset,
      ),
    ),
    right: toReadonlyDataView(
      new DataView(
        dataView.__dataView.buffer,
        dataView.__dataView.byteOffset + localOffset,
        dataView.__dataView.byteLength - localOffset,
      ),
    ),
    overflow: false,
  };
};

export const dataViewToLocation = (
  dataView: ReadonlyDataView,
): Location => {
  return {
    startIndex: dataView.__dataView.byteOffset,
    endIndex: dataView.__dataView.byteOffset + dataView.__dataView.byteLength,
  };
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
  dataView: ReadonlyDataView,
): WithLocationAndNext<number | undefined> => {
  const { left, right, overflow } = createLocationAndNextDataView(
    dataView,
    1,
  );
  return {
    withLocationValue: {
      value: overflow ? undefined : left.__dataView.getUint8(0),
      location: dataViewToLocation(left),
    },
    next: right,
  };
};

/**
 * 4byte の Int32 を取得する
 */
export const getInt32 = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<number | undefined> => {
  const { left, right, overflow } = createLocationAndNextDataView(
    dataView,
    4,
  );
  return {
    withLocationValue: {
      value: overflow ? undefined : left.__dataView.getInt32(0, true),
      location: dataViewToLocation(left),
    },
    next: right,
  };
};

/**
 * 8byte の Float64 を取得する
 */
export const getFloat64 = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<number | undefined> => {
  const { left, right, overflow } = createLocationAndNextDataView(
    dataView,
    8,
  );
  return {
    withLocationValue: {
      value: overflow ? undefined : dataView.__dataView.getFloat64(0, true),
      location: dataViewToLocation(left),
    },
    next: right,
  };
};

/**
 * 指定した値が含まれる位置を返す
 * @returns 相対位置を返す
 */
export const indexOf = (
  dataView: ReadonlyDataView,
  value: number,
): number | undefined => {
  const binary = new Uint8Array(
    dataView.__dataView.buffer,
    dataView.__dataView.byteOffset,
    dataView.__dataView.byteLength,
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
  dataView: ReadonlyDataView,
): WithLocation<{
  readonly value: string;
  readonly originalIfInvalidUtf8Error: Uint8Array | undefined;
}> => {
  const sliced = new Uint8Array(
    dataView.__dataView.buffer,
    dataView.__dataView.byteOffset,
    dataView.__dataView.byteLength,
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
