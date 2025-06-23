/**
 * https://www.npmjs.com/package/bson から Node.js への依存をなくして, 型を強化した bson ライブラリ
 *
 * @module
 */
import {
  createLocationAndNextDataView,
  getFloat64,
  getInt32,
  getString,
  getUint8,
  indexOf,
  ReadonlyDataView,
  toReadonlyDataView,
  ValueAndNext,
} from "./dataView.ts";

export type ElementValueWithInvalid =
  | { readonly type: "double"; readonly value: number | undefined }
  | { readonly type: "string"; readonly value: StringWithInvalid }
  | { readonly type: "document"; readonly value: DocumentWithInvalid }
  | { readonly type: "int32"; readonly value: number };

export type CStringWithInvalid = {
  readonly value: string;
  readonly originalIfInvalidUtf8Error: Uint8Array | undefined;
  readonly notFoundEndOfFlag: boolean;
};

export type StringWithInvalid = {
  readonly value: string;
  readonly originalIfError: Uint8Array | undefined;
};

export type DocumentWithInvalid = {
  readonly value: ReadonlyArray<Element>;
  readonly lastUnsupportedType: UnsupportedTypeInElement | undefined;
};

export type UnsupportedTypeInElement = {
  readonly name: CStringWithInvalid;
  readonly typeId: number | undefined;
};

export type Element = {
  readonly name: CStringWithInvalid;
  readonly value: ElementValueWithInvalid;
};

export const fromBsonBinary = (
  binary: Uint8Array,
): DocumentWithInvalid => {
  return documentFromDataView(
    toReadonlyDataView(new DataView(binary.buffer)),
  );
};

export const documentFromDataView = (
  dataView: ReadonlyDataView,
): DocumentWithInvalid => {
  const bytesSize = getInt32(dataView);

  const elements: Array<Element> = [];
  let dataViewCurrent = bytesSize.next;
  while (true) {
    const element = elementFromDataView(dataViewCurrent);

    switch (element.type) {
      case "element": {
        elements.push(element.element.value);
        dataViewCurrent = element.element.next;
        break;
      }
      case "endOfElement":
        return {
          value: elements,
          lastUnsupportedType: undefined,
        };
      case "unsupportedType": {
        return {
          value: elements,
          lastUnsupportedType: element.unsupportedType,
        };
      }
    }
  }
};

const typeIdDouble = 0x01;
const typeIdString = 0x02;

type DeserializeElementResult = {
  readonly type: "element";
  readonly element: ValueAndNext<Element>;
} | {
  readonly type: "endOfElement";
} | {
  readonly type: "unsupportedType";
  readonly unsupportedType: UnsupportedTypeInElement;
};

export const elementFromDataView = (
  dataView: ReadonlyDataView,
): DeserializeElementResult => {
  const typeIdAndNext = getUint8(dataView);
  if (typeIdAndNext.value === 0) {
    return { type: "endOfElement" };
  }
  const nameAndNext = parseCString(typeIdAndNext.next);
  switch (typeIdAndNext.value) {
    case typeIdDouble: {
      const double = getFloat64(nameAndNext.next);
      return {
        type: "element",
        element: {
          value: {
            name: nameAndNext.value,
            value: {
              type: "double",
              value: double.value,
            },
          },
          next: double.next,
        },
      };
    }
    case typeIdString: {
      const string = parseString(nameAndNext.next);
      return {
        type: "element",
        element: {
          value: {
            name: nameAndNext.value,
            value: {
              type: "string",
              value: string.value,
            },
          },
          next: string.next,
        },
      };
    }
  }
  return {
    type: "unsupportedType",
    unsupportedType: {
      typeId: typeIdAndNext.value,
      name: nameAndNext.value,
    },
  };
};

export const parseCString = (
  dataView: ReadonlyDataView,
): ValueAndNext<CStringWithInvalid> => {
  const endOfFlagLocalIndex = indexOf(dataView, 0);
  // ここらへんがおかしい原因っぽい
  const stringDataView = createLocationAndNextDataView(
    dataView,
    endOfFlagLocalIndex === undefined
      ? dataView.__dataView.byteLength
      : endOfFlagLocalIndex,
  );
  const stringResult = getString(stringDataView.left);
  return {
    value: {
      value: stringResult.value,
      originalIfInvalidUtf8Error: stringResult.originalIfInvalidUtf8Error,
      notFoundEndOfFlag: endOfFlagLocalIndex === undefined,
    },
    next: createLocationAndNextDataView(
      stringDataView.right,
      1,
    ).right,
  };
};

const parseString = (
  dataView: ReadonlyDataView,
): ValueAndNext<StringWithInvalid> => {
  const size = getInt32(dataView);
  if (size.value === undefined) {
    // TODO
    return {
      value: {
        value: "",
        originalIfError: undefined,
      },
      next: size.next,
    };
  }
  const body = createLocationAndNextDataView(
    size.next,
    size.value - 1,
  );
  const getStringResult = getString(body.left);
  return {
    value: {
      originalIfError: getStringResult.originalIfInvalidUtf8Error,
      value: getStringResult.value,
    },
    next: createLocationAndNextDataView(body.right, 1).right,
  };
};
