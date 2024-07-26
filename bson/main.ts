import {
  createLocationAndNextDataView,
  getFloat64,
  getInt32,
  getString,
  getUint8,
  indexOf,
  ReadonlyDataView,
  toReadonlyDataView,
  WithLocationAndNext,
} from "./dataView.ts";
import { WithLocation } from "./location.ts";

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
  readonly value: ReadonlyArray<WithLocation<Element>>;
  readonly lastUnsupportedType: UnsupportedTypeInElement | undefined;
};

export type UnsupportedTypeInElement = {
  readonly name: WithLocation<CStringWithInvalid>;
  readonly typeId: number | undefined;
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

    switch (element.type) {
      case "element": {
        elements.push(element.element.withLocationValue);
        dataViewCurrent = element.element.next;
        break;
      }
      case "endOfElement":
        return {
          location: {
            startIndex: dataView.__dataView.byteOffset,
            endIndex: dataViewCurrent.__dataView.byteOffset +
              dataViewCurrent.__dataView.byteLength - 1,
          },
          value: { value: elements, lastUnsupportedType: undefined },
        };
      case "unsupportedType": {
        return {
          location: {
            startIndex: dataView.__dataView.byteOffset,
            endIndex: dataViewCurrent.__dataView.byteOffset +
              dataViewCurrent.__dataView.byteLength - 1,
          },
          value: {
            value: elements,
            lastUnsupportedType: element.unsupportedType,
          },
        };
      }
    }
  }
};

const typeIdDouble = 0x01;
const typeIdString = 0x02;

type DeserializeElementResult = {
  readonly type: "element";
  readonly element: WithLocationAndNext<Element>;
} | {
  readonly type: "endOfElement";
} | {
  readonly type: "unsupportedType";
  readonly unsupportedType: UnsupportedTypeInElement;
};

const deserializeElement = (
  dataView: ReadonlyDataView,
): DeserializeElementResult => {
  const typeIdAndNext = getUint8(dataView);
  if (typeIdAndNext.withLocationValue.value === 0) {
    return { type: "endOfElement" };
  }
  const nameAndNext = parseCString(typeIdAndNext.next);
  switch (typeIdAndNext.withLocationValue.value) {
    case typeIdDouble: {
      const double = getFloat64(nameAndNext.next);
      return {
        type: "element",
        element: {
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
        },
      };
    }
    case typeIdString: {
      const string = parseString(nameAndNext.next);
      return {
        type: "element",
        element: {
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
        },
      };
    }
  }
  return {
    type: "unsupportedType",
    unsupportedType: {
      typeId: typeIdAndNext.withLocationValue.value,
      name: nameAndNext.withLocationValue,
    },
  };
};

const parseCString = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<CStringWithInvalid> => {
  const endOfFlagLocalIndex = indexOf(dataView, 0);
  const stringDataView = createLocationAndNextDataView(
    dataView,
    endOfFlagLocalIndex === undefined
      ? dataView.__dataView.byteLength
      : endOfFlagLocalIndex,
  );
  const stringResult = getString(stringDataView.left);
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
    next: stringDataView.right,
  };
};

const parseString = (
  dataView: ReadonlyDataView,
): WithLocationAndNext<StringWithInvalid> => {
  const size = getInt32(dataView);
  if (size.withLocationValue.value === undefined) {
    return {
      withLocationValue: {
        location: size.withLocationValue.location,
        value: {
          value: "",
          originalIfError: undefined,
        },
      },
      next: size.next,
    };
  }
  const body = createLocationAndNextDataView(
    size.next,
    size.withLocationValue.value,
  );
  const getStringResult = getString(body.left);
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
    next: body.right,
  };
};
