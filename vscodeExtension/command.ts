import { VSCodeAPI } from "@narumincho/vscode";
import { Command, languages } from "../client/command.ts";
import { MessageFromVsCode } from "../client/vscode.ts";

export const commandTitles: {
  readonly [key in Command]: {
    readonly [key in typeof languages[number]]: string;
  };
} = {
  moveToParent: {
    en: "Move to parent",
    ja: "親へ移動",
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
