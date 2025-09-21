import type { AppState } from "./appState.ts";
import { cancelTextEdit } from "./command/cancelTextEdit.ts";
import { confirmTextEdit } from "./command/confirmTextEdit.ts";
import { moveToParent } from "./command/moveToParent.ts";
import { startTextEdit } from "./command/startTextEdit.ts";

export const languages = ["en", "ja"] as const;

export const commands = [
  "moveToParent",
  "startTextEdit",
  "cancelTextEdit",
  "confirmTextEdit",
] as const;

export type Command = typeof commands[number];

export const handleCommand = (
  { command, appState }: {
    readonly command: Command;
    readonly appState: AppState;
  },
): AppState => {
  switch (command) {
    case "moveToParent":
      return moveToParent(appState);
    case "startTextEdit":
      return startTextEdit(appState);
    case "cancelTextEdit":
      return cancelTextEdit(appState);
    case "confirmTextEdit":
      return confirmTextEdit(appState);
  }
};
