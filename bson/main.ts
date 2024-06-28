import {
  getFloat64,
  getInt32,
  getLocation,
  getString,
  getUint8,
  indexOf,
  ReadonlyDataView,
  setLocalOffsetAndLengthDataView,
  setLocalOffsetDataView,
  toReadonlyDataView,
  WithLocationAndNext,
} from "./dataView.ts";
import { WithLocation } from "./location.ts";

export type ElementValueWithInvalid =
  | { readonly type: "double"; readonly value: number }
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
  readonly value: ReadonlyArray<WithLocation<Element>>;
  readonly unsupportedTypesError: boolean;
};

export type Element = {
  readonly name: WithLocation<CStringWithInvalid>;
  readonly value: WithLocation<ElementValueWithInvalid>;
};

export const bsonBinaryToStructuredBson = (
  binary: Uint8Array,
): WithLocation<DocumentWithInvalid> => {
  return deserializeDocument(toReadonlyDataView(new DataView(binary.buffer)));
};

const deserializeDocument = (
  dataView: ReadonlyDataView,
): WithLocation<DocumentWithInvalid> => {
  const bytesSize = getInt32(dataView);

  const elements: Array<WithLocation<Element>> = [];
  let dataViewCurrent = bytesSize.next;
  while (true) {
    const element = deserializeElement(dataViewCurrent);

    if (element === "endOfElement") {
      return {
        location: {
          startIndex: dataView.__dataView.byteOffset,
          endIndex: dataViewCurrent.__dataView.byteOffset +
            dataViewCurrent.__dataView.byteLength - 1,
        },
        value: {
          value: elements,
          unsupportedTypesError: false,
        },
      };
    }
    if (element === "unsupportedType") {
      return {
        location: {
          startIndex: dataView.__dataView.byteOffset,
          endIndex: dataViewCurrent.__dataView.byteOffset +
            dataViewCurrent.__dataView.byteLength - 1,
        },
        value: { value: elements, unsupportedTypesError: true },
      };
    }
    elements.push(element.withLocationValue);
    dataViewCurrent = element.next;
  }
};

const typeIdDouble = 0x01;
const typeIdString = 0x02;

const deserializeElement = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<Element> | "endOfElement" | "unsupportedType" => {
  const typeIdAndNext = getUint8(dataView);
  if (typeIdAndNext.withLocationValue.value === 0) {
    return "endOfElement";
  }
  const nameAndNext = parseCString(typeIdAndNext.next);
  switch (typeIdAndNext.withLocationValue.value) {
    case typeIdDouble: {
      const double = getFloat64(nameAndNext.next);
      return {
        withLocationValue: {
          location: {
            startIndex: typeIdAndNext.withLocationValue.location.startIndex,
            endIndex: double.withLocationValue.location.endIndex,
          },
          value: {
            name: nameAndNext.withLocationValue,
            value: {
              location: double.withLocationValue.location,
              value: {
                type: "double",
                value: double.withLocationValue.value,
              },
            },
          },
        },
        next: double.next,
      };
    }
    case typeIdString: {
      const string = parseString(nameAndNext.next);
      return {
        withLocationValue: {
          location: {
            startIndex: typeIdAndNext.withLocationValue.location.startIndex,
            endIndex: string.withLocationValue.location.endIndex,
          },
          value: {
            name: nameAndNext.withLocationValue,
            value: {
              location: string.withLocationValue.location,
              value: {
                type: "string",
                value: string.withLocationValue.value,
              },
            },
          },
        },
        next: string.next,
      };
    }
  }
  return "unsupportedType";
};

const parseCString = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<CStringWithInvalid> => {
  const endOfFlagLocalIndex = indexOf(dataView, 0);
  const stringDataView = endOfFlagLocalIndex === undefined
    ? dataView
    : setLocalOffsetAndLengthDataView(dataView, 0, endOfFlagLocalIndex);
  const stringResult = getString(stringDataView);
  return {
    withLocationValue: {
      location: {
        startIndex: dataView.__dataView.byteOffset,
        endIndex: stringResult.location.endIndex,
      },
      value: {
        value: stringResult.value.value,
        originalIfInvalidUtf8Error:
          stringResult.value.originalIfInvalidUtf8Error,
        notFoundEndOfFlag: endOfFlagLocalIndex === undefined,
      },
    },
    next: endOfFlagLocalIndex === undefined
      ? dataView
      : setLocalOffsetDataView(dataView, endOfFlagLocalIndex + 1),
  };
};

const parseString = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<StringWithInvalid> => {
  const size = getInt32(dataView);
  const body = setLocalOffsetAndLengthDataView(
    size.next,
    0,
    size.withLocationValue.value - 1,
  );
  const getStringResult = getString(body);
  return {
    withLocationValue: {
      location: {
        startIndex: size.withLocationValue.location.startIndex,
        endIndex: getStringResult.location.endIndex,
      },
      value: {
        originalIfError: getStringResult.value.originalIfInvalidUtf8Error,
        value: getStringResult.value.value,
      },
    },
    next: setLocalOffsetDataView(size.next, size.withLocationValue.value),
  };
};
