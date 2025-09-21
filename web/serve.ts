import { serveDir } from "@std/http";
import { distDirectory } from "./const.ts";

import "./build.tsx";

Deno.serve((req) =>
  serveDir(req, {
    fsRoot: distDirectory,
  })
);
