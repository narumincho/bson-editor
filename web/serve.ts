import { serveDir } from "@std/http";
import { distDirectory } from "./const.ts";

Deno.serve((req) =>
  serveDir(req, {
    fsRoot: distDirectory,
  })
);
