import { fromFileUrl } from "https://deno.land/std@0.201.0/path/posix.ts";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.10.3";
import {
  build as esbuildBuild,
  stop as esbuildStop,
} from "https://deno.land/x/esbuild@v0.23.0/mod.js";
import { ensureFile } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { toHashString } from "https://deno.land/std@0.201.0/crypto/mod.ts";

export const writeTextFileWithLog = async (
  path: URL,
  content: string,
): Promise<void> => {
  console.log(path.toString() + " に書き込み中... " + content.length + "文字");
  await ensureFile(path);
  await Deno.writeTextFile(path, content);
  console.log(path.toString() + " に書き込み完了!");
};

const build = async (url: URL): Promise<Uint8Array> => {
  const esbuildResult = await esbuildBuild({
    entryPoints: [fromFileUrl(url)],
    plugins: denoPlugins(),
    write: false,
    bundle: true,
    format: "esm",
    target: ["chrome115"],
  });

  for (const esbuildResultFile of esbuildResult.outputFiles ?? []) {
    if (esbuildResultFile.path === "<stdout>") {
      console.log("js 発見");
      const scriptContent = esbuildResultFile.contents;

      return scriptContent;
    }
  }
  throw new Error("esbuild で <stdout> の出力を取得できなかった...");
};

const scriptContent = await build(
  new URL("../client/main.tsx", import.meta.url),
);

const scriptHash = toHashString(
  await crypto.subtle.digest("SHA-256", scriptContent),
  "hex",
);

await writeTextFileWithLog(
  new URL("./dist.json", import.meta.url),
  JSON.stringify({
    scriptContent: new TextDecoder().decode(scriptContent),
    scriptHash,
  }),
);

esbuildStop();
