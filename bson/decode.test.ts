import { bsonBinaryToStructuredBson } from "./main.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/testing/asserts.ts";

Deno.test("bsonBinaryToStructuredBson", () => {
  assertEquals(
    bsonBinaryToStructuredBson(
      new Uint8Array([
        // document byte size
        0x28,
        0x00,
        0x00,
        0x00,
        // type (utf8 string)
        0x02,
        // name (long)
        0x6c,
        0x6f,
        0x6e,
        0x67,
        0x00,
        // value (サンプルテキスト)
        0x19,
        0x00,
        0x00,
        0x00,
        0xe3,
        0x82,
        0xb5,
        0xe3,
        0x83,
        0xb3,
        0xe3,
        0x83,
        0x97,
        0xe3,
        0x83,
        0xab,
        0xe3,
        0x83,
        0x86,
        0xe3,
        0x82,
        0xad,
        0xe3,
        0x82,
        0xb9,
        0xe3,
        0x83,
        0x88,
        0x00,
        // document end
        0x00,
      ]),
    ),
    {
      location: {
        startIndex: 0,
        endIndex: 39,
      },
      value: {
        value: [
          {
            location: {
              startIndex: 4,
              endIndex: 38,
            },
            value: {
              name: {
                location: {
                  startIndex: 5,
                  endIndex: 9,
                },
                value: {
                  notFoundEndOfFlag: false,
                  originalIfInvalidUtf8Error: undefined,
                  value: "long",
                },
              },
              value: {
                location: {
                  startIndex: 10,
                  endIndex: 38,
                },
                value: {
                  type: "string",
                  value: {
                    value: "サンプルテキスト",
                    originalIfError: undefined,
                  },
                },
              },
            },
          },
        ],
        unsupportedTypesError: false,
      },
    },
  );
});
