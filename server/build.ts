import { fromFileUrl } from "@std/path/posix";
import { denoPlugin } from "@deno/esbuild-plugin";
import { build as esbuildBuild, stop as esbuildStop } from "esbuild";
import { ensureFile } from "@std/fs";
import { encodeHex } from "@std/encoding";

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
    plugins: [denoPlugin()],
    write: false,
    bundle: true,
    format: "esm",
    target: ["chrome115"],
  });

  for (const esbuildResultFile of esbuildResult.outputFiles ?? []) {
    if (esbuildResultFile.path === "<stdout>") {
      const scriptContent = esbuildResultFile.contents;

      return scriptContent;
    }
  }
  throw new Error("esbuild で <stdout> の出力を取得できなかった...");
};

const scriptContent = await build(
  new URL("../client/main.tsx", import.meta.url),
);

const scriptHash = encodeHex(
  await crypto.subtle.digest("SHA-256", scriptContent),
);

await writeTextFileWithLog(
  new URL("./dist.json", import.meta.url),
  JSON.stringify({
    scriptContent: new TextDecoder().decode(scriptContent),
    scriptHash,
  }),
);

esbuildStop();
