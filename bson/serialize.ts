export type Document = ReadonlyMap<string, Element>;

export type Element = {
  readonly type: "double";
  readonly value: number;
} | {
  readonly type: "string";
  readonly value: string;
} | {
  readonly type: "document";
  readonly value: Document;
};

export const ToBsonBinary = (document: Document): Uint8Array => {
  return new Uint8Array(documentToBsonBinary(document));
};

const documentToBsonBinary = (
  document: Document,
): ReadonlyArray<number> => {
  const body = [...document].flatMap(([name, element]) => {
    const { type, value } = elementToBsonBinary(element);
    return [
      type,
      ...stringTOCString(name),
      ...value,
    ];
  });
  return [
    ...int32ToBsonBinary(body.length + 5),
    ...body,
    0x00,
  ];
};

const elementToBsonBinary = (
  element: Element,
): { type: number; value: ReadonlyArray<number> } => {
  switch (element.type) {
    case "double":
      return {
        type: 0x01,
        value: [...new Uint8Array(new Float64Array([element.value]).buffer)],
      };
    case "string":
      return {
        type: 0x02,
        value: stringToBsonString(element.value),
      };
    case "document":
      return {
        type: 0x03,
        value: documentToBsonBinary(element.value),
      };
  }
};

const stringTOCString = (string: string): ReadonlyArray<number> => {
  return [...new TextEncoder().encode(string), 0x00];
};

const stringToBsonString = (string: string): ReadonlyArray<number> => {
  const utf8 = new TextEncoder().encode(string);
  return [
    ...int32ToBsonBinary(utf8.length + 1),
    ...utf8,
    0x00,
  ];
};

const int32ToBsonBinary = (value: number): ReadonlyArray<number> => {
  return [...new Uint8Array(new Int32Array([value]).buffer)];
};
