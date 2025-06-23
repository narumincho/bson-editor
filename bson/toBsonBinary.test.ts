import { serialize } from "bson";
import { assertEquals } from "@std/assert";
import { Element, ToBsonBinary } from "./toBsonBinary.ts";

Deno.test("empty", () => {
  const expected = new Uint8Array([5, 0, 0, 0, 0]);
  assertEquals(serialize({}), expected);
  assertEquals(ToBsonBinary(new Map()), expected);
});

Deno.test("string and number", () => {
  const expected = new Uint8Array([
    98,
    0,
    0,
    0,
    2,
    115,
    97,
    109,
    112,
    108,
    101,
    0,
    25,
    0,
    0,
    0,
    227,
    130,
    181,
    227,
    131,
    179,
    227,
    131,
    151,
    227,
    131,
    171,
    227,
    131,
    134,
    227,
    130,
    173,
    227,
    130,
    185,
    227,
    131,
    136,
    0,
    1,
    110,
    117,
    109,
    98,
    101,
    114,
    0,
    174,
    71,
    225,
    122,
    20,
    174,
    40,
    64,
    1,
    105,
    110,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    127,
    1,
    110,
    73,
    110,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    255,
    1,
    110,
    97,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    127,
    0,
  ]);
  assertEquals(
    serialize({
      sample: "サンプルテキスト",
      number: 12.34,
      inf: Number.POSITIVE_INFINITY,
      nInf: Number.NEGATIVE_INFINITY,
      nan: Number.NaN,
    }),
    expected,
  );
  assertEquals(
    ToBsonBinary(
      new Map<string, Element>([
        ["sample", { type: "string", value: "サンプルテキスト" }],
        ["number", { type: "double", value: 12.34 }],
        ["inf", { type: "double", value: Number.POSITIVE_INFINITY }],
        ["nInf", { type: "double", value: Number.NEGATIVE_INFINITY }],
        ["nan", { type: "double", value: Number.NaN }],
      ]),
    ),
    expected,
  );
});

Deno.test("document in document", () => {
  const expected = new Uint8Array([
    26,
    0,
    0,
    0,
    3,
    100,
    111,
    99,
    0,
    16,
    0,
    0,
    0,
    2,
    115,
    116,
    114,
    0,
    2,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
  ]);
  assertEquals(
    serialize({
      doc: {
        str: "a",
      },
    }),
    expected,
  );
  assertEquals(
    ToBsonBinary(
      new Map([
        [
          "doc",
          {
            type: "document",
            value: new Map([
              ["str", { type: "string", value: "a" }],
            ]),
          },
        ],
      ]),
    ),
    expected,
  );
});
