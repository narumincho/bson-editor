import { Binary, Document, fromBson, ObjectId, toBson } from "./main.ts";
import { assertEquals } from "@std/assert";

Deno.test("bson test", () => {
  const document: Document = {
    num: 0.1,
    nan: NaN,
    inf: Number.POSITIVE_INFINITY,
    nInf: Number.NEGATIVE_INFINITY,
    str: "bar",
    subDocument: { a: "sub" },
    array: [1, "二", { three: "..." }],
    binary: new Binary(new Uint8Array([1, 2, 3])),
    objectId: new ObjectId(),
    true: true,
    date: new Date(),
    null: null,
  };
  assertEquals(fromBson(toBson(document)), document);
});
