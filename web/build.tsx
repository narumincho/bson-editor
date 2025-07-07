import React from "react";
import { renderToString } from "react-dom/server";
import { emptyDir } from "@std/fs";
import { join } from "@std/path";
import { encodeHex } from "@std/encoding";

const bundleOutput = await new Deno.Command(Deno.execPath(), {
  args: ["bundle", "--platform", "browser", "./client/main.tsx"],
}).output();

if (!bundleOutput.success) {
  throw new Error(new TextDecoder().decode(bundleOutput.stderr));
}

const scriptFileName = `${
  encodeHex(
    await crypto.subtle.digest(
      "SHA-256",
      bundleOutput.stdout,
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
          <div id="loading">Bson Editor loading</div>
          <noscript>JavaScript is required to run nBson Editor.</noscript>
        </body>
      </html>,
    )
  }`,
);

Deno.exit();
