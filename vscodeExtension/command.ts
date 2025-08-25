import { VSCodeAPI } from "@narumincho/vscode";
import { Command, languages } from "../client/command.ts";
import { MessageFromVsCode } from "../client/vscode.ts";
import { viewType } from "./lib.ts";

export const commandTitles: {
  readonly [key in Command]: {
    readonly [key in typeof languages[number]]: string;
  };
} = {
  moveToParent: {
    en: "Move to parent",
    ja: "親へ移動",
  },
  startTextEdit: {
    en: "Start Text Edit",
    ja: "文字列編集",
  },
};

export const commandKeybindings: {
  readonly [key in Command]: {
    readonly key: string;
    readonly mac: string;
    readonly when: string;
  };
} = {
  moveToParent: {
    key: "Q",
    mac: "Q",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
  startTextEdit: {
    key: "Enter",
    mac: "Enter",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
};

export const registerCommands = (
  vscode: VSCodeAPI,
  messageToWebview: (message: MessageFromVsCode) => void,
): void => {
  vscode.commands.registerCommand("bsonEditor.moveToParent", () => {
    messageToWebview({ type: "moveToParent" });
  });
};
