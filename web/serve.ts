import { serveDir } from "@std/http";
import { distDirectory } from "./const.ts";

import { build } from "./build.tsx";

await build();

Deno.serve((req) =>
  serveDir(req, {
    fsRoot: distDirectory,
  })
);
