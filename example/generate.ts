import { serialize } from "jsr:@lucsoft/web-bson";

const doc = { long: "サンプルテキスト" };
const data = serialize(doc);
console.log(data);

await Deno.writeFile("./example/test2.bson", data);
console.log(
  [...data].map((e) => "0x" + e.toString(16).padStart(2, "0")).join(","),
);
