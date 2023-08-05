export type SizeTooSmallError = {
  readonly type: "sizeTooSmall";
  readonly size: number;
  readonly min: number;
};

export type ErrorAtSize = {
  readonly type: "cannotReadSize";
} | {
  readonly type: "lessThanOrEqualZero";
};

export type NotFoundEndOfFlagError = {
  readonly index: number;
  readonly value: number | undefined;
};

export type ElementValueWithInvalid =
  | { readonly type: "double"; readonly value: DoubleWithInvalid }
  | { readonly type: "string"; readonly value: StringWithInvalid }
  | { readonly type: "document"; readonly value: DocumentWithInvalid }
  | { readonly type: "int32"; readonly value: Int32WithInvalid };

export type DoubleWithInvalid = {
  readonly type: "ok";
  readonly value: number;
  readonly startIndex: number;
  readonly endIndex: number;
} | {
  readonly type: "binarySizeTooSmall";
};

export type CStringWithInvalid = {
  readonly value: string;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly originalIfInvalidUtf8Error: Uint8Array | undefined;
  readonly notFoundEndOfFlag: boolean;
};

export type StringWithInvalid = {
  readonly value: string;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly originalIfError: Uint8Array | undefined;
  readonly warnNotFoundEndOfFlag: NotFoundEndOfFlagError | undefined;
} | {
  readonly type: "errorAtSize";
  readonly error: ErrorAtSize;
};

export type DocumentWithInvalid = {
  readonly type: "ok";
  readonly value: ReadonlyArray<ElementWithInvalid>;
  readonly warnNotFoundEndOfFlag: NotFoundEndOfFlagError | undefined;
} | {
  readonly type: "errorAtSize";
  readonly error: ErrorAtSize;
};

export type ElementWithInvalid = {
  readonly type: "ok";
  readonly value: {
    readonly name: CStringWithInvalid;
    readonly value: ElementValueWithInvalid;
  };
} | {
  readonly type: "unsupportedType";
  readonly typeId: number;
};

export type Int32WithInvalid = {
  readonly type: "ok";
  readonly value: number;
  readonly startIndex: number;
  readonly endIndex: number;
} | {
  readonly type: "binarySizeTooSmall";
};

export const bsonBinaryToStructuredBson = (
  binary: Uint8Array,
): DocumentWithInvalid => {
  return deserializeDocument(binary, 0);
};

const deserializeDocument = (
  binary: Uint8Array,
  index: 0,
): DocumentWithInvalid => {
  const bytesSize = parseInt32(binary, index);

  if (bytesSize.type === "binarySizeTooSmall") {
    return {
      type: "errorAtSize",
      error: {
        type: "cannotReadSize",
      },
    };
  }
  const endOfFlagIndex = index + bytesSize.value;
  const warnNotFoundEndOfFlag: NotFoundEndOfFlagError | undefined =
    binary[endOfFlagIndex] === 0 ? undefined : {
      index: endOfFlagIndex,
      value: binary[endOfFlagIndex],
    };

  const elements: Array<ElementWithInvalid> = [];
  let nextIndex = bytesSize.endIndex + 1;
  while (true) {
    const element = deserializeElement(binary, nextIndex);

    if (element.type === "endOfFlag" || element.type === "empty") {
      return {
        type: "ok",
        value: elements,
        warnNotFoundEndOfFlag,
      };
    }
    elements.push(element.value);
    nextIndex = element.nextIndex;
  }
};

const typeIdDouble = 0x01;
const typeIdString = 0x02;

const deserializeElement = (
  binary: Uint8Array,
  index: number,
): {
  readonly type: "ok";
  readonly value: ElementWithInvalid;
  readonly nextIndex: number;
} | {
  readonly type: "endOfFlag";
  readonly nextIndex: number;
} | {
  readonly type: "empty";
} => {
  const typeId = binary[index];
  if (typeId === undefined) {
    return { type: "empty" };
  }
  if (typeId === 0) {
    return { type: "endOfFlag", nextIndex: index + 1 };
  }
  const nameAndNextIndex = parseCString(binary, index + 1);
  const dataView = new DataView(binary.buffer, nameAndNextIndex.endIndex + 1);
  switch (typeId) {
    case typeIdDouble: {
      return {
        type: "ok",
        value: {
          name: nameAndNextIndex,
          value: {
            type: "double",
            value: dataView.getFloat64(0),
          },
          nextIndex: nameAndNextIndex.nextIndex + 8,
        },
      };
    }
    case typeIdString: {
    }
  }
  return {
    type: "ok",
    value: {
      type: "unsupportedType",
      typeId,
    },
  };
};

const parseInt32 = (
  binary: Uint8Array,
  index: number,
): Int32WithInvalid => {
  try {
    return {
      type: "ok",
      value: new DataView(binary.buffer).getInt32(index, true),
      startIndex: index,
      endIndex: index + 4,
    };
  } catch (_e) {
    return {
      type: "binarySizeTooSmall",
    };
  }
};

const parseCString = (
  binary: Uint8Array,
  index: number,
): CStringWithInvalid => {
  const endIndex = binary.indexOf(0, index);
  const notFoundEndOfFlag = endIndex === -1;
  const sliced = binary.slice(index, notFoundEndOfFlag ? undefined : endIndex);
  try {
    return {
      value: new TextDecoder(undefined, { fatal: true }).decode(
        sliced,
      ),
      originalIfInvalidUtf8Error: undefined,
      startIndex: index,
      endIndex: notFoundEndOfFlag ? binary.length - 1 : endIndex,
      notFoundEndOfFlag,
    };
  } catch (_e) {
    return {
      value: new TextDecoder().decode(
        sliced,
      ),
      originalIfInvalidUtf8Error: sliced,
      startIndex: index,
      endIndex: notFoundEndOfFlag ? binary.length - 1 : endIndex,
      notFoundEndOfFlag,
    };
  }
};

const parseString = (dataView: DataView): StringWithInvalid => {
};

const parseDouble = (dataView: DataView): DoubleWithInvalid => {
};
