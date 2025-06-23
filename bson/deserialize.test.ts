import { toReadonlyDataView } from "./dataView.ts";
import {
  bsonBinaryToStructuredBson,
  deserializeElement,
  parseCString,
} from "./deserialize.ts";
import { assertEquals } from "@std/assert";
import { serialize } from "bson";

Deno.test("bsonBinaryToStructuredBson", () => {
  assertEquals(
    bsonBinaryToStructuredBson(serialize({ a: "サンプルテキスト" })),
    {
      value: [
        {
          name: {
            notFoundEndOfFlag: false,
            originalIfInvalidUtf8Error: undefined,
            value: "a",
          },
          value: {
            type: "string",
            value: {
              value: "サンプルテキスト",
              originalIfError: undefined,
            },
          },
        },
      ],
      lastUnsupportedType: undefined,
    },
  );
});

Deno.test("parseCString", () => {
  const buffer = new Uint8Array([0x01, 0x61, 0x00, 0x01]).buffer;
  assertEquals(
    parseCString(toReadonlyDataView(new DataView(buffer, 1, 3))),
    {
      next: toReadonlyDataView(new DataView(buffer, 3, 1)),
      value: {
        originalIfInvalidUtf8Error: undefined,
        notFoundEndOfFlag: false,
        value: "a",
      },
    },
  );
});

Deno.test("element", () => {
  assertEquals(
    deserializeElement(
      toReadonlyDataView(new DataView(new Uint8Array([0x00]).buffer)),
    ),
    { type: "endOfElement" },
  );

  const doubleValue = new DataView(new Uint8Array(8).buffer);
  doubleValue.setFloat64(0, 12345);
  const bson = new Uint8Array([
    0x01,
    ...new TextEncoder().encode("a"),
    0x00,
    ...new Uint8Array(doubleValue.buffer),
  ]);
  assertEquals(
    bson,
    new Uint8Array([
      0x01,
      0x61,
      0x00,
      64,
      200,
      28,
      128,
      0x00,
      0x00,
      0x00,
      0x00,
    ]),
  );

  assertEquals(
    deserializeElement(toReadonlyDataView(new DataView(bson.buffer))),
    {
      type: "element",
      element: {
        next: toReadonlyDataView(new DataView(bson.buffer, 11, 0)),
        value: {
          name: {
            notFoundEndOfFlag: true,
            originalIfInvalidUtf8Error: undefined,
            value: "",
          },
          value: {
            type: "double",
            value: 12345,
          },
        },
      },
    },
  );
});
