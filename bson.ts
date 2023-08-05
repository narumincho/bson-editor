export type DeserializeResult<T> = {
  readonly type: "ok";
  readonly value: T;
} | {
  readonly type: "error";
  readonly error:
    | SizeTooSmallError
    | BinarySizeError
    | IllegalEndValue
    | UnsupportedType;
};

export type SizeTooSmallError = {
  readonly type: "sizeTooSmall";
  readonly size: number;
};

export type BinarySizeError = {
  readonly type: "binarySizeError";
  readonly expectedSize: number;
  readonly actualSize: number;
};

export type IllegalEndValue = {
  readonly type: "illegalEndValue";
  readonly index: number;
  readonly value: number;
};

export type UnsupportedType = {
  readonly type: "unsupportedType";
  readonly typeId: number;
};

export type StructuredBson = BsonDouble | StructuredBsonArray;

export type BsonDouble = {
  readonly type: "double";
  readonly value: number;
};

export type StructuredBsonArray = {
  readonly type: "array";
  readonly value: ReadonlyArray<
    { readonly name: string; readonly value: StructuredBson }
  >;
};

export const bsonBinaryToStructuredBson = (
  binary: Uint8Array,
): DeserializeResult<StructuredBsonArray> => {
  if (binary.length < 4) {
    return {
      type: "error",
      error: { type: "sizeTooSmall", size: binary.length },
    };
  }
  const size = parseInt32(binary, 0);
  const sizeValue = size.value;
  if (sizeValue < 5) {
    return { type: "error", error: { type: "sizeTooSmall", size: size.value } };
  }

  if (sizeValue > binary.length) {
    return {
      type: "error",
      error: {
        type: "binarySizeError",
        expectedSize: sizeValue,
        actualSize: binary.length,
      },
    };
  }

  if (binary[sizeValue - 1] !== 0) {
    return {
      type: "error",
      error: {
        type: "illegalEndValue",
        index: sizeValue - 1,
        value: binary[sizeValue - 1],
      },
    };
  }
  return deserializeObject(binary, size.nextIndex);
};

const deserializeObject = (
  binary: Uint8Array,
  index: number,
): DeserializeResult<StructuredBsonArray> => {
  const fields: Array<{
    readonly name: string;
    readonly value: StructuredBson;
  }> = [];
  while (true) {
    const field = deserializeObjectField(binary, index);
    if (field.type === "error") {
      return field;
    }
    if (field.value === undefined) {
      return {
        type: "ok",
        value: { type: "array", value: fields },
      };
    }
    fields.push({ name: field.value.name, value: field.value.value });
  }
};

const typeDouble = 0x01;

const deserializeObjectField = (
  binary: Uint8Array,
  index: number,
): DeserializeResult<
  {
    name: string;
    value: StructuredBson;
    nextIndex: number;
  } | undefined
> => {
  const type = binary[index];
  const valueIndex = index + 1;
  const nameAndNextIndex = parseCString(binary, valueIndex);
  switch (type) {
    case 0: {
      return { type: "ok", value: undefined };
    }
    case typeDouble: {
      const dataView = new DataView(binary.buffer);
      return {
        type: "ok",
        value: {
          name: nameAndNextIndex.value,
          value: {
            type: "double",
            value: dataView.getFloat64(nameAndNextIndex.nextIndex),
          },
          nextIndex: nameAndNextIndex.nextIndex + 8,
        },
      };
    }
  }
  return {
    type: "error",
    error: { type: "unsupportedType", typeId: type },
  };
};

const parseInt32 = (
  binary: Uint8Array,
  index: number,
): { readonly value: number; readonly nextIndex: number } => {
  return {
    value: binary[index] |
      (binary[index + 1] << 8) |
      (binary[index + 2] << 16) |
      (binary[index + 3] << 24),
    nextIndex: index + 4,
  };
};

const parseCString = (
  binary: Uint8Array,
  index: number,
): { readonly value: string; readonly nextIndex: number } => {
  const endIndex = binary.indexOf(0, index);
  if (endIndex === -1) {
    throw new Error("Could not find end of cstring");
  }
  return {
    value: new TextDecoder().decode(binary.slice(index, endIndex)),
    nextIndex: endIndex + 1,
  };
};
