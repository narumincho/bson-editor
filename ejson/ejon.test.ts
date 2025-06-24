import { EJSON } from "bson";
import { assertEquals } from "@std/assert";

Deno.test("ejson normal", () => {
  const bsonObject = {
    str: "サンプル",
    num: 123,
  };
  const ejsonAsString = EJSON.stringify(bsonObject);
  const ejsonAsObject = EJSON.parse(ejsonAsString);

  assertEquals(bsonObject, ejsonAsObject);
});

Deno.test("ejson reserved", () => {
  // $oid の名前が含まれるBSONは正常に EJSONにすることができない
  const bsonObject = {
    "_id": {
      "$oid": "5a9427648b0beebeb69579e7",
    },
  };
  const ejsonAsString = EJSON.stringify(bsonObject);
  const ejsonAsObject = EJSON.parse(ejsonAsString);

  assertEquals(bsonObject, ejsonAsObject);
});
