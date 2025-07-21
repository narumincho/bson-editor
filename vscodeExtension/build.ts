import { fromFileUrl } from "@std/path";
import { denoPlugin } from "@deno/esbuild-plugin";
import { build as esBuild } from "esbuild";
import { ensureFile } from "@std/fs";
import { scriptFileName, viewType } from "./lib.ts";
import { commands, languages } from "../client/command.ts";
import { commandKeybindings, commandTitles } from "./command.ts";

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
    plugins: [denoPlugin()],
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
  await build(new URL("./main.tsx", import.meta.url), "cjs"),
);

writeTextFileWithLog(
  new URL(scriptFileName, distributionPath),
  await build(new URL("../client/mainVscode.tsx", import.meta.url), "esm"),
);

const commandToCommandId = (command: string) => `bsonEditor.${command}`;

const commandTitlePlaceHolder = (command: string) => `command.${command}.title`;

const placeHolderUse = (palaceHolder: string) => `%${palaceHolder}%`;

writeTextFileWithLog(
  new URL("./package.json", distributionPath),
  JSON.stringify({
    name: "bson-editor",
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
      commands: commands.map((command) => ({
        command: commandToCommandId(command),
        title: placeHolderUse(commandTitlePlaceHolder(command)),
      })),
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
      keybindings: Object.entries(commandKeybindings).map((
        [command, keybinding],
      ) => ({ ...keybinding, command: commandToCommandId(command) })),
    },
    browser: scriptRelativePath,
    publisher: "narumincho",
  }),
);

const defaultLanguage = "en";

for (const language of languages) {
  const content = JSON.stringify(Object.fromEntries(
    Object.entries(commandTitles).map(([command, title]) => [
      commandTitlePlaceHolder(command),
      title[language],
    ]),
  ));
  if (language === defaultLanguage) {
    writeTextFileWithLog(
      new URL(`./package.nls.json`, distributionPath),
      content,
    );
  }
  writeTextFileWithLog(
    new URL(`./package.nls.${language}.json`, distributionPath),
    content,
  );
}

writeTextFileWithLog(
  new URL("README.md", distributionPath),
  `bson-editor VSCode extension
`,
);
