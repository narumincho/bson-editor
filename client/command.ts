import type { AppState } from "./appState.ts";
import { moveToParent } from "./command/moveToParent.ts";
import { startTextEdit } from "./command/startTextEdit.ts";

export const languages = ["en", "ja"] as const;

export const commands = [
  "moveToParent",
  "startTextEdit",
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
  }
};
