import { toReadonlyDataView } from "./dataView.ts";
import { fromBsonBinary, parseCString } from "./fromBsonBinary.ts";
import { assertEquals } from "@std/assert";
import { serialize } from "bson";

Deno.test("bsonBinaryToStructuredBson", () => {
  assertEquals(
    fromBsonBinary(serialize({ a: "サンプルテキスト", b: "あああ" })),
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
        {
          name: {
            notFoundEndOfFlag: false,
            originalIfInvalidUtf8Error: undefined,
            value: "b",
          },
          value: {
            type: "string",
            value: {
              value: "あああ",
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

Deno.test("double", () => {
  assertEquals(
    fromBsonBinary(serialize({ "数値サンプル": 1.2 })),
    {
      value: [
        {
          name: {
            notFoundEndOfFlag: false,
            originalIfInvalidUtf8Error: undefined,
            value: "数値サンプル",
          },
          value: {
            type: "double",
            value: 1.2,
          },
        },
      ],
      lastUnsupportedType: undefined,
    },
  );
});

Deno.test("int32", () => {
  assertEquals(
    fromBsonBinary(serialize({ "整数サンプル": 15 })),
    {
      value: [
        {
          name: {
            notFoundEndOfFlag: false,
            originalIfInvalidUtf8Error: undefined,
            value: "整数サンプル",
          },
          value: {
            type: "int32",
            value: 15,
          },
        },
      ],
      lastUnsupportedType: undefined,
    },
  );
});
