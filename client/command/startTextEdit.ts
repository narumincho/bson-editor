import { HandleCommand } from "./type.ts";

export const startTextEdit: HandleCommand = (appState) => {
  return { ...appState, isTextEdit: true };
};
