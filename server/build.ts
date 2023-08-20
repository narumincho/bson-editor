import { fromFileUrl } from "https://deno.land/std@0.198.0/path/posix.ts";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import {
  build as esBuild,
  type Plugin,
} from "https://deno.land/x/esbuild@v0.19.2/mod.js";
import { ensureFile } from "https://deno.land/std@0.198.0/fs/mod.ts";
import { toHashString } from "https://deno.land/std@0.198.0/crypto/mod.ts";

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
  const esbuildResult = await esBuild({
    entryPoints: [fromFileUrl(url)],
    plugins: denoPlugins() as Plugin[],
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
