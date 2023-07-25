import { Long, serialize } from "https://deno.land/x/web_bson@v0.3.0/mod.js";

const doc = { long: Long.fromNumber(100) };
const data = serialize(doc);
console.log(data);

await Deno.writeFile("./example/test.bson", data);
