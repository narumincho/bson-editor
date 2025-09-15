import React from "react";
import { renderToString } from "react-dom/server";
import { emptyDir } from "@std/fs";
import { join } from "@std/path";
import { encodeHex } from "@std/encoding";
import { WebApp } from "../client/component/WebApp.tsx";

const bundleOutput = await new Deno.Command(Deno.execPath(), {
  args: ["bundle", "--platform", "browser", "./client/mainWeb.tsx"],
}).output();

const { outputFiles: [outputFile] = [] } = await Deno.bundle({
  platform: "browser",
  entrypoints: ["./client/mainWeb.tsx"],
});

if (!outputFile) {
  throw new Error("not found output file");
}

if (!outputFile.contents) {
  throw new Error("not found output file contents");
}

const scriptFileName = `${
  encodeHex(
    await crypto.subtle.digest(
      "SHA-256",
      new Uint8Array(outputFile.contents),
    ),
  )
}.js`;

const distDirectory = "./webDistribution";

await emptyDir(distDirectory);

await Deno.writeFile(join(distDirectory, scriptFileName), bundleOutput.stdout);

await Deno.writeTextFile(
  join(distDirectory, "index.html"),
  `<!doctype html>
${
    renderToString(
      <html>
        <head>
          <meta charSet="UTF-8" />
          <title>nBson Editor</title>
          <script defer src={`./${scriptFileName}`}></script>
          <style>
            {`
:root {
  color-scheme: dark;
}

html {
  height: 100%;
}

body {
  margin: 0;
  height: 100%;
}`}
          </style>
        </head>
        <body>
          <noscript>
            JavaScript is required to run nBson Editor.
          </noscript>
          <WebApp />
        </body>
      </html>,
    )
  }`,
);

Deno.exit();
