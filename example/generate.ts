import { Bson } from "https://deno.land/x/bson@v0.1.3/mod.ts";

const doc = { long: Bson.Long.fromNumber(100) };
const data = Bson.serialize(doc);
console.log(data);

await Deno.writeFile("./example/test.bson", data);
