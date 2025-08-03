import { serialize } from "bson";

const data = serialize({ sampleName: "サンプルテキスト" });
console.log(data);

await Deno.writeFile("./example/sampleText.bson", data);
