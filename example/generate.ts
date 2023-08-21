import { Bson } from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import { toHashString } from "https://deno.land/std@0.198.0/crypto/to_hash_string.ts";

const doc = { long: "サンプルテキスト" };
const data = Bson.serialize(doc);
console.log(data);

// await Deno.writeFile("./example/test.bson", data);
console.log(
  [...data].map((e) => "0x" + e.toString(16).padStart(2, "0")).join(",")
);
