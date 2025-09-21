import { VSCodeAPI } from "@narumincho/vscode";
import { Command, commands, languages } from "../client/command.ts";
import { MessageFromVsCode } from "../client/vscode.ts";
import { commandToCommandId, viewType } from "./lib.ts";

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
    key: "Q",
    mac: "Q",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
  startTextEdit: {
    key: "Enter",
    mac: "Enter",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
  cancelTextEdit: {
    key: "Escape",
    mac: "Escape",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
  confirmTextEdit: {
    key: "Ctrl+Enter",
    mac: "Cmd+Enter",
    when: `editorFocus && activeCustomEditorId == ${viewType}`,
  },
};

export const registerCommands = (
  vscode: VSCodeAPI,
  messageToWebview: (message: MessageFromVsCode) => void,
): void => {
  for (const command of commands) {
    vscode.commands.registerCommand(commandToCommandId(command), () => {
      messageToWebview({ type: "command", command });
    });
  }
};
