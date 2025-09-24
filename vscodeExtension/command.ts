import { VSCodeAPI } from "@narumincho/vscode";
import { Command, commands, languages } from "../client/command.ts";
import { bsonEditorBlur, commandToCommandId, viewType } from "./lib.ts";

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
  cancelTextEdit: {
    en: "Cancel Text Edit",
    ja: "文字列編集をキャンセルする",
  },
  confirmTextEdit: {
    en: "Confirm Text Edit",
    ja: "文字列編集を確定する",
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
    key: "q",
    mac: "q",
    when: `activeCustomEditorId == ${viewType} && !${bsonEditorBlur}`,
  },
  startTextEdit: {
    key: "enter",
    mac: "enter",
    when: `activeCustomEditorId == ${viewType} && !${bsonEditorBlur}`,
  },
  cancelTextEdit: {
    key: "escape",
    mac: "escape",
    when: `activeCustomEditorId == ${viewType} && !${bsonEditorBlur}`,
  },
  confirmTextEdit: {
    key: "ctrl+enter",
    mac: "cmd+enter",
    when: `activeCustomEditorId == ${viewType} && !${bsonEditorBlur}`,
  },
};

export const registerCommands = (
  vscode: VSCodeAPI,
  messageToWebview: (message: Command) => void,
): void => {
  for (const command of commands) {
    console.log("registerCommand", commandToCommandId(command));
    vscode.commands.registerCommand(commandToCommandId(command), () => {
      messageToWebview(command);
    });
  }
};
