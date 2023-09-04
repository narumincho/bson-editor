import { fromFileUrl } from "https://deno.land/std@0.201.0/path/posix.ts";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import {
  build as esBuild,
  type Plugin,
} from "https://deno.land/x/esbuild@v0.19.2/mod.js";
import { ensureFile } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { viewType } from "./lib.ts";

export const writeTextFileWithLog = async (
  path: URL,
  content: string,
): Promise<void> => {
  console.log(path.toString() + " に書き込み中... " + content.length + "文字");
  await ensureFile(path);
  await Deno.writeTextFile(path, content);
  console.log(path.toString() + " に書き込み完了!");
};

const distributionPath = new URL(
  "../vscodeExtensionDistribution/",
  import.meta.url,
);

const build = async (url: URL, format: "cjs" | "esm"): Promise<string> => {
  const esbuildResult = await esBuild({
    entryPoints: [fromFileUrl(url)],
    plugins: denoPlugins() as Plugin[],
    write: false,
    bundle: true,
    format,
    target: ["node18", "chrome115"],
  });

  for (const esbuildResultFile of esbuildResult.outputFiles ?? []) {
    if (esbuildResultFile.path === "<stdout>") {
      console.log("js 発見");
      const scriptContent = new TextDecoder().decode(
        esbuildResultFile.contents,
      );

      return scriptContent;
    }
  }
  throw new Error("esbuild で <stdout> の出力を取得できなかった...");
};

const scriptRelativePath = "./main.js";

writeTextFileWithLog(
  new URL(scriptRelativePath, distributionPath),
  await build(new URL("./main.ts", import.meta.url), "cjs"),
);

writeTextFileWithLog(
  new URL("client.js", distributionPath),
  await build(new URL("../client/main.tsx", import.meta.url), "esm"),
);

writeTextFileWithLog(
  new URL("./package.json", distributionPath),
  JSON.stringify({
    name: "bson editor",
    version: "0.0.1",
    description: "bson editor VSCode extension",
    repository: {
      url: "git+https://github.com/narumincho/bson-editor.git",
      type: "git",
    },
    license: "MIT",
    homepage: "https://github.com/narumincho/bson-editor",
    author: "narumincho",
    engines: {
      vscode: "^1.76.0",
    },
    dependencies: {},
    activationEvents: [],
    /**
     * https://code.visualstudio.com/api/references/contribution-points
     */
    contributes: {
      customEditors: [
        {
          viewType,
          displayName: "bson editor",
          selector: [
            {
              filenamePattern: "*.bson",
            },
          ],
          priority: "default",
        },
      ],
    },
    browser: scriptRelativePath,
    publisher: "narumincho",
  }),
);

writeTextFileWithLog(
  new URL("README.md", distributionPath),
  `bson-editor VSCode extension
`,
);
