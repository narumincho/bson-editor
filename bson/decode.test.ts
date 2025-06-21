import { bsonBinaryToStructuredBson } from "./main.ts";
import { assertEquals } from "@std/assert";

Deno.test("bsonBinaryToStructuredBson", () => {
  assertEquals(
    bsonBinaryToStructuredBson(
      new Uint8Array([
        // document byte size
        0x28, // 0
        0x00, // 1
        0x00, // 2
        0x00, // 3
        // type (utf8 string)
        0x02, // 4
        // name (long)
        0x6c, // 5
        0x6f, // 6
        0x6e, // 7
        0x67, // 8
        0x00, // 9
        // value (サンプルテキスト)
        0x19, // 10
        0x00, // 11
        0x00, // 12
        0x00, // 13
        0xe3, // 14
        0x82, // 15
        0xb5, // 16
        0xe3, // 17
        0x83, // 18
        0xb3, // 19
        0xe3, // 20
        0x83, // 21
        0x97, // 22
        0xe3, // 23
        0x83, // 24
        0xab, // 25
        0xe3, // 26
        0x83, // 27
        0x86, // 28
        0xe3, // 29
        0x82, // 30
        0xad, // 31
        0xe3, // 32
        0x82, // 33
        0xb9, // 34
        0xe3, // 35
        0x83, // 36
        0x88, // 37
        0x00, // 38
        // document end
        0x00, // 39
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
        // lastUnsupportedType: {},
        unsupportedTypesError: false,
      },
    },
  );
});
